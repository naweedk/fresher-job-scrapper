/**
 * Stats service — wraps the /api/stats endpoint.
 */
import { apiService } from './api';
import type { StatsResponse } from '../types/api.types';

export const statsService = {
  getStats(): Promise<StatsResponse> {
    return apiService.get<StatsResponse>('/stats');
  },
};
