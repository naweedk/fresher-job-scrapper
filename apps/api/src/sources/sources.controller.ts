import { Controller, Get } from '@nestjs/common';
import { SourcesService } from './sources.service';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  /** GET /api/sources */
  @Get()
  findAll() {
    return this.sourcesService.findAll();
  }
}
