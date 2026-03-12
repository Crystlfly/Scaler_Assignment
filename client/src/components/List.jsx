import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Card from './Card';
import axios from 'axios';
import { FiMoreHorizontal, FiPlus } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

const List = ({ list, index, refreshBoard }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [listTitle, setListTitle] = React.useState(list.title);

  const addCard = async () => {
    const title = prompt("Enter card title:");
    if (!title) return;

    try {
      await axios.post(`${API_URL}/cards`, { title, listId: list.id });
      refreshBoard();
    } catch (error) {
      console.error("Failed to add card:", error);
    }
  };

  const deleteList = async () => {
    if (window.confirm(`Delete list '${list.title}'?`)) {
      try {
        await axios.delete(`${API_URL}/lists/${list.id}`);
        refreshBoard();
      } catch (error) {
        console.error("Failed to delete list:", error);
      }
    }
  }

  const updateListTitle = async () => {
    setIsEditing(false);
    if (listTitle.trim() && listTitle !== list.title) {
      try {
        await axios.put(`${API_URL}/lists/${list.id}`, { title: listTitle });
        refreshBoard();
      } catch (error) {
        console.error("Failed to update list:", error);
      }
    } else {
      setListTitle(list.title);
    }
  }

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className="bg-[#f1f2f4] rounded-xl w-[272px] shrink-0 max-h-full flex flex-col mr-3 shadow-sm"
        >
          {/* List Header */}
          <div className="px-3 pt-3 pb-2 font-semibold text-sm text-[#172b4d] flex justify-between items-center group">
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                onBlur={updateListTitle}
                onKeyDown={(e) => e.key === 'Enter' && updateListTitle()}
                className="w-full px-2 py-1 mr-2 rounded border-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm"
              />
            ) : (
              <span onClick={() => setIsEditing(true)} className="truncate pr-2 mt-0.5 cursor-pointer flex-1">{list.title}</span>
            )}
            <button
              onClick={deleteList}
              className="p-1.5 text-gray-500 hover:bg-[#091e4214] rounded hover:text-gray-800 transition-colors"
            >
              <FiMoreHorizontal size={16} />
            </button>
          </div>

          {/* List Cards Container */}
          <Droppable droppableId={list.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto px-2 pb-1 min-h-[2px] ${snapshot.isDraggingOver ? 'bg-[#091e420f]' : ''
                  }`}
              >
                {list.cards?.map((card, i) => (
                  <Card key={card.id} card={card} index={i} refreshBoard={refreshBoard} listTitle={list.title} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add a Card Button */}
          <div className="px-2 pb-2 mt-1 relative">
            <button
              onClick={addCard}
              className="w-full text-left text-[14px] font-medium text-[#44546f] hover:bg-[#091e4214] hover:text-[#172b4d] px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <FiPlus size={16} /> Add a card
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default List;
