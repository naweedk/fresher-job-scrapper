import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryJobsDto, SortBy, SortOrder } from './dto/query-jobs.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns a paginated, filtered, and sorted list of active jobs.
   */
  async findAll(query: QueryJobsDto) {
    const {
      search,
      role,
      city,
      jobType,
      experienceLevel,
      workMode,
      skills,
      page = 1,
      limit = 20,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = query;

    const order = sortOrder.toLowerCase() as 'asc' | 'desc';

    // ── WHERE clause ──────────────────────────────────────────────────────────
    const where: any = { status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Classification-level filters accumulate into a single `classification` block
    const classificationFilter: Record<string, any> = {};

    if (role) {
      classificationFilter.role = { contains: role, mode: 'insensitive' };
    }
    if (city) {
      classificationFilter.city = { contains: city, mode: 'insensitive' };
    }
    if (jobType) {
      classificationFilter.jobType = jobType;
    }
    if (experienceLevel) {
      classificationFilter.experienceLevel = experienceLevel;
    }
    if (workMode) {
      classificationFilter.workMode = workMode;
    }
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        classificationFilter.skills = { hasSome: skillList };
      }
    }

    if (Object.keys(classificationFilter).length > 0) {
      where.classification = classificationFilter;
    }

    // ── ORDER BY clause ───────────────────────────────────────────────────────
    let orderBy: any;
    switch (sortBy) {
      case SortBy.POSTED_AT:
        orderBy = [{ postedAt: order }, { createdAt: 'desc' }];
        break;
      case SortBy.TITLE:
        orderBy = { title: order };
        break;
      case SortBy.COMPANY:
        orderBy = { company: { name: order } };
        break;
      case SortBy.CREATED_AT:
      default:
        orderBy = { createdAt: order };
        break;
    }

    // ── SELECT / INCLUDE ──────────────────────────────────────────────────────
    const select = {
      id: true,
      title: true,
      location: true,
      jobUrl: true,
      postedAt: true,
      createdAt: true,
      status: true,
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          website: true,
        },
      },
      classification: {
        select: {
          role: true,
          city: true,
          jobType: true,
          experienceLevel: true,
          workMode: true,
          skills: true,
          confidence: true,
          status: true,
        },
      },
    };

    const skip = (page - 1) * limit;

    // ── Single round-trip via $transaction ────────────────────────────────────
    const [data, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({ where, select, orderBy, skip, take: limit }),
      this.prisma.job.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Returns a single job with all details.
   * Throws NotFoundException when no job matches the given id.
   */
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        source: {
          select: {
            id: true,
            name: true,
            sourceType: true,
            baseUrl: true,
          },
        },
        classification: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  /**
   * Returns distinct filter values from completed job classifications.
   */
  async getFilters() {
    const [roles, cities, jobTypes, experienceLevels, workModes] =
      await Promise.all([
        this.prisma.jobClassification.groupBy({
          by: ['role'],
          where: { status: 'COMPLETED', role: { not: null } },
        }),
        this.prisma.jobClassification.groupBy({
          by: ['city'],
          where: { status: 'COMPLETED', city: { not: null } },
        }),
        this.prisma.jobClassification.groupBy({
          by: ['jobType'],
          where: { status: 'COMPLETED', jobType: { not: null } },
        }),
        this.prisma.jobClassification.groupBy({
          by: ['experienceLevel'],
          where: { status: 'COMPLETED', experienceLevel: { not: null } },
        }),
        this.prisma.jobClassification.groupBy({
          by: ['workMode'],
          where: { status: 'COMPLETED', workMode: { not: null } },
        }),
      ]);

    return {
      roles: roles.map((r) => r.role).filter(Boolean).sort(),
      cities: cities.map((c) => c.city).filter(Boolean).sort(),
      jobTypes: jobTypes.map((j) => j.jobType).filter(Boolean),
      experienceLevels: experienceLevels.map((e) => e.experienceLevel).filter(Boolean),
      workModes: workModes.map((w) => w.workMode).filter(Boolean),
    };
  }
}
