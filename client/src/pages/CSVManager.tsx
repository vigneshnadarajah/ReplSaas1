import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import HeaderPanel from "@/components/csv-manager/HeaderPanel";
import FilterPanel from "@/components/csv-manager/FilterPanel";
import GridPanel from "@/components/csv-manager/GridPanel";
import DetailsPanel from "@/components/csv-manager/DetailsPanel";
import ChartPanel from "@/components/csv-manager/ChartPanel";
import StatusBar from "@/components/csv-manager/StatusBar";
import UploadProgressDialog from "@/components/csv-manager/UploadProgressDialog";
import FileNavBar from "@/components/csv-manager/FileNavBar";
import { type CsvFile, type CsvData, type CsvRowData } from "@shared/schema";

export default function CSVManager() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<CsvFile | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<CsvData | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Ready");
  const [searchColumn, setSearchColumn] = useState<string>("all");
  
  // Panel collapse states
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState<boolean>(false);
  const [isDetailsPanelCollapsed, setIsDetailsPanelCollapsed] = useState<boolean>(false);
  const [isChartPanelCollapsed, setIsChartPanelCollapsed] = useState<boolean>(false);
  const [isGridPanelCollapsed, setIsGridPanelCollapsed] = useState<boolean>(false);

  // Query for files list
  const filesQuery = useQuery<CsvFile[]>({
    queryKey: ["/api/csv/files"],
    refetchInterval: false,
    refetchOnWindowFocus: true
  });

  // Query for CSV data based on selected file
  const dataQuery = useQuery<{data: CsvData[], pagination: {page: number, limit: number, total: number, totalPages: number}}>({
    queryKey: [`/api/csv/data/${selectedFile?.id}`, currentPage, perPage],
    queryFn: async () => {
      const response = await apiRequest(
        "GET", 
        `/api/csv/data/${selectedFile?.id}?page=${currentPage}&limit=${perPage}`
      );
      return response.json();
    },
    enabled: !!selectedFile && Object.keys(filters).length === 0,
    refetchInterval: false,
    refetchOnWindowFocus: false
  });

  // Mutation for file upload
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/csv/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload file");
      }
      
      return response.json();
    },
    onMutate: () => {
      setShowUploadDialog(true);
      setUploadProgress(0);
      // Simulate progress updates
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      return () => clearInterval(interval);
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      setTimeout(() => {
        setShowUploadDialog(false);
        setStatusMessage(`File uploaded successfully: ${data.recordCount} records processed`);
        queryClient.invalidateQueries({ queryKey: ["/api/csv/files"] });
        toast({
          title: "Upload Successful",
          description: `${data.recordCount} records have been processed successfully.`,
        });
      }, 500);
    },
    onError: (error: Error) => {
      setShowUploadDialog(false);
      setStatusMessage(`Upload failed: ${error.message}`);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for filtering data
  const filterMutation = useMutation<
    {data: CsvData[], pagination: {page: number, limit: number, total: number, totalPages: number}},
    Error,
    { fileId: number; filters: Record<string, any> }
  >({
    mutationFn: async (filterData) => {
      const response = await apiRequest(
        "POST", 
        `/api/csv/filter/${filterData.fileId}?page=${currentPage}&limit=${perPage}`,
        { filters: filterData.filters }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setStatusMessage(`Filtered data: ${data.pagination.total} records found`);
    },
    onError: (error: Error) => {
      setStatusMessage(`Filtering failed: ${error.message}`);
      toast({
        title: "Filtering Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // When fileId or filters or pagination parameters change, refresh data
  useEffect(() => {
    if (selectedFile) {
      if (Object.keys(filters).length > 0) {
        console.log("Applying filters:", filters, "Page:", currentPage, "Limit:", perPage);
        // Only trigger if it's not already fetching
        if (!filterMutation.isPending) {
          filterMutation.mutate({
            fileId: selectedFile.id,
            filters,
          });
        }
      }
      // We don't need to manually refetch dataQuery since the URL includes page and perPage
      // and the query function is defined with those parameters
    }
  }, [selectedFile?.id, filters]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    const formData = new FormData();
    formData.append("csvFile", file);
    uploadMutation.mutate(formData);
  };

  // Handle file selection
  const handleFileSelect = (file: CsvFile) => {
    setSelectedFile(file);
    setSelectedRecord(null);
    setCurrentPage(1);
    setFilters({});
    setSearchTerm("");
    setStatusMessage(`Loaded file: ${file.originalName}`);
  };

  // Handle record selection
  const handleRecordSelect = (record: CsvData) => {
    setSelectedRecord(record);
    setStatusMessage("Record selected");
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // If filters are applied, we need to refresh the filter results with the new page
    if (selectedFile && Object.keys(filters).length > 0) {
      filterMutation.mutate({
        fileId: selectedFile.id,
        filters,
      });
    }
  };

  // Handle per page change
  const handlePerPageChange = (limit: number) => {
    setPerPage(limit);
    setCurrentPage(1);
    
    // If filters are applied, we need to refresh the filter results with the new limit
    if (selectedFile && Object.keys(filters).length > 0) {
      filterMutation.mutate({
        fileId: selectedFile.id,
        filters,
      });
    }
  };

  // Handle filter apply
  const handleFilterApply = (newFilters: Record<string, any>) => {
    // Validate and clean filters
    const cleanedFilters: Record<string, any> = {};
    
    Object.entries(newFilters).forEach(([key, value]) => {
      // Skip empty values except boolean flags
      if (value === "" || value === null || value === undefined) {
        return;
      }
      
      // Convert string values to proper format if they represent numbers
      if (typeof value === 'string' && !isNaN(Number(value)) && key !== '_global') {
        cleanedFilters[key] = Number(value);
      } else {
        cleanedFilters[key] = value;
      }
    });
    
    console.log("Applying filters:", cleanedFilters);
    setFilters(cleanedFilters);
    setCurrentPage(1);
    setStatusMessage("Filters applied");
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setFilters({});
    setSearchTerm("");
    setSearchColumn("all");
    setCurrentPage(1);
    setStatusMessage("Filters reset");
  };

  // Handle quick search
  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term && selectedFile) {
      const searchFilters = { ...filters };
      
      if (searchColumn === "all") {
        // If searching all columns, use the global search term
        searchFilters._global = term;
      } else {
        // If searching a specific column, add it to the filters
        searchFilters[searchColumn] = term;
      }
      
      setFilters(searchFilters);
      setStatusMessage(`Searching for "${term}"`);
    } else if (!term) {
      // If search term is cleared, remove it from filters
      const newFilters = { ...filters };
      if (searchColumn === "all") {
        delete newFilters._global;
      } else {
        delete newFilters[searchColumn];
      }
      setFilters(newFilters);
    }
  };

  // Handle export
  const handleExport = (format: string) => {
    if (!selectedFile) return;
    
    const url = `/api/csv/export/${selectedFile.id}?format=${format}`;
    const filterData = { filters };
    
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filterData),
    })
      .then(response => {
        if (!response.ok) throw new Error("Export failed");
        
        // For CSV exports, trigger file download from blob
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = selectedFile.originalName.replace('.csv', `.${format}`);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        setStatusMessage(`Exported data as ${format.toUpperCase()}`);
        toast({
          title: "Export Complete",
          description: `Data exported as ${format.toUpperCase()} successfully.`,
        });
      })
      .catch(error => {
        setStatusMessage(`Export failed: ${error.message}`);
        toast({
          title: "Export Failed",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <HeaderPanel />
      
      {/* File Navigation Bar */}
      <div className="px-3 pt-3">
        <FileNavBar 
          files={filesQuery.data || []}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Panel */}
        <FilterPanel 
          headers={selectedFile?.headers || []}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
          filters={filters}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchColumn={searchColumn}
          onSearchColumnChange={setSearchColumn}
          fileId={selectedFile?.id}
          isCollapsed={isFilterPanelCollapsed}
          onToggleCollapse={setIsFilterPanelCollapsed}
        />
        
        {/* Grid Panel */}
        <GridPanel 
          files={filesQuery.data || []}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          data={(Object.keys(filters).length > 0 
            ? (filterMutation.data?.data || []) 
            : (dataQuery.data?.data || []))}
          headers={selectedFile?.headers || []}
          pagination={
            (Object.keys(filters).length > 0 
              ? filterMutation.data?.pagination 
              : dataQuery.data?.pagination) || { 
              page: currentPage, 
              limit: perPage, 
              total: 0, 
              totalPages: 0 
            }
          }
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          selectedRecord={selectedRecord}
          onRecordSelect={handleRecordSelect}
          onFileUpload={handleFileUpload}
          onExport={handleExport}
          onQuickSearch={handleQuickSearch}
          isLoading={dataQuery.isLoading || filterMutation.isPending}
          isCollapsed={isGridPanelCollapsed}
          onToggleCollapse={setIsGridPanelCollapsed}
        />
        
        {/* Details Panel */}
        <DetailsPanel 
          record={selectedRecord}
          headers={selectedFile?.headers || []}
          isCollapsed={isDetailsPanelCollapsed}
          onToggleCollapse={setIsDetailsPanelCollapsed}
        />
        
        {/* Chart Panel */}
        <ChartPanel
          data={(Object.keys(filters).length > 0 
            ? (filterMutation.data?.data || []) 
            : (dataQuery.data?.data || []))}
          headers={selectedFile?.headers || []}
          isCollapsed={isChartPanelCollapsed}
          onToggleCollapse={setIsChartPanelCollapsed}
        />
      </div>
      
      {/* Status Bar */}
      <StatusBar message={statusMessage} />
      
      {/* Upload Progress Dialog */}
      {showUploadDialog && (
        <UploadProgressDialog 
          progress={uploadProgress} 
          fileName={uploadMutation.variables instanceof FormData ? 
            (uploadMutation.variables.get("csvFile") as File)?.name || "unknown" : 
            "unknown"
          }
          onCancel={() => {
            uploadMutation.reset();
            setShowUploadDialog(false);
          }}
        />
      )}
    </div>
  );
}
