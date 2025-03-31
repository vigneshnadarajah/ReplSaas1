import React from 'react';
import { type CsvFile } from "@shared/schema";
import { FileText } from 'lucide-react';

interface FileNavBarProps {
  files: CsvFile[];
  selectedFile: CsvFile | null;
  onFileSelect: (file: CsvFile) => void;
}

/**
 * Formats a filename by:
 * 1. Removing file extension
 * 2. Converting to proper case
 * 3. Converting dashes and underscores to spaces
 */
const formatFileName = (fileName: string): string => {
  // Remove file extension
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  
  // Replace dashes and underscores with spaces
  const withSpaces = withoutExtension.replace(/[-_]+/g, " ");
  
  // Convert to proper case (capitalize first letter of each word)
  return withSpaces.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
};

const FileNavBar: React.FC<FileNavBarProps> = ({
  files,
  selectedFile,
  onFileSelect,
}) => {
  if (files.length === 0) {
    return null; // Don't render the navigation bar if there are no files
  }

  return (
    <div className="w-full bg-white border border-[#d0d0d0] rounded-sm mb-3 overflow-x-auto">
      <div className="flex p-2 px-3 min-w-max">
        {files.map((file) => (
          <button
            key={file.id}
            className={`px-4 py-2 mx-1 rounded-sm transition-all duration-200 whitespace-nowrap 
              ${selectedFile?.id === file.id 
                ? 'bg-[#167ABC] text-white' 
                : 'bg-[#f5f5f5] border border-[#d0d0d0] hover:bg-[#e8e8e8]'
              }`}
            onClick={() => onFileSelect(file)}
          >
            <FileText className="inline-block w-4 h-4 mr-2" />
            {formatFileName(file.originalName)}
            <span className="ml-2 text-xs opacity-70">
              ({new Date(file.createdAt).toLocaleDateString()})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FileNavBar;