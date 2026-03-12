import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { FiX, FiCheckSquare, FiUser, FiTag, FiServer, FiAlignLeft } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

const CardModal = ({ cardId, onClose, refreshBoard, listTitle }) => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock available members/labels (in a real app, these would come from the board fetch)
  const availableLabels = [
    { id: 'l-bug', title: 'Bug', color: '#ef5350' },
    { id: 'l-feature', title: 'Feature', color: '#66bb6a' },
    { id: 'l-design', title: 'Design', color: '#ab47bc' },
    { id: 'l-urgent', title: 'Urgent', color: '#ffb74d' },
  ];

  const availableMembers = [
    { id: 'u-demo', name: 'Demo User', email: 'demo@example.com' },
    { id: 'u-alice', name: 'Alice Smith', email: 'alice@example.com' },
  ];

  const fetchCard = async () => {
    // For simplicity, we refetch the board and find our card, or we could add a GET /api/cards/:id route to the backend.
    // Wait, the backend doesn't have a GET /api/cards/:id route in our index.js!
    // But we pass the deeply nested board data down anyway. Let's just fetch the whole board and extract the card.
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/boards`);
      let activeBoardId = res.data[0]?.id;
      if (!activeBoardId) return;

      const boardRes = await axios.get(`${API_URL}/boards/${activeBoardId}`);
      
      let foundCard = null;
      for (const list of boardRes.data.lists) {
          const c = list.cards.find(c => c.id === cardId);
          if (c) {
              foundCard = c;
              break;
          }
      }
      setCard(foundCard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  // Handle outside click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const updateDescription = async () => {
      const desc = prompt("Enter new description:", card?.description || "");
      if (desc !== null) {
          await axios.put(`${API_URL}/cards/${card.id}`, { description: desc });
          fetchCard();
          refreshBoard();
      }
  }

  const addChecklist = async () => {
      const title = prompt("Checklist title:", "Tasks");
      if (title) {
          await axios.post(`${API_URL}/cards/${card.id}/checklists`, { title });
          fetchCard();
          refreshBoard();
      }
  }

  const addChecklistItem = async (checklistId) => {
      const content = prompt("Add item:");
      if (content) {
          await axios.post(`${API_URL}/checklists/${checklistId}/items`, { content });
          fetchCard();
          refreshBoard();
      }
  }

  const toggleChecklistItem = async (item) => {
      await axios.put(`${API_URL}/checklists/items/${item.id}`, { isCompleted: !item.isCompleted });
      fetchCard();
      refreshBoard();
  }

  const addMember = async () => {
      // Mock random member assignment for brevity
      const member = availableMembers[Math.floor(Math.random() * availableMembers.length)];
      try {
          // Backend expects an existing DB user. 
          // If running the seed, 'demo@example.com' exists. We need to fetch users to get real IDs.
          // Fallback: prompt for user ID.
          const userId = prompt("Enter User ID to assign (must exist in DB). Check network requests for board members or run seed.");
          if (userId) {
              await axios.post(`${API_URL}/cards/${card.id}/members`, { userId });
              fetchCard();
              refreshBoard();
          }
      } catch (e) { alert("Failed to add member. Ensure User ID is valid."); }
  }

  const addLabel = async () => {
      // Prompt for a label ID that exists we created in seed.
      const labelId = prompt("Enter Label ID to assign. Check network requests for board labels.");
      if (labelId) {
          try {
              await axios.post(`${API_URL}/cards/${card.id}/labels`, { labelId });
              fetchCard();
              refreshBoard();
          } catch (e) { alert("Failed to add label. Ensure Label ID is valid."); }
      }
  }


  if (loading || !card) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"></div>,
      document.body
    );
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center pt-16 pb-16 overflow-y-auto font-[Inter,-apple-system,sans-serif]"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#f4f5f7] rounded-xl w-full max-w-3xl min-h-[500px] relative text-[#172b4d] flex">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors z-10"
        >
          <FiX size={20} />
        </button>

        {/* Main Content Area */}
        <div className="flex-1 p-6 pr-4">
           
           {/* Header Section */}
           <div className="flex items-start gap-4 mb-8">
              <FiServer className="text-gray-500 mt-1 shrink-0" size={24} />
              <div>
                  <h2 className="text-xl font-bold leading-tight">{card.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                      in list <span className="underline cursor-pointer">{listTitle}</span>
                  </p>
              </div>
           </div>

           {/* Badges row (Labels & Members) */}
           {(card.labels?.length > 0 || card.members?.length > 0) && (
               <div className="flex flex-wrap gap-8 ml-10 mb-8">
                   {card.members?.length > 0 && (
                       <div>
                           <h3 className="text-xs font-semibold text-[#5e6c84] mb-2">Members</h3>
                           <div className="flex gap-1">
                               {card.members.map(member => (
                                   <div key={member.id} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer hover:bg-blue-700" title={member.user.name}>
                                       {member.user.name.charAt(0).toUpperCase()}
                                   </div>
                               ))}
                               <button onClick={addMember} className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
                                   <FiPlus size={16} />
                               </button>
                           </div>
                       </div>
                   )}
                   
                   {card.labels?.length > 0 && (
                       <div>
                           <h3 className="text-xs font-semibold text-[#5e6c84] mb-2">Labels</h3>
                           <div className="flex flex-wrap gap-1">
                               {card.labels.map(cardLabel => (
                                   <div 
                                      key={cardLabel.id} 
                                      className="px-3 py-1.5 rounded-sm text-sm font-medium text-white shadow-sm cursor-pointer transition-opacity hover:opacity-90"
                                      style={{ backgroundColor: cardLabel.label.color }}
                                   >
                                       {cardLabel.label.title || "Label"}
                                   </div>
                               ))}
                               <button onClick={addLabel} className="h-8 px-3 rounded-sm bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
                                   <FiPlus size={16} />
                               </button>
                           </div>
                       </div>
                   )}
               </div>
           )}

           {/* Description Section */}
           <div className="flex items-start gap-4 mb-8">
              <FiAlignLeft className="text-gray-500 mt-0.5 shrink-0" size={24} />
              <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                     <h3 className="text-lg font-semibold">Description</h3>
                     {card.description && (
                         <button onClick={updateDescription} className="px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors">
                             Edit
                         </button>
                     )}
                  </div>
                  {card.description ? (
                      <div className="text-sm cursor-pointer" onClick={updateDescription}>
                          {card.description}
                      </div>
                  ) : (
                      <div onClick={updateDescription} className="bg-[#091e420f] hover:bg-[#091e4214] rounded-sm p-3 min-h-[56px] text-sm text-[#172b4d] cursor-pointer transition-colors font-medium">
                          Add a more detailed description...
                      </div>
                  )}
              </div>
           </div>

           {/* Checklists Section */}
           {card.checklists?.map(checklist => {
               const total = checklist.items.length;
               const completed = checklist.items.filter(i => i.isCompleted).length;
               const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

               return (
                   <div key={checklist.id} className="flex items-start gap-4 mb-8">
                       <FiCheckSquare className="text-gray-500 mt-1 shrink-0" size={24} />
                       <div className="flex-1">
                           <div className="flex items-center justify-between mb-4">
                               <h3 className="text-lg font-semibold">{checklist.title}</h3>
                               <button className="px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors">
                                   Delete
                               </button>
                           </div>
                           
                           {/* Progress Bar */}
                           <div className="flex items-center gap-3 mb-4">
                               <span className="text-xs text-gray-600 w-8">{percent}%</span>
                               <div className="flex-1 h-2 bg-[#091e4214] rounded-full overflow-hidden">
                                   <div 
                                      className="h-full bg-blue-600 transition-all duration-300" 
                                      style={{ width: `${percent}%`, backgroundColor: percent === 100 ? '#1f845a' : '#0c66e4' }}
                                   />
                               </div>
                           </div>

                           {/* Items */}
                           <div className="space-y-2 mb-3">
                               {checklist.items.map(item => (
                                   <div key={item.id} className="flex items-start gap-3 group">
                                       <div 
                                          className={`w-4 h-4 mt-1 rounded-sm border cursor-pointer flex items-center justify-center shrink-0 ${item.isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}
                                          onClick={() => toggleChecklistItem(item)}
                                       >
                                           {item.isCompleted && <FiCheckSquare size={12} className="opacity-0 group-hover:opacity-100 absolute" style={{opacity: item.isCompleted ? 1 : ''}}/>}
                                       </div>
                                       <div className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-[#172b4d]'}`}>
                                           {item.content}
                                       </div>
                                   </div>
                               ))}
                           </div>

                           <button onClick={() => addChecklistItem(checklist.id)} className="px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors mt-2">
                               Add an item
                           </button>
                       </div>
                   </div>
               )
           })}

        </div>

        {/* Sidebar Actions */}
        <div className="w-[192px] p-6 pl-2 pt-16 space-y-4 fixed right-0 mr-[-16px] md:relative md:mr-0 z-0">
            <div>
                <h4 className="text-xs font-semibold text-[#5e6c84] mb-2 uppercase">Add to card</h4>
                <div className="space-y-2">
                    <button onClick={addMember} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2">
                        <FiUser size={16}/> Members
                    </button>
                    <button onClick={addLabel} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2">
                        <FiTag size={16}/> Labels
                    </button>
                    <button onClick={addChecklist} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2">
                        <FiCheckSquare size={16}/> Checklist
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CardModal;

// Because we used some generic icons, we need an ad-hoc Plus icon for the row
const FiPlus = ({size}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
