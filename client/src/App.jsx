import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdAdd, MdClose } from 'react-icons/md';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import List from './components/List';
import Card from './components/Card';
import CardModal from './components/CardModal';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [board, setBoard] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Board Creation State
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [isUpdatingBoardTitleLoading, setIsUpdatingBoardTitleLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Advanced Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterLabels, setFilterLabels] = useState([]);
  const [filterMembers, setFilterMembers] = useState([]);
  const [filterDueDate, setFilterDueDate] = useState(false);
  const [dbUsers, setDbUsers] = useState([]);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingListLoading, setIsAddingListLoading] = useState(false);
  const listInputRef = useRef(null);

  useEffect(() => {
    fetchBoardsAndActive();
  }, []);

  const fetchBoardsAndActive = async (activeId = null) => {
    try {
      if (!board) setLoading(true);

      // Fetch users for member filtering
      const usersRes = await axios.get(`${API_URL}/users`);
      setDbUsers(usersRes.data);

      const boardsRes = await axios.get(`${API_URL}/boards`);
      setBoards(boardsRes.data);

      let targetId = activeId;
      if (!targetId) {
        // Try to read from localStorage first
        const savedId = localStorage.getItem('activeBoardId');
        if (savedId && boardsRes.data.some(b => b.id === savedId)) {
          targetId = savedId;
        } else if (boardsRes.data.length > 0) {
          targetId = boardsRes.data[0].id;
        }
      }

      if (targetId) {
        const res = await axios.get(`${API_URL}/boards/${targetId}`);
        setBoard(res.data);
        localStorage.setItem('activeBoardId', res.data.id);
      } else {
        setBoard(null);
        localStorage.removeItem('activeBoardId');
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoard = async () => {
    if (board) await fetchBoardsAndActive(board.id);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/boards`, { title: newBoardTitle, background: '#0079bf' });
      setNewBoardTitle('');
      setIsCreatingBoard(false);
      fetchBoardsAndActive(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    setIsAddingListLoading(true);

    try {
      await axios.post(`${API_URL}/lists`, {
        title: newListTitle,
        boardId: board.id
      });
      setNewListTitle('');
      setIsAddingList(false);
      await fetchBoard();
    } catch (err) {
      console.error('Error adding list', err);
    } finally {
      setIsAddingListLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'list') {
      const newLists = Array.from(board.lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);

      let newOrder = 1000;
      if (destination.index === 0) {
        newOrder = newLists.length > 1 ? newLists[1].order / 2 : 1000;
      } else if (destination.index === newLists.length - 1) {
        newOrder = newLists[newLists.length - 2].order + 1000;
      } else {
        newOrder = (newLists[destination.index - 1].order + newLists[destination.index + 1].order) / 2;
      }

      movedList.order = newOrder;
      setBoard({ ...board, lists: newLists });

      try {
        await axios.put(`${API_URL}/lists/${movedList.id}/reorder`, { order: newOrder });
      } catch (err) {
        console.error("Failed to reorder list", err);
        fetchBoard();
      }
      return;
    }

    if (type === 'card') {
      const sourceListIndex = board.lists.findIndex(l => l.id === source.droppableId);
      const destListIndex = board.lists.findIndex(l => l.id === destination.droppableId);

      const sourceList = board.lists[sourceListIndex];
      const destList = board.lists[destListIndex];

      const sourceCards = Array.from(sourceList.cards);
      const destCards = source.droppableId === destination.droppableId ? sourceCards : Array.from(destList.cards);

      const [movedCard] = sourceCards.splice(source.index, 1);
      movedCard.listId = destination.droppableId;

      destCards.splice(destination.index, 0, movedCard);

      let newOrder = 1000;
      if (destination.index === 0) {
        newOrder = destCards.length > 1 ? destCards[1].order / 2 : 1000;
      } else if (destination.index === destCards.length - 1) {
        newOrder = destCards[destCards.length - 2].order + 1000;
      } else {
        newOrder = (destCards[destination.index - 1].order + destCards[destination.index + 1].order) / 2;
      }

      movedCard.order = newOrder;

      const newLists = Array.from(board.lists);
      newLists[sourceListIndex] = { ...sourceList, cards: sourceCards };
      if (source.droppableId !== destination.droppableId) {
        newLists[destListIndex] = { ...destList, cards: destCards };
      }

      setBoard({ ...board, lists: newLists });

      try {
        await axios.put(`${API_URL}/cards/${movedCard.id}/reorder`, {
          listId: destination.droppableId,
          order: newOrder
        });
      } catch (err) {
        console.error("Failed to reorder card", err);
        fetchBoard();
      }
      return;
    }
  };

  const handleUpdateBoardTitle = async () => {
    setIsUpdatingBoardTitleLoading(true);
    try {
        if (editBoardTitle.trim() && editBoardTitle !== board.title) {
            await axios.put(`${API_URL}/boards/${board.id}`, { title: editBoardTitle });
            setBoard(prev => ({ ...prev, title: editBoardTitle }));
            await fetchBoardsAndActive(board.id);
        } else {
            setEditBoardTitle(board.title);
        }
    } catch (error) {
        console.error("Failed to update board:", error);
        setEditBoardTitle(board.title);
    } finally {
        setIsUpdatingBoardTitleLoading(false);
        setIsEditingBoard(false);
    }
  };

  const handleDeleteBoard = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBoard = async () => {
    try {
      await axios.delete(`${API_URL}/boards/${board.id}`);
      localStorage.removeItem('activeBoardId');
      setIsDeleteDialogOpen(false);
      fetchBoardsAndActive();
    } catch (error) {
      console.error("Failed to delete board:", error);
    }
  };

  if (loading) return <div className="text-[#172b4d] p-8 h-screen w-screen bg-white">Loading...</div>;

  if (!board && boards.length === 0) {
    return (
      <div className="h-screen w-screen bg-[#f4f5f7] flex items-center justify-center font-sans">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
          <h2 className="text-xl font-bold text-[#172b4d] mb-4">Welcome to Trello Clone</h2>
          <p className="text-sm text-gray-600 mb-6">You don't have any boards yet. Create your first board to get started!</p>
          <form onSubmit={handleCreateBoard}>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Board title"
              className="w-full px-3 py-2 mb-4 border-2 border-blue-500 rounded text-sm focus:outline-none"
              required
            />
            <button type="submit" className="w-full bg-[#0c66e4] hover:bg-[#0055cc] text-white py-2 rounded text-sm font-medium transition-colors">
              Create First Board
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col font-sans" style={{ backgroundColor: board.background }}>
      <nav className="bg-black/20 text-white flex items-center justify-between px-4 py-2 border-b border-black/10 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-xl drop-shadow-sm tracking-wider flex items-center cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM10 17C10 17.5523 9.55228 18 9 18H6C5.44772 18 5 17.5523 5 17V6C5 5.44772 5.44772 5 6 5H9C9.55228 5 10 5.44772 10 6V17ZM18 12C18 12.5523 17.5523 13 17 13H14C13.4477 13 13 12.5523 13 12V6C13 5.44772 13.4477 5 14 5H17C17.5523 5 18 5.44772 18 6V12Z" />
            </svg>
            Trello Clone
          </div>

          {/* Boards Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors text-sm font-medium">
              Boards <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded shadow-xl hidden group-hover:block z-50 text-[#172b4d] overflow-hidden">
              <div className="p-2 border-b text-xs font-semibold text-gray-500">Your Boards</div>
              <div className="max-h-64 overflow-y-auto pt-1 pb-1">
                {boards.map(b => (
                  <div key={b.id} onClick={() => fetchBoardsAndActive(b.id)} className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm flex items-center gap-2 ${board?.id === b.id ? 'bg-blue-50 font-medium' : ''}`}>
                    <div className="w-6 h-4 rounded-sm shadow-sm" style={{ backgroundColor: b.background }}></div>
                    {b.title}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <button onClick={() => setIsCreatingBoard(!isCreatingBoard)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded transition-colors relative">
              <MdAdd size={20} />
            </button>
            {isCreatingBoard && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded shadow-xl text-black z-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-500">Create board</span>
                  <button onClick={() => setIsCreatingBoard(false)} className="text-gray-400 hover:text-gray-600"><MdClose size={16} /></button>
                </div>
                <form onSubmit={handleCreateBoard}>
                  <label className="block text-xs font-bold text-[#5e6c84] mb-1">Board title <span className="text-red-500">*</span></label>
                  <input
                    autoFocus
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    className="w-full px-2 py-1.5 mb-3 border-2 border-blue-500 rounded text-sm focus:outline-none"
                    required
                  />
                  <button type="submit" className="w-full bg-[#0c66e4] hover:bg-[#0055cc] text-white py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50" disabled={!newBoardTitle.trim()}>
                    Create
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* Board Header */}
      <div className="px-6 py-3 flex items-center shrink-0 justify-between">
        <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-2 relative">
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
              className="pl-8 pr-3 py-1.5 rounded bg-white/20 text-white placeholder-white/80 focus:bg-white focus:text-[#172b4d] outline-none transition-colors text-sm w-48 focus:w-64 peer"
            />
            <svg className="absolute left-2.5 top-2 w-4 h-4 text-white/80 peer-focus:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors text-sm font-medium ${isFilterOpen || filterLabels.length || filterMembers.length || filterDueDate ? 'bg-white/30 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filter {((filterLabels.length + filterMembers.length + (filterDueDate ? 1 : 0)) > 0) && `(${(filterLabels.length + filterMembers.length + (filterDueDate ? 1 : 0))})`}
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
                  <div
                    onClick={() => setFilterDueDate(!filterDueDate)}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <span className="text-sm">Has due date</span>
                    </div>
                    {filterDueDate && <span className="text-blue-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
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
                              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{user.name.charAt(0)}</div>
                              <span className="text-sm truncate">{user.name}</span>
                            </div>
                            {isSelected && <span className="text-blue-600 shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
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

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex items-start h-full space-x-3"
              >
                {/* MODULAR COMPONENT CALL */}
                {board?.lists?.map((list, index) => (
                  <List
                    key={list.id}
                    list={list}
                    index={index}
                    refreshBoard={fetchBoard}
                    searchQuery={searchQuery}
                    filterLabels={filterLabels}
                    filterMembers={filterMembers}
                    filterDueDate={filterDueDate}
                  />
                ))}
                {provided.placeholder}

                {/* Add New List Form */}
                <div className="w-[272px] shrink-0">
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
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Delete Board Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-[320px] overflow-hidden">
            <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
              <h3 className="font-semibold text-[#172b4d] text-[14px]">Delete board?</h3>
              <button onClick={() => setIsDeleteDialogOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <MdClose size={18} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[14px] text-[#172b4d] mb-4 leading-normal">
                Are you sure you want to completely delete the board <strong>"{board.title}"</strong>? This action cannot be undone.
              </p>
              <button
                onClick={confirmDeleteBoard}
                className="w-full bg-[#c9372c] hover:bg-[#ae2e24] text-white font-medium py-1.5 px-4 rounded text-[14px] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;