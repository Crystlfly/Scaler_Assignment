import React, { useState } from 'react';
import { FiUser, FiTag, FiCheckSquare, FiClock, FiPlus, FiImage, FiPaperclip } from 'react-icons/fi';

const ModalSidebar = ({
    card,
    showMembers, setShowMembers,
    showLabels, setShowLabels,
    showDatePicker, setShowDatePicker,
    showCover, setShowCover,
    isAddingChecklist, setIsAddingChecklist,
    dbUsers, assignMember,
    dbLabels, assignLabel,
    addChecklist, newChecklistTitle, setNewChecklistTitle,
    dueDateInput, setDueDateInput, updateDueDate,
    updateCover,
    isAddingChecklistLoading,
    isAssigningMemberLoading,
    isAssigningLabelLoading,
    isUpdatingDueDateLoading,
    isUpdatingCoverLoading,
    showAttachment, setShowAttachment,
    addAttachment, isAddingAttachmentLoading
}) => {
    const predefinedColors = ['#ef5350', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];
    const [coverUrlInput, setCoverUrlInput] = useState('');
    const [attachNextUrl, setAttachNextUrl] = useState('');
    const [attachNextName, setAttachNextName] = useState('');

    const handleAttach = (e) => {
        e.preventDefault();
        if (attachNextUrl.trim()) {
            addAttachment(attachNextUrl.trim(), attachNextName.trim() || attachNextUrl.trim());
            setAttachNextUrl('');
            setAttachNextName('');
        }
    };
    return (
        <div className="w-[192px] p-6 pl-2 pt-16 space-y-4 fixed right-0 mr-[-16px] md:relative md:mr-0 z-0">
            <div>
                <h4 className="text-xs font-semibold text-[#5e6c84] mb-2 uppercase">Add to card</h4>
                <div className="space-y-2 relative">
                    {/* Members Button - Hidden if members already exist on the card */}
                    {!(card.members?.length > 0) && (
                        <>
                            <button onClick={() => { setShowMembers(!showMembers); setShowLabels(false); setShowDatePicker(false); setIsAddingChecklist(false); setShowCover(false); setShowAttachment(false); }} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2">
                                <FiUser size={16} /> Members
                            </button>
                            {/* Inline member picker */}
                            {showMembers && (
                                <div className="absolute top-8 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 z-20 text-sm">
                                    <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Board Members</div>
                                    {dbUsers.map(m => (
                                        <div key={m.id} onClick={() => isAssigningMemberLoading !== m.id && assignMember(m.id)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer ${isAssigningMemberLoading === m.id ? 'opacity-50' : 'hover:bg-gray-100'}`}>
                                            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                {isAssigningMemberLoading === m.id ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : m.name.charAt(0)}
                                            </div>
                                            <span>{m.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Labels Button - Hidden if labels already exist on the card */}
                    {!(card.labels?.length > 0) && (
                        <>
                            <button onClick={() => { setShowLabels(!showLabels); setShowMembers(false); setShowDatePicker(false); setIsAddingChecklist(false); }} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2">
                                <FiTag size={16} /> Labels
                            </button>
                            {/* Inline label picker */}
                            {showLabels && (
                                <div className="absolute top-16 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 z-20 text-sm space-y-1 mt-1">
                                    <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Board Labels</div>
                                    {dbLabels.map(l => (
                                        <div key={l.id} onClick={() => isAssigningLabelLoading !== l.id && assignLabel(l.id)} className={`px-2 py-1.5 rounded flex items-center justify-between text-white font-medium cursor-pointer ${isAssigningLabelLoading === l.id ? 'opacity-70' : ''}`} style={{ backgroundColor: l.color }}>
                                            {l.title} 
                                            {isAssigningLabelLoading === l.id ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <FiPlus size={14} />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Checklists Button */}
                    {isAddingChecklist ? (
                        <form onSubmit={addChecklist} className="bg-white p-2 rounded shadow-md border absolute top-32 left-0 xl:right-full xl:left-auto xl:mr-2 w-48 z-20">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2 text-center border-b pb-2">Add Checklist</h4>
                            <input
                                autoFocus
                                type="text"
                                value={newChecklistTitle}
                                onChange={(e) => setNewChecklistTitle(e.target.value)}
                                className="w-full px-2 py-1 mb-2 rounded border-2 border-blue-500 focus:outline-none text-sm"
                            />
                            <button 
                                type="submit" 
                                disabled={isAddingChecklistLoading}
                                className="bg-[#0c66e4] text-white w-full py-1 rounded text-sm font-medium flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isAddingChecklistLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Add
                            </button>
                        </form>
                    ) : (
                        <button onClick={() => { setIsAddingChecklist(true); setShowLabels(false); setShowMembers(false); setShowDatePicker(false); }} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2">
                            <FiCheckSquare size={16} /> Checklist
                        </button>
                    )}

                    {/* Dates Button */}
                    <div className="relative">
                        <button onClick={() => { setShowDatePicker(!showDatePicker); setShowLabels(false); setShowMembers(false); setIsAddingChecklist(false); }} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2 mt-2">
                            <FiClock size={16} /> Dates
                        </button>
                        {showDatePicker && (
                            <div className="absolute top-10 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 w-64 z-20">
                                <h4 className="text-xs font-semibold text-gray-500 mb-3 text-center border-b pb-2">Dates</h4>
                                <label className="block text-xs font-bold text-[#5e6c84] mb-1">Due date</label>
                                <input
                                    type="date"
                                    value={dueDateInput}
                                    onChange={(e) => setDueDateInput(e.target.value)}
                                    className="w-full px-2 py-1.5 mb-3 rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                                />
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => updateDueDate(dueDateInput ? `${dueDateInput}T12:00:00Z` : null)} 
                                        disabled={isUpdatingDueDateLoading}
                                        className="flex items-center justify-center gap-2 bg-[#0c66e4] text-white hover:bg-[#0055cc] w-full py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {isUpdatingDueDateLoading && dueDateInput && <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => updateDueDate(null)} 
                                        disabled={isUpdatingDueDateLoading}
                                        className="flex items-center justify-center gap-2 w-full py-1.5 rounded text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        {isUpdatingDueDateLoading && !dueDateInput && <div className="w-3 h-3 border-2 border-gray-500 border-t-gray-800 rounded-full animate-spin" />}
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cover Button */}
                    <div className="relative">
                        <button onClick={() => { setShowCover(!showCover); setShowLabels(false); setShowMembers(false); setShowDatePicker(false); setIsAddingChecklist(false); setShowAttachment(false); }} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2 mt-2">
                            <FiImage size={16} /> Cover
                        </button>
                        {showCover && (
                            <div className="absolute top-10 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 w-64 z-20">
                                <h4 className="text-xs font-semibold text-gray-500 mb-3 text-center border-b pb-2">Cover</h4>
                                
                                <label className="block text-xs font-bold text-[#5e6c84] mb-1">Colors</label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {predefinedColors.map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => updateCover(color)}
                                            disabled={isUpdatingCoverLoading}
                                            className="w-10 h-8 rounded shrink-0 hover:opacity-80 transition-opacity disabled:opacity-50"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                <label className="block text-xs font-bold text-[#5e6c84] mb-1">Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={coverUrlInput}
                                    onChange={(e) => setCoverUrlInput(e.target.value)}
                                    className="w-full px-2 py-1.5 mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                                    disabled={isUpdatingCoverLoading}
                                />
                                <button 
                                    onClick={() => coverUrlInput.trim() && updateCover(coverUrlInput.trim())}
                                    disabled={isUpdatingCoverLoading || !coverUrlInput.trim()}
                                    className="w-full bg-[#0c66e4] hover:bg-[#0055cc] text-white py-1.5 rounded text-sm font-medium transition-colors mb-3 disabled:opacity-50"
                                >
                                    Apply Image
                                </button>

                                <button 
                                    onClick={() => updateCover(null)}
                                    disabled={isUpdatingCoverLoading}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Remove Cover
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Attachment Button */}
                    <div className="relative">
                        <button onClick={() => { setShowAttachment(!showAttachment); setShowLabels(false); setShowMembers(false); setShowDatePicker(false); setIsAddingChecklist(false); setShowCover(false); }} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2 mt-2">
                            <FiPaperclip size={16} /> Attachment
                        </button>
                        {showAttachment && (
                            <form onSubmit={handleAttach} className="absolute top-10 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 w-64 z-20">
                                <h4 className="text-xs font-semibold text-gray-500 mb-3 text-center border-b pb-2">Attach a link</h4>
                                
                                <label className="block text-xs font-bold text-[#5e6c84] mb-1">Search or paste a link</label>
                                <input
                                    autoFocus
                                    type="url"
                                    placeholder="Find recent links or paste a new link"
                                    value={attachNextUrl}
                                    onChange={(e) => setAttachNextUrl(e.target.value)}
                                    className="w-full px-2 py-1.5 mb-2 rounded border-2 border-blue-500 focus:outline-none text-sm bg-gray-50"
                                    disabled={isAddingAttachmentLoading}
                                />
                                
                                {attachNextUrl && (
                                    <>
                                        <label className="block text-xs font-bold text-[#5e6c84] mb-1 mt-2">Display text</label>
                                        <input
                                            type="text"
                                            placeholder="Text to display"
                                            value={attachNextName}
                                            onChange={(e) => setAttachNextName(e.target.value)}
                                            className="w-full px-2 py-1.5 mb-3 rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                                            disabled={isAddingAttachmentLoading}
                                        />
                                    </>
                                )}

                                <button 
                                    type="submit"
                                    disabled={isAddingAttachmentLoading || !attachNextUrl.trim()}
                                    className="w-full mt-2 bg-[#0c66e4] hover:bg-[#0055cc] text-white py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isAddingAttachmentLoading && <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                                    Insert
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalSidebar;
