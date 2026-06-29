import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import AdmZip from 'adm-zip';

@Injectable()
export class DataExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async triggerExport(userId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace || !workspace.isActive) {
      throw new NotFoundException('Workspace not found or inactive');
    }

    
    process.nextTick(() => {
      this.executeExport(userId, workspaceId).catch((err) => {
        console.error(
          `[GDPR Export] Background export task failed for workspace ${workspaceId}:`,
          err,
        );
      });
    });

    return {
      message:
        'Your GDPR data export request has been received and is being processed. An email notification with the download link will be sent shortly.',
      estimatedTimeSeconds: 300,
    };
  }

  private async executeExport(userId: string, workspaceId: string) {
    
    const [clients, projects, invoices, files] = await Promise.all([
      this.prisma.client.findMany({ where: { workspaceId, deletedAt: null } }),
      this.prisma.project.findMany({ where: { workspaceId, deletedAt: null } }),
      this.prisma.invoice.findMany({ where: { workspaceId, deletedAt: null } }),
      this.prisma.file.findMany({
        where: { workspaceId, deletedAt: null, parentId: null },
      }),
    ]);

    
    const clientHeaders = [
      'id',
      'name',
      'company',
      'email',
      'phone',
      'timezone',
      'country',
      'address',
      'taxNumber',
      'currency',
      'healthStatus',
      'totalRevenue',
      'createdAt',
    ];
    const projectHeaders = [
      'id',
      'name',
      'description',
      'status',
      'startDate',
      'deadline',
      'currency',
      'priority',
      'estimatedValue',
      'createdAt',
    ];
    const invoiceHeaders = [
      'id',
      'invoiceNumber',
      'status',
      'currency',
      'subtotal',
      'taxTotal',
      'discountAmount',
      'total',
      'amountPaid',
      'amountDue',
      'dueDate',
      'createdAt',
    ];

    const clientCsv = this.toCsv(clients, clientHeaders);
    const projectCsv = this.toCsv(projects, projectHeaders);
    const invoiceCsv = this.toCsv(invoices, invoiceHeaders);

    
    const zip = new AdmZip();
    zip.addFile('clients.csv', Buffer.from(clientCsv, 'utf8'));
    zip.addFile('projects.csv', Buffer.from(projectCsv, 'utf8'));
    zip.addFile('invoices.csv', Buffer.from(invoiceCsv, 'utf8'));

    
    for (const file of files) {
      try {
        const downloadUrl = await this.storageService.getDownloadUrl(file.key);
        
        const response = await fetch(downloadUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          zip.addFile(`files/${file.name}`, buffer);
        } else {
          console.warn(
            `[GDPR Export] Failed to download file ${file.key}. HTTP Status: ${response.status}`,
          );
        }
      } catch (err) {
        console.error(
          `[GDPR Export] Failed to download and zip file ${file.key}:`,
          err,
        );
      }
    }

    const zipBuffer = zip.toBuffer();
    const exportFilename = `gdpr_export_${workspaceId}_${Date.now()}.zip`;
    const exportKey = `exports/${workspaceId}/${exportFilename}`;

    
    const secureUrl = await this.storageService.uploadFile(
      exportKey,
      zipBuffer,
      'application/zip',
    );

    
    console.log(
      `✉️ [GDPR Export] Email sent to user ${userId}: Your data export is ready. Download link: ${secureUrl}`,
    );

    return secureUrl;
  }

  private toCsv(data: any[], headers: string[]): string {
    const csvRows: string[] = [];
    
    csvRows.push(headers.join(','));

    
    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) {
          return '""';
        }
        const stringified =
          typeof val === 'object' ? JSON.stringify(val) : String(val);
        const escaped = stringified.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}
