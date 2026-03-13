import React, { useState } from 'react';
import { FiUser, FiTag, FiCheckSquare, FiClock, FiPlus, FiImage, FiPaperclip } from 'react-icons/fi';
import MemberPicker from './Pickers/MemberPicker';
import LabelPicker from './Pickers/LabelPicker';
import DatePicker from './Pickers/DatePicker';
import CoverPicker from './Pickers/CoverPicker';
import AttachmentPicker from './Pickers/AttachmentPicker';

const ModalSidebar = ({
    card,
    activePopover, setActivePopover,
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
        <div className="w-full md:w-[192px] p-6 md:pl-2 pt-6 md:pt-16 space-y-4 relative z-0 border-t md:border-t-0 border-gray-200 mt-4 md:mt-0">
            <div>
                <h4 className="text-xs font-semibold text-[#5e6c84] mb-2 uppercase">Add to card</h4>
                <div className="space-y-2 relative">
                    {/* Members Button - Hidden if members already exist on the card */}
                    {!(card.members?.length > 0) && (
                        <div className="relative" data-popover="true">
                            <button onClick={() => setActivePopover(activePopover === 'members' ? null : 'members')} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2">
                                <FiUser size={16} /> Members
                            </button>
                            {/* Inline member picker */}
                            {activePopover === 'members' && (
                                <MemberPicker
                                    dbUsers={dbUsers}
                                    assignMember={assignMember}
                                    isAssigningMemberLoading={isAssigningMemberLoading}
                                />
                            )}
                        </div>
                    )}

                    {/* Labels Button - Hidden if labels already exist on the card */}
                    {!(card.labels?.length > 0) && (
                        <div className="relative" data-popover="true">
                            <button onClick={() => setActivePopover(activePopover === 'labels' ? null : 'labels')} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2">
                                <FiTag size={16} /> Labels
                            </button>
                            {/* Inline label picker */}
                            {activePopover === 'labels' && (
                                <LabelPicker
                                    dbLabels={dbLabels}
                                    assignLabel={assignLabel}
                                    isAssigningLabelLoading={isAssigningLabelLoading}
                                />
                            )}
                        </div>
                    )}

                    {/* Checklists Button */}
                    <div className="relative" data-popover="true">
                        {activePopover === 'checklist' ? (
                            <form onSubmit={(e) => { e.preventDefault(); addChecklist(); }} className="bg-white p-2 rounded shadow-md border absolute top-8 left-0 xl:right-full xl:left-auto xl:mr-2 w-48 z-20">
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
                            <button onClick={() => setActivePopover(activePopover === 'checklist' ? null : 'checklist')} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2 mt-2">
                                <FiCheckSquare size={16} /> Checklist
                            </button>
                        )}
                    </div>

                    {/* Dates Button */}
                    <div className="relative" data-popover="true">
                        <button onClick={() => setActivePopover(activePopover === 'datePicker' ? null : 'datePicker')} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2 mt-2">
                            <FiClock size={16} /> Dates
                        </button>
                        {activePopover === 'datePicker' && (
                            <DatePicker
                                dueDateInput={dueDateInput}
                                setDueDateInput={setDueDateInput}
                                updateDueDate={updateDueDate}
                                isUpdatingDueDateLoading={isUpdatingDueDateLoading}
                            />
                        )}
                    </div>

                    {/* Cover Button */}
                    <div className="relative" data-popover="true">
                        <button onClick={() => setActivePopover(activePopover === 'cover' ? null : 'cover')} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2 mt-2">
                            <FiImage size={16} /> Cover
                        </button>
                        {activePopover === 'cover' && (
                            <CoverPicker
                                predefinedColors={predefinedColors}
                                updateCover={updateCover}
                                isUpdatingCoverLoading={isUpdatingCoverLoading}
                                coverUrlInput={coverUrlInput}
                                setCoverUrlInput={setCoverUrlInput}
                            />
                        )}
                    </div>

                    {/* Attachment Button */}
                    <div className="relative" data-popover="true">
                        <button onClick={() => setActivePopover(activePopover === 'attachment' ? null : 'attachment')} className="w-full text-left px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors flex items-center gap-2 mt-2">
                            <FiPaperclip size={16} /> Attachment
                        </button>
                        {activePopover === 'attachment' && (
                            <AttachmentPicker
                                handleAttach={handleAttach}
                                attachNextUrl={attachNextUrl}
                                setAttachNextUrl={setAttachNextUrl}
                                attachNextName={attachNextName}
                                setAttachNextName={setAttachNextName}
                                isAddingAttachmentLoading={isAddingAttachmentLoading}
                            />
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalSidebar;
