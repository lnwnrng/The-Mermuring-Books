/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { login, register } from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthProps {
  mode: 'login' | 'register' | 'forgot';
  onLoginSuccess: (user: User, token: string) => void;
  onSwitchMode: (mode: 'login' | 'register' | 'forgot') => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onLoginSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowErrorModal(false);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { user: authenticatedUser, token }: AuthResponse = await login(email, password);
        onLoginSuccess(authenticatedUser, token);
      } else if (mode === 'register') {
        const { user: authenticatedUser, token }: AuthResponse = await register(email, password, name || email);
        onLoginSuccess(authenticatedUser, token);
      } else {
        throw new Error('该操作需要后端接口，当前仅展示表单。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败，请稍后重试');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleText =
    mode === 'login' ? '欢迎回来' :
    mode === 'register' ? '加入呓语' : '找回密码';

  const subtitleText =
    mode === 'login' ? '请登录您的账号以继续阅读之旅' :
    mode === 'register' ? '注册成为会员，享受专属权益' :
    '请输入注册邮箱以重置密码';

  const submitText =
    mode === 'login' ? '登录' :
    mode === 'register' ? '注册' : '发送重置邮件';

  return (
    <>
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-4 bg-[#F5F2EB]">
        <div className="w-full max-w-md bg-white p-8 md:p-12 shadow-xl border border-[#D6D1C7] animate-fade-in-up">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-[#2C2A26] mb-2">{titleText}</h2>
            <p className="text-sm text-[#A8A29E]">{subtitleText}</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 border border-[#B91C1C] text-[#B91C1C] bg-red-50 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#5D5A53] mb-2">昵称 / 姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F9F8F6] border-b border-[#D6D1C7] py-3 px-4 text-[#2C2A26] outline-none focus:border-[#2C2A26] transition-colors placeholder-[#A8A29E]"
                  placeholder="用于个人中心显示"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#5D5A53] mb-2">电子邮箱 / 账号</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F9F8F6] border-b border-[#D6D1C7] py-3 px-4 text-[#2C2A26] outline-none focus:border-[#2C2A26] transition-colors placeholder-[#A8A29E]"
                placeholder="请输入注册邮箱"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#5D5A53] mb-2">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F9F8F6] border-b border-[#D6D1C7] py-3 px-4 text-[#2C2A26] outline-none focus:border-[#2C2A26] transition-colors"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#2C2A26] text-[#F5F2EB] uppercase tracking-widest text-sm font-medium hover:bg-[#433E38] transition-colors shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '处理中…' : submitText}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#F5F2EB] flex justify-between text-xs text-[#5D5A53] tracking-wide">
            {mode === 'login' ? (
              <>
                <button onClick={() => onSwitchMode('forgot')} className="hover:text-[#2C2A26] underline underline-offset-4">忘记密码？</button>
                <button onClick={() => onSwitchMode('register')} className="hover:text-[#2C2A26] underline underline-offset-4">注册新账号</button>
              </>
            ) : (
              <button onClick={() => onSwitchMode('login')} className="w-full text-center hover:text-[#2C2A26] underline underline-offset-4">返回登录</button>
            )}
          </div>
        </div>
      </div>

      {showErrorModal && error && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-sm p-6 shadow-2xl border border-[#D6D1C7]">
            <h3 className="text-lg font-serif text-[#2C2A26] mb-3">请求失败</h3>
            <p className="text-sm text-[#5D5A53] mb-6">{error}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 border border-[#2C2A26] text-[#2C2A26] hover:bg-[#EBE7DE] text-sm"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Auth;
