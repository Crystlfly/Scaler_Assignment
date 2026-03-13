import React from 'react';

const CoverPicker = ({ predefinedColors, updateCover, isUpdatingCoverLoading, coverUrlInput, setCoverUrlInput }) => {
    return (
        <div className="absolute top-10 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 w-64 z-20">
            <h4 className="text-xs font-semibold text-gray-500 mb-3 text-center border-b pb-2">Cover</h4>
            
            <label className="block text-xs font-bold text-[#5e6c84] mb-1">Colors</label>
            <div className="flex flex-wrap gap-2 mb-4">
                {predefinedColors.map(color => (
                    <button 
                        key={color}
                        onClick={() => updateCover(color)}
                        disabled={isUpdatingCoverLoading}
                        className="w-10 h-8 rounded shrink-0 hover:opacity-80 transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>

            <label className="block text-xs font-bold text-[#5e6c84] mb-1">Image URL</label>
            <input
                type="text"
                placeholder="https://..."
                value={coverUrlInput}
                onChange={(e) => setCoverUrlInput(e.target.value)}
                className="w-full px-2 py-1.5 mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                disabled={isUpdatingCoverLoading}
            />
            <button 
                onClick={() => coverUrlInput.trim() && updateCover(coverUrlInput.trim())}
                disabled={isUpdatingCoverLoading || !coverUrlInput.trim()}
                className="w-full bg-[#0c66e4] hover:bg-[#0055cc] text-white py-1.5 rounded text-sm font-medium transition-colors mb-3 disabled:opacity-50"
            >
                Apply Image
            </button>

            <button 
                onClick={() => updateCover(null)}
                disabled={isUpdatingCoverLoading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
                Remove Cover
            </button>
        </div>
    );
};

export default CoverPicker;
