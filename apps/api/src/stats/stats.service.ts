import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns extended platform statistics including classification breakdown,
   * job-type counts, and work-mode counts.
   */
  async getSummary() {
    const [
      totalJobs,
      activeJobs,
      expiredJobs,
      totalCompanies,
      totalSources,
      completedClassifications,
      pendingClassifications,
      failedClassifications,
      internshipCount,
      fullTimeCount,
      remoteCount,
    ] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'ACTIVE' } }),
      this.prisma.job.count({ where: { status: 'EXPIRED' } }),
      this.prisma.company.count(),
      this.prisma.source.count({ where: { isActive: true } }),
      this.prisma.jobClassification.count({ where: { status: 'COMPLETED' } }),
      this.prisma.jobClassification.count({ where: { status: 'PENDING' } }),
      this.prisma.jobClassification.count({
        where: { status: { in: ['FAILED', 'REVIEW_REQUIRED'] } },
      }),
      this.prisma.jobClassification.count({
        where: { status: 'COMPLETED', jobType: 'INTERNSHIP' },
      }),
      this.prisma.jobClassification.count({
        where: { status: 'COMPLETED', jobType: 'FULL_TIME' },
      }),
      this.prisma.jobClassification.count({
        where: { status: 'COMPLETED', workMode: 'REMOTE' },
      }),
    ]);

    return {
      totalJobs,
      activeJobs,
      expiredJobs,
      totalCompanies,
      activeSources: totalSources,
      classifications: {
        completed: completedClassifications,
        pending: pendingClassifications,
        failed: failedClassifications,
      },
      byJobType: {
        internships: internshipCount,
        fullTime: fullTimeCount,
      },
      byWorkMode: {
        remote: remoteCount,
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}
