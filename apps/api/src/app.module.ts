import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { CompaniesModule } from './companies/companies.module';
import { SourcesModule } from './sources/sources.module';
import { StatsModule } from './stats/stats.module';
import { HealthModule } from './common/health/health.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Load environment variables globally; make available via ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    JobsModule,
    CompaniesModule,
    SourcesModule,
    StatsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
