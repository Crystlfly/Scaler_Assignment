import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { FiX, FiCheckSquare, FiUser, FiTag, FiServer, FiPlus, FiCheck, FiClock } from 'react-icons/fi';
import ModalDescription from './ModalComponents/ModalDescription';
import ModalChecklists from './ModalComponents/ModalChecklists';
import ModalSidebar from './ModalComponents/ModalSidebar';
import ModalBadges from './ModalComponents/ModalBadges';

const API_URL = 'http://localhost:5000/api';

const CardModal = ({ cardId, onClose, refreshBoard, listTitle, boardId }) => {
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);

    // New states for inline editing
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleContent, setEditTitleContent] = useState('');

    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editDescContent, setEditDescContent] = useState('');

    const [isAddingChecklist, setIsAddingChecklist] = useState(false);
    const [newChecklistTitle, setNewChecklistTitle] = useState('Tasks');

    const [addingItemId, setAddingItemId] = useState(null);
    const [newItemContent, setNewItemContent] = useState('');

    const [showMembers, setShowMembers] = useState(false);
    const [showLabels, setShowLabels] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dueDateInput, setDueDateInput] = useState('');

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
            setLoading(true);
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
        setIsEditingTitle(false);
        if (editTitleContent.trim() && editTitleContent.trim() !== card.title) {
            await axios.put(`${API_URL}/cards/${card.id}`, { title: editTitleContent.trim() });
            fetchCard();
            refreshBoard();
        } else {
            setEditTitleContent(card.title);
        }
    }

    const updateDescription = async () => {
        setIsEditingDescription(false);
        if (editDescContent.trim() !== card.description) {
            await axios.put(`${API_URL}/cards/${card.id}`, { description: editDescContent });
            fetchCard();
            refreshBoard();
        }
    }

    const updateDueDate = async (dateVal) => {
        try {
            // Send null if dateVal is empty string
            await axios.put(`${API_URL}/cards/${card.id}`, { dueDate: dateVal || null });
            setShowDatePicker(false);
            fetchCard();
            refreshBoard();
        } catch (err) { alert("Failed to update due date"); }
    }

    const addChecklist = async (e) => {
        e?.preventDefault();
        setIsAddingChecklist(false);
        if (newChecklistTitle.trim()) {
            await axios.post(`${API_URL}/cards/${card.id}/checklists`, { title: newChecklistTitle });
            setNewChecklistTitle('Tasks');
            fetchCard();
            refreshBoard();
        }
    }

    const addChecklistItem = async (checklistId, e) => {
        e?.preventDefault();
        setAddingItemId(null);
        if (newItemContent.trim()) {
            await axios.post(`${API_URL}/checklists/${checklistId}/items`, { content: newItemContent });
            setNewItemContent('');
            fetchCard();
            refreshBoard();
        }
    }

    const toggleChecklistItem = async (item) => {
        await axios.put(`${API_URL}/checklists/items/${item.id}`, { isCompleted: !item.isCompleted });
        fetchCard();
        refreshBoard();
    }

    const assignMember = async (userId) => {
        try {
            await axios.post(`${API_URL}/cards/${card.id}/members`, { userId });
            // setShowMembers(false); // keep open for multiple
            fetchCard();
            refreshBoard();
        } catch (e) { alert("Failed to add member."); }
    }

    const removeMember = async (userId) => {
        try {
            await axios.delete(`${API_URL}/cards/${card.id}/members/${userId}`);
            fetchCard();
            refreshBoard();
        } catch (e) { alert("Failed to remove member."); }
    }

    const assignLabel = async (labelId) => {
        try {
            await axios.post(`${API_URL}/cards/${card.id}/labels`, { labelId });
            // setShowLabels(false); // keep open to toggle multiple
            fetchCard();
            refreshBoard();
        } catch (e) { alert("Failed to add label."); }
    }

    const removeLabel = async (labelId) => {
        try {
            await axios.delete(`${API_URL}/cards/${card.id}/labels/${labelId}`);
            fetchCard();
            refreshBoard();
        } catch (e) { alert("Failed to remove label."); }
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
                        <div className="flex-1">
                            {isEditingTitle ? (
                                <input
                                    autoFocus
                                    type="text"
                                    value={editTitleContent}
                                    onChange={(e) => setEditTitleContent(e.target.value)}
                                    onBlur={updateTitle}
                                    onKeyDown={(e) => e.key === 'Enter' && updateTitle()}
                                    className="text-xl font-bold leading-tight w-full bg-white border-2 border-blue-500 rounded px-2 py-0.5 outline-none -ml-2.5"
                                />
                            ) : (
                                <h2
                                    onClick={() => setIsEditingTitle(true)}
                                    className="text-xl font-bold leading-tight cursor-pointer cursor-text hover:bg-[#091e4214] -ml-2.5 px-2.5 py-0.5 rounded transition-colors"
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
                        setShowDatePicker={setShowDatePicker}
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

                    {/* Checklists Section */}
                    <ModalChecklists
                        card={card}
                        addingItemId={addingItemId}
                        setAddingItemId={setAddingItemId}
                        newItemContent={newItemContent}
                        setNewItemContent={setNewItemContent}
                        addChecklistItem={addChecklistItem}
                        toggleChecklistItem={toggleChecklistItem}
                    />

                </div>

                {/* Sidebar Actions */}
                <ModalSidebar
                    card={card}
                    showMembers={showMembers} setShowMembers={setShowMembers}
                    showLabels={showLabels} setShowLabels={setShowLabels}
                    showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker}
                    isAddingChecklist={isAddingChecklist} setIsAddingChecklist={setIsAddingChecklist}
                    dbUsers={dbUsers} assignMember={assignMember}
                    dbLabels={dbLabels} assignLabel={assignLabel}
                    addChecklist={addChecklist} newChecklistTitle={newChecklistTitle} setNewChecklistTitle={setNewChecklistTitle}
                    dueDateInput={dueDateInput} setDueDateInput={setDueDateInput} updateDueDate={updateDueDate}
                />
            </div>
        </div>,
        document.body
    );
};

export default CardModal;

