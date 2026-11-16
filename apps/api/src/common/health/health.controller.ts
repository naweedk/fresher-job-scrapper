import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/health
   *
   * Performs a live database connectivity check.
   * Returns HTTP 200 when healthy, HTTP 503 when database is unavailable.
   */
  @Get()
  async getHealth(@Res() res: Response) {
    const dbConnected = await this.prisma.isConnected();

    const body = {
      status: dbConnected ? 'ok' : 'error',
      service: 'fresher-jobs-api',
      database: dbConnected ? 'connected' : 'disconnected',
    };

    return res
      .status(dbConnected ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json(body);
  }
}
