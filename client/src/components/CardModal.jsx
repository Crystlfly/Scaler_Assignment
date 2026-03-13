import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { FiX, FiCheckSquare, FiUser, FiTag, FiServer, FiPlus, FiCheck, FiClock } from 'react-icons/fi';
import ModalDescription from './ModalComponents/ModalDescription';
import ModalChecklists from './ModalComponents/ModalChecklists';
import ModalSidebar from './ModalComponents/ModalSidebar';
import ModalBadges from './ModalComponents/ModalBadges';
import ModalActivity from './ModalComponents/ModalActivity';
import ModalAttachments from './ModalComponents/ModalAttachments';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CardModal = ({ cardId, onClose, refreshBoard, listTitle, boardId }) => {
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);

    // New states for inline editing
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleContent, setEditTitleContent] = useState('');
    const [isUpdatingTitleLoading, setIsUpdatingTitleLoading] = useState(false);

    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editDescContent, setEditDescContent] = useState('');
    const [isUpdatingDescLoading, setIsUpdatingDescLoading] = useState(false);

    const [isAddingChecklist, setIsAddingChecklist] = useState(false);
    const [isAddingChecklistLoading, setIsAddingChecklistLoading] = useState(false);
    const [newChecklistTitle, setNewChecklistTitle] = useState('Tasks');

    const [addingItemId, setAddingItemId] = useState(null);
    const [newItemContent, setNewItemContent] = useState('');
    const [isAddingItemLoading, setIsAddingItemLoading] = useState(false);
    const [togglingItemId, setTogglingItemId] = useState(null);

    const [activePopover, setActivePopover] = useState(null);
    const [dueDateInput, setDueDateInput] = useState('');

    const [isAssigningMemberLoading, setIsAssigningMemberLoading] = useState(null);
    const [isRemovingMemberLoading, setIsRemovingMemberLoading] = useState(null);
    const [isAssigningLabelLoading, setIsAssigningLabelLoading] = useState(null);
    const [isRemovingLabelLoading, setIsRemovingLabelLoading] = useState(null);
    const [isUpdatingDueDateLoading, setIsUpdatingDueDateLoading] = useState(false);
    
    const [isUpdatingCoverLoading, setIsUpdatingCoverLoading] = useState(false);

    const [isAddingAttachmentLoading, setIsAddingAttachmentLoading] = useState(false);

    const [isAddingCommentLoading, setIsAddingCommentLoading] = useState(false);

    const [dbLabels, setDbLabels] = useState([]);
    const [dbUsers, setDbUsers] = useState([]);

    const fetchUsersAndLabels = async () => {
        try {
            const [usersRes, boardRes] = await Promise.all([
                axios.get(`${API_URL}/users`),
                axios.get(`${API_URL}/boards/${boardId}`)
            ]);
            setDbUsers(usersRes.data);
            setDbLabels(boardRes.data.labels);
        } catch (error) {
            console.error("Failed to fetch users or labels", error);
        }
    };
    const fetchCard = async () => {
        try {
            const res = await axios.get(`${API_URL}/cards/${cardId}`);
            const foundCard = res.data;

            setCard(foundCard);
            // Pre-fill editable fields
            if (foundCard) {
                setEditTitleContent(foundCard.title || "");
                setEditDescContent(foundCard.description || "");
                setDueDateInput(foundCard.dueDate ? foundCard.dueDate.split('T')[0] : '');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cardId && boardId) {
            fetchCard();
            fetchUsersAndLabels();
        }
    }, [cardId, boardId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activePopover && !event.target.closest('[data-popover="true"]')) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activePopover]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const updateTitle = async () => {
         if (!editTitleContent.trim() || editTitleContent.trim() === card.title) {
             setEditTitleContent(card.title);
             setIsEditingTitle(false);
             return;
         }

         const previousTitle = card.title;
         
         // Optimistic Update
         setCard(prev => ({ ...prev, title: editTitleContent.trim() }));
         setIsEditingTitle(false);

         try {
             await axios.put(`${API_URL}/cards/${card.id}`, { title: editTitleContent.trim() });
             await refreshBoard();
         } catch (error) {
             console.error("Failed to update title:", error);
             // Rollback
             setCard(prev => ({ ...prev, title: previousTitle }));
             setEditTitleContent(previousTitle);
         }
    };

    const updateDescription = async () => {
        if (!editDescContent.trim() || editDescContent.trim() === card.description) {
            setIsEditingDescription(false);
            return;
        }

        const previousDesc = card.description;

        // Optimistic Update
        setCard(prev => ({ ...prev, description: editDescContent }));
        setIsEditingDescription(false);

        try {
            await axios.put(`${API_URL}/cards/${card.id}`, { description: editDescContent });
            await refreshBoard();
        } catch (error) {
            console.error(error);
            // Rollback
            setCard(prev => ({ ...prev, description: previousDesc }));
            setEditDescContent(previousDesc);
        }
    };

    const updateDueDate = async (isoDate) => {
        const previousDueDate = card.dueDate;
        
        // Optimistic Update
        setCard(prev => ({ ...prev, dueDate: isoDate }));
        setActivePopover(null);

        try {
            await axios.put(`${API_URL}/cards/${card.id}`, { dueDate: isoDate });
            await refreshBoard();
        } catch (e) { 
            console.error("Failed to update due date.", e);
            // Rollback
            setCard(prev => ({ ...prev, dueDate: previousDueDate }));
        }
    }

    const updateCover = async (coverUrlOrHex) => {
        const previousCover = card.cover;
        
        // Optimistic Update
        setCard(prev => ({ ...prev, cover: coverUrlOrHex }));
        setActivePopover(null);

        try {
            await axios.put(`${API_URL}/cards/${card.id}`, { cover: coverUrlOrHex });
            await refreshBoard();
        } catch (e) {
             console.error("Failed to update cover.", e);
             // Rollback
             setCard(prev => ({ ...prev, cover: previousCover }));
        }
    }

    const addComment = async (text) => {
        const tempId = "temp-" + Date.now();
        const tempComment = {
            id: tempId,
            text,
            authorName: "Demo User",
            createdAt: new Date().toISOString()
        };

        // Optimistic Update
        setCard(prev => ({ ...prev, comments: [tempComment, ...(prev.comments || [])] }));

        try {
            const res = await axios.post(`${API_URL}/cards/${card.id}/comments`, { text, authorName: "Demo User" });
            // Swap temp comment with real
            setCard(prev => ({
                ...prev,
                comments: prev.comments.map(c => c.id === tempId ? res.data : c)
            }));
            await refreshBoard();
        } catch (e) { 
            console.error("Failed to add comment.", e);
            // Rollback
            setCard(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== tempId) }));
        }
    };

    const addAttachment = async (url, name) => {
        const tempId = "temp-" + Date.now();
        const tempAttachment = {
            id: tempId,
            url,
            name,
            createdAt: new Date().toISOString()
        };

        // Optimistic Update
        setCard(prev => ({ ...prev, attachments: [tempAttachment, ...(prev.attachments || [])] }));
        setActivePopover(null);

        try {
            const res = await axios.post(`${API_URL}/cards/${card.id}/attachments`, { url, name });
            // Swap temp attachment with real
            setCard(prev => ({
                ...prev,
                attachments: prev.attachments.map(a => a.id === tempId ? res.data : a)
            }));
            await refreshBoard();
        } catch (e) { 
            console.error("Failed to add attachment.", e);
            // Rollback
            setCard(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== tempId) }));
        }
    };

    const addChecklist = async (e) => {
        e?.preventDefault();
        if (!newChecklistTitle.trim()) {
            setActivePopover(null);
            return;
        }

        const tempId = "temp-" + Date.now();
        const tempChecklist = {
            id: tempId,
            title: newChecklistTitle,
            items: []
        };

        // Optimistic Update
        setCard(prev => ({ ...prev, checklists: [...(prev.checklists || []), tempChecklist] }));
        const savedTitle = newChecklistTitle;
        setNewChecklistTitle('Tasks');
        setActivePopover(null);

        try {
            const res = await axios.post(`${API_URL}/cards/${card.id}/checklists`, { title: savedTitle });
            // Swap temp checklist with real
            setCard(prev => ({
                ...prev,
                checklists: prev.checklists.map(cl => cl.id === tempId ? res.data : cl)
            }));
            await refreshBoard();
        } catch (err) {
            console.error("Failed to add checklist", err);
            // Rollback
            setCard(prev => ({ ...prev, checklists: prev.checklists.filter(cl => cl.id !== tempId) }));
        }
    }

    const addChecklistItem = async (checklistId, e) => {
        e?.preventDefault();
        if (!newItemContent.trim()) {
            setAddingItemId(null);
            return;
        }

        const tempId = "temp-" + Date.now();
        const tempItem = {
            id: tempId,
            content: newItemContent,
            isCompleted: false
        };

        // Optimistic Update
        setCard(prev => ({
            ...prev,
            checklists: prev.checklists.map(cl => 
                cl.id === checklistId 
                ? { ...cl, items: [...(cl.items || []), tempItem] }
                : cl
            )
        }));
        const savedContent = newItemContent;
        setNewItemContent('');
        setAddingItemId(null);

        try {
            const res = await axios.post(`${API_URL}/checklists/${checklistId}/items`, { content: savedContent });
            // Swap temp item with real
            setCard(prev => ({
                ...prev,
                checklists: prev.checklists.map(cl => 
                    cl.id === checklistId 
                    ? { ...cl, items: cl.items.map(i => i.id === tempId ? res.data : i) }
                    : cl
                )
            }));
            await refreshBoard();
        } catch (err) {
             console.error("Failed to add item", err);
             // Rollback
             setCard(prev => ({
                 ...prev,
                 checklists: prev.checklists.map(cl => 
                     cl.id === checklistId 
                     ? { ...cl, items: cl.items.filter(i => i.id !== tempId) }
                     : cl
                 )
             }));
        }
    }

    const toggleChecklistItem = async (item) => {
        const previousState = item.isCompleted;

        // Optimistic Update
        setCard(prev => ({
            ...prev,
            checklists: prev.checklists.map(cl => ({
                ...cl,
                items: cl.items.map(i => i.id === item.id ? { ...i, isCompleted: !previousState } : i)
            }))
        }));

        try {
            await axios.put(`${API_URL}/checklists/items/${item.id}`, { isCompleted: !item.isCompleted });
            await refreshBoard();
        } catch (err) {
            console.error("Failed to toggle item", err);
            // Rollback
            setCard(prev => ({
                ...prev,
                checklists: prev.checklists.map(cl => ({
                    ...cl,
                    items: cl.items.map(i => i.id === item.id ? { ...i, isCompleted: previousState } : i)
                }))
            }));
        }
    }

    const assignMember = async (userId) => {
        const userToAdd = dbUsers.find(u => u.id === userId);
        if (!userToAdd) return;

        const tempMember = {
            id: `temp-${Date.now()}`,
            user: userToAdd
        };

        // Optimistic Update
        setCard(prev => ({ ...prev, members: [...(prev.members || []), tempMember] }));

        try {
            const res = await axios.post(`${API_URL}/cards/${card.id}/members`, { userId });
            // Swap temp member with real
            setCard(prev => ({
                ...prev,
                members: prev.members.map(m => m.id === tempMember.id ? res.data : m)
            }));
            await refreshBoard();
        } catch (e) { 
            console.error("Failed to add member.", e);
            // Rollback
            setCard(prev => ({ ...prev, members: prev.members.filter(m => m.id !== tempMember.id) }));
        }
    }

    const removeMember = async (userId) => {
        const previousMembers = [...(card.members || [])];

        // Optimistic Update
        setCard(prev => ({ ...prev, members: prev.members.filter(m => m.user.id !== userId) }));

        try {
            await axios.delete(`${API_URL}/cards/${card.id}/members/${userId}`);
            await refreshBoard();
        } catch (e) { 
            console.error("Failed to remove member.", e);
            // Rollback
            setCard(prev => ({ ...prev, members: previousMembers }));
        }
    }

    const assignLabel = async (labelId) => {
        const labelToAdd = dbLabels.find(l => l.id === labelId);
        if (!labelToAdd) return;

        const tempLabel = {
            id: `temp-${Date.now()}`,
            label: labelToAdd
        };

        // Optimistic Update
        setCard(prev => ({ ...prev, labels: [...(prev.labels || []), tempLabel] }));

        try {
            const res = await axios.post(`${API_URL}/cards/${card.id}/labels`, { labelId });
            // Swap temp label with real
            setCard(prev => ({
                ...prev,
                labels: prev.labels.map(l => l.id === tempLabel.id ? res.data : l)
            }));
            await refreshBoard();
        } catch (e) { 
            console.error("Failed to add label.", e);
            // Rollback
            setCard(prev => ({ ...prev, labels: prev.labels.filter(l => l.id !== tempLabel.id) }));
        }
    }

    const removeLabel = async (labelId) => {
        const previousLabels = [...(card.labels || [])];

        // Optimistic Update
        setCard(prev => ({ ...prev, labels: prev.labels.filter(l => l.label.id !== labelId) }));

        try {
            await axios.delete(`${API_URL}/cards/${card.id}/labels/${labelId}`);
            await refreshBoard();
        } catch (e) { 
            console.error("Failed to remove label.", e);
            // Rollback
            setCard(prev => ({ ...prev, labels: previousLabels }));
        }
    }

    if (loading) {
        return createPortal(
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center overflow-y-auto font-sans p-4 sm:p-12">
                <div className="bg-[#f4f5f7] rounded-xl w-full max-w-[768px] min-h-[400px] flex items-center justify-center relative">
                     <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#091e4214] text-gray-500 transition-colors z-10"><FiX size={20} /></button>
                     <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>,
            document.body
        );
    }
    
    if (!card) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center pt-16 pb-16 overflow-y-auto font-[Inter,-apple-system,sans-serif]"
            onClick={handleOverlayClick}
        >
            <div className="bg-[#f4f5f7] rounded-xl w-full max-w-3xl min-h-[500px] relative text-[#172b4d] flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${card.cover ? 'text-white hover:bg-black/20 bg-black/10' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <FiX size={20} />
                </button>

                {/* Optional Cover Block */}
                {card.cover && (
                    <div 
                        className="w-full h-32 shrink-0 bg-cover bg-center bg-no-repeat rounded-t-xl"
                        style={{
                            backgroundColor: card.cover.startsWith('#') ? card.cover : undefined,
                            backgroundImage: card.cover.startsWith('http') ? `url('${card.cover}')` : undefined
                        }}
                    ></div>
                )}

                <div className="flex flex-col md:flex-row flex-1">
                    {/* Main Content Area */}
                    <div className="flex-1 p-6 pr-4">

                    {/* Header Section */}
                    <div className="flex items-start gap-4 mb-8">
                        <FiServer className="text-gray-500 mt-1 shrink-0" size={24} />
                        <div className="flex-1">
                                {isEditingTitle ? (
                                    <input
                                        autoFocus
                                        value={editTitleContent}
                                        onChange={(e) => setEditTitleContent(e.target.value)}
                                        onBlur={updateTitle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') updateTitle();
                                            if (e.key === 'Escape') {
                                                setIsEditingTitle(false);
                                                setEditTitleContent(card.title);
                                            }
                                        }}
                                        className="text-xl font-semibold bg-white border-2 border-blue-500 rounded px-2 py-0.5 outline-none w-full"
                                        disabled={isUpdatingTitleLoading}
                                    />
                                ) : (
                                    <h2
                                        onClick={() => setIsEditingTitle(true)}
                                        className="text-xl font-semibold cursor-pointer hover:bg-[#091e4214] flex items-center gap-2 rounded px-2 py-0.5 -ml-2"
                                    >
                                        {card.title}
                                    </h2>
                                )}
                            <p className="text-sm text-gray-500 mt-1">
                                in list <span className="underline cursor-pointer">{listTitle}</span>
                            </p>
                        </div>
                    </div>

                    {/* Badges row (Labels, Members, Due Date) */}
                    <ModalBadges
                        card={card}
                        dbUsers={dbUsers}
                        dbLabels={dbLabels}
                        assignMember={assignMember}
                        removeMember={removeMember}
                        assignLabel={assignLabel}
                        removeLabel={removeLabel}
                        activePopover={activePopover}
                        setActivePopover={setActivePopover}
                        isAssigningMemberLoading={isAssigningMemberLoading}
                        isRemovingMemberLoading={isRemovingMemberLoading}
                        isAssigningLabelLoading={isAssigningLabelLoading}
                        isRemovingLabelLoading={isRemovingLabelLoading}
                    />

                    {/* Description Section */}
                    <ModalDescription
                        card={card}
                        isEditingDescription={isEditingDescription}
                        setIsEditingDescription={setIsEditingDescription}
                        editDescContent={editDescContent}
                        setEditDescContent={setEditDescContent}
                        updateDescription={updateDescription}
                    />

                    {/* Attachments Section */}
                    {card.attachments && card.attachments.length > 0 && (
                        <ModalAttachments attachments={card.attachments} />
                    )}

                    {/* Checklists Section */}
                    <ModalChecklists
                        card={card}
                        addingItemId={addingItemId}
                        setAddingItemId={setAddingItemId}
                        newItemContent={newItemContent}
                        setNewItemContent={setNewItemContent}
                        addChecklistItem={addChecklistItem}
                        toggleChecklistItem={toggleChecklistItem}
                        isAddingItemLoading={isAddingItemLoading}
                        togglingItemId={togglingItemId}
                    />

                    {/* Activity Section */}
                    <ModalActivity
                        card={card}
                        addComment={addComment}
                    />

                </div>

                {/* Sidebar Actions */}
                    <ModalSidebar
                        card={card}
                        activePopover={activePopover} setActivePopover={setActivePopover}
                        dbUsers={dbUsers} assignMember={assignMember}
                        dbLabels={dbLabels} assignLabel={assignLabel}
                        addChecklist={addChecklist} newChecklistTitle={newChecklistTitle} setNewChecklistTitle={setNewChecklistTitle}
                        dueDateInput={dueDateInput} setDueDateInput={setDueDateInput} updateDueDate={updateDueDate}
                        updateCover={updateCover} addAttachment={addAttachment}
                        isAddingChecklistLoading={isAddingChecklistLoading}
                        isAssigningMemberLoading={isAssigningMemberLoading}
                        isAssigningLabelLoading={isAssigningLabelLoading}
                        isUpdatingDueDateLoading={isUpdatingDueDateLoading}
                        isUpdatingCoverLoading={isUpdatingCoverLoading}
                        isAddingAttachmentLoading={isAddingAttachmentLoading}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CardModal;

