import React from 'react';
import { FiAlignLeft } from 'react-icons/fi';

const ModalDescription = ({
    card,
    isEditingDescription,
    setIsEditingDescription,
    editDescContent,
    setEditDescContent,
    updateDescription
}) => {
    return (
        <div className="flex items-start gap-4 mb-8">
            <FiAlignLeft className="text-gray-500 mt-0.5 shrink-0" size={24} />
            <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Description</h3>
                    {card.description && !isEditingDescription && (
                        <button onClick={() => setIsEditingDescription(true)} className="px-3 py-1.5 bg-[#091e420f] hover:bg-[#091e4214] rounded-sm text-sm font-medium transition-colors">
                            Edit
                        </button>
                    )}
                </div>

                {isEditingDescription ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            autoFocus
                            value={editDescContent}
                            onChange={(e) => setEditDescContent(e.target.value)}
                            placeholder="Add a more detailed description..."
                            className="w-full p-2 text-sm rounded-lg border-2 border-blue-500 shadow-sm resize-none focus:outline-none text-[#172b4d]"
                            rows={4}
                        />
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={updateDescription} 
                                className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-4 py-1.5 rounded-sm text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                Save
                            </button>
                            <button onClick={() => { setIsEditingDescription(false); setEditDescContent(card.description || ""); }} className="px-3 py-1.5 hover:bg-gray-200 rounded-sm text-gray-600 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    card.description ? (
                        <div className="text-sm cursor-pointer" onClick={() => setIsEditingDescription(true)}>
                            {card.description}
                        </div>
                    ) : (
                        <div onClick={() => setIsEditingDescription(true)} className="bg-[#091e420f] hover:bg-[#091e4214] rounded-sm p-3 min-h-[56px] text-sm text-[#172b4d] cursor-pointer transition-colors font-medium">
                            Add a more detailed description...
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ModalDescription;
