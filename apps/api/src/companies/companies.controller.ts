import { Controller, Get } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /** GET /api/companies */
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }
}
