import React from 'react';

const MemberPicker = ({ dbUsers, assignMember, isAssigningMemberLoading }) => {
    return (
        <div className="absolute top-8 left-0 xl:right-full xl:left-auto xl:mr-2 bg-white shadow-xl border border-gray-200 rounded-lg p-2 w-48 z-20 text-sm">
            <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Board Members</div>
            {dbUsers.map(m => (
                <div key={m.id} onClick={() => isAssigningMemberLoading !== m.id && assignMember(m.id)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer ${isAssigningMemberLoading === m.id ? 'opacity-50' : 'hover:bg-gray-100'}`}>
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {isAssigningMemberLoading === m.id ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                </div>
            ))}
        </div>
    );
};

export default MemberPicker;
