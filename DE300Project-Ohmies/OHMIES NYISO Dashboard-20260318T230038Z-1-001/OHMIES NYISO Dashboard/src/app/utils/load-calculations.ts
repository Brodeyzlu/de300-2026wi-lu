import { LoadDataPoint } from '../context/energy-data-context';

/**
 * Calculate statistics for load data
 */
export interface LoadStats {
  totalActualLoad: number;
  totalPredictedLoad: number;
  avgActualLoad: number;
  avgPredictedLoad: number;
  avgError: number;
  avgAbsError: number;
  avgPercentError: number;
  maxActualLoad: number;
  maxPredictedLoad: number;
  dataPoints: number;
  accuracy: number; // 100 - avgPercentError
}

export function calculateLoadStats(data: LoadDataPoint[]): LoadStats {
  if (data.length === 0) {
    return {
      totalActualLoad: 0,
      totalPredictedLoad: 0,
      avgActualLoad: 0,
      avgPredictedLoad: 0,
      avgError: 0,
      avgAbsError: 0,
      avgPercentError: 0,
      maxActualLoad: 0,
      maxPredictedLoad: 0,
      dataPoints: 0,
      accuracy: 0,
    };
  }

  const totalActualLoad = data.reduce((sum, point) => sum + (point.actual_load || 0), 0);
  const totalPredictedLoad = data.reduce((sum, point) => sum + (point.predicted_load || 0), 0);
  const totalError = data.reduce((sum, point) => sum + (point.error || 0), 0);
  const totalAbsError = data.reduce((sum, point) => sum + (point.abs_error || 0), 0);
  const totalPercentError = data.reduce((sum, point) => sum + Math.abs(point.percent_error || 0), 0);

  const avgActualLoad = totalActualLoad / data.length;
  const avgPredictedLoad = totalPredictedLoad / data.length;
  const avgError = totalError / data.length;
  const avgAbsError = totalAbsError / data.length;
  const avgPercentError = totalPercentError / data.length;

  const maxActualLoad = Math.max(...data.map(point => point.actual_load || 0));
  const maxPredictedLoad = Math.max(...data.map(point => point.predicted_load || 0));

  return {
    totalActualLoad,
    totalPredictedLoad,
    avgActualLoad,
    avgPredictedLoad,
    avgError,
    avgAbsError,
    avgPercentError,
    maxActualLoad,
    maxPredictedLoad,
    dataPoints: data.length,
    accuracy: Math.max(0, 100 - avgPercentError),
  };
}

/**
 * Group data by utility
 */
export function groupByUtility(data: LoadDataPoint[]): Map<string, LoadDataPoint[]> {
  const groups = new Map<string, LoadDataPoint[]>();
  
  data.forEach(point => {
    const utility = point.utility || 'Unknown';
    if (!groups.has(utility)) {
      groups.set(utility, []);
    }
    groups.get(utility)!.push(point);
  });
  
  return groups;
}

/**
 * Calculate stats for each utility
 */
export function calculateUtilityStats(data: LoadDataPoint[]): Map<string, LoadStats> {
  const grouped = groupByUtility(data);
  const stats = new Map<string, LoadStats>();
  
  grouped.forEach((utilityData, utility) => {
    stats.set(utility, calculateLoadStats(utilityData));
  });
  
  return stats;
}
