/**
 * Unit tests for JobsService
 * Uses Jest mock of PrismaService — does NOT require a live database.
 */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueryJobsDto, SortBy, SortOrder } from './dto/query-jobs.dto';

// ── Minimal mock shapes ────────────────────────────────────────────────────

const mockJob = {
  id: 'job-1',
  title: 'React Developer Intern',
  location: 'Mumbai',
  workMode: 'REMOTE',
  indiaEligibility: 'VERIFIED_INDIAN',
  countryCode: 'IN',
  jobUrl: 'https://example.com/job/1',
  postedAt: null,
  createdAt: new Date('2026-11-01T00:00:00Z'),
  status: 'ACTIVE',
  company: { id: 'co-1', name: 'Acme Corp', logoUrl: null, website: null },
  classification: {
    role: 'Frontend Developer',
    city: 'Mumbai',
    jobType: 'INTERNSHIP',
    experienceLevel: 'FRESHER',
    workMode: 'REMOTE',
    skills: ['React', 'JavaScript'],
    confidence: 0.92,
    status: 'COMPLETED',
  },
};

const mockFullJob = {
  ...mockJob,
  description: 'Join our team as a frontend intern in Mumbai...',
  externalId: 'ext-123',
  canonicalUrl: 'https://example.com/job/1',
  expiresAt: null,
  companyId: 'co-1',
  sourceId: 'src-1',
  updatedAt: new Date('2026-11-01T00:00:00Z'),
  source: { id: 'src-1', name: 'Simplify Jobs', sourceType: 'API', baseUrl: null },
};

function buildMockPrisma() {
  return {
    job: {
      findMany: jest.fn().mockResolvedValue([mockJob]),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn().mockResolvedValue(mockFullJob),
      groupBy: jest.fn().mockResolvedValue([{ location: 'Mumbai' }]),
    },
    jobClassification: {
      groupBy: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn().mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops)),
  };
}

// ── Test suite ─────────────────────────────────────────────────────────────

describe('JobsService', () => {
  let service: JobsService;
  let prisma: ReturnType<typeof buildMockPrisma>;

  beforeEach(async () => {
    prisma = buildMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated jobs with default params', async () => {
      const result = await service.findAll(new QueryJobsDto());

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('strictly enforces status=ACTIVE and indiaEligibility=VERIFIED_INDIAN', async () => {
      await service.findAll(new QueryJobsDto());
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              { status: 'ACTIVE' },
              { indiaEligibility: 'VERIFIED_INDIAN' },
            ]),
          },
        }),
      );
    });

    it('applies search OR filter when search is provided', async () => {
      const dto = Object.assign(new QueryJobsDto(), { search: 'react' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { title: { contains: 'react', mode: 'insensitive' } },
                ]),
              }),
            ]),
          }),
        }),
      );
    });

    it('applies city filter to location and classification.city', async () => {
      const dto = Object.assign(new QueryJobsDto(), { city: 'Mumbai' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { location: { contains: 'Mumbai', mode: 'insensitive' } },
                ]),
              }),
            ]),
          }),
        }),
      );
    });

    it('applies role classification filter', async () => {
      const dto = Object.assign(new QueryJobsDto(), { role: 'Frontend' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                classification: expect.objectContaining({
                  role: { contains: 'Frontend', mode: 'insensitive' },
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('applies jobType filter', async () => {
      const dto = Object.assign(new QueryJobsDto(), { jobType: 'INTERNSHIP' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                classification: expect.objectContaining({ jobType: 'INTERNSHIP' }),
              }),
            ]),
          }),
        }),
      );
    });

    it('applies experienceLevel filter', async () => {
      const dto = Object.assign(new QueryJobsDto(), { experienceLevel: 'FRESHER' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                classification: expect.objectContaining({ experienceLevel: 'FRESHER' }),
              }),
            ]),
          }),
        }),
      );
    });

    it('applies workMode filter across job and classification', async () => {
      const dto = Object.assign(new QueryJobsDto(), { workMode: 'REMOTE' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { workMode: 'REMOTE' },
                  { classification: { workMode: 'REMOTE' } },
                ]),
              }),
            ]),
          }),
        }),
      );
    });

    it('applies skills filter splitting comma-separated string', async () => {
      const dto = Object.assign(new QueryJobsDto(), { skills: 'React, TypeScript' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                classification: expect.objectContaining({
                  skills: { hasSome: ['React', 'TypeScript'] },
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('applies correct skip for page 3 limit 10', async () => {
      const dto = Object.assign(new QueryJobsDto(), { page: 3, limit: 10 });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('sorts by title ascending with postedAt tiebreaker', async () => {
      const dto = Object.assign(new QueryJobsDto(), { sortBy: SortBy.TITLE, sortOrder: SortOrder.ASC });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ title: 'asc' }, { postedAt: { sort: 'desc', nulls: 'last' } }],
        }),
      );
    });

    it('sorts by company name with postedAt tiebreaker', async () => {
      const dto = Object.assign(new QueryJobsDto(), { sortBy: SortBy.COMPANY, sortOrder: SortOrder.ASC });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ company: { name: 'asc' } }, { postedAt: { sort: 'desc', nulls: 'last' } }],
        }),
      );
    });

    it('sorts strictly by postedAt descending by default or request', async () => {
      const dto = Object.assign(new QueryJobsDto(), { sortBy: SortBy.POSTED_AT, sortOrder: SortOrder.DESC });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ postedAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
        }),
      );
    });

    it('applies default 30-day freshness filter excluding stale or null postedAt', async () => {
      await service.findAll(new QueryJobsDto());

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                postedAt: expect.objectContaining({
                  gte: expect.any(Date),
                  not: null,
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('supports dateRange=all allowing older jobs without postedAt cutoff', async () => {
      const dto = Object.assign(new QueryJobsDto(), { dateRange: 'all' as any });
      await service.findAll(dto);

      const callArgs = prisma.job.findMany.mock.calls[prisma.job.findMany.mock.calls.length - 1][0];
      const andConditions = callArgs.where.AND;
      const hasDateFilter = andConditions.some((c: any) => c.postedAt && c.postedAt.gte);
      expect(hasDateFilter).toBe(false);
    });

    it('calculates hasNextPage=true when more pages exist', async () => {
      prisma.job.count.mockResolvedValue(100);
      prisma.$transaction.mockResolvedValue([[mockJob], 100]);

      const dto = Object.assign(new QueryJobsDto(), { page: 1, limit: 20 });
      const result = await service.findAll(dto);

      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.totalPages).toBe(5);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns full job details when found and verified Indian', async () => {
      const result = await service.findOne('job-1');

      expect(result.id).toBe('job-1');
      expect(result.title).toBe('React Developer Intern');
      expect(result.indiaEligibility).toBe('VERIFIED_INDIAN');
      expect(result.company.name).toBe('Acme Corp');
      expect(result.source?.name).toBe('Simplify Jobs');
    });

    it('throws NotFoundException when job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when job is INTERNATIONAL', async () => {
      prisma.job.findUnique.mockResolvedValue({
        ...mockFullJob,
        indiaEligibility: 'INTERNATIONAL',
        location: 'London, UK',
      });

      await expect(service.findOne('job-international')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('job-international')).rejects.toThrow("Job with ID 'job-international' not found");
    });

    it('throws NotFoundException when job is AMBIGUOUS', async () => {
      prisma.job.findUnique.mockResolvedValue({
        ...mockFullJob,
        indiaEligibility: 'AMBIGUOUS',
      });

      await expect(service.findOne('job-ambiguous')).rejects.toThrow(NotFoundException);
    });

    it('queries by correct id', async () => {
      await service.findOne('job-abc');

      expect(prisma.job.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'job-abc' } }),
      );
    });
  });

  // ── getFilters ────────────────────────────────────────────────────────────

  describe('getFilters', () => {
    it('returns distinct filters for verified Indian opportunities', async () => {
      prisma.jobClassification.groupBy
        .mockResolvedValueOnce([{ role: 'Frontend Developer' }])
        .mockResolvedValueOnce([{ city: 'Bengaluru' }])
        .mockResolvedValueOnce([{ jobType: 'INTERNSHIP' }])
        .mockResolvedValueOnce([{ experienceLevel: 'FRESHER' }]);

      prisma.job.groupBy.mockResolvedValueOnce([{ location: 'Mumbai' }]);

      const filters = await service.getFilters();

      expect(filters.roles).toEqual(['Frontend Developer']);
      expect(filters.cities).toContain('Bengaluru');
      expect(filters.cities).toContain('Mumbai');
      expect(filters.workModes).toEqual(['ONSITE', 'HYBRID', 'REMOTE']);
      expect(filters.jobTypes).toEqual(['INTERNSHIP']);
      expect(filters.experienceLevels).toEqual(['FRESHER']);
    });
  });
});
