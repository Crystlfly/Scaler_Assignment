import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';

const BoardHeader = ({
  board,
  editBoardTitle,
  setEditBoardTitle,
  isEditingBoard,
  setIsEditingBoard,
  isUpdatingBoardTitleLoading,
  handleUpdateBoardTitle,
  handleDeleteBoard,
  searchQuery,
  setSearchQuery,
  filterLabels,
  setFilterLabels,
  filterMembers,
  setFilterMembers,
  filterDueDate,
  setFilterDueDate,
  dbUsers
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (!board) return null;

  return (
    <div className="px-4 py-3 flex flex-col md:flex-row items-start md:items-center shrink-0 justify-between gap-3">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* Edit Board Title block */}
        {isEditingBoard ? (
          <input
            autoFocus
            type="text"
            value={editBoardTitle}
            onChange={(e) => setEditBoardTitle(e.target.value)}
            onBlur={handleUpdateBoardTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateBoardTitle();
              if (e.key === 'Escape') {
                setIsEditingBoard(false);
                setEditBoardTitle(board.title);
              }
            }}
            className="text-[18px] font-bold text-[#172b4d] px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            disabled={isUpdatingBoardTitleLoading}
          />
        ) : (
          <h1
            onClick={() => {
              setEditBoardTitle(board.title);
              setIsEditingBoard(true);
            }}
            className="text-[18px] font-bold text-white bg-[#ffffff29] px-3 py-1.5 rounded cursor-pointer hover:bg-[#ffffff3d] backdrop-blur-sm transition-colors flex items-center gap-2"
          >
            {board.title}
            {isUpdatingBoardTitleLoading && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
          </h1>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 gap-y-2 relative w-full md:w-auto">
        {/* Delete Board Button */}
        <button
          onClick={handleDeleteBoard}
          className="bg-[#ffffff29] hover:bg-red-500 text-white px-3 py-1.5 rounded transition-colors text-sm font-medium backdrop-blur-sm shadow-sm"
          title="Delete this entire board"
        >
          Delete Board
        </button>
        {/* Search & Filter Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 rounded bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:bg-white focus:text-gray-900 transition-all w-32 sm:w-48 focus:w-full sm:focus:w-64"
          />
          <svg className="absolute left-2.5 top-2 w-4 h-4 text-white/80 peer-focus:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors text-sm font-medium ${isFilterOpen || filterLabels.length || filterMembers.length || filterDueDate.length ? 'bg-white/30 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filter {((filterLabels.length + filterMembers.length + filterDueDate.length) > 0) && `(${(filterLabels.length + filterMembers.length + filterDueDate.length)})`}
        </button>

        {/* Filter Dropdown */}
        {isFilterOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-[#ffffff] rounded-lg shadow-xl text-[#172b4d] z-50 overflow-hidden flex flex-col font-sans border border-gray-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-700 text-sm">Filter</span>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                <MdClose size={18} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[400px] p-2 space-y-4">
              {/* Due Date Filter */}
              <div>
                <h4 className="text-xs font-semibold text-[#5e6c84] mb-2 px-2 uppercase shadow-none tracking-wider">Due date</h4>
                
                {/* Overdue Checkbox */}
                <div
                  onClick={() => setFilterDueDate(prev => prev.includes('overdue') ? prev.filter(f => f !== 'overdue') : [...prev, 'overdue'])}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center text-red-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <span className="text-sm">Overdue</span>
                  </div>
                  {filterDueDate.includes('overdue') && <span className="text-blue-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
                </div>

                {/* Due Soon Checkbox */}
                <div
                  onClick={() => setFilterDueDate(prev => prev.includes('due_soon') ? prev.filter(f => f !== 'due_soon') : [...prev, 'due_soon'])}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <span className="text-sm">Due in the next day</span>
                  </div>
                  {filterDueDate.includes('due_soon') && <span className="text-blue-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
                </div>

                {/* Later / Not Due Soon Checkbox */}
                <div
                  onClick={() => setFilterDueDate(prev => prev.includes('due_later') ? prev.filter(f => f !== 'due_later') : [...prev, 'due_later'])}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <span className="text-sm">Later</span>
                  </div>
                  {filterDueDate.includes('due_later') && <span className="text-blue-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
                </div>
              </div>

              {/* Labels Filter */}
              {board.labels && board.labels.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#5e6c84] mb-2 px-2 uppercase shadow-none tracking-wider">Labels</h4>
                  <div className="space-y-1">
                    {board.labels.map(label => {
                      const isSelected = filterLabels.includes(label.id);
                      return (
                        <div
                          key={label.id}
                          onClick={() => setFilterLabels(prev => isSelected ? prev.filter(id => id !== label.id) : [...prev, label.id])}
                          className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-6 rounded text-transparent group-hover:bg-opacity-80 transition-opacity" style={{ backgroundColor: label.color }}></div>
                            <span className="text-sm truncate pr-2">{label.title || 'unnamed'}</span>
                          </div>
                          {isSelected && <span className="text-blue-600 shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Members Filter */}
              {dbUsers && dbUsers.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#5e6c84] mb-2 px-2 uppercase shadow-none tracking-wider">Members</h4>
                  <div className="space-y-1">
                    {dbUsers.map(user => {
                      const isSelected = filterMembers.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() => setFilterMembers(prev => isSelected ? prev.filter(id => id !== user.id) : [...prev, user.id])}
                          className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <span className="text-sm">{user.name}</span>
                          </div>
                          {isSelected && <span className="text-blue-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardHeader;
