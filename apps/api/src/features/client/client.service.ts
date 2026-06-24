import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async createClient(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: dto as any,
    });
  }

  async getClients(query: ClientQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.healthStatus) {
      where.healthStatus = query.healthStatus;
    }

    const total = await this.prisma.client.count({ where });
    const clients = await this.prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: clients,
      pagination: {
        total,
        page,
        limit,
        hasNext: skip + clients.length < total,
      },
    };
  }

  async getClientById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async updateClient(id: string, dto: UpdateClientDto) {
    // Ensure the client exists and belongs to the workspace (scoped via PrismaService where)
    await this.getClientById(id);

    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }

  async deleteClient(id: string) {
    // Ensure the client exists
    await this.getClientById(id);

    // Prisma extension will automatically translate this delete to an update soft-delete
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
