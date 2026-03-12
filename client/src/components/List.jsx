import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Card from './Card';
import axios from 'axios';
import { FiMoreHorizontal, FiPlus } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

const List = ({ list, index, refreshBoard }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [listTitle, setListTitle] = React.useState(list.title);
  const [isAddingCard, setIsAddingCard] = React.useState(false);
  const [newCardTitle, setNewCardTitle] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const addCard = async (e) => {
    e?.preventDefault();
    if (!newCardTitle.trim()) {
        setIsAddingCard(false);
        return;
    }

    try {
      await axios.post(`${API_URL}/cards`, { title: newCardTitle, listId: list.id });
      setNewCardTitle('');
      setIsAddingCard(false);
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
          <div className="px-3 pt-3 pb-2 font-semibold text-sm text-[#172b4d] flex justify-between items-center group relative">
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-1.5 rounded transition-colors ${isMenuOpen ? 'bg-gray-300 text-gray-800' : 'text-gray-500 hover:bg-[#091e4214] hover:text-gray-800'}`}
            >
              <FiMoreHorizontal size={16} />
            </button>

            {/* Actions Popover Menu */}
            {isMenuOpen && (
              <div className="absolute top-10 right-2 w-72 bg-white rounded-lg shadow-xl shadow-black/20 border border-gray-200 z-50 text-sm font-normal py-2 text-[#172b4d]">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-200 mb-2">
                    <span className="font-semibold text-gray-500 flex-1 text-center text-xs">List actions</span>
                    <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                        ✕
                    </button>
                </div>
                <div className="px-2">
                    <button onClick={() => {setIsAddingCard(true); setIsMenuOpen(false);}} className="w-full text-left px-2 py-1.5 hover:bg-[#A6CCD2] rounded transition-colors bg-[#ebecf0]">
                        Add card...
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button onClick={deleteList} className="w-full text-left px-2 py-1.5 hover:bg-red-50 text-red-600 rounded transition-colors">
                        Delete list
                    </button>
                </div>
              </div>
            )}
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

          {/* Add a Card Form/Button */}
          <div className="px-2 pb-2 mt-1 relative">
            {isAddingCard ? (
                <div className="flex flex-col gap-2">
                    <textarea 
                        autoFocus
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Enter a title for this card..."
                        className="w-full p-2 text-sm rounded-lg border-none shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#172b4d]"
                        rows={2}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                addCard();
                            }
                        }}
                    />
                    <div className="flex items-center gap-2">
                        <button onMouseDown={(e) => { e.preventDefault(); addCard(); }} className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors">
                            Add card
                        </button>
                        <button onMouseDown={() => {setIsAddingCard(false); setNewCardTitle('');}} className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors">
                            ✕
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                  onClick={() => setIsAddingCard(true)}
                  className="w-full text-left text-[14px] font-medium text-[#44546f] hover:bg-[#091e4214] hover:text-[#172b4d] px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <FiPlus size={16} /> Add a card
                </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default List;
