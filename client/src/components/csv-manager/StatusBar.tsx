import React from 'react';

interface StatusBarProps {
  message: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ message }) => {
  return (
    <div className="border-t p-2 text-sm flex justify-between items-center bg-white">
      <div className="text-neutral-500">
        <span>{message}</span>
      </div>
      <div className="text-neutral-500">
        <span>CSV Manager v1.0</span>
      </div>
    </div>
  );
};

export default StatusBar;
