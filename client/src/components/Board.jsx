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

  const addList = async () => {
    const title = prompt("Enter list title:");
    if (!title) return;

    try {
      await axios.post(`${API_URL}/lists`, { title, boardId: board.id });
      const boardRes = await axios.get(`${API_URL}/boards/${board.id}`);
      setBoard(boardRes.data);
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
      <div className="h-12 border-b border-white/20 bg-black/10 flex items-center px-4 justify-between">
         <div className="flex items-center gap-2 text-white font-bold text-lg cursor-pointer hover:bg-white/20 px-2 py-1 rounded transition-colors">
            <TfiTrello size={20} />
            <span>Trello Clone</span>
         </div>
         <div className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded font-medium cursor-pointer transition-colors backdrop-blur-sm">
             demo@example.com
         </div>
      </div>

      {/* Board Header */}
      <div className="px-6 py-3 flex items-center">
        <h1 className="text-xl font-bold text-white bg-white/20 px-3 py-1.5 rounded cursor-pointer hover:bg-white/30 backdrop-blur-sm transition-colors">
          {board.title}
        </h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4 flex items-start"
            >
              {board.lists?.map((list, index) => (
                <List key={list.id} list={list} index={index} refreshBoard={refreshBoard} />
              ))}
              {provided.placeholder}
              
              {/* Add List Button */}
              <button 
                onClick={addList}
                className="bg-[#ffffff3d] hover:bg-[#ffffff29] transition-colors rounded-xl w-[272px] shrink-0 p-3 text-white shadow-sm font-medium text-[14px] flex items-center gap-1 text-left"
              >
                <FiPlus size={18} /> Add another list
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Board;
