import React, { useState } from 'react';
import { FiPlus, FiCheck } from 'react-icons/fi';

const ModalBadges = ({
    card,
    dbUsers, dbLabels,
    assignMember, removeMember,
    assignLabel, removeLabel,
    setShowDatePicker
}) => {
    // Isolated states for badge dropdowns to prevent overlapping with ModalSidebar
    const [showBadgeMembers, setShowBadgeMembers] = useState(false);
    const [showBadgeLabels, setShowBadgeLabels] = useState(false);

    if (!card.labels?.length && !card.members?.length && !card.dueDate) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-8 ml-10 mb-8">
            {/* Due Date Badge */}
            {card.dueDate && (
                <div>
                    <h3 className="text-xs font-semibold text-[#5e6c84] mb-2">Due date</h3>
                    <div
                        onClick={() => setShowDatePicker(true)}
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
                    <div className="flex gap-1 relative">
                        {card.members.map(member => (
                            <div
                                key={member.id}
                                onClick={() => removeMember(member.user.id)}
                                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer hover:bg-red-500 transition-colors"
                                title={`Remove ${member.user.name}`}
                            >
                                {member.user.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        <button onClick={() => { setShowBadgeMembers(!showBadgeMembers); setShowBadgeLabels(false); }} className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
                            <FiPlus size={16} />
                        </button>
                        {/* Inline member picker */}
                        {showBadgeMembers && (
                            <div className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 z-10 text-sm">
                                <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Board Members</div>
                                {dbUsers.map(m => {
                                    const isAssigned = card.members.some(cm => cm.user.id === m.id);
                                    return (
                                        <div key={m.id} onClick={() => isAssigned ? removeMember(m.id) : assignMember(m.id)} className="flex items-center justify-between gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">{m.name.charAt(0)}</div>
                                                <span>{m.name}</span>
                                            </div>
                                            {isAssigned && <FiCheck size={14} className="text-gray-600" />}
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
                    <div className="flex flex-wrap gap-1 relative">
                        {card.labels.map(cardLabel => (
                            <div
                                key={cardLabel.id}
                                onClick={() => removeLabel(cardLabel.label.id)}
                                className="px-3 py-1.5 rounded-sm text-sm font-medium text-white shadow-sm cursor-pointer transition-colors hover:bg-red-500 hover:opacity-100 group flex items-center gap-1.5"
                                style={{ backgroundColor: cardLabel.label.color }}
                                title="Click to remove"
                            >
                                <span>{cardLabel.label.title || "Label"}</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
                            </div>
                        ))}
                        <button onClick={() => { setShowBadgeLabels(!showBadgeLabels); setShowBadgeMembers(false); }} className="h-8 px-3 rounded-sm bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
                            <FiPlus size={16} />
                        </button>
                        {/* Inline label picker */}
                        {showBadgeLabels && (
                            <div className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 z-10 text-sm space-y-1 mt-1">
                                <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Board Labels</div>
                                {dbLabels.map(l => {
                                    const isAssigned = card.labels.some(cl => cl.label.id === l.id);
                                    return (
                                        <div key={l.id} onClick={() => isAssigned ? removeLabel(l.id) : assignLabel(l.id)} className="px-2 py-1.5 rounded flex items-center justify-between text-white font-medium cursor-pointer hover:opacity-90" style={{ backgroundColor: l.color }}>
                                            {l.title} {isAssigned ? <FiCheck size={14} /> : <FiPlus size={14} />}
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
