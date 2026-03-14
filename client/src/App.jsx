import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdAdd, MdClose } from 'react-icons/md';
import Navbar from './components/AppComponents/Navbar';
import BoardHeader from './components/AppComponents/BoardHeader';
import AddListForm from './components/AppComponents/AddListForm';
import ConfirmModal from './components/ModalComponents/ConfirmModal';
import Board from './components/Board';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [filterDueDate, setFilterDueDate] = useState([]);
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
    const tempId = "temp-" + Date.now();
    const tempBoard = { id: tempId, title, background: '#0079bf' };

    // Optimistic Update
    setBoards(prev => [tempBoard, ...prev]);
    setBoard(tempBoard);

    try {
      const res = await axios.post(`${API_URL}/boards`, { title: title, background: '#0079bf' });
      // Replace temp board with real board silently
      setBoards(prev => prev.map(b => b.id === tempId ? res.data : b));
      // Fix scope issue with functional state to evaluate latest active board
      setBoard(prev => (prev?.id === tempId || !prev) ? res.data : prev);
      localStorage.setItem('activeBoardId', res.data.id);
    } catch (err) {
      console.error(err);
      // Rollback
      setBoards(prev => prev.filter(b => b.id !== tempId));
      setBoard(prev => {
        if (prev?.id === tempId) {
          localStorage.removeItem('activeBoardId');
          return null;
        }
        return prev;
      });
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    const tempId = "temp-" + Date.now();
    const newList = {
      id: tempId,
      title: newListTitle,
      boardId: board.id,
      cards: [],
      order: board.lists && board.lists.length > 0
        ? board.lists[board.lists.length - 1].order + 1000
        : 1000
    };

    // Optimistic Update
    setBoard(prev => ({ ...prev, lists: [...(prev.lists || []), newList] }));
    const savedTitle = newListTitle;
    setNewListTitle('');
    // Keep continuous input open
    // setIsAddingList(false);

    try {
      const res = await axios.post(`${API_URL}/lists`, {
        title: savedTitle,
        boardId: board.id
      });
      // Replace temp ID with real ID
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l => l.id === tempId ? { ...l, id: res.data.id } : l)
      }));
    } catch (err) {
      console.error('Error adding list', err);
      // Rollback
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.filter(l => l.id !== tempId)
      }));
    }
  };



  const handleUpdateBoardTitle = async () => {
    if (!editBoardTitle.trim() || editBoardTitle === board.title) {
      setIsEditingBoard(false);
      setEditBoardTitle(board.title);
      return;
    }

    const previousTitle = board.title;

    // Optimistic Update
    setBoard(prev => ({ ...prev, title: editBoardTitle }));
    setIsEditingBoard(false);

    try {
      await axios.put(`${API_URL}/boards/${board.id}`, { title: editBoardTitle });
      // Silently update boards list names
      setBoards(prev => prev.map(b => b.id === board.id ? { ...b, title: editBoardTitle } : b));
    } catch (error) {
      console.error("Failed to update board:", error);
      // Rollback
      setBoard(prev => ({ ...prev, title: previousTitle }));
      setEditBoardTitle(previousTitle);
    }
  };

  const handleDeleteBoard = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBoard = async () => {
    const deletedId = board.id;
    const previousBoards = [...boards];
    const newBoards = boards.filter(b => b.id !== deletedId);

    // Optimistic Update
    setBoards(newBoards);
    setIsDeleteDialogOpen(false);

    let nextBoardId = null;
    if (newBoards.length > 0) {
      nextBoardId = newBoards[0].id;
      localStorage.setItem('activeBoardId', nextBoardId);
      fetchBoardsAndActive(nextBoardId); // Fetch the new active board
    } else {
      setBoard(null);
      localStorage.removeItem('activeBoardId');
    }

    try {
      await axios.delete(`${API_URL}/boards/${deletedId}`);
    } catch (error) {
      console.error("Failed to delete board:", error);
      // Rollback
      setBoards(previousBoards);
      setBoard(previousBoards.find(b => b.id === deletedId));
      localStorage.setItem('activeBoardId', deletedId);
    }
  };

  const updateBoardBackground = async (color) => {
    // Optimistic Update
    setBoard(prev => ({ ...prev, background: color }));
    // setIsBackgroundMenuOpen(false);

    try {
      await axios.put(`${API_URL}/boards/${board.id}`, { background: color });
      fetchBoardsAndActive(board.id);
    } catch (error) {
      console.error("Failed to update background:", error);
    }
  }

  if (loading) return (
    <div className="text-[#172b4d] p-8 h-screen w-screen bg-white">
      Loading...
      <br />
      Instance is starting up. Please refresh or wait for some time...
    </div>
  );

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

  const appStyle = board.background?.includes('url(')
    ? { backgroundImage: board.background, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: board.background };

  return (
    <div className="h-screen flex flex-col font-sans" style={appStyle}>
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

      <Board
        board={board}
        setBoard={setBoard}
        fetchBoard={fetchBoard}
        searchQuery={searchQuery}
        filterLabels={filterLabels}
        filterMembers={filterMembers}
        filterDueDate={filterDueDate}
        isAddingList={isAddingList}
        setIsAddingList={setIsAddingList}
        newListTitle={newListTitle}
        setNewListTitle={setNewListTitle}
        isAddingListLoading={isAddingListLoading}
        handleAddList={handleAddList}
        listInputRef={listInputRef}
      />

      <ConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteBoard}
        title="Delete board?"
        message={`Are you sure you want to completely delete the board "${board.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default App;