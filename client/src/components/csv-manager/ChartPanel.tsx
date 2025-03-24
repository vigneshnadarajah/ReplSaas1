import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bar, 
  BarChart, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { type CsvData, type CsvRowData } from "@shared/schema";
import { detectColumnType, getRecommendedChartType } from "@/lib/csvUtils";
import { 
  BarChart2, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  ChevronLeft 
} from "lucide-react";

// Define colors for chart elements
const COLORS = [
  '#167ABC', '#6FB07F', '#F6BD17', '#FF7572', '#6E8AD3', 
  '#D37EAB', '#A06CB9', '#5CC5C0', '#FFA75C', '#A3A3A3'
];

interface ChartPanelProps {
  data: CsvData[];
  headers: string[];
  isCollapsed?: boolean;
}

interface ChartData {
  name: string;
  value: number;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ 
  data,
  headers,
  isCollapsed = false
}) => {
  const [selectedChart, setSelectedChart] = useState<string>(headers[0] || "make");
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [isLocalCollapsed, setIsLocalCollapsed] = useState(isCollapsed);

  // Detect the best chart type for each field based on data type
  const detectBestChartType = (fieldName: string): 'pie' | 'bar' | 'line' => {
    if (!data || data.length === 0) return 'bar';

    const values = data.map(item => {
      const rowData = item.rowData as CsvRowData;
      return rowData[fieldName];
    });

    const dataType = detectColumnType(values);
    
    // Use the utility function to get the recommended chart type
    return getRecommendedChartType(fieldName, dataType);
  };

  // Prepare data for visualization
  const prepareChartData = (fieldName: string): ChartData[] => {
    if (!data || data.length === 0) return [];

    const counter: Record<string, number> = {};
    
    data.forEach(item => {
      const rowData = item.rowData as CsvRowData;
      const value = String(rowData[fieldName] || 'N/A');
      
      counter[value] = (counter[value] || 0) + 1;
    });
    
    return Object.entries(counter)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by frequency
  };

  // Create aggregated data for line charts (useful for year data)
  const prepareLineChartData = (fieldName: string, metricField?: string): any[] => {
    if (!data || data.length === 0) return [];

    // If no metric field provided, we'll just count occurrences
    if (!metricField) {
      return prepareChartData(fieldName);
    }

    const aggregated: Record<string, { count: number, sum: number }> = {};
    
    data.forEach(item => {
      const rowData = item.rowData as CsvRowData;
      const key = String(rowData[fieldName] || 'N/A');
      const metricValue = Number(rowData[metricField] || 0);
      
      if (!aggregated[key]) {
        aggregated[key] = { count: 0, sum: 0 };
      }
      
      aggregated[key].count += 1;
      aggregated[key].sum += isNaN(metricValue) ? 0 : metricValue;
    });
    
    return Object.entries(aggregated)
      .map(([name, { count, sum }]) => ({ 
        name, 
        count,
        average: count > 0 ? sum / count : 0
      }))
      .sort((a, b) => {
        // Try to sort numerically if possible
        const numA = Number(a.name);
        const numB = Number(b.name);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.name.localeCompare(b.name);
      });
  };

  // When selected chart changes, update the chart type
  useEffect(() => {
    if (selectedChart && headers.includes(selectedChart)) {
      setChartType(detectBestChartType(selectedChart));
    }
  }, [selectedChart, headers, data]);

  // Memoize the chart data to prevent recalculation on every render
  const chartData = useMemo(() => {
    if (chartType === 'line') {
      return prepareLineChartData(selectedChart);
    }
    return prepareChartData(selectedChart);
  }, [selectedChart, data, chartType]);

  // Handle dropdown selection change
  const handleChartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChart(e.target.value);
  };
  
  // Handle chart type change
  const handleChartTypeChange = (type: 'pie' | 'bar' | 'line') => {
    setChartType(type);
  };

  // If the panel is collapsed, show minimal UI
  if (isLocalCollapsed) {
    return (
      <div className="w-8 bg-white border border-[#d0d0d0] flex flex-col items-center">
        <button 
          className="w-full p-2 bg-[#f5f5f5] border-b border-[#d0d0d0] text-center"
          onClick={() => setIsLocalCollapsed(false)}
        >
          <i className="fas fa-chart-bar"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="w-96 flex-col shrink-0 bg-white border border-[#d0d0d0] rounded-sm overflow-hidden flex">
      <div className="flex justify-between items-center bg-[#f5f5f5] border-b border-[#d0d0d0] p-2 px-4">
        <span className="font-semibold">Data Visualization</span>
        <button className="text-neutral-400 hover:text-neutral-500" onClick={() => setIsLocalCollapsed(true)}>
          <i className="fas fa-minus"></i>
        </button>
      </div>
      
      <div className="p-4 flex flex-col h-full">
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-500 mb-1">Select Field</label>
          <select 
            className="w-full border border-neutral-200 p-2 rounded-sm bg-white"
            value={selectedChart}
            onChange={handleChartChange}
          >
            {headers.map((header) => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-500 mb-1">Chart Type</label>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 rounded-sm ${chartType === 'pie' 
                ? 'bg-[#167ABC] text-white' 
                : 'bg-[#f5f5f5] border border-[#d0d0d0]'}`}
              onClick={() => handleChartTypeChange('pie')}
            >
              Pie
            </button>
            <button 
              className={`px-3 py-1.5 rounded-sm ${chartType === 'bar' 
                ? 'bg-[#167ABC] text-white' 
                : 'bg-[#f5f5f5] border border-[#d0d0d0]'}`}
              onClick={() => handleChartTypeChange('bar')}
            >
              Bar
            </button>
            <button 
              className={`px-3 py-1.5 rounded-sm ${chartType === 'line' 
                ? 'bg-[#167ABC] text-white' 
                : 'bg-[#f5f5f5] border border-[#d0d0d0]'}`}
              onClick={() => handleChartTypeChange('line')}
            >
              Line
            </button>
          </div>
        </div>
        
        <div className="flex-1 h-full min-h-[300px] border border-[#e0e0e0] p-2 bg-white rounded-sm">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-neutral-400">
              No data available for visualization
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                </PieChart>
              ) : chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#167ABC" />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Count" 
                    stroke="#167ABC" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-4 text-sm text-neutral-500">
          <p className="font-medium">Summary</p>
          {chartData.length > 0 && (
            <div className="mt-1">
              <p>Total entries: {data.length}</p>
              <p>Unique values: {chartData.length}</p>
              {chartData.length <= 5 && (
                <div className="mt-1">
                  <p className="font-medium text-xs text-neutral-400">Top Categories:</p>
                  <ul className="list-disc list-inside">
                    {chartData.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="text-xs">
                        {item.name}: {item.value} ({((item.value / data.length) * 100).toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;