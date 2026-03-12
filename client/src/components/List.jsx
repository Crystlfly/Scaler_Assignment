import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Card from './Card';
import axios from 'axios';
import { FiMoreHorizontal, FiPlus } from 'react-icons/fi';
import ConfirmModal from './ModalComponents/ConfirmModal';

const API_URL = 'http://localhost:5000/api';

const List = ({ list, index, refreshBoard, searchQuery = '', filterLabels = [], filterMembers = [], filterDueDate = false }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [listTitle, setListTitle] = React.useState(list.title);
  const [isAddingCard, setIsAddingCard] = React.useState(false);
  const [isAddingCardLoading, setIsAddingCardLoading] = React.useState(false);
  
  const [isEditingTitleLoading, setIsEditingTitleLoading] = React.useState(false);
  const [isDeletingListLoading, setIsDeletingListLoading] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  
  const [newCardTitle, setNewCardTitle] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const addCard = async (e) => {
    e?.preventDefault();
    if (!newCardTitle.trim()) {
      setIsAddingCard(false);
      return;
    }
    
    setIsAddingCardLoading(true);

    try {
      await axios.post(`${API_URL}/cards`, { title: newCardTitle, listId: list.id });
      await refreshBoard();
      setNewCardTitle('');
      setIsAddingCard(false);
    } catch (error) {
      console.error("Failed to add card:", error);
    } finally {
      setIsAddingCardLoading(false);
    }
  };

  const deleteList = () => {
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteList = async () => {
    setIsDeletingListLoading(true);
    try {
      await axios.delete(`${API_URL}/lists/${list.id}`);
      await refreshBoard();
    } catch (error) {
      console.error("Failed to delete list:", error);
    } finally {
      setIsDeletingListLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const updateListTitle = async () => {
    if (listTitle.trim() && listTitle !== list.title) {
      setIsEditingTitleLoading(true);
      try {
        await axios.put(`${API_URL}/lists/${list.id}`, { title: listTitle });
        await refreshBoard();
      } catch (error) {
        console.error("Failed to update list:", error);
      } finally {
        setIsEditingTitleLoading(false);
        setIsEditing(false);
      }
    } else {
      setListTitle(list.title);
      setIsEditing(false);
    }
  }

  const filteredCards = list.cards?.filter(card => {
    // 1. Keyword Text Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const titleMatch = card.title?.toLowerCase().includes(lowerQuery);
      const labelsMatch = card.labels?.some(cl => cl.label.title?.toLowerCase().includes(lowerQuery));
      const membersMatch = card.members?.some(cm => cm.user.name?.toLowerCase().includes(lowerQuery));
      if (!titleMatch && !labelsMatch && !membersMatch) return false;
    }

    // 2. Exact Label Filters (OR logic within labels)
    if (filterLabels.length > 0) {
      const hasSelectedLabel = card.labels?.some(cl => filterLabels.includes(cl.label.id));
      if (!hasSelectedLabel) return false;
    }

    // 3. Exact Member Filters (OR logic within members)
    if (filterMembers.length > 0) {
      const hasSelectedMember = card.members?.some(cm => filterMembers.includes(cm.user.id));
      if (!hasSelectedMember) return false;
    }

    // 4. Due Date Filters (e.g., 'no_date', 'has_date' mock logic or next 24h depending on what user wants, for now we will just do has due date)
    if (filterDueDate) {
      if (!card.dueDate) return false;
    }

    return true;
  }) || [];

  return (
    <>
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className="bg-[#f1f2f4] rounded-xl w-full sm:w-[300px] shrink-0 max-h-full flex flex-col md:mr-3 shadow-sm text-[#172b4d] relative"
        >
          {/* Deletion Loading Overlay */}
          {isDeletingListLoading && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
               <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <div className="px-3 pt-3 pb-2 font-semibold text-sm text-[#172b4d] flex justify-between items-center group relative cursor-pointer">
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                onBlur={updateListTitle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') updateListTitle();
                    if (e.key === 'Escape') {
                        setIsEditing(false);
                        setListTitle(list.title);
                    }
                }}
                disabled={isEditingTitleLoading}
                className="w-full px-2 py-1 mr-2 rounded border-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm disabled:opacity-50"
              />
            ) : (
              <h2
                onClick={() => setIsEditing(true)}
                className="font-semibold text-sm text-[#172b4d] px-2 py-1 cursor-pointer flex-1 break-words flex items-center gap-2"
              >
                {list.title}
                {isEditingTitleLoading && <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
              </h2>
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
                  <button onClick={() => { setIsAddingCard(true); setIsMenuOpen(false); }} className="w-full text-left px-2 py-1.5 hover:bg-[#A6CCD2] rounded transition-colors bg-[#ebecf0]">
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
                className={`flex-1 overflow-y-auto overflow-x-hidden px-2 pb-1 min-h-[2px] ${snapshot.isDraggingOver ? 'bg-[#091e420f]' : ''
                  }`}
              >
                {filteredCards.map((card, i) => (
                  <Card key={card.id} card={card} index={i} refreshBoard={refreshBoard} listTitle={list.title} boardId={list.boardId} />
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
                <div className="flex items-center space-x-2 w-full">
                <button 
                  type="submit" 
                  disabled={isAddingCardLoading}
                  onMouseDown={(e) => { e.preventDefault(); addCard(); }}
                  className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isAddingCardLoading ? (
                     <>
                       <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Adding...
                     </>
                  ) : 'Add card'}
                </button>
                <button
                  type="button" onMouseDown={() => { setIsAddingCard(false); setNewCardTitle(''); }} className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors">
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

    <ConfirmModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={confirmDeleteList}
      title="Delete List"
      message={`Are you sure you want to delete the list "${list.title}"? This action cannot be undone and all cards inside will be lost.`}
      confirmText="Delete List"
      isLoading={isDeletingListLoading}
    />
    </>
  );
};

export default List;
