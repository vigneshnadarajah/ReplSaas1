import React, { useState, useEffect } from 'react';

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
  const [statusFilters, setStatusFilters] = useState({
    active: false,
    inactive: false,
    pending: false
  });

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
    setStatusFilters({
      active: !!filters.status_active,
      inactive: !!filters.status_inactive,
      pending: !!filters.status_pending
    });
    
  }, [filters]);

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
    
    // Add status filters - IMPORTANT: Only add if checked
    if (statusFilters.active) appliedFilters.status_active = true;
    if (statusFilters.inactive) appliedFilters.status_inactive = true;
    if (statusFilters.pending) appliedFilters.status_pending = true;
    
    // Log the filters being applied
    console.log("FilterPanel - Applying filters:", appliedFilters);
    
    onApply(appliedFilters);
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    setFromDate("");
    setToDate("");
    setStatusFilters({
      active: false,
      inactive: false,
      pending: false
    });
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

  if (isCollapsed) {
    return (
      <div className="w-8 bg-white border border-[#d0d0d0] flex flex-col items-center">
        <button 
          className="w-full p-2 bg-[#f5f5f5] border-b border-[#d0d0d0] text-center"
          onClick={() => setIsCollapsed(false)}
        >
          <i className="fas fa-filter"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 flex flex-col shrink-0 bg-white border border-[#d0d0d0] rounded-sm overflow-hidden">
      <div className="flex justify-between items-center bg-[#f5f5f5] border-b border-[#d0d0d0] p-2 px-4">
        <span className="font-semibold">Filters</span>
        <button className="text-neutral-400 hover:text-neutral-500" onClick={() => setIsCollapsed(true)}>
          <i className="fas fa-minus"></i>
        </button>
      </div>
      
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
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-500 mb-1">Status</label>
          <div className="space-y-1">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="status_active" 
                className="mr-2"
                checked={statusFilters.active}
                onChange={() => handleStatusChange('active')}
              />
              <label htmlFor="status_active">Active</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="status_inactive" 
                className="mr-2"
                checked={statusFilters.inactive}
                onChange={() => handleStatusChange('inactive')}
              />
              <label htmlFor="status_inactive">Inactive</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="status_pending" 
                className="mr-2"
                checked={statusFilters.pending}
                onChange={() => handleStatusChange('pending')}
              />
              <label htmlFor="status_pending">Pending</label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-500 mb-1">Date Range</label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">From</label>
              <input 
                type="date" 
                className="w-full border border-neutral-200 p-2 rounded-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">To</label>
              <input 
                type="date" 
                className="w-full border border-neutral-200 p-2 rounded-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
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
