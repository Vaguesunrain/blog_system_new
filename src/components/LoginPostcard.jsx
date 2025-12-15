import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, ArrowRight, Loader2 } from 'lucide-react';
import { API_BASE } from '../data/config.js';

// 🎨 风格常量
const COLORS = {
  paper: '#FDFBF7',       // 暖白信纸
  ink: '#2C3E50',         // 深蓝墨水
  red: '#C0392B',         // 邮戳红
  line: 'rgba(44, 62, 80, 0.15)',
  fog: '#EBF0F3'          // 雾霾白 (成功背景)
};

const STAMP_IMG = "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?q=80&w=300&auto=format&fit=crop";

const LoginPostcard = ({ initialMode = 'login', onClose, onSuccess }) => {
  const [mode, setMode] = useState(initialMode === 'register' ? 'signup' : initialMode);
  const [status, setStatus] = useState('idle');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const endpoint = mode === 'login' ? '/login' : '/signup';

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => {
           onSuccess(data.username || formData.name);
           onClose();
        }, 2200);
      } else {
        setErrorMsg(data.message);
        setStatus('idle');
      }
    } catch (error) {
      setErrorMsg('Network Connection Lost.');
      setStatus('idle');
    }
  };

  // 切换模式处理
  const toggleMode = () => {
    setErrorMsg('');
    setMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 99999,
      background: status === 'success' ? COLORS.fog : 'rgba(0,0,0,0.6)',
      backdropFilter: status === 'success' ? 'blur(20px)' : 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 1s ease'
    }}>
      {/* 噪点层 (成功时显示) */}
      {status === 'success' && (
        <div style={{
           position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none',
           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />
      )}

      <AnimatePresence mode="wait">

        {/* --- Phase 1: 明信片 (The Card) --- */}
        {status !== 'success' && (
          <motion.div
            key="postcard"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.8 } }}
            style={{ position: 'relative' }}
          >
            {/* Close Button */}
            <div
              onClick={onClose}
              style={{ position: 'absolute', top: -40, right: 0, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Courier New", monospace', fontSize: '12px', opacity: 0.8 }}
            >
               [ESC] CLOSE <X size={14} />
            </div>

            {/* Main Card Container */}
            <div style={{
              width: '850px', height: '520px',
              backgroundColor: COLORS.paper,
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative',
              // [关键] Flex 布局：通过 row-reverse 实现左右互换
              display: 'flex',
              flexDirection: mode === 'login' ? 'row' : 'row-reverse'
            }}>

                {/*
                   LEFT/RIGHT SECTION: 表单区 (Form)
                   添加 layout 属性，让它在位置变化时自动滑过去
                */}
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    style={{
                        flex: '0 0 65%',
                        padding: '50px',
                        display: 'flex', flexDirection: 'column',
                        position: 'relative',
                        // 动态边框：如果在左边(Login)，边框在右；如果在右边(Signup)，边框在左
                        borderRight: mode === 'login' ? `1px solid ${COLORS.line}` : 'none',
                        borderLeft: mode === 'signup' ? `1px solid ${COLORS.line}` : 'none',
                        zIndex: 2,
                        backgroundColor: COLORS.paper // 确保背景色遮挡
                    }}
                >
                    {/* 使用 AnimatePresence 实现文字内容的淡入淡出 */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode} // key 变化触发重绘
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Header */}
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.textSub, letterSpacing: '2px', marginBottom: '10px' }}>
                                    {mode === 'login' ? 'IDENTITY_VERIFICATION' : 'NEW_REGISTRATION'}
                                </div>
                                <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '36px', color: COLORS.ink, margin: 0, fontStyle: 'italic', lineHeight: 1 }}>
                                    {mode === 'login' ? 'Welcome Back.' : 'Join the Archive.'}
                                </h2>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', zIndex: 2 }}>
                                {mode === 'signup' && (
                                    <InputGroup label="NAME" type="text" value={formData.name} onChange={v => setFormData({...formData, name:v})} />
                                )}
                                <InputGroup label="EMAIL" type="email" value={formData.email} onChange={v => setFormData({...formData, email:v})} />
                                <InputGroup label="PASSWORD" type="password" value={formData.password} onChange={v => setFormData({...formData, password:v})} />

                                {errorMsg && <div style={{ color: COLORS.red, fontFamily: '"Courier New", monospace', fontSize: '12px' }}>* {errorMsg}</div>}

                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span
                                        onClick={toggleMode}
                                        style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#7F8C8D', cursor: 'pointer', borderBottom: '1px solid #ccc' }}
                                    >
                                        {mode === 'login' ? 'Create an account' : 'Log in existing'}
                                    </span>

                                    <button
                                        type="submit" disabled={status === 'loading'}
                                        style={{
                                        background: COLORS.ink, color: '#fff', border: 'none',
                                        padding: '12px 24px', fontFamily: '"Courier New", monospace', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                        opacity: status === 'loading' ? 0.7 : 1, transition: 'all 0.3s'
                                        }}
                                    >
                                        {status === 'loading' ? <Loader2 className="spin" size={16} /> : <span>PROCEED</span>}
                                        {!status !== 'loading' && <ArrowRight size={16} />}
                                    </button>
                                </div>
                            </form>

                            {/* 底部装饰：五线谱 */}
                            <div style={{ position: 'absolute', bottom: '25px', left: '0', width: '100%', opacity: 0.15, pointerEvents: 'none' }}>
                                <MusicStaff />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/*
                   RIGHT/LEFT SECTION: 装饰区 (Stamp)
                   添加 layout 属性，实现平滑移动
                */}
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    style={{
                        flex: 1,
                        backgroundColor: '#F9F7F2',
                        position: 'relative',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        paddingTop: '60px',
                        zIndex: 1
                    }}
                >
                    {/* 邮票 (固定不动，随容器移动) */}
                    <div style={{ width: '110px', height: '140px', padding: '6px', background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transform: 'rotate(3deg)' }}>
                        <div style={{ width: '100%', height: '100%', background: '#eee', overflow: 'hidden' }}>
                           <img src={STAMP_IMG} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(40%) sepia(20%)' }} alt="stamp" />
                        </div>
                    </div>

                    {/* 邮戳 */}
                    <div style={{
                        position: 'absolute', top: '150px', right: '30px', width: '90px', height: '90px',
                        border: `2px solid ${COLORS.red}`, borderRadius: '50%', opacity: 0.7,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-15deg)',
                        color: COLORS.red, fontFamily: '"Courier New", monospace', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none',
                        maskImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div>ARCHIVE</div>
                            <div style={{ fontSize: '16px', margin: '2px 0' }}>{new Date().getDate()}.{new Date().getMonth()+1}</div>
                            <div>AUTH</div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '20px', width: '50%', height: '2px', background: `repeating-linear-gradient(90deg, ${COLORS.red} 0, ${COLORS.red} 2px, transparent 2px, transparent 4px)` }} />
                    </div>

                    {/* 竖排文字 */}
                    <div style={{ marginTop: 'auto', marginBottom: '80px', writingMode: 'vertical-rl', fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#999', letterSpacing: '4px' }}>
                        DIGITAL MEMORY ARCHIVE // SYSTEM
                    </div>

                </motion.div>
            </div>
          </motion.div>
        )}

        {/* --- Phase 2: 沉浸式转场 (雾白风格) --- */}
        {status === 'success' && (
           <SuccessTransition name={formData.name} />
        )}

      </AnimatePresence>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
};

// --- Sub Components ---

const InputGroup = ({ label, type, value, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#999', letterSpacing: '1px' }}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{
                width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.line}`,
                fontFamily: '"Georgia", serif', fontSize: '18px', color: COLORS.ink, padding: '5px 0', outline: 'none',
                transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderBottom = `1px solid ${COLORS.ink}`}
            onBlur={(e) => e.target.style.borderBottom = `1px solid ${COLORS.line}`}
        />
    </div>
);

const MusicStaff = () => (
  <div style={{ position: 'relative', height: '40px', width: '100%' }}>
     {[0, 6, 12, 18, 24].map(top => (
        <div key={top} style={{ position: 'absolute', top, left: 0, right: 0, height: '1px', background: COLORS.ink }}></div>
     ))}
     <Music size={20} style={{ position: 'absolute', top: '-5px', left: '20px', color: COLORS.ink }} />
     <div style={{ position: 'absolute', top: '18px', left: '60px', width: '8px', height: '8px', background: COLORS.ink, borderRadius: '50%' }}></div>
     <div style={{ position: 'absolute', top: '-2px', left: '63px', width: '1px', height: '25px', background: COLORS.ink }}></div>
  </div>
);

const SuccessTransition = ({ name }) => {
    return (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', position: 'relative', zIndex: 10 }}
        >
            <motion.div
               initial={{ width: 0 }}
               animate={{ width: 100 }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               style={{ height: '1px', background: COLORS.ink, marginBottom: '30px' }}
            />

            <div style={{ textAlign: 'center', color: COLORS.ink }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', letterSpacing: '4px', marginBottom: '15px', opacity: 0.6 }}
                >
                    IDENTITY VERIFIED
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                    style={{ fontFamily: '"Georgia", serif', fontSize: '32px', fontStyle: 'italic', color: COLORS.ink }}
                >
                    Welcome back.
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoginPostcard;
