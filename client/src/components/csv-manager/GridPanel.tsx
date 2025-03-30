import React, { useState } from 'react';
import { type CsvFile, type CsvData, type CsvRowData } from "@shared/schema";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GridPanelProps {
  files: CsvFile[];
  selectedFile: CsvFile | null;
  onFileSelect: (file: CsvFile) => void;
  data: CsvData[];
  headers: string[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  selectedRecord: CsvData | null;
  onRecordSelect: (record: CsvData) => void;
  onFileUpload: (file: File) => void;
  onExport: (format: string) => void;
  onQuickSearch: (term: string) => void;
  isLoading: boolean;
}

const GridPanel: React.FC<GridPanelProps> = ({
  files,
  selectedFile,
  onFileSelect,
  data,
  headers,
  pagination,
  onPageChange,
  onPerPageChange,
  selectedRecord,
  onRecordSelect,
  onFileUpload,
  onExport,
  onQuickSearch,
  isLoading
}) => {
  const [quickSearchTerm, setQuickSearchTerm] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileUpload(event.target.files[0]);
    }
  };

  const handleQuickSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickSearchTerm(e.target.value);
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch(quickSearchTerm);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleExportMenu = () => {
    setShowExportMenu(prev => !prev);
  };

  const handleExport = (format: string) => {
    setShowExportMenu(false);
    onExport(format);
  };

  const statusColor = (status: string) => {
    const lowerStatus = String(status).toLowerCase();
    if (lowerStatus.includes('active')) return 'bg-[#4CAF50] bg-opacity-10 text-[#4CAF50]';
    if (lowerStatus.includes('inactive')) return 'bg-[#F44336] bg-opacity-10 text-[#F44336]';
    if (lowerStatus.includes('pending')) return 'bg-[#FF9800] bg-opacity-10 text-[#FF9800]';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 flex flex-col bg-white border border-[#d0d0d0] rounded-sm overflow-hidden">
      <div className="flex justify-between items-center bg-[#f5f5f5] border-b border-[#d0d0d0] p-2 px-3">
        <div className="flex items-center">
          <span className="font-semibold">CSV Data</span>
          <span className="ml-2 text-xs text-neutral-400">{pagination.total} records</span>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleQuickSearchSubmit}>
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="border border-neutral-200 p-1 text-sm rounded-sm" 
              style={{ width: '150px' }}
              value={quickSearchTerm}
              onChange={handleQuickSearchChange}
            />
          </form>
          <button 
            className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm py-1 px-2 text-sm flex items-center hover:bg-[#e8e8e8] transition-all duration-200"
            onClick={() => {
              if (selectedFile) {
                onFileSelect(selectedFile); // Reload data
              }
            }}
          >
            <i className="fas fa-sync-alt mr-1"></i>
            Refresh
          </button>
        </div>
      </div>
      
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex gap-2">
          <label className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm py-1.5 px-3 cursor-pointer flex items-center hover:bg-[#e8e8e8] transition-all duration-200">
            <i className="fas fa-file-upload mr-2"></i>
            Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
          {selectedFile && (
            <div className="flex items-center text-neutral-500 text-sm">
              <i className="fas fa-file-csv mr-2"></i>
              <span className="font-semibold">{selectedFile.originalName}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button 
              className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm py-1.5 px-3 flex items-center hover:bg-[#e8e8e8] transition-all duration-200"
              onClick={toggleExportMenu}
              disabled={!selectedFile}
            >
              <i className="fas fa-file-export mr-2"></i>
              Export
              <i className="fas fa-chevron-down ml-2 text-xs"></i>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white shadow-lg z-10 border border-neutral-200 rounded-sm">
                <button 
                  className="block px-4 py-2 hover:bg-neutral-100 text-sm w-full text-left"
                  onClick={() => handleExport('csv')}
                >
                  <i className="fas fa-file-csv mr-2"></i> Export as CSV
                </button>
                <button 
                  className="block px-4 py-2 hover:bg-neutral-100 text-sm w-full text-left"
                  onClick={() => handleExport('json')}
                >
                  <i className="fas fa-file-code mr-2"></i> Export as JSON
                </button>
              </div>
            )}
          </div>
          <button 
            className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm py-1.5 px-3 flex items-center hover:bg-[#e8e8e8] transition-all duration-200"
            disabled={!selectedFile}
          >
            <i className="fas fa-cog mr-2"></i>
            Columns
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#167ABC]"></div>
          </div>
        ) : selectedFile ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5] border-b border-[#d0d0d0]">
                <th className="px-4 py-2 text-left font-semibold text-sm">ID</th>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-2 text-left font-semibold text-sm">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort(header)}
                    >
                      {header}
                      {sortField === header ? (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ml-1 text-xs`}></i>
                      ) : (
                        <i className="fas fa-sort ml-1 text-xs text-neutral-400"></i>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const rowData = item.rowData as CsvRowData;
                return (
                  <tr 
                    key={item.id}
                    className={`border-b hover:bg-[#f5f5f5] cursor-pointer ${selectedRecord?.id === item.id ? 'bg-[#e8f5fe]' : ''}`}
                    onClick={() => onRecordSelect(item)}
                  >
                    <td className="px-4 py-2 text-sm">{item.id}</td>
                    {headers.map((header) => {
                      const cellValue = rowData[header];
                      return header.toLowerCase().includes('status') ? (
                        <td className="px-4 py-2 text-sm" key={header}>
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColor(String(cellValue))}`}>
                            {cellValue}
                          </span>
                        </td>
                      ) : (
                        <td className="px-4 py-2 text-sm" key={header}>
                          {cellValue}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={headers.length + 1} className="px-4 py-8 text-center text-gray-500">
                    {selectedFile ? "No data found" : "Please select or upload a CSV file"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <i className="fas fa-file-csv text-4xl text-gray-400 mb-4"></i>
            <h3 className="font-medium text-lg mb-2">No CSV File Selected</h3>
            <p className="text-gray-500 text-center mb-4">Upload a CSV file or select an existing one to view data</p>
            <label className="bg-[#167ABC] text-white border border-[#0d5a9b] rounded-sm py-2 px-4 cursor-pointer flex items-center hover:bg-[#0d5a9b] transition-all duration-200">
              <i className="fas fa-file-upload mr-2"></i>
              Upload CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}
      </div>
      
      {selectedFile && (
        <div className="p-3 border-t flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
          </div>
          <div className="flex items-center">
            <button 
              className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm px-2 py-1 disabled:opacity-50"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="px-2">Page {pagination.page} of {pagination.totalPages || 1}</span>
            <button 
              className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm px-2 py-1 disabled:opacity-50"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
            <select 
              className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm ml-2 py-1 px-2"
              value={pagination.limit}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridPanel;
