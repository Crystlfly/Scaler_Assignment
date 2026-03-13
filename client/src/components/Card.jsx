import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { BiRightArrowAlt } from 'react-icons/bi';
import { FiClock, FiCheckSquare, FiTrash2, FiCircle, FiCheckCircle } from 'react-icons/fi';
import { format, isPast, differenceInHours } from 'date-fns';
import CardModal from './CardModal';
import ConfirmModal from './ModalComponents/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Card = ({ board, setBoard, card, index, refreshBoard, listTitle, boardId }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const deleteCard = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCard = async () => {
    const listId = card.listId;
    const previousCards = board.lists.find(l => l.id === listId)?.cards || [];
    
    // Optimistic Update
    setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l => 
            l.id === listId 
            ? { ...l, cards: l.cards.filter(c => c.id !== card.id) }
            : l
        )
    }));
    setIsDeleteModalOpen(false);

    try {
      await axios.delete(`${API_URL}/cards/${card.id}`);
    } catch (error) {
      console.error("Failed to delete card:", error);
      // Rollback
      setBoard(prev => ({
          ...prev,
          lists: prev.lists.map(l => 
              l.id === listId 
              ? { ...l, cards: previousCards }
              : l
          )
      }));
    }
  };

  const toggleComplete = async (e) => {
    e.stopPropagation();
    const listId = card.listId;
    const previousState = card.isComplete;
    
    // Optimistic Update
    setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l => 
            l.id === listId 
            ? { 
                ...l, 
                cards: l.cards.map(c => 
                    c.id === card.id 
                    ? { ...c, isComplete: !previousState } 
                    : c
                ) 
              }
            : l
        )
    }));

    try {
      await axios.put(`${API_URL}/cards/${card.id}`, {
        isComplete: !previousState
      });
    } catch (error) {
      console.error("Failed to toggle card completion:", error);
      // Rollback
      setBoard(prev => ({
          ...prev,
          lists: prev.lists.map(l => 
              l.id === listId 
              ? { 
                  ...l, 
                  cards: l.cards.map(c => 
                      c.id === card.id 
                      ? { ...c, isComplete: previousState } 
                      : c
                  ) 
                }
              : l
          )
      }));
    }
  };

  // Count checklist progress
  let totalChecklistItems = 0;
  let completedChecklistItems = 0;
  if (card.checklists) {
    card.checklists.forEach(cl => {
      totalChecklistItems += cl.items.length;
      completedChecklistItems += cl.items.filter(i => i.isCompleted).length;
    });
  }

  const hasChecklist = totalChecklistItems > 0;
  const isChecklistComplete = hasChecklist && totalChecklistItems === completedChecklistItems;

  const isOverdue = card.dueDate && isPast(new Date(card.dueDate)) && !card.isComplete;
  const hoursUntilDue = card.dueDate ? differenceInHours(new Date(card.dueDate), new Date()) : null;
  const isDueSoon = card.dueDate && !isOverdue && hoursUntilDue !== null && hoursUntilDue <= 24 && hoursUntilDue >= 0 && !card.isComplete;
  
  let dueDateBgClass = 'bg-[#ebecf0] text-[#5e6c84]';
  if (card.isComplete) {
    dueDateBgClass = 'bg-green-600 text-white';
  } else if (isOverdue) {
    dueDateBgClass = 'bg-red-600 text-white';
  } else if (isDueSoon) {
    dueDateBgClass = 'bg-yellow-500 text-white';
  }

  return (
    <>
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={provided.draggableProps.style}
            onClick={() => setIsModalOpen(true)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`bg-white rounded-lg mb-2 shrink-0 group relative cursor-pointer shadow-[0_1px_1px_#091e4240] flex flex-col overflow-hidden ${snapshot.isDragging ? 'shadow-lg rotate-2 z-50' : 'hover:outline-2 outline-blue-500 hover:bg-[#f4f5f7]'
              }`}
          >
            {/* Cover Image/Color */}
            {card.cover && (
                <div 
                    className={`w-full shrink-0 bg-cover bg-center bg-no-repeat ${card.cover.startsWith('http') ? 'h-32' : 'h-8'}`}
                    style={{
                        backgroundColor: card.cover.startsWith('#') ? card.cover : undefined,
                        backgroundImage: card.cover.startsWith('http') ? `url('${card.cover}')` : undefined
                    }}
                />
            )}

            {/* Inner Content Padding Wrapper */}
            <div className="p-2.5">
            {/* Deletion Loading Overlay Removed for Optimistic UI */}

            {/* Edit/Delete pencil indicator (Simplified to just delete for now mock) */}
            {isHovering && !snapshot.isDragging && (
              <button
                onClick={deleteCard}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-[2px] right-[2px] p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg hover:text-gray-800 transition-colors z-10 bg-white/90"
              >
                <span className="text-xs font-bold px-1">✕</span>
              </button>
            )}

            {/* Labels - Trello styling: thin colored bars by default */}
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1 pr-6">
                {card.labels.map((cardLabel) => (
                  <div
                    key={cardLabel.id || cardLabel.label.id}
                    className="h-2 w-10 rounded-[3px]"
                    style={{ backgroundColor: cardLabel.label.color }}
                    title={cardLabel.label.title}
                  />
                ))}
              </div>
            )}

            {/* Title with Hover to Complete Toggle */}
            <div className="flex items-start gap-1.5 mb-1 pr-6 relative">
              {/* Completion Icon */}
              {(isHovering || card.isComplete) && (
                <div 
                  onClick={toggleComplete}
                  className="mt-[3px] shrink-0 cursor-pointer z-20 text-gray-400 hover:text-gray-700 transition-colors"
                  title={card.isComplete ? "Mark as incomplete" : "Mark as complete"}
                >
                  {card.isComplete ? (
                    <FiCheckCircle size={14} className="text-green-600" />
                  ) : (
                    <FiCircle size={14} />
                  )}
                </div>
              )}
              {/* Title Text */}
              <div className="text-[14px] font-normal text-[#172b4d] leading-5 break-words">
                {card.title}
              </div>
            </div>

            {/* Badges Footer */}
            {(card.dueDate || hasChecklist || (card.members && card.members.length > 0)) && (
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-[5px]">

                <div className="flex items-center gap-2">
                  {/* Due Date Indicator */}
                  {card.dueDate && (
                    <div className={`flex items-center gap-1 text-[12px] p-[2px] px-1.5 rounded z-20 ${dueDateBgClass}`}>
                      {card.isComplete ? <FiCheckSquare size={12} /> : <FiClock size={12} />}
                      <span>{format(new Date(card.dueDate), 'MMM d')}</span>
                    </div>
                  )}

                  {/* Checklist Indicator */}
                  {hasChecklist && (
                    <div className={`flex items-center gap-1 text-[12px] p-[2px] px-1.5 rounded ${isChecklistComplete ? 'bg-[#e4f0f6] text-[#0065ff]' : 'text-[#5e6c84]'}`}>
                      <FiCheckSquare size={12} />
                      <span>{completedChecklistItems}/{totalChecklistItems}</span>
                    </div>
                  )}
                </div>

                {/* Members Indicator */}
                {card.members && card.members.length > 0 && (
                  <div className="flex items-center ml-auto h-6">
                    {card.members.map((member) => (
                      <div
                        key={member.id || member.user.id}
                        className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold ring-2 ring-white"
                        title={member.user.name}
                      >
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          {isModalOpen && (
            <CardModal
              cardId={card.id}
              boardId={boardId}
              listTitle={listTitle}
              onClose={() => setIsModalOpen(false)}
              refreshBoard={refreshBoard}
            />
          )}
        </>
      )}
    </Draggable>

    <ConfirmModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={confirmDeleteCard}
      title="Delete Card"
      message={`Are you sure you want to delete the card "${card.title}"? This action cannot be undone.`}
      confirmText="Delete Card"
    />
    </>
  );
};

export default Card;
