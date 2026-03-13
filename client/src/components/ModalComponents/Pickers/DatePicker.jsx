import React from 'react';

const DatePicker = ({ dueDateInput, setDueDateInput, updateDueDate, isUpdatingDueDateLoading }) => {
    return (
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
    );
};

export default DatePicker;
