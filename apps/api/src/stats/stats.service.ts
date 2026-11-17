import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns extended platform statistics scoped strictly to verified Indian opportunities.
   */
  async getSummary() {
    const verifiedWhere = {
      indiaEligibility: 'VERIFIED_INDIAN' as const,
    };

    const activeVerifiedWhere = {
      status: 'ACTIVE' as const,
      indiaEligibility: 'VERIFIED_INDIAN' as const,
    };

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
      onsiteCount,
      hybridCount,
    ] = await Promise.all([
      this.prisma.job.count({ where: verifiedWhere }),
      this.prisma.job.count({ where: activeVerifiedWhere }),
      this.prisma.job.count({
        where: { status: 'EXPIRED', ...verifiedWhere },
      }),
      this.prisma.company.count({
        where: {
          jobs: {
            some: activeVerifiedWhere,
          },
        },
      }),
      this.prisma.source.count({
        where: {
          isActive: true,
          jobs: {
            some: activeVerifiedWhere,
          },
        },
      }),
      this.prisma.jobClassification.count({
        where: { status: 'COMPLETED', job: verifiedWhere },
      }),
      this.prisma.jobClassification.count({
        where: { status: 'PENDING', job: verifiedWhere },
      }),
      this.prisma.jobClassification.count({
        where: {
          status: { in: ['FAILED', 'REVIEW_REQUIRED'] },
          job: verifiedWhere,
        },
      }),
      this.prisma.jobClassification.count({
        where: {
          jobType: 'INTERNSHIP',
          job: verifiedWhere,
        },
      }),
      this.prisma.jobClassification.count({
        where: {
          jobType: 'FULL_TIME',
          job: verifiedWhere,
        },
      }),
      this.prisma.job.count({
        where: { ...activeVerifiedWhere, workMode: 'REMOTE' },
      }),
      this.prisma.job.count({
        where: { ...activeVerifiedWhere, workMode: 'ONSITE' },
      }),
      this.prisma.job.count({
        where: { ...activeVerifiedWhere, workMode: 'HYBRID' },
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
        onsite: onsiteCount,
        hybrid: hybridCount,
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}
