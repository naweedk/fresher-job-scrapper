import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /api/stats
   * Returns aggregated platform statistics.
   * Phase 2 will populate with real data.
   */
  @Get()
  getSummary() {
    return this.statsService.getSummary();
  }
}
