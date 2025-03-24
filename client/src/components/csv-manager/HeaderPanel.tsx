import React from 'react';

const HeaderPanel: React.FC = () => {
  return (
    <div className="py-3 px-4 flex justify-between items-center bg-[#167ABC] text-white">
      <div className="flex items-center">
        <i className="fas fa-table mr-2 text-xl"></i>
        <h1 className="text-xl font-semibold">CSV Manager</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="bg-[#f5f5f5] border border-[#d0d0d0] text-black rounded-sm py-1 px-3 flex items-center hover:bg-[#e8e8e8] transition-all duration-200">
          <i className="fas fa-question-circle mr-2"></i>
          Help
        </button>
        <button className="bg-[#f5f5f5] border border-[#d0d0d0] text-black rounded-sm py-1 px-3 flex items-center hover:bg-[#e8e8e8] transition-all duration-200">
          <i className="fas fa-cog mr-2"></i>
          Settings
        </button>
      </div>
    </div>
  );
};

export default HeaderPanel;
