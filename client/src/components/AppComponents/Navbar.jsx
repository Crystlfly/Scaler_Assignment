import React, { useState, useRef, useEffect } from 'react';
import { MdAdd, MdClose } from 'react-icons/md';

const BACKGROUND_COLORS = ['#0079bf', '#519839', '#b04632', '#89609e', '#d29034', '#838c91'];

const Navbar = ({ boards, board, fetchBoardsAndActive, handleCreateBoard, updateBoardBackground }) => {
  const [activePopover, setActivePopover] = useState(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [bgImageUrl, setBgImageUrl] = useState('');
  
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onSubmitCreate = (e) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      handleCreateBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setActivePopover(null);
    }
  };

  return (
    <nav ref={navRef} className="bg-black/20 text-white flex items-center px-4 py-2 border-b border-black/10 shrink-0 w-full">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full">
        <div className="font-bold text-xl drop-shadow-sm tracking-wider flex items-center cursor-pointer mr-0 sm:mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM10 17C10 17.5523 9.55228 18 9 18H6C5.44772 18 5 17.5523 5 17V6C5 5.44772 5.44772 5 6 5H9C9.55228 5 10 5.44772 10 6V17ZM18 12C18 12.5523 17.5523 13 17 13H14C13.4477 13 13 12.5523 13 12V6C13 5.44772 13.4477 5 14 5H17C17.5523 5 18 5.44772 18 6V12Z" />
          </svg>
          Trello Clone
        </div>

        {/* Boards Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setActivePopover(activePopover === 'boards' ? null : 'boards')}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors text-sm font-medium"
          >
            Boards <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          {activePopover === 'boards' && (
            <div className="absolute top-full left-0 pt-1 w-64 z-50">
              <div className="bg-white rounded shadow-xl text-[#172b4d] overflow-hidden">
                <div className="p-2 border-b text-xs font-semibold text-gray-500">Your Boards</div>
                <div className="max-h-64 overflow-y-auto pt-1 pb-1">
                  {boards.map(b => (
                    <div 
                      key={b.id} 
                      onClick={() => {
                        fetchBoardsAndActive(b.id);
                        setActivePopover(null);
                      }} 
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm flex items-center gap-2 ${board?.id === b.id ? 'bg-blue-50 font-medium' : ''}`}
                    >
                      <div className="w-6 h-4 rounded-sm shadow-sm" style={
                        b.background?.includes('url(') 
                          ? { backgroundImage: b.background, backgroundSize: 'cover', backgroundPosition: 'center' } 
                          : { backgroundColor: b.background }
                      }></div>
                      {b.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Background Dropdown */}
        {board && (
          <div className="relative">
            <button onClick={() => setActivePopover(activePopover === 'background' ? null : 'background')} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors text-sm font-medium">
              Background
            </button>
            {activePopover === 'background' && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl text-[#172b4d] z-50 overflow-hidden font-sans border border-gray-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700 text-sm">Background</span>
                  <button onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-600"><MdClose size={18} /></button>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {BACKGROUND_COLORS.map((bgHex) => (
                      <div
                        key={bgHex}
                        onClick={() => {
                          updateBoardBackground(bgHex);
                          setActivePopover(null);
                        }}
                        className="h-16 rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-sm relative group"
                        style={{ backgroundColor: bgHex }}
                      >
                        {board.background === bgHex && (
                          <div className="absolute inset-0 flex items-center justify-center text-white bg-black/10 rounded-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-[#5e6c84] mb-1">Custom Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={bgImageUrl}
                      onChange={(e) => setBgImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && bgImageUrl.trim()) {
                            let formattedUrl = bgImageUrl.trim();
                            if (!formattedUrl.startsWith('url(')) {
                                formattedUrl = `url(${formattedUrl})`;
                            }
                            updateBoardBackground(formattedUrl);
                            setBgImageUrl('');
                            setActivePopover(null);
                        }
                      }}
                      className="w-full px-2 py-1.5 border-2 border-gray-200 hover:border-blue-500 focus:border-blue-500 rounded text-sm focus:outline-none transition-colors"
                    />
                    <button 
                      onClick={() => {
                         if (bgImageUrl.trim()) {
                            let formattedUrl = bgImageUrl.trim();
                            if (!formattedUrl.startsWith('url(')) {
                                formattedUrl = `url(${formattedUrl})`;
                            }
                            updateBoardBackground(formattedUrl);
                            setBgImageUrl('');
                            setActivePopover(null);
                         }
                      }}
                      className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-[#172b4d] py-1.5 rounded text-sm font-medium transition-colors"
                    >
                      Apply Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <button onClick={() => setActivePopover(activePopover === 'createBoard' ? null : 'createBoard')} className="bg-white/20 hover:bg-white/30 p-1.5 rounded transition-colors relative">
            <MdAdd size={20} />
          </button>
          {activePopover === 'createBoard' && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded shadow-xl text-black z-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-500">Create board</span>
                <button onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-600"><MdClose size={16} /></button>
              </div>
              <form onSubmit={onSubmitCreate}>
                <label className="block text-xs font-bold text-[#5e6c84] mb-1">Board title <span className="text-red-500">*</span></label>
                <input
                  autoFocus
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full px-2 py-1.5 mb-3 border-2 border-blue-500 rounded text-sm focus:outline-none"
                  required
                />
                <button type="submit" className="w-full bg-[#0c66e4] hover:bg-[#0055cc] text-white py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50" disabled={!newBoardTitle.trim()}>
                  Create
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
