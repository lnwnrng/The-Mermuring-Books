/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { BRAND_NAME } from '../constants';
import { User } from '../types';

interface NavbarProps {
  currentView: string;
  onNavClick: (target: string) => void;
  cartCount: number;
  favoritesCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  user: User | null;
  onToUserCenter: () => void;
  onToAdminPanel: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavClick, cartCount, favoritesCount, onOpenCart, onOpenFavorites, user, onToUserCenter, onToAdminPanel, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavClick(target);
  };

  // Text color logic: 
  // Scrolled or Mobile Menu Open -> Dark Text
  // Transparent & Desktop -> Light Text (on dark bg)
  const textColorClass = (scrolled || mobileMenuOpen) ? 'text-[#2C2A26]' : 'text-[#2C2A26] md:text-[#F5F2EB]';
  
  // Background logic
  const bgClass = scrolled ? 'bg-[#F5F2EB]/95 backdrop-blur-md shadow-sm py-5' : 'bg-transparent py-8';

  const NavLink = ({ children, onClick }: { children: React.ReactNode, onClick?: (e: React.MouseEvent) => void }) => (
    <button 
        onClick={onClick}
        className="group relative px-1 py-1 overflow-hidden"
    >
        <span className="relative z-10 transition-colors duration-300 group-hover:text-[#A8A29E]">{children}</span>
        <span className={`absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${(scrolled || mobileMenuOpen) ? 'bg-[#2C2A26]' : 'bg-[#2C2A26] md:bg-[#F5F2EB]'}`}></span>
    </button>
  );

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${bgClass}`}
      >
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#" 
            onClick={(e) => handleLinkClick(e, 'home')}
            className={`text-3xl font-serif font-medium tracking-[0.15em] z-50 relative transition-colors duration-500 ${textColorClass}`}
          >
            {BRAND_NAME}
          </a>
          
          {/* Right Actions */}
          <div className={`flex items-center gap-8 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            <div className="hidden md:flex items-center gap-10 text-base tracking-[0.2em]">
              <NavLink onClick={(e) => handleLinkClick(e, 'home')}>首页</NavLink>
              <NavLink onClick={(e) => handleLinkClick(e, 'books')}>书库</NavLink>
            </div>
            
            <button 
              onClick={onOpenCart}
              className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <span className="text-base tracking-widest hidden sm:block font-light">购物车</span>
              <div className="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                 </svg>
                 {cartCount > 0 && (
                    <span className={`absolute -top-1 -right-2 ${scrolled ? 'bg-[#2C2A26] text-[#F5F2EB]' : 'bg-[#F5F2EB] text-[#2C2A26]'} text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold`}>
                        {cartCount}
                    </span>
                 )}
              </div>
            </button>

            <button
              onClick={onOpenFavorites}
              className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <span className="text-base tracking-widest hidden sm:block font-light">我的收藏</span>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" fill="none" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {favoritesCount > 0 && (
                  <span className={`absolute -top-1 -right-2 ${scrolled ? 'bg-[#2C2A26] text-[#F5F2EB]' : 'bg-[#F5F2EB] text-[#2C2A26]'} text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold`}>
                    {favoritesCount}
                  </span>
                )}
              </div>
            </button>
            
            {user ? (
                <div className="relative group">
                    <button className="w-10 h-10 rounded-full overflow-hidden border border-[#D6D1C7] bg-[#EBE7DE] flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-serif text-[#2C2A26]">{user.name?.charAt(0) || '访'}</span>
                      )}
                    </button>
                    <div className="absolute right-0 top-full pt-6 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-[#F5F2EB] shadow-xl border border-[#D6D1C7] py-2 flex flex-col text-[#2C2A26] text-sm text-left">
                            <button onClick={onToUserCenter} className="px-6 py-3 hover:bg-[#EBE7DE] text-left tracking-widest transition-colors">个人中心</button>
                            {user.role === 'admin' && (
                                <button onClick={onToAdminPanel} className="px-6 py-3 hover:bg-[#EBE7DE] text-left text-amber-900 tracking-widest transition-colors">管理后台</button>
                            )}
                            <button onClick={onLogout} className="px-6 py-3 hover:bg-[#EBE7DE] text-left border-t border-[#D6D1C7] mt-1 tracking-widest transition-colors">退出登录</button>
                        </div>
                    </div>
                </div>
            ) : (
                <button onClick={(e) => handleLinkClick(e, 'login')} className="text-base tracking-widest font-light hover:text-[#A8A29E] transition-colors">登录</button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className={`block md:hidden focus:outline-none transition-transform active:scale-95`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
               {mobileMenuOpen ? (
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-7 h-7">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                   </svg>
               ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-7 h-7">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                   </svg>
               )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#F5F2EB] z-40 flex flex-col justify-center items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
          <div className="flex flex-col items-center space-y-10 text-2xl font-serif text-[#2C2A26] font-light tracking-[0.2em]">
            <button onClick={(e) => handleLinkClick(e, 'home')} className="hover:text-[#A8A29E] transition-colors">首页</button>
            <button onClick={(e) => handleLinkClick(e, 'books')} className="hover:text-[#A8A29E] transition-colors">书库</button>
            <button onClick={() => { setMobileMenuOpen(false); onOpenFavorites(); }} className="hover:text-[#A8A29E] transition-colors text-lg">我的收藏</button>
            <div className="w-12 h-[1px] bg-[#D6D1C7] my-4"></div>
            {user ? (
                 <>
                    <button onClick={() => { setMobileMenuOpen(false); onToUserCenter(); }} className="text-lg">个人中心</button>
                    {user.role === 'admin' && <button onClick={() => { setMobileMenuOpen(false); onToAdminPanel(); }} className="text-lg text-amber-800">管理后台</button>}
                    <button onClick={() => { setMobileMenuOpen(false); onLogout(); }} className="text-base text-[#A8A29E] mt-4">退出登录</button>
                 </>
            ) : (
                 <button onClick={(e) => handleLinkClick(e, 'login')} className="text-lg">登录 / 注册</button>
            )}
          </div>
      </div>
    </>
  );
};

export default Navbar;
