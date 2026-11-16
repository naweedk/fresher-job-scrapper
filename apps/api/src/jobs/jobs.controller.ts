import { Controller, Get, Param, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { QueryJobsDto } from './dto/query-jobs.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * GET /api/jobs/filters
   * Returns distinct filter values from classified jobs.
   * MUST be declared before :id to avoid route shadowing.
   */
  @Get('filters')
  getFilters() {
    return this.jobsService.getFilters();
  }

  /**
   * GET /api/jobs
   * Returns a paginated, filtered, sorted list of active jobs.
   */
  @Get()
  findAll(@Query() query: QueryJobsDto) {
    return this.jobsService.findAll(query);
  }

  /**
   * GET /api/jobs/:id
   * Returns a single job with full details.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
}
