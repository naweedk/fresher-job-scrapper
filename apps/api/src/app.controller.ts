import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /**
   * GET /api
   * Returns basic API metadata.
   */
  @Get()
  getInfo() {
    return {
      name: 'Fresher Jobs India API',
      version: '1.0.0',
      description:
        'REST API for the Fresher Jobs India job aggregation platform.',
      environment: process.env.NODE_ENV ?? 'development',
      docs: '/api/health',
    };
  }
}
