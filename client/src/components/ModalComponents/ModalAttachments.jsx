import React from 'react';
import { FiPaperclip } from 'react-icons/fi';
import { format } from 'date-fns';

const ModalAttachments = ({ attachments }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-8">
            <div className="flex items-center gap-4 mb-3">
                <FiPaperclip className="text-gray-500 mt-0.5 shrink-0" size={24} />
                <h3 className="text-[16px] font-semibold">Attachments</h3>
            </div>
            
            <div className="ml-10 space-y-2">
                {attachments.map(attachment => {
                    // Try to safely extract the domain name for the subtitle
                    let domain = 'Link';
                    try {
                        domain = new URL(attachment.url).hostname.replace('www.', '');
                    } catch (e) {
                         // invalid url format, fallback
                    }

                    return (
                        <a 
                            key={attachment.id} 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 hover:bg-[#091e4214] p-2 rounded transition-colors group"
                        >
                            <div className="w-[112px] h-[80px] bg-gray-200 rounded shrink-0 flex items-center justify-center text-gray-400 group-hover:bg-gray-300 transition-colors">
                                <span className="font-bold text-lg uppercase">{domain.slice(0, 3)}</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-[#172b4d] text-sm break-words group-hover:underline">
                                    {attachment.name}
                                </p>
                                <div className="text-xs text-gray-500 mt-2">
                                    <span className="mb-1 block">Added {format(new Date(attachment.createdAt), "MMM d 'at' h:mm a")}</span>
                                    <span className="flex items-center gap-1 font-semibold hover:underline">
                                        <FiPaperclip size={12} /> {domain}
                                    </span>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default ModalAttachments;
