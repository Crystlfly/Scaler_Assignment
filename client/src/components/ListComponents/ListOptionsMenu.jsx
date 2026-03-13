import React from 'react';

const ListOptionsMenu = ({ isMenuOpen, setIsMenuOpen, setIsAddingCard, deleteList }) => {
    if (!isMenuOpen) return null;

    return (
        <div className="absolute top-10 right-2 w-72 bg-white rounded-lg shadow-xl shadow-black/20 border border-gray-200 z-50 text-sm font-normal py-2 text-[#172b4d]">
            <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-200 mb-2">
                <span className="font-semibold text-gray-500 flex-1 text-center text-xs">List actions</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                    ✕
                </button>
            </div>
            <div className="px-2">
                <button 
                    onClick={() => { setIsAddingCard(true); setIsMenuOpen(false); }} 
                    className="w-full text-left px-2 py-1.5 hover:bg-[#A6CCD2] rounded transition-colors bg-[#ebecf0]"
                >
                    Add card...
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <button 
                    onClick={deleteList} 
                    className="w-full text-left px-2 py-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                >
                    Delete list
                </button>
            </div>
        </div>
    );
};

export default ListOptionsMenu;
