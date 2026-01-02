/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState } from 'react';

interface FooterProps {
  onLinkClick: (target: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) return;
    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <footer className="bg-[#EBE7DE] pt-24 pb-12 px-6 text-[#5D5A53]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <div className="md:col-span-4">
          <h4 className="text-2xl font-serif text-[#2C2A26] mb-6">呓语书屋</h4>
          <p className="max-w-xs font-light leading-relaxed">
            在一个喧嚣的时代，我们提供一处安静的角落。让阅读回归本质，让精神有所依托。
          </p>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-medium text-[#2C2A26] mb-6 tracking-wide text-sm uppercase">探索</h4>
          <ul className="space-y-4 font-light text-sm">
            <li><button onClick={() => onLinkClick('books')} className="hover:text-[#2C2A26] transition-colors hover:underline">所有藏书</button></li>
            <li><button onClick={() => onLinkClick('books')} className="hover:text-[#2C2A26] transition-colors hover:underline">本周新书</button></li>
            <li><button onClick={() => onLinkClick('books')} className="hover:text-[#2C2A26] transition-colors hover:underline">店长推荐</button></li>
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h4 className="font-medium text-[#2C2A26] mb-6 tracking-wide text-sm uppercase">关于</h4>
          <ul className="space-y-4 font-light text-sm">
            <li><a href="#" className="hover:text-[#2C2A26] transition-colors hover:underline">品牌故事</a></li>
            <li><a href="#" className="hover:text-[#2C2A26] transition-colors hover:underline">线下门店</a></li>
            <li><a href="#" className="hover:text-[#2C2A26] transition-colors hover:underline">联系我们</a></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-medium text-[#2C2A26] mb-6 tracking-wide text-sm uppercase">订阅书讯</h4>
          <div className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="您的电子邮箱" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
              className="bg-transparent border-b border-[#A8A29E] py-2 text-lg outline-none focus:border-[#2C2A26] transition-colors placeholder-[#A8A29E]/70 text-[#2C2A26] disabled:opacity-50" 
            />
            <button 
              onClick={handleSubscribe}
              disabled={subscribeStatus !== 'idle' || !email}
              className="self-start text-sm font-medium uppercase tracking-widest mt-2 hover:text-[#2C2A26] disabled:cursor-default disabled:hover:text-[#5D5A53] disabled:opacity-50 transition-opacity"
            >
              {subscribeStatus === 'idle' && '订阅'}
              {subscribeStatus === 'loading' && '提交中...'}
              {subscribeStatus === 'success' && '已订阅'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-[#D6D1C7] flex flex-col md:flex-row justify-between items-center text-xs text-[#A8A29E] tracking-widest opacity-80">
        <p>© 2025 呓语书屋 The Murmuring Lirary. All rights reserved.</p>
        <p className="mt-2 md:mt-0">ICP备12345678号</p>
      </div>
    </footer>
  );
};

export default Footer;