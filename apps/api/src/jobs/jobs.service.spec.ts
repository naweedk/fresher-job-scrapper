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
  description: 'Join our team as a frontend intern...',
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

    it('applies status=ACTIVE filter always', async () => {
      await service.findAll(new QueryJobsDto());
      const [findManyCall] = (prisma.$transaction as jest.Mock).mock.calls[0][0];
      void findManyCall; // $transaction receives the promises
      // Verify status ACTIVE in where via findMany call
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) }),
      );
    });

    it('applies search OR filter when search is provided', async () => {
      const dto = Object.assign(new QueryJobsDto(), { search: 'react' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'react', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('applies city classification filter', async () => {
      const dto = Object.assign(new QueryJobsDto(), { city: 'Mumbai' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            classification: expect.objectContaining({
              city: { contains: 'Mumbai', mode: 'insensitive' },
            }),
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
            classification: expect.objectContaining({
              role: { contains: 'Frontend', mode: 'insensitive' },
            }),
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
            classification: expect.objectContaining({ jobType: 'INTERNSHIP' }),
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
            classification: expect.objectContaining({ experienceLevel: 'FRESHER' }),
          }),
        }),
      );
    });

    it('applies workMode filter', async () => {
      const dto = Object.assign(new QueryJobsDto(), { workMode: 'REMOTE' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            classification: expect.objectContaining({ workMode: 'REMOTE' }),
          }),
        }),
      );
    });

    it('applies skills filter splitting comma-separated string', async () => {
      const dto = Object.assign(new QueryJobsDto(), { skills: 'React,Node.js' });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            classification: expect.objectContaining({
              skills: { hasSome: ['React', 'Node.js'] },
            }),
          }),
        }),
      );
    });

    it('applies multiple filters together', async () => {
      const dto = Object.assign(new QueryJobsDto(), {
        city: 'Bengaluru', jobType: 'FULL_TIME', workMode: 'HYBRID',
      });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            classification: expect.objectContaining({
              city: { contains: 'Bengaluru', mode: 'insensitive' },
              jobType: 'FULL_TIME',
              workMode: 'HYBRID',
            }),
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

    it('sorts by title ascending', async () => {
      const dto = Object.assign(new QueryJobsDto(), { sortBy: SortBy.TITLE, sortOrder: SortOrder.ASC });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { title: 'asc' } }),
      );
    });

    it('sorts by company name', async () => {
      const dto = Object.assign(new QueryJobsDto(), { sortBy: SortBy.COMPANY, sortOrder: SortOrder.ASC });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { company: { name: 'asc' } } }),
      );
    });

    it('sorts by postedAt with createdAt fallback', async () => {
      const dto = Object.assign(new QueryJobsDto(), { sortBy: SortBy.POSTED_AT, sortOrder: SortOrder.DESC });
      await service.findAll(dto);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
        }),
      );
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
    it('returns full job details when found', async () => {
      const result = await service.findOne('job-1');

      expect(result.id).toBe('job-1');
      expect(result.title).toBe('React Developer Intern');
      expect(result.company.name).toBe('Acme Corp');
      expect(result.source?.name).toBe('Simplify Jobs');
    });

    it('throws NotFoundException when job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow('Job not found');
    });

    it('queries by correct id', async () => {
      await service.findOne('job-abc');

      expect(prisma.job.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'job-abc' } }),
      );
    });
  });

  // ── getFilters ───────────────────────────────────────────────────────────

  describe('getFilters', () => {
    beforeEach(() => {
      (prisma.jobClassification.groupBy as jest.Mock)
        .mockResolvedValueOnce([{ role: 'Software Engineer' }, { role: 'Data Analyst' }])
        .mockResolvedValueOnce([{ city: 'Mumbai' }, { city: 'Bengaluru' }])
        .mockResolvedValueOnce([{ jobType: 'INTERNSHIP' }, { jobType: 'FULL_TIME' }])
        .mockResolvedValueOnce([{ experienceLevel: 'FRESHER' }])
        .mockResolvedValueOnce([{ workMode: 'REMOTE' }, { workMode: 'HYBRID' }]);
    });

    it('returns sorted roles', async () => {
      const result = await service.getFilters();
      expect(result.roles).toEqual(['Data Analyst', 'Software Engineer']);
    });

    it('returns sorted cities', async () => {
      const result = await service.getFilters();
      expect(result.cities).toEqual(['Bengaluru', 'Mumbai']);
    });

    it('returns job types', async () => {
      const result = await service.getFilters();
      expect(result.jobTypes).toContain('INTERNSHIP');
      expect(result.jobTypes).toContain('FULL_TIME');
    });

    it('queries only COMPLETED classifications', async () => {
      await service.getFilters();

      const calls = (prisma.jobClassification.groupBy as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0].where.status).toBe('COMPLETED');
      });
    });

    it('returns empty arrays when no classifications exist', async () => {
      (prisma.jobClassification.groupBy as jest.Mock).mockReset().mockResolvedValue([]);
      const result = await service.getFilters();

      expect(result.roles).toEqual([]);
      expect(result.cities).toEqual([]);
      expect(result.jobTypes).toEqual([]);
    });
  });
});
