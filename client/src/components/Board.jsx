import React, { useRef } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import List from './List';
import AddListForm from './AppComponents/AddListForm';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Board = ({
  board,
  setBoard,
  fetchBoard,
  searchQuery,
  filterLabels,
  filterMembers,
  filterDueDate,
  isAddingList,
  setIsAddingList,
  newListTitle,
  setNewListTitle,
  isAddingListLoading,
  handleAddList,
  listInputRef
}) => {

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
      setBoard(prev => ({ ...prev, lists: newLists }));

      try {
        await axios.put(`${API_URL}/lists/${movedList.id}/reorder`, { order: newOrder });
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

      setBoard(prev => ({ ...prev, lists: newLists }));

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

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto px-4 md:px-6 pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="list" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col md:flex-row items-center md:items-start h-full space-y-4 md:space-y-0 md:space-x-3 w-full"
            >
              {board?.lists?.map((list, index) => (
                <List
                  key={list.id}
                  board={board}
                  setBoard={setBoard}
                  list={list}
                  index={index}
                  refreshBoard={fetchBoard}
                  searchQuery={searchQuery}
                  filterLabels={filterLabels}
                  filterMembers={filterMembers}
                  filterDueDate={filterDueDate}
                />
              ))}
              {provided.placeholder}

              <AddListForm
                isAddingList={isAddingList}
                setIsAddingList={setIsAddingList}
                newListTitle={newListTitle}
                setNewListTitle={setNewListTitle}
                isAddingListLoading={isAddingListLoading}
                handleAddList={handleAddList}
                listInputRef={listInputRef}
              />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Board;