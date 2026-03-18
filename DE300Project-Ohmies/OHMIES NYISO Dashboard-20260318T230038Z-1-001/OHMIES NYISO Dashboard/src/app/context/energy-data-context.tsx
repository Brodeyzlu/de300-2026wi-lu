import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LoadDataPoint {
  'Hour Start': string;
  actual_load: number;
  predicted_load: number;
  error: number;
  abs_error: number;
  percent_error: number;
  utility?: string;
  weekStart?: string;
  fileName?: string;
  [key: string]: string | number | undefined;
}

interface EnergyDataContextType {
  data: LoadDataPoint[];
  setData: (data: LoadDataPoint[]) => void;
  fileName: string;
  setFileName: (name: string) => void;
  selectedUtility: string;
  setSelectedUtility: (utility: string) => void;
}

const EnergyDataContext = createContext<EnergyDataContextType | undefined>(undefined);

export function EnergyDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LoadDataPoint[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [selectedUtility, setSelectedUtility] = useState<string>('ALL');

  return (
    <EnergyDataContext.Provider value={{ 
      data, 
      setData, 
      fileName, 
      setFileName,
      selectedUtility,
      setSelectedUtility
    }}>
      {children}
    </EnergyDataContext.Provider>
  );
}

export function useEnergyData() {
  const context = useContext(EnergyDataContext);
  if (!context) {
    throw new Error('useEnergyData must be used within EnergyDataProvider');
  }
  return context;
}