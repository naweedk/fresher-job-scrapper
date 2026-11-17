import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  POSTED_AT = 'postedAt',
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  COMPANY = 'company',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryJobsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['INTERNSHIP', 'FULL_TIME', 'CONTRACT', 'OTHER'])
  jobType?: string;

  @IsOptional()
  @IsEnum(['FRESHER', 'ZERO_TO_ONE_YEAR', 'ONE_TO_TWO_YEARS', 'OTHER'])
  experienceLevel?: string;

  @IsOptional()
  @IsEnum(['ONSITE', 'REMOTE', 'HYBRID', 'UNKNOWN'])
  workMode?: string;

  /** Comma-separated list of skills, e.g. `react,nodejs` */
  @IsOptional()
  @IsString()
  skills?: string;

  /** Configurable date freshness filter: '24h' | '3d' | '7d' | '14d' | '30d' | 'all' */
  @IsOptional()
  @IsEnum(['24h', '3d', '7d', '14d', '30d', 'all'])
  dateRange?: '24h' | '3d' | '7d' | '14d' | '30d' | 'all' = '30d';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.POSTED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
