import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdAdd, MdMoreHoriz, MdClose } from 'react-icons/md';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const [addingCardToList, setAddingCardToList] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const listInputRef = useRef(null);
  const cardInputRef = useRef(null);

  useEffect(() => {
    fetchBoard();
  }, []);

  useEffect(() => {
    if (isAddingList && listInputRef.current) {
      listInputRef.current.focus();
    }
  }, [isAddingList]);

  useEffect(() => {
    if (addingCardToList && cardInputRef.current) {
      cardInputRef.current.focus();
    }
  }, [addingCardToList]);

  const fetchBoard = async () => {
    try {
      const boardsRes = await axios.get(`${API_URL}/boards`);
      if (boardsRes.data.length > 0) {
        const boardId = boardsRes.data[0].id;
        const res = await axios.get(`${API_URL}/boards/${boardId}`);
        setBoard(res.data);
      } else {
        setBoard(null);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
    } finally {
      setLoading(false);
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

  const handleAddCard = async (e, listId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      await axios.post(`${API_URL}/cards`, {
        title: newCardTitle,
        listId
      });
      setNewCardTitle('');
      setAddingCardToList(null);
      fetchBoard();
    } catch (err) {
      console.error('Error adding card', err);
    }
  };

  const handleDeleteCard = async (e, cardId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/cards/${cardId}`);
      fetchBoard();
    } catch (err) {
      console.error('Error deleting card', err);
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
        await axios.put(`${API_URL}/cards/${movedCard.id}`, {
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

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!board) return <div className="text-white p-8">No boards found. Please refresh or run the seed script.</div>;

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
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-white/20 hover:bg-white/30 p-1.5 rounded text-sm transition-colors cursor-pointer">
            demo@example.com
          </button>
        </div>
      </nav>

      <div className="px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 text-white">
          <h1 className="text-xl font-bold bg-white/20 px-3 py-1 rounded cursor-pointer hover:bg-white/30 transition-colors drop-shadow-sm">
            {board.title}
          </h1>
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
                {board?.lists?.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-[#f1f2f4] w-[272px] shrink-0 rounded-xl max-h-full flex flex-col shadow-sm ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                      >
                        <div className="px-3 pt-3 pb-2 flex justify-between items-center cursor-pointer group">
                          <h2 className="font-semibold text-slate-700 text-sm px-1 group-hover:bg-slate-200 rounded py-0.5">{list.title}</h2>
                          <button className="text-slate-500 hover:bg-slate-200 p-1.5 rounded flex items-center justify-center cursor-pointer">
                            <MdMoreHoriz size={18} />
                          </button>
                        </div>

                        <Droppable droppableId={list.id} type="card">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 overflow-y-auto px-2 pb-1 space-y-2 custom-scrollbar min-h-2 ${snapshot.isDraggingOver ? 'bg-slate-200/50 rounded-lg transition-colors' : ''}`}
                            >
                              {list?.cards?.map((card, index) => (
                                <Draggable key={card.id} draggableId={card.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:outline-2 outline-blue-500 cursor-pointer group relative ${snapshot.isDragging ? 'rotate-3 shadow-xl ring-2 ring-blue-500' : ''}`}
                                    >
                                      {card.labels?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-1.5">
                                          {card.labels.map((cl) => (
                                            <span key={cl.id} className="h-2 w-10 rounded-full" style={{ backgroundColor: cl.label?.color || '#0079bf' }} />
                                          ))}
                                        </div>
                                      )}

                                      <div className="flex justify-between items-start">
                                        <p className="text-slate-800 text-sm">{card.title}</p>
                                        <button
                                          onClick={(e) => handleDeleteCard(e, card.id)}
                                          className="text-slate-400 hover:text-red-500 hover:bg-slate-100 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                          title="Delete Card"
                                        >
                                          <MdClose size={16} />
                                        </button>
                                      </div>

                                      {(card.members?.length > 0 || card.checklists?.length > 0 || card.dueDate) && (
                                        <div className="mt-2 flex items-center text-slate-500 space-x-3 text-xs">
                                          {card.dueDate && (
                                            <div className="flex items-center gap-1">
                                              ⏱️ {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                          )}
                                          {card.checklists?.map((checklist) => {
                                            const completed = checklist.items?.filter(i => i.isCompleted).length || 0;
                                            const total = checklist.items?.length || 0;
                                            return (
                                              <div key={checklist.id} className="flex items-center gap-1 bg-slate-100 px-1 py-0.5 rounded">
                                                ☑️ {completed}/{total}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      <div className="absolute right-3 bottom-2 flex flex-row-reverse -space-x-1 space-x-reverse">
                                        {card.members?.map((cm) => (
                                          <div key={cm.id} className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold border border-white" title={cm.user?.name}>
                                            {cm.user?.name?.charAt(0) || 'U'}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              {addingCardToList === list.id && (
                                <form onSubmit={(e) => handleAddCard(e, list.id)} className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 mt-2">
                                  <textarea
                                    ref={cardInputRef}
                                    value={newCardTitle}
                                    onChange={(e) => setNewCardTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddCard(e, list.id);
                                      }
                                    }}
                                    placeholder="Enter a title for this card..."
                                    className="w-full text-sm outline-none resize-none"
                                    rows="3"
                                  />
                                  <div className="flex items-center mt-2 space-x-2">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors cursor-pointer">
                                      Add card
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setAddingCardToList(null); setNewCardTitle(''); }}
                                      className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-200 cursor-pointer transition-colors"
                                    >
                                      <MdClose size={22} />
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          )}
                        </Droppable>

                        {!addingCardToList || addingCardToList !== list.id ? (
                          <div className="p-2 pt-1 mt-1">
                            <button
                              onClick={() => setAddingCardToList(list.id)}
                              className="flex items-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 w-full py-1.5 px-2 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                            >
                              <MdAdd size={20} className="mr-1" /> Add a card
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                <div className="w-[272px] shrink-0">
                  {isAddingList ? (
                    <form onSubmit={handleAddList} className="bg-[#f1f2f4] p-2 rounded-xl shadow-sm">
                      <input
                        ref={listInputRef}
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="Enter list title..."
                        className="w-full px-3 py-1.5 text-sm rounded border-2 border-blue-500 outline-none"
                      />
                      <div className="flex items-center mt-2 space-x-2">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors cursor-pointer">
                          Add list
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsAddingList(false); setNewListTitle(''); }}
                          className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-200 cursor-pointer transition-colors"
                        >
                          <MdClose size={22} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsAddingList(true)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 px-3 rounded-xl flex items-center transition-colors shadow-sm cursor-pointer"
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
