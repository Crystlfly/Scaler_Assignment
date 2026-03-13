import React from 'react';

const AttachmentPicker = ({ handleAttach, attachNextUrl, setAttachNextUrl, attachNextName, setAttachNextName, isAddingAttachmentLoading }) => {
    return (
        <form onSubmit={handleAttach} className="absolute top-10 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 w-64 z-20">
            <h4 className="text-xs font-semibold text-gray-500 mb-3 text-center border-b pb-2">Attach a link</h4>
            
            <label className="block text-xs font-bold text-[#5e6c84] mb-1">Search or paste a link</label>
            <input
                autoFocus
                type="url"
                placeholder="Find recent links or paste a new link"
                value={attachNextUrl}
                onChange={(e) => setAttachNextUrl(e.target.value)}
                className="w-full px-2 py-1.5 mb-2 rounded border-2 border-blue-500 focus:outline-none text-sm bg-gray-50"
                disabled={isAddingAttachmentLoading}
            />
            
            {attachNextUrl && (
                <>
                    <label className="block text-xs font-bold text-[#5e6c84] mb-1 mt-2">Display text</label>
                    <input
                        type="text"
                        placeholder="Text to display"
                        value={attachNextName}
                        onChange={(e) => setAttachNextName(e.target.value)}
                        className="w-full px-2 py-1.5 mb-3 rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                        disabled={isAddingAttachmentLoading}
                    />
                </>
            )}

            <button 
                type="submit"
                disabled={isAddingAttachmentLoading || !attachNextUrl.trim()}
                className="w-full mt-2 bg-[#0c66e4] hover:bg-[#0055cc] text-white py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isAddingAttachmentLoading && <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                Insert
            </button>
        </form>
    );
};

export default AttachmentPicker;
