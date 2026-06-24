import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { InvoiceStatus } from '@workledger/shared';
import { nanoid } from 'nanoid';
import { tenantContext } from '../../shared/context/tenant.context';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  public calculateTotals(lineItems: any[], discountValue = 0, discountType?: string | null) {
    let subtotal = 0;
    let taxTotal = 0;

    for (const item of lineItems) {
      const itemSub = item.quantity * item.rate;
      subtotal += itemSub;

      const taxRate = item.taxRate ?? 0;
      if (taxRate > 0) {
        taxTotal += itemSub * (taxRate / 100);
      }
    }

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else if (discountType === 'fixed') {
      discountAmount = discountValue;
    }

    subtotal = Math.round(subtotal * 100) / 100;
    taxTotal = Math.round(taxTotal * 100) / 100;
    discountAmount = Math.round(discountAmount * 100) / 100;
    const total = Math.max(0, Math.round((subtotal + taxTotal - discountAmount) * 100) / 100);

    return {
      subtotal,
      taxTotal,
      discountAmount,
      total,
    };
  }

  async createInvoice(dto: CreateInvoiceDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Lock and update Workspace to safely generate sequential numbering
      const workspaceId = tenantContext.getStore()?.workspaceId;
      if (!workspaceId) {
        throw new BadRequestException('Workspace context is required to create an invoice.');
      }

      const workspace = await tx.workspace.update({
        where: { id: workspaceId },
        data: {
          invoiceNextNum: { increment: 1 },
        },
      });

      const currentNum = workspace.invoiceNextNum - 1;
      const prefix = workspace.invoicePrefix ?? 'INV';
      const invoiceNumber = `${prefix}-${String(currentNum).padStart(4, '0')}`;

      // 2. Perform backend calculations to prevent tampering
      const totals = this.calculateTotals(dto.lineItems, dto.discountValue ?? 0, dto.discountType);
      const viewToken = nanoid(21);

      // 3. Create the invoice
      const invoice = await tx.invoice.create({
        data: {
          clientId: dto.clientId,
          projectId: dto.projectId ?? null,
          milestoneId: dto.milestoneId ?? null,
          invoiceNumber,
          status: InvoiceStatus.DRAFT,
          currency: dto.currency ?? workspace.defaultCurrency ?? 'USD',
          lineItems: dto.lineItems as any,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          discountAmount: totals.discountAmount,
          discountType: dto.discountType ?? null,
          total: totals.total,
          amountPaid: 0,
          amountDue: totals.total,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          notes: dto.notes ?? null,
          internalNote: dto.internalNote ?? null,
          viewToken,
          createdBy: userId,
        } as any,
      });

      // 4. Link milestone if provided
      if (dto.milestoneId) {
        await tx.milestone.update({
          where: { id: dto.milestoneId },
          data: { invoiceId: invoice.id },
        });
      }

      return invoice;
    });
  }

  async getInvoices(query: InvoiceQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const total = await this.prisma.invoice.count({ where });
    const invoices = await this.prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { client: true, project: true },
    });

    return {
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        hasNext: skip + invoices.length < total,
      },
    };
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto) {
    const original = await this.getInvoiceById(id);

    if (original.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot edit an invoice that is already fully paid.');
    }

    const updateData: any = { ...dto };

    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }

    // Recalculate totals if lineItems or discount fields change
    if (dto.lineItems || dto.discountValue !== undefined || dto.discountType !== undefined) {
      const lineItems = dto.lineItems ?? original.lineItems;
      const discountValue = dto.discountValue !== undefined ? dto.discountValue : Number(original.discountAmount);
      const discountType = dto.discountType !== undefined ? dto.discountType : original.discountType;

      const totals = this.calculateTotals(lineItems as any[], discountValue, discountType);

      updateData.subtotal = totals.subtotal;
      updateData.taxTotal = totals.taxTotal;
      updateData.discountAmount = totals.discountAmount;
      updateData.total = totals.total;
      updateData.amountDue = totals.total - Number(original.amountPaid);
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteInvoice(id: string) {
    await this.getInvoiceById(id);
    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  async sendInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { client: true, project: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Fetch Workspace settings
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: invoice.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace associated with invoice ${id} not found`);
    }

    // Map data for Go microservice template structure
    const serviceUrl = this.configService.get<string>('pdf.serviceUrl') ?? 'http://localhost:8080';
    const secret = this.configService.get<string>('pdf.serviceSecret') ?? 'local-dev-secret';

    const lineItems = (invoice.lineItems as any[]).map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      taxRate: Number(item.taxRate ?? 0),
      amount: Number(item.quantity) * Number(item.rate),
    }));

    const payload = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issuedDate: invoice.createdAt.toISOString().split('T')[0],
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString().split('T')[0] : '',
      currency: invoice.currency,
      workspace: {
        name: workspace.name,
        logoUrl: workspace.logoUrl ?? '',
        brandColor: workspace.brandColor ?? '#2563EB',
        email: workspace.businessEmail ?? '',
        address: workspace.address ?? '',
        taxNumber: workspace.taxNumber ?? '',
      },
      client: {
        name: invoice.client.name,
        company: invoice.client.company ?? '',
        email: invoice.client.email ?? '',
        address: invoice.client.address ?? '',
      },
      lineItems,
      subtotal: Number(invoice.subtotal),
      taxTotal: Number(invoice.taxTotal),
      total: Number(invoice.total),
      amountDue: Number(invoice.amountDue),
      notes: invoice.notes ?? '',
    };

    try {
      const response = await fetch(`${serviceUrl}/pdf/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': secret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Go PDF service error: ${response.statusText} (${errorText})`);
      }

      const resData = (await response.json()) as { pdfUrl: string };

      return this.prisma.invoice.update({
        where: { id },
        data: {
          pdfUrl: resData.pdfUrl,
          status: InvoiceStatus.SENT,
          sentAt: new Date(),
        },
      });
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to generate or compile PDF: ${err.message}`);
    }
  }

  async getInvoiceByViewToken(viewToken: string) {
    let invoice = await this.prisma.invoice.findUnique({
      where: { viewToken },
      include: {
        client: {
          select: {
            name: true,
            company: true,
            address: true,
            email: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
        payments: {
          select: {
            amount: true,
            method: true,
            paidAt: true,
          },
        },
      },
    });

    if (!invoice || invoice.status === InvoiceStatus.DRAFT) {
      throw new NotFoundException('Invoice not found or is in draft status.');
    }

    const invoiceId = invoice.id;

    // Client portal view logs/updates status from SENT to VIEWED
    if (invoice.status === InvoiceStatus.SENT) {
      invoice = await tenantContext.run(
        {
          workspaceId: invoice.workspaceId,
          userId: 'CLIENT_PORTAL',
          role: 'VIEWER',
          plan: 'FREE',
        },
        async () => {
          return this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: InvoiceStatus.VIEWED,
              viewedAt: new Date(),
              viewedCount: { increment: 1 },
            },
            include: {
              client: {
                select: {
                  name: true,
                  company: true,
                  address: true,
                  email: true,
                },
              },
              project: {
                select: {
                  name: true,
                },
              },
              payments: {
                select: {
                  amount: true,
                  method: true,
                  paidAt: true,
                },
              },
            },
          });
        },
      );
    } else {
      // Just increment viewedCount
      invoice = await tenantContext.run(
        {
          workspaceId: invoice.workspaceId,
          userId: 'CLIENT_PORTAL',
          role: 'VIEWER',
          plan: 'FREE',
        },
        async () => {
          return this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              viewedCount: { increment: 1 },
            },
            include: {
              client: {
                select: {
                  name: true,
                  company: true,
                  address: true,
                  email: true,
                },
              },
              project: {
                select: {
                  name: true,
                },
              },
              payments: {
                select: {
                  amount: true,
                  method: true,
                  paidAt: true,
                },
              },
            },
          });
        },
      );
    }

    return invoice;
  }

  async recordPayment(id: string, dto: RecordPaymentDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      const total = Number(invoice.total);
      const amountPaid = Number(invoice.amountPaid);
      const newAmountPaid = Math.round((amountPaid + dto.amount) * 100) / 100;
      const newAmountDue = Math.max(0, Math.round((total - newAmountPaid) * 100) / 100);

      // Determine correct status
      let status: InvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
      let paidAt: Date | null = invoice.paidAt;

      if (newAmountDue <= 0) {
        status = InvoiceStatus.PAID;
        paidAt = new Date(dto.paidAt);
      }

      // Update Invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status,
          paidAt,
        },
      });

      // Create Payment record
      await tx.payment.create({
        data: {
          invoiceId: id,
          amount: dto.amount,
          currency: invoice.currency,
          method: dto.method,
          reference: dto.reference ?? null,
          note: dto.note ?? null,
          paidAt: new Date(dto.paidAt),
          recordedBy: userId,
        } as any,
      });

      return updatedInvoice;
    });
  }
}
