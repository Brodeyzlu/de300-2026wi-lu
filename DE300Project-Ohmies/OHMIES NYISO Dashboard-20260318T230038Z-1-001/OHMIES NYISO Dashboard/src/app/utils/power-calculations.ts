import { EnergyDataPoint } from '../context/energy-data-context';

/**
 * Calculate power from voltage and current if not already present
 * Power (W) = Voltage (V) × Current (A)
 */
export function calculatePower(dataPoint: EnergyDataPoint): EnergyDataPoint {
  if (dataPoint.power !== undefined) {
    return dataPoint;
  }

  if (dataPoint.voltage !== undefined && dataPoint.current !== undefined) {
    return {
      ...dataPoint,
      power: dataPoint.voltage * dataPoint.current,
    };
  }

  return dataPoint;
}

/**
 * Process array of data points to calculate power metrics
 */
export function processEnergyData(data: EnergyDataPoint[]): EnergyDataPoint[] {
  return data.map(calculatePower);
}

/**
 * Calculate total energy consumption (kWh)
 */
export function calculateTotalEnergy(data: EnergyDataPoint[]): number {
  return data.reduce((sum, point) => {
    return sum + (point.energy || 0);
  }, 0);
}

/**
 * Calculate average power (W)
 */
export function calculateAveragePower(data: EnergyDataPoint[]): number {
  if (data.length === 0) return 0;
  const totalPower = data.reduce((sum, point) => sum + (point.power || 0), 0);
  return totalPower / data.length;
}

/**
 * Calculate peak power (W)
 */
export function calculatePeakPower(data: EnergyDataPoint[]): number {
  return Math.max(...data.map(point => point.power || 0), 0);
}

/**
 * Get summary statistics
 */
export function getEnergyStats(data: EnergyDataPoint[]) {
  const processedData = processEnergyData(data);
  
  return {
    totalEnergy: calculateTotalEnergy(processedData),
    averagePower: calculateAveragePower(processedData),
    peakPower: calculatePeakPower(processedData),
    dataPoints: processedData.length,
  };
}
