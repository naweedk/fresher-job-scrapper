import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all active jobs.
   * Phase 2 will add filtering, search, and pagination.
   */
  async findAll() {
    return this.prisma.job.findMany({
      where: { status: 'ACTIVE' },
      include: {
        company: true,
        classification: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
