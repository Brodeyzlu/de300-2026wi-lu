import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  Zap,
  TrendingUp,
  Database,
  Target,
} from "lucide-react";
import { useEnergyData } from "../context/energy-data-context";
import { calculateLoadStats } from "../utils/load-calculations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { getUtilityInfo } from "../utils/nyiso-locations";

export function OverviewPage() {
  const { data, fileName } = useEnergyData();
  const navigate = useNavigate();

  // 1. Process Raw Data into Chart-friendly format
  const chartData = useMemo(() => {
    return data.map((point, index) => {
      // Update: Use the key 'timestamp' as seen in your provided image
      const rawTimestamp = point["timestamp"];

      // Parse the date string. JS Date constructor handles "YYYY-MM-DD HH:mm:ss" well.
      const date = new Date(rawTimestamp);

      // Check for invalid dates to prevent UI crashes
      const isValidDate = !isNaN(date.getTime());

      const formattedTime = isValidDate
        ? date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit", // Added minutes for precision if needed
            hour12: false,
          })
        : "Invalid Date";

      return {
        ...point,
        index,
        // Ensure values are numbers, handling the high precision decimals in your file
        actual: parseFloat(point.actual_load) || 0,
        predicted: parseFloat(point.predicted_load) || 0,
        actualValue: parseFloat(point.actual_load) || 0,
        predictedValue: parseFloat(point.predicted_load) || 0,
        displayTime: formattedTime,
        utility: point.utility || "CAPITL", // Defaulting to the name in your screenshot title
        timestamp: rawTimestamp,
      };
    });
  }, [data]);

  // 2. Derive unique utilities from the dataset
  const utilities = useMemo(() => {
    return Array.from(
      new Set(data.map((d) => d.utility).filter(Boolean)),
    );
  }, [data]);

  // 3. Calculate stats per utility
  const statsByUtility = useMemo(() => {
    const statsMap = new Map<string, any>();
    utilities.forEach((util) => {
      const utilData = data.filter((d) => d.utility === util);
      if (utilData.length > 0) {
        statsMap.set(util, calculateLoadStats(utilData));
      }
    });
    return statsMap;
  }, [data, utilities]);

  // 4. Group chart data by utility for individual graphs
  const dataByUtility = useMemo(() => {
    const grouped = new Map<string, typeof chartData>();

    chartData.forEach((point) => {
      const util = point.utility;
      if (!grouped.has(util)) {
        grouped.set(util, []);
      }
      grouped.get(util)!.push(point);
    });

    // Sort by chronological order
    grouped.forEach((utilData) => {
      utilData.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime(),
      );
    });

    return grouped;
  }, [chartData]);

  // Empty State
  if (data.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <Database className="size-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 mb-6">
            Please upload a CSV file to view NYISO load data.
          </p>
          <Button onClick={() => navigate("/")}>
            Upload Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Load Overview
          {utilities.length === 1
            ? ` - ${utilities[0]}`
            : utilities.length > 1
              ? ` - ${utilities.length} Utilities`
              : ""}
        </h1>
        <p className="text-gray-600">
          Current dataset: {fileName}
        </p>
        {utilities.length > 1 && (
          <p className="text-sm text-gray-500 mt-1">
            Utilities: {utilities.join(", ")}
          </p>
        )}
      </div>

      {/* Stats Cards per Utility */}
      {Array.from(statsByUtility.entries()).map(
        ([util, utilStats]) => {
          const utilInfo = getUtilityInfo(util);
          const firstPoint = data.find(
            (d) => d.utility === util,
          );
          const utilData = dataByUtility.get(util) || [];

          // Calculate Y domain for individual charts
          const allValues = utilData.flatMap((d) => [
            d.actualValue,
            d.predictedValue,
          ]);
          const minValue = Math.floor(
            Math.min(...allValues) - 100,
          );
          const maxValue = Math.ceil(
            Math.max(...allValues) + 100,
          );
          const yDomain: [number, number] = [
            minValue,
            maxValue,
          ];

          // Find week boundaries
          const boundaries: number[] = [];
          for (let i = 1; i < utilData.length; i++) {
            if (
              utilData[i].weekStart !==
              utilData[i - 1].weekStart
            ) {
              boundaries.push(i);
            }
          }

          return (
            <section key={util} className="mb-12">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="w-1.5 h-8 rounded-full"
                  style={{
                    backgroundColor: utilInfo?.color || "#666",
                  }}
                />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {util}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {utilInfo?.name || "NYISO Zone"}{" "}
                    {firstPoint?.weekStart &&
                      `— Week of ${firstPoint.weekStart}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Avg Actual Load
                    </CardTitle>
                    <Activity className="size-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-gray-900">
                      {utilStats?.avgActualLoad.toFixed(1)} MW
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Avg Predicted Load
                    </CardTitle>
                    <Zap className="size-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-gray-900">
                      {utilStats?.avgPredictedLoad.toFixed(1)}{" "}
                      MW
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Accuracy
                    </CardTitle>
                    <Target className="size-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-gray-900">
                      {utilStats?.accuracy.toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Peak Load
                    </CardTitle>
                    <TrendingUp className="size-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-gray-900">
                      {utilStats?.maxActualLoad.toFixed(1)} MW
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Chart for this Utility */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Actual vs. Predicted Load Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={utilData}
                        margin={{
                          bottom: 60,
                          left: 10,
                          right: 10,
                          top: 20,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f0f0f0"
                        />
                        <XAxis
                          dataKey="displayTime"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11 }}
                          interval={Math.floor(
                            utilData.length / 15,
                          )}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          label={{
                            value: "MW",
                            angle: -90,
                            position: "insideLeft",
                          }}
                          domain={yDomain}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                          formatter={(
                            value: number,
                            name: string,
                          ) => [
                            `${value.toFixed(2)} MW`,
                            name === "actual"
                              ? "Actual Load"
                              : "Predicted Load",
                          ]}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                        />

                        {/* Actual Line - Solid Blue */}
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          name="actual"
                          dot={false}
                          activeDot={{ r: 6 }}
                        />

                        {/* Predicted Line - Dashed Amber */}
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          name="predicted"
                          dot={false}
                          strokeDasharray="5 5"
                        />

                        {/* Week Boundary Markers */}
                        {boundaries.map((idx) => (
                          <ReferenceLine
                            key={`${util}-boundary-${idx}`}
                            x={utilData[idx].displayTime}
                            stroke="#cbd5e1"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            label={{
                              value: "<-- JAN | JUL -->",
                              position: "top",
                              fontSize: 10,
                              fill: "#94a3b8",
                            }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Load Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Actual Load Only */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                      <Activity className="size-4 text-blue-600" />
                      Actual Load Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <AreaChart data={utilData}>
                          <defs>
                            <linearGradient
                              id={`colorActual-${util}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.1}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0f0f0"
                          />
                          <XAxis dataKey="displayTime" hide />
                          <YAxis
                            domain={yDomain}
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip
                            formatter={(v: number) => [
                              `${v.toFixed(1)} MW`,
                              "Actual",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="actualValue"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill={`url(#colorActual-${util})`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Predicted Load Only */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                      <Zap className="size-4 text-amber-500" />
                      Predicted Load Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <AreaChart data={utilData}>
                          <defs>
                            <linearGradient
                              id={`colorPred-${util}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#f59e0b"
                                stopOpacity={0.1}
                              />
                              <stop
                                offset="95%"
                                stopColor="#f59e0b"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0f0f0"
                          />
                          <XAxis dataKey="displayTime" hide />
                          <YAxis
                            domain={yDomain}
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip
                            formatter={(v: number) => [
                              `${v.toFixed(1)} MW`,
                              "Predicted",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="predictedValue"
                            stroke="#f59e0b"
                            fillOpacity={1}
                            fill={`url(#colorPred-${util})`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          );
        },
      )}

      {/* Footer Navigation */}
      <div className="flex gap-4 mt-8">
        <Button onClick={() => navigate("/charts")}>
          View Detailed Charts
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/maps")}
        >
          View NYISO Map
        </Button>
      </div>
    </div>
  );
}