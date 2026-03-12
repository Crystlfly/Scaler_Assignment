import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdAdd, MdClose } from 'react-icons/md';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import List from './components/List';
import Card from './components/Card';
import CardModal from './components/CardModal';
import Navbar from './components/AppComponents/Navbar';
import BoardHeader from './components/AppComponents/BoardHeader';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [board, setBoard] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [isUpdatingBoardTitleLoading, setIsUpdatingBoardTitleLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Advanced Filter State
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

  const handleCreateBoard = async (title) => {
    try {
      const res = await axios.post(`${API_URL}/boards`, { title: title, background: '#0079bf' });
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
      await fetchBoard();
      setNewListTitle('');
      setIsAddingList(false);
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

  const updateBoardBackground = async (color) => {
    // Optimistic Update
    setBoard(prev => ({ ...prev, background: color }));
    setIsBackgroundMenuOpen(false);

    try {
      await axios.put(`${API_URL}/boards/${board.id}`, { background: color });
      fetchBoardsAndActive(board.id);
    } catch (error) {
      console.error("Failed to update background:", error);
    }
  }

  if (loading) return <div className="text-[#172b4d] p-8 h-screen w-screen bg-white">Loading...</div>;

  if (!board && boards.length === 0) {
    return (
      <div className="h-screen w-screen bg-[#f4f5f7] flex items-center justify-center font-sans">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
          <h2 className="text-xl font-bold text-[#172b4d] mb-4">Welcome to Trello Clone</h2>
          <p className="text-sm text-gray-600 mb-6">You don't have any boards yet. Create your first board to get started!</p>
          <button
            onClick={() => handleCreateBoard("My First Board")}
            className="w-full bg-[#0c66e4] hover:bg-[#0055cc] text-white py-2 rounded text-sm font-medium transition-colors"
          >
            Create Default Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col font-sans" style={{ backgroundColor: board.background }}>
      <Navbar
        boards={boards}
        board={board}
        fetchBoardsAndActive={fetchBoardsAndActive}
        updateBoardBackground={updateBoardBackground}
        handleCreateBoard={handleCreateBoard}
      />

      <BoardHeader
        board={board}
        editBoardTitle={editBoardTitle}
        setEditBoardTitle={setEditBoardTitle}
        isEditingBoard={isEditingBoard}
        setIsEditingBoard={setIsEditingBoard}
        isUpdatingBoardTitleLoading={isUpdatingBoardTitleLoading}
        handleUpdateBoardTitle={handleUpdateBoardTitle}
        handleDeleteBoard={handleDeleteBoard}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterLabels={filterLabels}
        setFilterLabels={setFilterLabels}
        filterMembers={filterMembers}
        setFilterMembers={setFilterMembers}
        filterDueDate={filterDueDate}
        setFilterDueDate={setFilterDueDate}
        dbUsers={dbUsers}
      />

      {/* Main Board Area */}
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