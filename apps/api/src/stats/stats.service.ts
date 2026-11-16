import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns basic platform statistics.
   * Counts are live from the database.
   */
  async getSummary() {
    const [totalJobs, activeJobs, totalCompanies, totalSources] =
      await Promise.all([
        this.prisma.job.count(),
        this.prisma.job.count({ where: { status: 'ACTIVE' } }),
        this.prisma.company.count(),
        this.prisma.source.count({ where: { isActive: true } }),
      ]);

    return {
      totalJobs,
      activeJobs,
      totalCompanies,
      activeSources: totalSources,
      lastUpdated: new Date().toISOString(),
    };
  }
}
