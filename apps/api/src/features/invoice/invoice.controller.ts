import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { JwtAuthGuard, Public } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@workledger/shared';

@ApiTags('Invoices & Payments')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new invoice with transaction safety and sequence generation' })
  @ApiResponse({ status: 201, description: 'Invoice successfully created.' })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser('id') userId: string) {
    return this.invoiceService.createInvoice(dto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'List and filter invoices' })
  getInvoices(@Query() query: InvoiceQueryDto) {
    return this.invoiceService.getInvoices(query);
  }

  @Public()
  @Get('view/:viewToken')
  @ApiOperation({ summary: 'Get invoice details via client view token (transitions status to VIEWED)' })
  @ApiResponse({ status: 200, description: 'Invoice details successfully retrieved.' })
  viewInvoice(@Param('viewToken') viewToken: string) {
    return this.invoiceService.getInvoiceByViewToken(viewToken);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.MEMBER)
  @ApiOperation({ summary: 'Get details of a single invoice' })
  getInvoiceById(@Param('id') id: string) {
    return this.invoiceService.getInvoiceById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Update an invoice (recalculates totals if line items change)' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoiceService.updateInvoice(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Soft delete an invoice' })
  remove(@Param('id') id: string) {
    return this.invoiceService.deleteInvoice(id);
  }

  @Post(':id/send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Send invoice (renders and saves PDF via Go service, updates status to SENT)' })
  sendInvoice(@Param('id') id: string) {
    return this.invoiceService.sendInvoice(id);
  }

  @Post(':id/payments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Record a manual payment against an invoice' })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.invoiceService.recordPayment(id, dto, userId);
  }
}
