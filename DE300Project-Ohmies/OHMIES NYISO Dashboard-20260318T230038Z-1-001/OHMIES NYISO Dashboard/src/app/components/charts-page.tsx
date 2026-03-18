import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Database } from 'lucide-react';
import { useEnergyData } from '../context/energy-data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getUtilityInfo } from '../utils/nyiso-locations';

export function ChartsPage() {
  const { data, fileName } = useEnergyData();
  const navigate = useNavigate();

  // Get unique utilities from data
  const utilities = useMemo(() => {
    const uniqueUtilities = Array.from(new Set(data.map(d => d.utility).filter(Boolean)));
    return uniqueUtilities;
  }, [data]);

  // Group data by utility
  const dataByUtility = useMemo(() => {
    const grouped = new Map<string, any[]>();
    
    data.forEach(point => {
      const utility = point.utility || 'Unknown';
      if (!grouped.has(utility)) {
        grouped.set(utility, []);
      }
      
      // Support both 'timestamp' and 'Hour Start' column names
      const timestamp = point['timestamp'] || point['Hour Start'];
      const date = new Date(timestamp);
      const formattedTime = date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit',
        hour12: false
      });
      
      grouped.get(utility)!.push({
        percent_error: point.percent_error,
        timestamp: timestamp,
        displayTime: formattedTime,
        weekStart: point.weekStart,
        dateObj: date,
      });
    });

    // Sort each utility's data by timestamp
    grouped.forEach((utilData) => {
      utilData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });
    
    return grouped;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <Database className="size-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Please upload CSV files to view charts.
          </p>
          <Button onClick={() => navigate('/')}>
            Upload Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Percent Error Analysis</h1>
        <p className="text-gray-600">Prediction accuracy across utilities from {fileName}</p>
        {utilities.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {utilities.length === 1 ? `Utility: ${utilities[0]}` : `Utilities: ${utilities.join(', ')}`}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Create separate chart for each utility */}
        {Array.from(dataByUtility.entries()).map(([utility, utilData]) => {
          const utilInfo = getUtilityInfo(utility);
          const avgError = utilData.reduce((sum, d) => sum + Math.abs(d.percent_error), 0) / utilData.length;
          const maxError = Math.max(...utilData.map((d) => Math.abs(d.percent_error)));
          const weekStart = utilData[0]?.weekStart;
          
          // Find week boundaries - where weekStart changes
          const weekBoundaries: number[] = [];
          for (let i = 1; i < utilData.length; i++) {
            if (utilData[i].weekStart !== utilData[i - 1].weekStart) {
              weekBoundaries.push(i);
            }
          }
          
          return (
            <Card key={utility}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{utility} - Percent Error Over Time</CardTitle>
                    <CardDescription>
                      {utilInfo?.name || 'Unknown Zone'}
                      {weekStart && ` - Week of ${weekStart}`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Avg Abs Error</div>
                    <div className="text-2xl font-semibold" style={{ color: utilInfo?.color || '#666' }}>
                      {avgError.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Accuracy: {(100 - avgError).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={utilData} margin={{ bottom: 60, left: 20, right: 20, top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="displayTime"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Hour Start', position: 'insideBottom', offset: -50 }}
                    />
                    <YAxis 
                      label={{ value: 'Percent Error (%)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={(label) => `Time: ${label}`}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Percent Error']}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                    
                    {/* Add reference lines at week boundaries */}
                    {weekBoundaries.map((boundaryIndex) => (
                      <ReferenceLine
                        key={boundaryIndex}
                        x={utilData[boundaryIndex].displayTime}
                        stroke="#ff6b6b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{
                          value: `Week: ${utilData[boundaryIndex].weekStart}`,
                          position: 'top',
                          fill: '#ff6b6b',
                          fontSize: 11,
                        }}
                      />
                    ))}
                    
                    <Line 
                      type="monotone" 
                      dataKey="percent_error" 
                      stroke={utilInfo?.color || '#10b981'}
                      strokeWidth={2}
                      name="Percent Error"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Additional stats for this utility */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Data Points</div>
                    <div className="text-lg font-semibold">{utilData.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Max Abs Error</div>
                    <div className="text-lg font-semibold">{maxError.toFixed(2)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Avg Abs Error</div>
                    <div className="text-lg font-semibold">{avgError.toFixed(2)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Summary statistics grid */}
        {utilities.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Summary - All Utilities</CardTitle>
              <CardDescription>Quick comparison across all {utilities.length} utilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {utilities.map(utility => {
                  const utilData = dataByUtility.get(utility) || [];
                  const avgError = utilData.reduce((sum, d) => sum + Math.abs(d.percent_error), 0) / utilData.length;
                  const maxError = Math.max(...utilData.map(d => Math.abs(d.percent_error)));
                  const utilInfo = getUtilityInfo(utility);
                  
                  return (
                    <div 
                      key={utility}
                      className="p-4 border rounded-lg border-l-4"
                      style={{ borderLeftColor: utilInfo?.color || '#666' }}
                    >
                      <div className="font-semibold text-lg mb-1">{utility}</div>
                      <div className="text-xs text-gray-500 mb-3">{utilInfo?.name || 'Unknown Zone'}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Error:</span>
                          <span className="font-medium">{avgError.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Error:</span>
                          <span className="font-medium">{maxError.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accuracy:</span>
                          <span className="font-medium text-green-600">{(100 - avgError).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}