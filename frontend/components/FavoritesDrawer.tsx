/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Favorite } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Favorite[];
  onRemove: (bookId: string) => void;
  onOpenBook: (book: Favorite['book']) => void;
}

const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ isOpen, onClose, items, onRemove, onOpenBook }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-[#2C2A26]/30 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[470px] bg-[#F5F2EB] z-[70] shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-[#D6D1C7] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#D6D1C7]">
          <h2 className="text-xl font-serif text-[#2C2A26]">我的收藏 ({items.length})</h2>
          <button
            onClick={onClose}
            className="text-[#A8A29E] hover:text-[#2C2A26] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-[#A8A29E]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <p className="text-sm text-[#5D5A53]">还没有收藏的书籍，去逛逛吧。</p>
            </div>
          ) : (
            items.map((fav) => (
              <div key={fav.id} className="flex gap-4 bg-[#EBE7DE]/40 border border-[#D6D1C7] p-4 shadow-sm animate-fade-in-up">
                <div className="w-20 h-28 bg-[#EBE7DE] flex-shrink-0 overflow-hidden">
                  <img src={fav.book.coverUrl} alt={fav.book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-[#2C2A26] text-base leading-tight line-clamp-2">{fav.book.title}</h3>
                    <p className="text-xs text-[#5D5A53] mt-1">{fav.book.author}</p>
                    <p className="text-sm text-[#2C2A26] font-medium mt-2">¥{fav.book.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => onOpenBook(fav.book)}
                      className="px-3 py-2 text-xs text-[#A8A29E] underline underline-offset-4 hover:text-[#B91C1C] transition-colors"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => onRemove(fav.bookId)}
                      className="px-3 py-2 text-xs text-[#A8A29E] underline underline-offset-4 hover:text-[#B91C1C] transition-colors"
                    >
                      移出收藏
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-[#D6D1C7] bg-[#EBE7DE]/30 text-sm text-[#5D5A53]">
          <p>收藏的书籍会同步到您的账号中，方便随时查看。</p>
        </div>
      </div>
    </>
  );
};

export default FavoritesDrawer;
