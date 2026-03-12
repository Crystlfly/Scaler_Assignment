import React from 'react';
import { FiCheckSquare, FiCheck } from 'react-icons/fi';

const ModalChecklists = ({
    card,
    addingItemId,
    setAddingItemId,
    newItemContent,
    setNewItemContent,
    addChecklistItem,
    toggleChecklistItem
}) => {
    return (
        <>
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
                                            {item.isCompleted && <FiCheck size={12} className="opacity-0 group-hover:opacity-100 absolute" style={{ opacity: item.isCompleted ? 1 : '' }} />}
                                        </div>
                                        <div className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-[#172b4d]'}`}>
                                            {item.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {addingItemId === checklist.id ? (
                                <form onSubmit={(e) => addChecklistItem(checklist.id, e)} className="mt-2 space-y-2">
                                    <textarea
                                        autoFocus
                                        value={newItemContent}
                                        onChange={(e) => setNewItemContent(e.target.value)}
                                        placeholder="Add an item"
                                        className="w-full p-2 text-sm rounded border-2 border-blue-500 shadow-sm resize-none focus:outline-none"
                                        rows={2}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                addChecklistItem(checklist.id, e);
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button type="submit" className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors">
                                            Add
                                        </button>
                                        <button type="button" onClick={() => { setAddingItemId(null); setNewItemContent(''); }} className="px-2 py-1.5 text-gray-500 hover:text-gray-800 transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button onClick={() => setAddingItemId(checklist.id)} className="px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors mt-2">
                                    Add an item
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </>
    );
};

export default ModalChecklists;
