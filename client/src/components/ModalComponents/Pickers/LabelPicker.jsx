import React from 'react';
import { FiPlus } from 'react-icons/fi';

const LabelPicker = ({ dbLabels, assignLabel, isAssigningLabelLoading }) => {
    return (
        <div className="absolute top-16 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 z-20 text-sm space-y-1 mt-1">
            <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Board Labels</div>
            {dbLabels.map(l => (
                <div key={l.id} onClick={() => isAssigningLabelLoading !== l.id && assignLabel(l.id)} className={`px-2 py-1.5 rounded flex items-center justify-between text-white font-medium cursor-pointer ${isAssigningLabelLoading === l.id ? 'opacity-70' : ''}`} style={{ backgroundColor: l.color }}>
                    {l.title} 
                    {isAssigningLabelLoading === l.id ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <FiPlus size={14} />}
                </div>
            ))}
        </div>
    );
};

export default LabelPicker;
