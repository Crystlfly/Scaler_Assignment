import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import List from './List';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import { TfiTrello } from 'react-icons/tfi';

const API_URL = 'http://localhost:5000/api';

const Board = () => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/boards`);
        let activeBoard = res.data[0];

        if (!activeBoard) {
            console.error("No boards found. Please run the seed script.");
            setLoading(false);
            return;
        }

        const boardRes = await axios.get(`${API_URL}/boards/${activeBoard.id}`);
        setBoard(boardRes.data);
      } catch (error) {
        console.error("Error fetching board:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, []);

  const calculateNewOrder = (items, destIndex) => {
    if (items.length === 0) return 1000;
    if (destIndex === 0) return items[0].order - 1000;
    if (destIndex === items.length) return items[items.length - 1].order + 1000;
    const prevOrder = items[destIndex - 1].order;
    const nextOrder = items[destIndex].order;
    return (prevOrder + nextOrder) / 2;
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'list') {
      const newLists = Array.from(board.lists);
      const [movedList] = newLists.splice(source.index, 1);
      const newOrder = calculateNewOrder(newLists, destination.index);
      movedList.order = newOrder;
      newLists.splice(destination.index, 0, movedList);
      
      setBoard(prev => ({ ...prev, lists: newLists }));
      
      try {
        await axios.put(`${API_URL}/lists/${draggableId}/reorder`, { order: newOrder });
      } catch (error) {
        console.error("Failed to reorder list:", error);
      }
      return;
    }

    if (type === 'card') {
      const sourceListIndex = board.lists.findIndex(l => l.id === source.droppableId);
      const destListIndex = board.lists.findIndex(l => l.id === destination.droppableId);

      const sourceList = board.lists[sourceListIndex];
      const destList = board.lists[destListIndex];

      const sourceCards = Array.from(sourceList.cards || []);
      const destCards = source.droppableId === destination.droppableId ? sourceCards : Array.from(destList.cards || []);

      const [movedCard] = sourceCards.splice(source.index, 1);
      const newOrder = calculateNewOrder(destCards, destination.index);
      movedCard.order = newOrder;
      movedCard.listId = destination.droppableId;
      
      destCards.splice(destination.index, 0, movedCard);

      const newLists = Array.from(board.lists);
      newLists[sourceListIndex] = { ...sourceList, cards: sourceCards };
      newLists[destListIndex] = { ...destList, cards: destCards };

      setBoard(prev => ({ ...prev, lists: newLists }));

      try {
        await axios.put(`${API_URL}/cards/${draggableId}/reorder`, { 
          order: newOrder, 
          listId: destination.droppableId 
        });
      } catch (error) {
        console.error("Failed to reorder card:", error);
      }
      return;
    }
  };

  const addList = async (e) => {
    e?.preventDefault();
    if (!newListTitle.trim()) {
        setIsAddingList(false);
        return;
    }

    try {
      await axios.post(`${API_URL}/lists`, { title: newListTitle, boardId: board.id });
      setNewListTitle('');
      setIsAddingList(false);
      refreshBoard();
    } catch (error) {
      console.error("Failed to add list:", error);
    }
  };

  const refreshBoard = async () => {
     if(board) {
        const boardRes = await axios.get(`${API_URL}/boards/${board.id}`);
        setBoard(boardRes.data);
     }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0079bf]">Loading Board...</div>;
  if (!board) return <div className="h-screen flex items-center justify-center bg-[#0079bf]">No board found.</div>;

  return (
    <div 
      className="h-screen w-full flex flex-col font-[Inter,-apple-system,sans-serif]" 
      style={{ backgroundColor: board.background }}
    >
      {/* Top Navbar mimic */}
      <div className="h-12 border-b border-[#ffffff29] bg-[#00000029] flex items-center px-4 justify-between shrink-0">
         <div className="flex items-center gap-2 text-white font-bold text-lg cursor-pointer hover:bg-[#ffffff29] px-2 py-1 rounded transition-colors">
            <TfiTrello size={20} />
            <span>Trello Clone</span>
         </div>
         <div className="bg-[#ffffff29] hover:bg-[#ffffff3d] text-white text-sm px-3 py-1.5 rounded-full font-medium cursor-pointer transition-colors backdrop-blur-sm">
             DU
         </div>
      </div>

      {/* Board Header */}
      <div className="px-6 py-3 flex items-center shrink-0">
        <h1 className="text-[18px] font-bold text-white bg-[#ffffff29] px-3 py-1.5 rounded cursor-pointer hover:bg-[#ffffff3d] backdrop-blur-sm transition-colors">
          {board.title}
        </h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4 flex items-start h-full"
            >
              {board.lists?.map((list, index) => (
                <List key={list.id} list={list} index={index} refreshBoard={refreshBoard} />
              ))}
              {provided.placeholder}
              
              {/* Add List Form/Button */}
              {isAddingList ? (
                  <form 
                    onSubmit={addList}
                    className="bg-[#f1f2f4] rounded-xl w-[272px] shrink-0 p-3 shadow-sm flex flex-col gap-2 relative h-fit"
                  >
                     <input 
                        autoFocus
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="Enter list title..."
                        className="w-full px-3 py-1.5 rounded-sm border-2 border-transparent focus:border-blue-500 focus:outline-none text-sm text-[#172b4d]"
                     />
                     <div className="flex items-center gap-2">
                         <button type="submit" className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors">
                             Add list
                         </button>
                         <button type="button" onClick={() => {setIsAddingList(false); setNewListTitle('');}} className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors">
                             ✕
                         </button>
                     </div>
                  </form>
              ) : (
                  <button 
                    onClick={() => setIsAddingList(true)}
                    className="bg-[#ffffff3d] hover:bg-[#ffffff29] transition-colors rounded-xl w-[272px] shrink-0 p-3 text-white shadow-sm font-medium text-[14px] flex items-center gap-1 text-left h-fit"
                  >
                    <FiPlus size={18} /> Add another list
                  </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Board;
