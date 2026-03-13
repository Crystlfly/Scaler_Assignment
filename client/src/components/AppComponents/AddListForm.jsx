import React from 'react';
import { MdAdd, MdClose } from 'react-icons/md';

const AddListForm = ({
    isAddingList,
    setIsAddingList,
    newListTitle,
    setNewListTitle,
    isAddingListLoading,
    handleAddList,
    listInputRef
}) => {
    return (
        <div className="w-full sm:w-[300px] shrink-0">
            {isAddingList ? (
                <form onSubmit={handleAddList} className="bg-[#f1f2f4] p-2 rounded-xl shadow-sm">
                    <input
                        ref={listInputRef}
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        onBlur={() => { if (!newListTitle.trim()) setIsAddingList(false) }}
                        placeholder="Enter list title..."
                        className="w-full px-3 py-1.5 text-sm rounded border-2 border-blue-500 outline-none"
                        autoFocus
                    />
                    <div className="flex items-center mt-2 space-x-2">
                        <button
                            type="submit"
                            disabled={isAddingListLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                            {isAddingListLoading ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Adding...
                                </>
                            ) : 'Add list'}
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setIsAddingList(false); setNewListTitle(''); }}
                            className="text-slate-500 hover:bg-slate-200 p-1.5 rounded cursor-pointer"
                        >
                            <MdClose size={22} />
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setIsAddingList(true)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 px-3 rounded-xl flex items-center cursor-pointer"
                >
                    <MdAdd size={20} className="mr-1" /> Add another list
                </button>
            )}
        </div>
    );
};

export default AddListForm;
