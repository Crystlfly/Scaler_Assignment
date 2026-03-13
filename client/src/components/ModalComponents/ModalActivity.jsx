import React, { useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import { format } from 'date-fns';

const ModalActivity = ({ card, addComment }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            addComment(newComment.trim());
            setNewComment('');
        }
    };

    return (
        <div className="mt-8">
            <div className="flex items-center gap-4 mb-4">
                <FiActivity className="text-gray-500 mt-0.5 shrink-0" size={24} />
                <h3 className="text-[16px] font-semibold">Activity</h3>
            </div>

            <div className="ml-10">
                {/* Add Comment Input */}
                <div className="flex gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        DU
                    </div>
                    <form onSubmit={handleSubmit} className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-white border border-gray-300 rounded shadow-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[40px] resize-y"
                        />
                        {newComment.trim() && (
                            <div className="mt-2">
                                <button
                                    type="submit"
                                    className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                <div className="space-y-4">
                    {card.comments && card.comments.length > 0 ? (
                        card.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-bold shrink-0">
                                    {comment.authorName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="mb-1">
                                        <span className="font-bold text-sm text-[#172b4d]">{comment.authorName}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {format(new Date(comment.createdAt), "MMM d 'at' h:mm a")}
                                        </span>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm text-[#172b4d] shadow-sm break-words whitespace-pre-wrap">
                                        {comment.text}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500 italic">No comments yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalActivity;
