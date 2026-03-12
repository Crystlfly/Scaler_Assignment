import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { BiRightArrowAlt } from 'react-icons/bi';
import { FiClock, FiCheckSquare } from 'react-icons/fi';
import CardModal from './CardModal';

const API_URL = 'http://localhost:5000/api';

const Card = ({ card, index, refreshBoard, listTitle, boardId }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteCard = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete card '${card.title}'?`)) {
      try {
        await axios.delete(`${API_URL}/cards/${card.id}`);
        refreshBoard();
      } catch (error) {
        console.error("Failed to delete card:", error);
      }
    }
  }

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

  return (
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
            className={`bg-white rounded-lg p-2.5 mb-2 shrink-0 group relative cursor-pointer shadow-[0_1px_1px_#091e4240] ${snapshot.isDragging ? 'shadow-lg rotate-2 z-50' : 'hover:outline-2 outline-blue-500 hover:bg-[#f4f5f7]'
              }`}
          >
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

            {/* Title */}
            <div className="text-[14px] font-normal text-[#172b4d] pr-6 leading-5 break-words mb-1">{card.title}</div>

            {/* Badges Footer */}
            {(card.dueDate || hasChecklist || (card.members && card.members.length > 0)) && (
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-[5px]">

                <div className="flex items-center gap-2">
                  {/* Due Date Indicator (Mock implementation to match screenshot style) */}
                  {card.dueDate && (
                    <div className="flex items-center gap-1 text-[12px] p-[2px] px-1.5 rounded bg-[#ebecf0] text-[#5e6c84]">
                      <FiClock size={12} />
                      <span>Mar 19</span>
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
  );
};

export default Card;
