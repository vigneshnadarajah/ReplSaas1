import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import HeaderPanel from "@/components/csv-manager/HeaderPanel";
import FilterPanel from "@/components/csv-manager/FilterPanel";
import GridPanel from "@/components/csv-manager/GridPanel";
import DetailsPanel from "@/components/csv-manager/DetailsPanel";
import StatusBar from "@/components/csv-manager/StatusBar";
import UploadProgressDialog from "@/components/csv-manager/UploadProgressDialog";
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

  // Query for files list
  const filesQuery = useQuery({
    queryKey: ["/api/csv/files"],
    refetchInterval: false,
    refetchOnWindowFocus: true
  });

  // Query for CSV data based on selected file
  const dataQuery = useQuery({
    queryKey: [`/api/csv/data/${selectedFile?.id}`, currentPage, perPage, JSON.stringify(filters)],
    enabled: !!selectedFile,
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
  const filterMutation = useMutation({
    mutationFn: async (filterData: { fileId: number; filters: Record<string, any> }) => {
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

  // When fileId or filters change, refresh data
  useEffect(() => {
    if (selectedFile && Object.keys(filters).length > 0) {
      filterMutation.mutate({
        fileId: selectedFile.id,
        filters,
      });
    }
  }, [selectedFile?.id, filters, currentPage, perPage]);

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
  };

  // Handle per page change
  const handlePerPageChange = (limit: number) => {
    setPerPage(limit);
    setCurrentPage(1);
  };

  // Handle filter apply
  const handleFilterApply = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
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
        />
        
        {/* Grid Panel */}
        <GridPanel 
          files={filesQuery.data || []}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          data={dataQuery.data?.data || filterMutation.data?.data || []}
          headers={selectedFile?.headers || []}
          pagination={dataQuery.data?.pagination || filterMutation.data?.pagination || { page: 1, limit: perPage, total: 0, totalPages: 0 }}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          selectedRecord={selectedRecord}
          onRecordSelect={handleRecordSelect}
          onFileUpload={handleFileUpload}
          onExport={handleExport}
          onQuickSearch={handleQuickSearch}
          isLoading={dataQuery.isLoading || filterMutation.isPending}
        />
        
        {/* Details Panel */}
        <DetailsPanel 
          record={selectedRecord}
          headers={selectedFile?.headers || []}
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
