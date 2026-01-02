/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface HeroProps {
    onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  return (
    <section className="relative w-full h-[90vh] overflow-hidden bg-[#2C2A26]">
      
      {/* Background Image - Atmospheric Library */}
      <div className="absolute inset-0 w-full h-full">
        {/* Using a reliable, high-quality Unsplash image of a dark library */}
        <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2200" 
            alt="Atmospheric library with books" 
            className="w-full h-full object-cover opacity-80 animate-slow-zoom"
        />
        {/* Enhanced Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1D1A] via-[#1F1D1A]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
      </div>

      {/* Decorative Lines */}
      <div className="absolute top-0 bottom-0 left-8 md:left-24 w-[1px] bg-white/10 z-10 hidden md:block"></div>
      <div className="absolute top-0 bottom-0 right-8 md:right-24 w-[1px] bg-white/10 z-10 hidden md:block"></div>

      {/* Content */}
      <div className="relative z-20 h-full w-full max-w-[1400px] mx-auto px-8 md:px-24 flex flex-col justify-end pb-24 md:pb-32">
        
        <div className="animate-fade-in-up flex flex-col md:flex-row items-end justify-between gap-12">
            
            {/* Left/Bottom Side: Description & CTA */}
            <div className="max-w-xl">
                <div className="flex items-center gap-4 mb-8 text-[#A8A29E]">
                    <span className="w-12 h-[1px] bg-[#A8A29E]"></span>
                    <span className="text-xs uppercase tracking-[0.3em]">Since 2025</span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-serif text-[#F5F2EB] font-light leading-relaxed mb-8 tracking-wide opacity-90">
                    这里不仅贩卖书籍，<br className="md:hidden" />更收藏时间。<br/>
                    每一页纸张的翻动，<br className="md:hidden" />都是与灵魂的对话。
                </h2>

                <button 
                    onClick={onExplore}
                    className="group relative px-8 py-3 overflow-hidden bg-transparent border border-[#F5F2EB]/30 text-[#F5F2EB] text-sm font-serif font-medium tracking-[0.25em] hover:text-[#2C2A26] transition-colors duration-500"
                >
                    <span className="absolute inset-0 w-full h-full bg-[#F5F2EB] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                    <span className="relative z-10">浏览书库</span>
                </button>
            </div>

            {/* Right/Top Side: Main Typography Art */}
            <div className="flex flex-col md:items-end text-right">
                {/* Vertical Text Layout for "Silence" */}
                <div className="relative">
                     <h1 className="font-serif text-[#F5F2EB] leading-none select-none">
                        <span className="block text-4xl md:text-5xl font-light opacity-80 mb-2 tracking-[0.2em]">在喧嚣中</span>
                        <span className="block text-5xl md:text-7xl mb-4 tracking-[0.1em]">寻得一片</span>
                        {/* 呓语 - Highlighted */}
                        <span className="block text-7xl md:text-9xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-b from-[#F5F2EB] to-[#A8A29E]">
                            呓语。
                        </span>
                    </h1>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
