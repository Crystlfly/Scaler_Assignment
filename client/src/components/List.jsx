import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Card from './Card';
import axios from 'axios';
import { FiMoreHorizontal } from 'react-icons/fi';
import ConfirmModal from './ModalComponents/ConfirmModal';
import ListOptionsMenu from './ListComponents/ListOptionsMenu';
import CreateCardForm from './ListComponents/CreateCardForm';
import { isPast, differenceInHours } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  
  const cardInputRef = React.useRef(null);

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
      // Refocus the input smoothly for continuous creation
      setTimeout(() => {
        cardInputRef.current?.focus();
      }, 0);
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

    // 4. Due Date Filters (Array: ['overdue', 'due_soon'])
    if (filterDueDate && filterDueDate.length > 0) {
      if (!card.dueDate) return false;
      
      const isOverdue = isPast(new Date(card.dueDate)) && !card.isComplete;
      const hoursUntilDue = differenceInHours(new Date(card.dueDate), new Date());
      const isDueSoon = !isOverdue && hoursUntilDue <= 24 && hoursUntilDue >= 0 && !card.isComplete;
      const isDueLater = !isOverdue && !isDueSoon && !card.isComplete;
      
      const wantsOverdue = filterDueDate.includes('overdue');
      const wantsDueSoon = filterDueDate.includes('due_soon');
      const wantsDueLater = filterDueDate.includes('due_later');
      
      // If they selected multiple, it should be an OR operation (e.g. show if it's overdue OR due soon)
      let matchesDueDateFilters = false;
      if (wantsOverdue && isOverdue) matchesDueDateFilters = true;
      if (wantsDueSoon && isDueSoon) matchesDueDateFilters = true;
      if (wantsDueLater && isDueLater) matchesDueDateFilters = true;
      
      if (!matchesDueDateFilters) return false;
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
            <ListOptionsMenu
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              setIsAddingCard={setIsAddingCard}
              deleteList={deleteList}
            />
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
          <CreateCardForm
            isAddingCard={isAddingCard}
            setIsAddingCard={setIsAddingCard}
            newCardTitle={newCardTitle}
            setNewCardTitle={setNewCardTitle}
            addCard={addCard}
            isAddingCardLoading={isAddingCardLoading}
            inputRef={cardInputRef}
          />
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
