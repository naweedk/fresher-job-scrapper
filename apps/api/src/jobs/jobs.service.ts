import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryJobsDto, SortBy, SortOrder } from './dto/query-jobs.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns a paginated, filtered, and sorted list of active, verified Indian jobs.
   * By default, enforces maximum age of 30 days (excluding stale and unknown-date listings).
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
      dateRange = '30d',
      page = 1,
      limit = 20,
      sortBy = SortBy.POSTED_AT,
      sortOrder = SortOrder.DESC,
    } = query;

    const order = sortOrder.toLowerCase() as 'asc' | 'desc';

    // ── WHERE clause: strictly enforce ACTIVE & VERIFIED_INDIAN ────────────────
    const andConditions: any[] = [
      { status: 'ACTIVE' },
      { indiaEligibility: 'VERIFIED_INDIAN' },
    ];

    // ── Date Freshness Filter ──────────────────────────────────────────────────
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let cutoff: Date;

      switch (dateRange) {
        case '24h':
          cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '3d':
          cutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '14d':
          cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
        default:
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      andConditions.push({
        postedAt: {
          gte: cutoff,
          not: null,
        },
      });
    }

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (city) {
      andConditions.push({
        OR: [
          { location: { contains: city, mode: 'insensitive' } },
          { classification: { city: { contains: city, mode: 'insensitive' } } },
        ],
      });
    }

    if (workMode) {
      andConditions.push({
        OR: [
          { workMode: workMode },
          { classification: { workMode: workMode } },
        ],
      });
    }

    // Classification-level sub-filters
    const classificationFilter: Record<string, any> = {};

    if (role) {
      classificationFilter.role = { contains: role, mode: 'insensitive' };
    }
    if (jobType) {
      classificationFilter.jobType = jobType;
    }
    if (experienceLevel) {
      classificationFilter.experienceLevel = experienceLevel;
    }
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        classificationFilter.skills = { hasSome: skillList };
      }
    }

    if (Object.keys(classificationFilter).length > 0) {
      andConditions.push({ classification: classificationFilter });
    }

    const where = { AND: andConditions };

    // ── ORDER BY clause: authentic postedAt as canonical primary sort ─────────
    let orderBy: any;
    switch (sortBy) {
      case SortBy.POSTED_AT:
        orderBy = [{ postedAt: { sort: order, nulls: 'last' } }, { id: 'desc' }];
        break;
      case SortBy.TITLE:
        orderBy = [{ title: order }, { postedAt: { sort: 'desc', nulls: 'last' } }];
        break;
      case SortBy.COMPANY:
        orderBy = [{ company: { name: order } }, { postedAt: { sort: 'desc', nulls: 'last' } }];
        break;
      case SortBy.CREATED_AT:
        orderBy = [{ createdAt: order }, { id: 'desc' }];
        break;
      default:
        orderBy = [{ postedAt: { sort: order, nulls: 'last' } }, { id: 'desc' }];
        break;
    }

    // ── SELECT / INCLUDE: expose canonical date timestamps ─────────────────────
    const select = {
      id: true,
      title: true,
      location: true,
      workMode: true,
      indiaEligibility: true,
      countryCode: true,
      jobUrl: true,
      postedAt: true,
      sourceUpdatedAt: true,
      firstSeenAt: true,
      lastSeenAt: true,
      createdAt: true,
      updatedAt: true,
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
   * Throws NotFoundException if the job does not exist or is not a verified Indian active job.
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

    if (!job || job.status !== 'ACTIVE' || job.indiaEligibility !== 'VERIFIED_INDIAN') {
      throw new NotFoundException(`Job with ID '${id}' not found`);
    }

    return job;
  }

  /**
   * Returns distinct filter values strictly from verified active Indian jobs.
   */
  async getFilters() {
    const verifiedWhere = {
      job: {
        status: 'ACTIVE' as const,
        indiaEligibility: 'VERIFIED_INDIAN' as const,
      },
    };

    const [roles, classifiedCities, jobCities, jobTypes, experienceLevels] =
      await Promise.all([
        this.prisma.jobClassification.groupBy({
          by: ['role'],
          where: { ...verifiedWhere, role: { not: null } },
        }),
        this.prisma.jobClassification.groupBy({
          by: ['city'],
          where: { ...verifiedWhere, city: { not: null } },
        }),
        this.prisma.job.groupBy({
          by: ['location'],
          where: {
            status: 'ACTIVE',
            indiaEligibility: 'VERIFIED_INDIAN',
            location: { not: null },
          },
        }),
        this.prisma.jobClassification.groupBy({
          by: ['jobType'],
          where: { ...verifiedWhere, jobType: { not: null } },
        }),
        this.prisma.jobClassification.groupBy({
          by: ['experienceLevel'],
          where: { ...verifiedWhere, experienceLevel: { not: null } },
        }),
      ]);

    const allCities = new Set<string>();
    for (const c of classifiedCities) {
      if (c.city) allCities.add(c.city);
    }
    for (const j of jobCities) {
      if (j.location && !['remote', 'india'].includes(j.location.toLowerCase())) {
        allCities.add(j.location);
      }
    }

    return {
      roles: roles.map((r) => r.role).filter(Boolean).sort(),
      cities: Array.from(allCities).sort(),
      jobTypes: jobTypes.map((j) => j.jobType).filter(Boolean),
      experienceLevels: experienceLevels.map((e) => e.experienceLevel).filter(Boolean),
      workModes: ['ONSITE', 'HYBRID', 'REMOTE'],
    };
  }
}
