import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdAdd, MdClose } from 'react-icons/md';
import Navbar from './components/AppComponents/Navbar';
import BoardHeader from './components/AppComponents/BoardHeader';
import ConfirmModal from './components/ModalComponents/ConfirmModal';
import Board from './components/Board';

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