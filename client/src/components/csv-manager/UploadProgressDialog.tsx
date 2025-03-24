import React from 'react';

interface UploadProgressDialogProps {
  progress: number;
  fileName: string;
  onCancel: () => void;
}

const UploadProgressDialog: React.FC<UploadProgressDialogProps> = ({ progress, fileName, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm p-4 w-96 shadow-lg">
        <h3 className="font-semibold mb-3">Uploading CSV File</h3>
        <div className="mb-3">
          <div className="h-2 bg-neutral-200 rounded-full">
            <div 
              className="h-2 bg-[#167ABC] rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-right text-sm mt-1 text-neutral-500">{progress}%</div>
        </div>
        <p className="text-sm text-neutral-600 mb-3">
          Processing file: <span>{fileName}</span>
        </p>
        <div className="flex justify-end">
          <button 
            className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm py-1 px-3 hover:bg-[#e8e8e8] transition-all duration-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadProgressDialog;
