import React, { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronDown, Check, X } from 'lucide-react';

interface FilterPanelProps {
  headers: string[];
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
  filters: Record<string, any>;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  searchColumn: string;
  onSearchColumnChange: (column: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  headers,
  onApply,
  onReset,
  filters,
  searchTerm,
  onSearchTermChange,
  searchColumn,
  onSearchColumnChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({});
  const [selectedFilterColumns, setSelectedFilterColumns] = useState<string[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Initialize local filters from props
  useEffect(() => {
    const newLocalFilters: Record<string, any> = {};
    
    // Extract non-special filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== '_global') {
        newLocalFilters[key] = value;
      }
    });
    
    setLocalFilters(newLocalFilters);
    
    // Extract date range if it exists
    if (filters.date_from) setFromDate(filters.date_from);
    if (filters.date_to) setToDate(filters.date_to);
    
    // Extract status filters
    const newStatusFilters: Record<string, boolean> = {};
    Object.keys(filters).forEach(key => {
      if (key.startsWith('status_')) {
        const statusValue = key.replace('status_', '');
        newStatusFilters[statusValue] = true;
      }
    });
    setStatusFilters(newStatusFilters);
    
  }, [filters]);
  
  // Initialize selected filter columns when headers change
  useEffect(() => {
    // Initial set of default filter columns - we'll use a subset of common fields
    const defaultFilterColumns = ['Make', 'Model', 'Year', 'Status'];
    
    // Only set default columns if we haven't selected any yet
    if (selectedFilterColumns.length === 0 && headers.length > 0) {
      // Filter to only include headers that exist in our data
      const availableDefaultColumns = defaultFilterColumns.filter(column => 
        headers.includes(column)
      );
      
      // If we have some matches, use them, otherwise use the first few headers
      if (availableDefaultColumns.length > 0) {
        setSelectedFilterColumns(availableDefaultColumns);
      } else {
        // Just use the first 3-4 columns as default if our predefined ones aren't available
        setSelectedFilterColumns(headers.slice(0, Math.min(4, headers.length)));
      }
    }
  }, [headers, selectedFilterColumns]);

  const handleApplyFilters = () => {
    const appliedFilters: Record<string, any> = { ...localFilters };
    
    // Add search term if it exists
    if (searchTerm) {
      if (searchColumn === 'all') {
        appliedFilters._global = searchTerm;
      } else {
        appliedFilters[searchColumn] = searchTerm;
      }
    }
    
    // Add date range if set
    if (fromDate) appliedFilters.date_from = fromDate;
    if (toDate) appliedFilters.date_to = toDate;
    
    // Add all status filters dynamically
    Object.entries(statusFilters).forEach(([status, isChecked]) => {
      if (isChecked) {
        appliedFilters[`status_${status}`] = true;
      }
    });
    
    // Log the filters being applied
    console.log("FilterPanel - Applying filters:", appliedFilters);
    
    onApply(appliedFilters);
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    setFromDate("");
    setToDate("");
    setStatusFilters({});
    onSearchTermChange("");
    onSearchColumnChange("all");
    onReset();
  };

  const handleStatusChange = (status: keyof typeof statusFilters) => {
    setStatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };
  
  const toggleColumnSelection = (column: string) => {
    setSelectedFilterColumns(prevSelected => {
      if (prevSelected.includes(column)) {
        return prevSelected.filter(col => col !== column);
      } else {
        return [...prevSelected, column];
      }
    });
  };
  
  const handleSelectAllColumns = () => {
    setSelectedFilterColumns([...headers]);
  };
  
  const handleClearAllColumns = () => {
    // Keep at least one column selected
    if (headers.length > 0) {
      setSelectedFilterColumns([headers[0]]);
    } else {
      setSelectedFilterColumns([]);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-8 bg-white border border-[#d0d0d0] flex flex-col items-center">
        <button 
          className="w-full p-2 bg-[#f5f5f5] border-b border-[#d0d0d0] text-center"
          onClick={() => setIsCollapsed(false)}
        >
          <Filter size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 flex flex-col shrink-0 bg-white border border-[#d0d0d0] rounded-sm overflow-hidden">
      <div className="flex justify-between items-center bg-[#f5f5f5] border-b border-[#d0d0d0] p-2 px-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-neutral-600" />
          <span className="font-semibold">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="text-neutral-500 hover:text-neutral-700" 
            onClick={() => setShowColumnSelector(prev => !prev)}
            title="Choose filter columns"
          >
            {showColumnSelector ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button className="text-neutral-400 hover:text-neutral-500" onClick={() => setIsCollapsed(true)}>
            <X size={16} />
          </button>
        </div>
      </div>
      
      {showColumnSelector && (
        <div className="p-3 border-b border-[#d0d0d0] bg-[#f9f9f9]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-neutral-500">Filter Columns</label>
            <div className="flex gap-1">
              <button 
                className="text-xs text-blue-600 hover:text-blue-800" 
                onClick={handleSelectAllColumns}
              >
                Select All
              </button>
              <span className="text-neutral-300">|</span>
              <button 
                className="text-xs text-blue-600 hover:text-blue-800" 
                onClick={handleClearAllColumns}
              >
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto border border-neutral-200 rounded-sm bg-white p-1">
            {headers.map(header => (
              <div 
                key={header} 
                className="flex items-center p-1 hover:bg-neutral-50 cursor-pointer rounded-sm"
                onClick={() => toggleColumnSelection(header)}
              >
                <div className={`w-4 h-4 border rounded-sm mr-2 flex items-center justify-center ${
                  selectedFilterColumns.includes(header) ? 'bg-blue-600 border-blue-600' : 'border-neutral-300'
                }`}>
                  {selectedFilterColumns.includes(header) && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm">{header}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 overflow-y-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-500 mb-1">Search</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full border border-neutral-200 p-2 rounded-sm pl-8"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-3 text-neutral-300"></i>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-500 mb-1">Column</label>
          <select 
            className="w-full border border-neutral-200 p-2 rounded-sm bg-white"
            value={searchColumn}
            onChange={(e) => onSearchColumnChange(e.target.value)}
          >
            <option value="all">All Columns</option>
            {headers.map((header) => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
        
        {/* Only show Status filter if it's in the selected columns */}
        {selectedFilterColumns.some(col => col.toLowerCase() === 'status' || col.toLowerCase() === 'state' || col.toLowerCase() === 'condition') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-500 mb-1">Status</label>
            <div className="space-y-1">
              {/* Common statuses - will show by default */}
              {['active', 'inactive', 'pending'].map(status => (
                <div className="flex items-center" key={status}>
                  <input 
                    type="checkbox" 
                    id={`status_${status}`} 
                    className="mr-2"
                    checked={!!statusFilters[status]}
                    onChange={() => handleStatusChange(status)}
                  />
                  <label htmlFor={`status_${status}`} className="capitalize">{status}</label>
                </div>
              ))}
              
              {/* Any other status filters that are already applied but not in the common list */}
              {Object.keys(statusFilters)
                .filter(status => !['active', 'inactive', 'pending'].includes(status) && statusFilters[status])
                .map(status => (
                  <div className="flex items-center" key={status}>
                    <input 
                      type="checkbox" 
                      id={`status_${status}`} 
                      className="mr-2"
                      checked={!!statusFilters[status]}
                      onChange={() => handleStatusChange(status)}
                    />
                    <label htmlFor={`status_${status}`} className="capitalize">{status}</label>
                  </div>
                ))
              }
              
              {/* Add new status option */}
              <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                <input 
                  type="text" 
                  placeholder="Add custom status..."
                  className="w-full text-sm border border-neutral-200 p-1 rounded-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newStatus = e.currentTarget.value.toLowerCase().trim();
                      if (newStatus) {
                        handleStatusChange(newStatus);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Year filter - for numeric columns like Year */}
        {selectedFilterColumns.includes('Year') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-500 mb-1">Year Range</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Min"
                className="w-full border border-neutral-200 p-2 rounded-sm"
                value={localFilters['Year_min'] || ''}
                onChange={(e) => setLocalFilters(prev => ({...prev, Year_min: e.target.value}))}
              />
              <input 
                type="number" 
                placeholder="Max"
                className="w-full border border-neutral-200 p-2 rounded-sm"
                value={localFilters['Year_max'] || ''}
                onChange={(e) => setLocalFilters(prev => ({...prev, Year_max: e.target.value}))}
              />
            </div>
          </div>
        )}
        
        {/* Make filter (dropdown since this would be categorical) */}
        {selectedFilterColumns.includes('Make') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-500 mb-1">Make</label>
            <input 
              type="text" 
              placeholder="Filter by make..."
              className="w-full border border-neutral-200 p-2 rounded-sm"
              value={localFilters['Make'] || ''}
              onChange={(e) => setLocalFilters(prev => ({...prev, Make: e.target.value}))}
            />
          </div>
        )}
        
        {/* Model filter */}
        {selectedFilterColumns.includes('Model') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-500 mb-1">Model</label>
            <input 
              type="text" 
              placeholder="Filter by model..."
              className="w-full border border-neutral-200 p-2 rounded-sm"
              value={localFilters['Model'] || ''}
              onChange={(e) => setLocalFilters(prev => ({...prev, Model: e.target.value}))}
            />
          </div>
        )}
        
        {/* BodyStyle filter */}
        {selectedFilterColumns.includes('BodyStyle') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-500 mb-1">Body Style</label>
            <input 
              type="text" 
              placeholder="Filter by body style..."
              className="w-full border border-neutral-200 p-2 rounded-sm"
              value={localFilters['BodyStyle'] || ''}
              onChange={(e) => setLocalFilters(prev => ({...prev, BodyStyle: e.target.value}))}
            />
          </div>
        )}
        
        {/* FuelType filter */}
        {selectedFilterColumns.includes('FuelType') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-500 mb-1">Fuel Type</label>
            <input 
              type="text" 
              placeholder="Filter by fuel type..."
              className="w-full border border-neutral-200 p-2 rounded-sm"
              value={localFilters['FuelType'] || ''}
              onChange={(e) => setLocalFilters(prev => ({...prev, FuelType: e.target.value}))}
            />
          </div>
        )}
        
        {/* Dynamic filters for any other selected columns */}
        {selectedFilterColumns
          .filter(col => !['Status', 'Year', 'Make', 'Model', 'BodyStyle', 'FuelType'].includes(col))
          .map(column => (
            <div className="mb-4" key={column}>
              <label className="block text-sm font-medium text-neutral-500 mb-1">{column}</label>
              <input 
                type="text" 
                placeholder={`Filter by ${column.toLowerCase()}...`}
                className="w-full border border-neutral-200 p-2 rounded-sm"
                value={localFilters[column] || ''}
                onChange={(e) => setLocalFilters(prev => ({...prev, [column]: e.target.value}))}
              />
            </div>
          ))
        }
        
        <div className="flex justify-between gap-2">
          <button 
            className="bg-[#167ABC] text-white border border-[#0d5a9b] rounded-sm py-1.5 px-3 flex-1 hover:bg-[#0d5a9b] transition-all duration-200"
            onClick={handleApplyFilters}
          >
            Apply
          </button>
          <button 
            className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm py-1.5 px-3 flex-1 hover:bg-[#e8e8e8] transition-all duration-200"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
