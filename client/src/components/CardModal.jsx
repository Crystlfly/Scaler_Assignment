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

    const [showMembers, setShowMembers] = useState(false);
    const [showLabels, setShowLabels] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dueDateInput, setDueDateInput] = useState('');

    const [isAssigningMemberLoading, setIsAssigningMemberLoading] = useState(null);
    const [isRemovingMemberLoading, setIsRemovingMemberLoading] = useState(null);
    const [isAssigningLabelLoading, setIsAssigningLabelLoading] = useState(null);
    const [isRemovingLabelLoading, setIsRemovingLabelLoading] = useState(null);
    const [isUpdatingDueDateLoading, setIsUpdatingDueDateLoading] = useState(false);
    
    const [showCover, setShowCover] = useState(false);
    const [isUpdatingCoverLoading, setIsUpdatingCoverLoading] = useState(false);

    const [showAttachment, setShowAttachment] = useState(false);
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

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const updateTitle = async () => {
        setIsUpdatingTitleLoading(true);
        try {
             if (editTitleContent.trim() && editTitleContent.trim() !== card.title) {
                await axios.put(`${API_URL}/cards/${card.id}`, { title: editTitleContent.trim() });
                await fetchCard();
                await refreshBoard();
             } else {
                setEditTitleContent(card.title);
             }
             setIsEditingTitle(false);
        } catch (error) {
             console.error("Failed to update title:", error);
             setEditTitleContent(card.title);
        } finally {
             setIsUpdatingTitleLoading(false);
        }
    }

    const updateDescription = async () => {
        setIsUpdatingDescLoading(true);
        try {
            // Only update if content has changed
            if (editDescContent.trim() !== card.description) {
                await axios.put(`${API_URL}/cards/${card.id}`, { description: editDescContent });
                await fetchCard();
                await refreshBoard(); // Keep refreshBoard as it was in the original
            }
            setIsEditingDescription(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdatingDescLoading(false);
        }
    }

    const updateDueDate = async (isoDate) => {
        setIsUpdatingDueDateLoading(true);
        try {
            await axios.put(`${API_URL}/cards/${card.id}`, { dueDate: isoDate });
            await fetchCard();
            await refreshBoard();
            setShowDatePicker(false);
        } catch (e) { alert("Failed to update due date."); }
        finally { setIsUpdatingDueDateLoading(false); }
    }

    const updateCover = async (coverUrlOrHex) => {
        setIsUpdatingCoverLoading(true);
        try {
            await axios.put(`${API_URL}/cards/${card.id}`, { cover: coverUrlOrHex });
            await fetchCard();
            await refreshBoard();
        } catch (e) { alert("Failed to update cover."); }
        finally { setIsUpdatingCoverLoading(false); }
    }

    const addComment = async (text) => {
        setIsAddingCommentLoading(true);
        try {
            await axios.post(`${API_URL}/cards/${card.id}/comments`, { text, authorName: "Demo User" });
            await fetchCard();
            await refreshBoard();
        } catch (e) { alert("Failed to add comment."); }
        finally { setIsAddingCommentLoading(false); }
    };

    const addAttachment = async (url, name) => {
        setIsAddingAttachmentLoading(true);
        try {
            await axios.post(`${API_URL}/cards/${card.id}/attachments`, { url, name });
            setShowAttachment(false);
            await fetchCard();
            await refreshBoard();
        } catch (e) { alert("Failed to add attachment."); }
        finally { setIsAddingAttachmentLoading(false); }
    };

    const addChecklist = async (e) => {
        e?.preventDefault();
        if (newChecklistTitle.trim()) {
            setIsAddingChecklistLoading(true);
            try {
                await axios.post(`${API_URL}/cards/${card.id}/checklists`, { title: newChecklistTitle });
                setNewChecklistTitle('Tasks');
                await fetchCard();
                await refreshBoard();
            } catch (err) {
                console.error("Failed to add checklist", err);
            } finally {
                setIsAddingChecklistLoading(false);
                setIsAddingChecklist(false);
            }
        } else {
            setIsAddingChecklist(false);
        }
    }

    const addChecklistItem = async (checklistId, e) => {
        e?.preventDefault();
        if (newItemContent.trim()) {
            setIsAddingItemLoading(true);
            try {
                await axios.post(`${API_URL}/checklists/${checklistId}/items`, { content: newItemContent });
                setNewItemContent('');
                await fetchCard();
                await refreshBoard();
            } catch (err) {
                 console.error("Failed to add item", err);
            } finally {
                 setIsAddingItemLoading(false);
                 setAddingItemId(null);
            }
        } else {
            setAddingItemId(null);
        }
    }

    const toggleChecklistItem = async (item) => {
        setTogglingItemId(item.id);
        try {
            await axios.put(`${API_URL}/checklists/items/${item.id}`, { isCompleted: !item.isCompleted });
            await fetchCard();
            await refreshBoard();
        } catch (err) {
            console.error("Failed to toggle item", err);
        } finally {
            setTogglingItemId(null);
        }
    }

    const assignMember = async (userId) => {
        setIsAssigningMemberLoading(userId);
        try {
            await axios.post(`${API_URL}/cards/${card.id}/members`, { userId });
            // setShowMembers(false); // keep open for multiple
            await fetchCard();
            await refreshBoard();
        } catch (e) { alert("Failed to add member."); }
        finally { setIsAssigningMemberLoading(null); }
    }

    const removeMember = async (userId) => {
        setIsRemovingMemberLoading(userId);
        try {
            await axios.delete(`${API_URL}/cards/${card.id}/members/${userId}`);
            await fetchCard();
            await refreshBoard();
        } catch (e) { alert("Failed to remove member."); }
        finally { setIsRemovingMemberLoading(null); }
    }

    const assignLabel = async (labelId) => {
        setIsAssigningLabelLoading(labelId);
        try {
            await axios.post(`${API_URL}/cards/${card.id}/labels`, { labelId });
            // setShowLabels(false); // keep open to toggle multiple
            await fetchCard();
            await refreshBoard();
        } catch (e) { alert("Failed to add label."); }
        finally { setIsAssigningLabelLoading(null); }
    }

    const removeLabel = async (labelId) => {
        setIsRemovingLabelLoading(labelId);
        try {
            await axios.delete(`${API_URL}/cards/${card.id}/labels/${labelId}`);
            await fetchCard();
            await refreshBoard();
        } catch (e) { alert("Failed to remove label."); }
        finally { setIsRemovingLabelLoading(null); }
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
                                        {isUpdatingTitleLoading && <div className="w-4 h-4 border-2 border-blue-500 border-t-blue-200 rounded-full animate-spin"></div>}
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
                        showMembers={showMembers}
                        setShowMembers={setShowMembers}
                        showLabels={showLabels}
                        setShowLabels={setShowLabels}
                        showDatePicker={showDatePicker}
                        setShowDatePicker={setShowDatePicker}
                        setIsAddingChecklist={setIsAddingChecklist}
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
                        isUpdatingDescLoading={isUpdatingDescLoading}
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
                        isAddingCommentLoading={isAddingCommentLoading}
                    />

                </div>

                {/* Sidebar Actions */}
                    <ModalSidebar
                        card={card}
                        showMembers={showMembers} setShowMembers={setShowMembers}
                        showLabels={showLabels} setShowLabels={setShowLabels}
                        showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker}
                        showCover={showCover} setShowCover={setShowCover}
                        showAttachment={showAttachment} setShowAttachment={setShowAttachment}
                        isAddingChecklist={isAddingChecklist} setIsAddingChecklist={setIsAddingChecklist}
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

