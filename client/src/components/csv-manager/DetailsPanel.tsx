import React, { useState } from 'react';
import { type CsvData, type CsvRowData } from "@shared/schema";

interface DetailsPanelProps {
  record: CsvData | null;
  headers: string[];
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ record, headers }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-8 bg-white border border-[#d0d0d0] flex flex-col items-center">
        <button 
          className="w-full p-2 bg-[#f5f5f5] border-b border-[#d0d0d0] text-center"
          onClick={() => setIsCollapsed(false)}
        >
          <i className="fas fa-info-circle"></i>
        </button>
      </div>
    );
  }

  const rowData = record?.rowData as CsvRowData || {};
  
  // Extract first and last name if they exist
  const firstName = rowData['First Name'] || rowData['FirstName'] || rowData['firstname'] || '';
  const lastName = rowData['Last Name'] || rowData['LastName'] || rowData['lastname'] || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : 
                   rowData['Name'] || rowData['name'] || rowData['Full Name'] || 'Unknown';
  
  // Extract email
  const email = rowData['Email'] || rowData['email'] || rowData['EmailAddress'] || '';
  
  // Extract initials
  const initials = firstName && lastName ? 
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() :
    fullName.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  
  // Extract status
  const status = rowData['Status'] || rowData['status'] || '';
  
  // Extract date fields
  const dateFields = headers.filter(h => 
    h.toLowerCase().includes('date') || 
    h.toLowerCase().includes('created') || 
    h.toLowerCase().includes('updated')
  );
  const primaryDate = dateFields.length > 0 ? rowData[dateFields[0]] : '';
  
  // Get all non-displayed primary fields to show in additional section
  const primaryFields = ['First Name', 'FirstName', 'firstname', 
                        'Last Name', 'LastName', 'lastname',
                        'Name', 'name', 'Full Name', 'Email', 'email', 'EmailAddress',
                        'Status', 'status'].concat(dateFields);
  
  const additionalFields = Object.entries(rowData)
    .filter(([key]) => !primaryFields.includes(key))
    .slice(0, 5); // Limit to 5 additional fields
  
  return (
    <div className="w-72 flex flex-col shrink-0 bg-white border border-[#d0d0d0] rounded-sm overflow-hidden">
      <div className="flex justify-between items-center bg-[#f5f5f5] border-b border-[#d0d0d0] p-2 px-4">
        <span className="font-semibold">Record Details</span>
        <button className="text-neutral-400 hover:text-neutral-500" onClick={() => setIsCollapsed(true)}>
          <i className="fas fa-minus"></i>
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1">
        {record ? (
          <>
            <div className="bg-neutral-100 p-3 mb-4 rounded text-center">
              <div className="h-16 w-16 bg-[#167ABC] rounded-full flex items-center justify-center text-white text-xl mx-auto mb-2">
                <span>{initials || '?'}</span>
              </div>
              <h3 className="font-semibold text-lg">{fullName}</h3>
              <p className="text-neutral-500 text-sm">{email}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2 pb-1 border-b">Record Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">ID:</span>
                  <span className="text-sm font-medium">{record.id}</span>
                </div>
                {status && (
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-500">Status:</span>
                    <span className={`text-sm font-medium ${status.toString().toLowerCase().includes('active') ? 'text-[#4CAF50]' : 
                                    status.toString().toLowerCase().includes('inactive') ? 'text-[#F44336]' : 
                                    status.toString().toLowerCase().includes('pending') ? 'text-[#FF9800]' : ''}`}>
                      {status}
                    </span>
                  </div>
                )}
                {primaryDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-500">Date Added:</span>
                    <span className="text-sm font-medium">{primaryDate}</span>
                  </div>
                )}
              </div>
            </div>
            
            {additionalFields.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 pb-1 border-b">Additional Fields</h4>
                <div className="space-y-2">
                  {additionalFields.map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-neutral-500">{key}:</span>
                      <span className="text-sm font-medium">{value ? String(value) : '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2 pb-1 border-b">Notes</h4>
              <p className="text-sm text-neutral-600">
                {rowData['Notes'] || rowData['notes'] || rowData['Comments'] || rowData['comments'] || 
                'No additional notes available for this record.'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <i className="fas fa-info-circle text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">Select a record to view details</p>
          </div>
        )}
      </div>
      
      {record && (
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <button className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm py-1.5 px-3 flex-1 flex items-center justify-center hover:bg-[#e8e8e8] transition-all duration-200">
              <i className="fas fa-edit mr-2"></i>
              Edit
            </button>
            <button className="bg-[#f5f5f5] border border-[#d0d0d0] rounded-sm py-1.5 px-3 flex items-center justify-center hover:bg-[#e8e8e8] transition-all duration-200">
              <i className="fas fa-external-link-alt mr-2"></i>
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsPanel;
