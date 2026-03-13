import React, { useState } from 'react';
import { FiPlus, FiCheck } from 'react-icons/fi';

const ModalBadges = ({
    card,
    dbUsers, dbLabels,
    assignMember, removeMember,
    assignLabel, removeLabel,
    activePopover, setActivePopover,
    isAssigningMemberLoading,
    isRemovingMemberLoading,
    isAssigningLabelLoading,
    isRemovingLabelLoading
}) => {
    if (!card.labels?.length && !card.members?.length && !card.dueDate) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-8 ml-10 mb-8">
            {/* Due Date Badge */}
            {card.dueDate && (
                <div data-popover="true">
                    <h3 className="text-xs font-semibold text-[#5e6c84] mb-2">Due date</h3>
                    <div
                        onClick={() => setActivePopover(activePopover === 'datePicker' ? null : 'datePicker')}
                        className="px-3 py-1.5 rounded-sm text-sm bg-gray-200 text-[#172b4d] font-medium cursor-pointer hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                        <span>{new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-xs px-1 bg-white rounded uppercase text-gray-600 border shadow-sm">Due</span>
                    </div>
                </div>
            )}

            {/* Members Badge */}
            {card.members?.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-[#5e6c84] mb-2">Members</h3>
                    <div className="flex gap-1 relative" data-popover="true">
                        {card.members.map(member => (
                            <div
                                key={member.id}
                                onClick={() => isRemovingMemberLoading !== member.user.id && removeMember(member.user.id)}
                                className={`w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer hover:bg-red-500 transition-colors group ${isRemovingMemberLoading === member.user.id ? 'opacity-50' : ''}`}
                                title={`Remove ${member.user.name}`}
                            >
                                {isRemovingMemberLoading === member.user.id ? <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : (
                                    <>
                                        <span className="group-hover:hidden">{member.user.name.charAt(0).toUpperCase()}</span>
                                        <span className="hidden group-hover:block px-[1px]">✕</span>
                                    </>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setActivePopover(activePopover === 'badgeMembers' ? null : 'badgeMembers')} className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
                            <FiPlus size={16} />
                        </button>
                        {/* Inline member picker */}
                        {activePopover === 'badgeMembers' && (
                            <div className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 z-10 text-sm">
                                <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Board Members</div>
                                {dbUsers.map(m => {
                                    const isAssigned = card.members.some(cm => cm.user.id === m.id);
                                    const isLoading = isAssigningMemberLoading === m.id || isRemovingMemberLoading === m.id;
                                    return (
                                        <div key={m.id} onClick={() => !isLoading && (isAssigned ? removeMember(m.id) : assignMember(m.id))} className={`flex items-center justify-between gap-2 p-1.5 rounded cursor-pointer ${isLoading ? 'opacity-50' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {isLoading ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : m.name.charAt(0)}
                                                </div>
                                                <span>{m.name}</span>
                                            </div>
                                            {isAssigned && <FiCheck size={14} className="text-gray-600 shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Labels Badge */}
            {card.labels?.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-[#5e6c84] mb-2">Labels</h3>
                    <div className="flex flex-wrap gap-1 relative" data-popover="true">
                        {card.labels.map(cardLabel => (
                            <div
                                key={cardLabel.id}
                                onClick={() => isRemovingLabelLoading !== cardLabel.label.id && removeLabel(cardLabel.label.id)}
                                className={`px-3 py-1.5 rounded-sm text-sm font-medium text-white shadow-sm cursor-pointer transition-colors hover:bg-red-500 hover:opacity-100 group flex items-center gap-1.5 ${isRemovingLabelLoading === cardLabel.label.id ? 'opacity-70' : ''}`}
                                style={{ backgroundColor: cardLabel.label.color }}
                                title="Click to remove"
                            >
                                <span>{cardLabel.label.title || "Label"}</span>
                                {isRemovingLabelLoading === cardLabel.label.id ? (
                                    <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setActivePopover(activePopover === 'badgeLabels' ? null : 'badgeLabels')} className="h-8 px-3 rounded-sm bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
                            <FiPlus size={16} />
                        </button>
                        {/* Inline label picker */}
                        {activePopover === 'badgeLabels' && (
                            <div className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 z-10 text-sm space-y-1 mt-1">
                                <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Board Labels</div>
                                {dbLabels.map(l => {
                                    const isAssigned = card.labels.some(cl => cl.label.id === l.id);
                                    const isLoading = isAssigningLabelLoading === l.id || isRemovingLabelLoading === l.id;
                                    return (
                                        <div key={l.id} onClick={() => !isLoading && (isAssigned ? removeLabel(l.id) : assignLabel(l.id))} className={`px-2 py-1.5 rounded flex items-center justify-between text-white font-medium cursor-pointer ${isLoading ? 'opacity-70' : 'hover:opacity-90'}`} style={{ backgroundColor: l.color }}>
                                            {l.title}
                                            {isLoading ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : (isAssigned ? <FiCheck size={14} /> : <FiPlus size={14} />)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModalBadges;
