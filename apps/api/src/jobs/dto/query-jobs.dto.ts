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
  sortBy?: SortBy = SortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
