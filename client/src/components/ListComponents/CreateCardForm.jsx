import React from 'react';
import { FiPlus } from 'react-icons/fi';

const CreateCardForm = ({
    isAddingCard,
    setIsAddingCard,
    newCardTitle,
    setNewCardTitle,
    addCard,
    inputRef
}) => {
    return (
        <div className="px-2 pb-2 mt-1 relative">
            {isAddingCard ? (
                <div 
                    className="flex flex-col gap-2"
                    onBlur={(e) => {
                        // If the new focus is not inside this form block, close it.
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            setIsAddingCard(false);
                            setNewCardTitle('');
                        }
                    }}
                >
                    <textarea
                        ref={inputRef}
                        autoFocus
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Enter a title for this card..."
                        className="w-full p-2 text-sm rounded-lg border-none shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#172b4d]"
                        rows={2}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                addCard();
                            }
                        }}
                    />
                    <div className="flex items-center space-x-2 w-full">
                        <button
                            type="submit"
                            onMouseDown={(e) => { e.preventDefault(); addCard(); }}
                            className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            Add card
                        </button>
                        <button
                            type="button"
                            onMouseDown={() => { setIsAddingCard(false); setNewCardTitle(''); }}
                            className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAddingCard(true)}
                    className="w-full text-left text-[14px] font-medium text-[#44546f] hover:bg-[#091e4214] hover:text-[#172b4d] px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <FiPlus size={16} /> Add a card
                </button>
            )}
        </div>
    );
};

export default CreateCardForm;
