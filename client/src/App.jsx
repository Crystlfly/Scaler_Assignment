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
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const listInputRef = useRef(null);

  useEffect(() => {
    fetchBoardsAndActive();
  }, []);

  const fetchBoardsAndActive = async (activeId = null) => {
    try {
      if (!board) setLoading(true);
      const boardsRes = await axios.get(`${API_URL}/boards`);
      setBoards(boardsRes.data);

      let targetId = activeId;
      if (!targetId && boardsRes.data.length > 0) {
        targetId = boardsRes.data[0].id;
      }

      if (targetId) {
        const res = await axios.get(`${API_URL}/boards/${targetId}`);
        setBoard(res.data);
      } else {
        setBoard(null);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoard = async () => {
    if (board) fetchBoardsAndActive(board.id);
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
    try {
      await axios.post(`${API_URL}/lists`, {
        title: newListTitle,
        boardId: board.id
      });
      setNewListTitle('');
      setIsAddingList(false);
      fetchBoard();
    } catch (err) {
      console.error('Error adding list', err);
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
        await axios.put(`${API_URL}/lists/${movedList.id}`, { order: newOrder });
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

      <div className="px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white bg-white/20 px-3 py-1 rounded drop-shadow-sm">
            {board.title}
          </h1>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
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
          {/* Filter button mock */}
          <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded transition-colors text-sm font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filter
          </button>
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
                  <List key={list.id} list={list} index={index} refreshBoard={fetchBoard} searchQuery={searchQuery} />
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
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded cursor-pointer">
                          Add list
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
    </div>
  );
}

export default App;