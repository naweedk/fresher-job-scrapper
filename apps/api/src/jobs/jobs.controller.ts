import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * GET /api/jobs
   * Returns a paginated list of jobs (Phase 2 implementation).
   */
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }
}
