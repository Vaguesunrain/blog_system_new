import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ArrowLeft, Image as ImageIcon, Mail, Fingerprint, Quote, Edit3, Palette, Save, X, User, Camera, AlertTriangle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../data/config.js';

const Profile = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // --- 1. 状态管理 ---
  const [bgUrl, setBgUrl] = useState(null);
  const bgInputRef = useRef(null);

  //失败
  const [authError, setAuthError] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);
  // 新增：头像状态
  const [avatarUrl, setAvatarUrl] = useState(null);
  const avatarInputRef = useRef(null); // 隐藏的文件输入框引用

  // 用户数据
  const [userData, setUserData] = useState({
    name: 'Loading...',
    role: 'User',
    motto: 'Loading...',
    email: 'Loading...'
  });

  const [maskColor, setMaskColor] = useState('rgba(0,0,0,0.5)');
  const [editMode, setEditMode] = useState('none');

  const [tempColor, setTempColor] = useState('#000000');
  const [tempOpacity, setTempOpacity] = useState(50);

  // --- 2. 初始化数据 ---
useEffect(() => {
    const fetchData = async () => {
      try {
        // 先单独请求用户信息，这是鉴权的核心
        const infoRes = await fetch(`${API_BASE}/user-info`, { credentials: 'include' });

        // [关键修改] 检测 401 未授权或 403 禁止访问
        if (infoRes.status === 401 || infoRes.status === 403) {
          setAuthError(true);
          return; // 终止后续加载
        }

        const infoData = await infoRes.json();

        // 如果后端返回 200 但 json 里包含 success: false (取决于你的后端逻辑)
        if (!infoData.success && infoData.message === 'Unauthorized') {
             setAuthError(true);
             return;
        }

        // 只有认证通过才加载资源，节省流量
        const [bgRes, avatarRes] = await Promise.all([
          fetch(`${API_BASE}/get-background?t=${Date.now()}`, { credentials: 'include' }),
          fetch(`${API_BASE}/get-photo?t=${Date.now()}`, { credentials: 'include' }),
        ]);

        if (bgRes.ok) {
          const blob = await bgRes.blob();
          setBgUrl(URL.createObjectURL(blob));
        }
        if (avatarRes.ok) {
          const blob = await avatarRes.blob();
          setAvatarUrl(URL.createObjectURL(blob));
        }

        if (infoData.success) {
          setUserData({
            name: infoData.data.nickname || 'Commander',
            motto: infoData.data.motto,
            role: infoData.data.role,
            email: infoData.data.email
          });

          if (infoData.data.backgroundColor) {
            setMaskColor(infoData.data.backgroundColor);
            parseColorToState(infoData.data.backgroundColor);
          }
        }
      } catch (e) {
        console.error("Load Error", e);
        // 如果是网络错误，也可以选择弹窗，这里暂不处理
      }
    };
    fetchData();
  }, []);

  // --- 3. 自动跳转倒计时逻辑 ---
  useEffect(() => {
    if (authError) {
      const timer = setInterval(() => {
        setRedirectCount((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/'); // 这里填写你的登录页路由
            return 0;
          }
          return prev - 1;
        });
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [authError, navigate]);

  const parseColorToState = (colorStr) => {
    if (!colorStr) return;
    if (colorStr.startsWith('#')) {
      setTempColor(colorStr.slice(0, 7));
      if (colorStr.length === 9) {
        const alpha = parseInt(colorStr.slice(7), 16);
        setTempOpacity(Math.round((alpha / 255) * 100));
      }
    } else if (colorStr.startsWith('rgba')) {
      const match = colorStr.match(/[\d.]+/g);
      if (match && match.length >= 4) {
        setTempOpacity(Math.round(parseFloat(match[3]) * 100));
      }
    }
  };

  // --- 3. 保存逻辑 (文字/背景色) ---
  const handleSave = async () => {
    let finalColor = maskColor;
    if (editMode === 'bg') {
      const alphaHex = Math.round((tempOpacity / 100) * 255).toString(16).padStart(2, '0');
      finalColor = `${tempColor}${alphaHex}`;
    }

    const payload = {
      nickname: userData.name,
      motto: userData.motto,
      role: userData.role,
      backgroundColor: finalColor
    };

    try {
      const res = await fetch(`${API_BASE}/user-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const resData = await res.json();

      if (resData.success) {
        if (editMode === 'bg') setMaskColor(finalColor);
        setEditMode('none');
        alert("UPDATED // SUCCESS");
      } else {
        alert("FAILED: " + resData.message);
      }
    } catch (e) { alert("NETWORK ERROR"); }
  };

  // --- 4. 上传逻辑 ---

  // 上传背景
  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('background', file);
    try {
      const res = await fetch(`${API_BASE}/push-background`, {
        method: 'POST', body: formData, credentials: 'include'
      });
      if (res.ok) {
        setBgUrl(URL.createObjectURL(file));
        alert("BG IMAGE UPLOADED");
      }
    } catch (err) { alert("ERROR"); }
  };

  // 新增: 上传头像
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    // 注意: 后端 information.py 里 upload_photo 接收的 key 是 'avatar'
    formData.append('avatar', file);

    try {
      const res = await fetch(`${API_BASE}/push-photo`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        // 立即更新前端显示，无需刷新
        setAvatarUrl(URL.createObjectURL(file));
        alert("AVATAR UPDATED");
      } else {
        alert("UPLOAD FAILED");
      }
    } catch (err) {
      alert("NETWORK ERROR");
    }
  };

  // --- 滚动控制 ---
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling || editMode !== 'none' || authError) return;
      if (e.deltaY > 50 && currentPage < 2) scrollPage(currentPage + 1);
      else if (e.deltaY < -50 && currentPage > 0) scrollPage(currentPage - 1);
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentPage, isScrolling, editMode]);

  const scrollPage = (page) => {
    setIsScrolling(true);
    setCurrentPage(page);
    setTimeout(() => setIsScrolling(false), 800);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      backgroundColor: '#0b0d17', color: '#fff', fontFamily: 'var(--font-mono)',
      overflow: 'hidden'
    }}>
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              style={{
                border: '1px solid #ff4d4d',
                background: 'rgba(20, 0, 0, 0.9)',
                padding: '40px 60px',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(255, 77, 77, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
                {/* 装饰性扫描线 */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                    background: '#ff4d4d', opacity: 0.5,
                    animation: 'scan 2s linear infinite'
                }}/>
                <style jsx>{`
                    @keyframes scan { 0% {top: 0} 100% {top: 100%} }
                    @keyframes pulse-red { 0% {opacity: 0.6} 50% {opacity: 1} 100% {opacity: 0.6} }
                `}</style>

                <div style={{ marginBottom: '20px', color: '#ff4d4d', animation: 'pulse-red 1.5s infinite' }}>
                    <Lock size={60} strokeWidth={1.5} />
                </div>

                <h2 style={{
                    fontSize: '24px', letterSpacing: '2px', color: '#ff4d4d', marginBottom: '10px',
                    fontFamily: 'monospace', fontWeight: 'bold'
                }}>
                    ACCESS DENIED
                </h2>

                <div style={{ width: '50px', height: '2px', background: '#ff4d4d', margin: '0 auto 20px' }} />

                <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '5px' }}>
                    SECURITY PROTOCOL: <span style={{color:'#ff4d4d'}}>INVALID_TOKEN</span>
                </p>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '30px' }}>
                   SESSION EXPIRED OR UNAUTHORIZED CONNECTION DETECTED.
                </p>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d',
                        padding: '10px 30px', fontSize: '12px', letterSpacing: '1px',
                        cursor: 'pointer', transition: 'all 0.3s',
                        marginBottom: '20px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#ff4d4d';
                        e.target.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#ff4d4d';
                    }}
                >
                    RE-AUTHENTICATE MANUALLY
                </button>

                <div style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace' }}>
                    AUTO-REDIRECTING IN {redirectCount}s...
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* LAYER 1: 背景与掩膜 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
        {bgUrl && (
          <img src={bgUrl} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div
          className="mask-layer"
          style={{
            position: 'absolute', inset: 0,
            backgroundColor: editMode === 'bg'
              ? `${tempColor}${Math.round((tempOpacity / 100) * 255).toString(16).padStart(2, '0')}`
              : maskColor,
            transition: 'background-color 0.3s ease'
          }}
        />
        <div className="grid-bg" style={{ opacity: 0.15, pointerEvents: 'none' }} />
      </div>

      {/* LAYER 2: 导航栏 */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '80px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 40px', zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <NavButton icon={<ArrowLeft size={20} />} onClick={() => navigate(-1)} tooltip="BACK" />
          <NavButton icon={<Home size={20} />} onClick={() => navigate('/')} tooltip="HOME" />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {editMode !== 'none' ? (
            <>
              <NavButton icon={<X size={20} />} onClick={() => setEditMode('none')} tooltip="CANCEL" color="#ff4d4d" />
              <NavButton icon={<Save size={20} />} onClick={handleSave} tooltip="SAVE" color="#4dff88" />
            </>
          ) : (
            <>
              <NavButton icon={<Edit3 size={20} />} onClick={() => setEditMode('info')} tooltip="EDIT INFO" />
              <NavButton icon={<Palette size={20} />} onClick={() => setEditMode('bg')} tooltip="EDIT THEME" />
            </>
          )}

          {/* 背景上传 */}
          <input type="file" ref={bgInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
          <NavButton icon={<ImageIcon size={20} />} onClick={() => bgInputRef.current.click()} tooltip="UPLOAD BG" />
        </div>
      </nav>

      {/* LAYER 3: 调色板 (bg模式) */}
      <AnimatePresence>
        {editMode === 'bg' && (
          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{
              position: 'absolute', top: '90px', right: '40px', zIndex: 110,
              background: 'rgba(10, 10, 20, 0.85)', padding: '20px', borderRadius: '12px',
              border: '1px solid var(--accent-color)', backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minWidth: '220px'
            }}
          >
            <div style={{ fontSize: '10px', letterSpacing: '1px', marginBottom: '15px', color: 'var(--text-dim)', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
              MASK SETTINGS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={14} />
                <span style={{ fontSize: '12px' }}>COLOR</span>
              </div>
              <input
                type="color" value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'none' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                <span>OPACITY</span>
                <span>{tempOpacity}%</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={tempOpacity}
                onChange={(e) => setTempOpacity(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 4: 主内容 */}
      <motion.div
        animate={{ y: `-${currentPage * 100}%` }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{ height: '100%', width: '100%' }}
      >
        {/* PAGE 1: IDENTITY */}
        <Section>
          <div style={{ textAlign: 'center', maxWidth: '800px', width: '100%', padding: '20px' }}>

            {/*
                === 头像区域 (已修改) ===
                1. 隐藏的 input 用于文件选择
                2. 整个区域可点击
                3. 悬浮时显示相机图标
            */}
            <input type="file" ref={avatarInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />

            <div
              className="avatar-container"
              onClick={() => avatarInputRef.current.click()}
              title="Click to change avatar"
              style={{
                width: '160px', height: '160px', margin: '0 auto 40px', position: 'relative', cursor: 'pointer',
                group: true // for hover detection logic
              }}
            >
              {/* 扫描圈动画 */}
              <div style={{ position: 'absolute', inset: -10, border: '1px dashed var(--accent-color)', borderRadius: '50%', animation: 'spin 10s linear infinite', pointerEvents: 'none' }} />

              {/* 头像本体 */}
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.8)', background: '#000',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                position: 'relative'
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={60} strokeWidth={1} />
                )}

                {/* 悬浮遮罩层 (Prompt to upload) */}
                <div className="avatar-overlay">
                  <Camera size={30} color="#fff" />
                </div>
              </div>
            </div>

            {/* CSS for Avatar Hover Effect */}
            <style jsx>{`
                .avatar-container:hover .avatar-overlay { opacity: 1; }
                .avatar-overlay {
                    position: absolute; inset: 0; background: rgba(0,0,0,0.5);
                    display: flex; justify-content: center; align-items: center;
                    opacity: 0; transition: opacity 0.3s;
                }
            `}</style>

            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #fff, transparent)', margin: '30px 0' }} />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Motto */}
              <div style={{ marginBottom: '40px', minHeight: '60px', display: 'flex', justifyContent: 'center' }}>
                {editMode === 'info' ? (
                  <textarea
                    value={userData.motto}
                    onChange={(e) => setUserData({ ...userData, motto: e.target.value })}
                    style={{
                      background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent-color)', color: '#fff',
                      width: '100%', maxWidth: '600px', textAlign: 'center', padding: '10px',
                      fontSize: '18px', fontStyle: 'italic', borderRadius: '4px', outline: 'none'
                    }}
                    rows={2}
                  />
                ) : (
                  <h2 style={{ fontSize: '24px', lineHeight: 1.4, fontStyle: 'italic', position: 'relative', maxWidth: '700px' }}>
                    <Quote size={14} style={{ display: 'inline', transform: 'translateY(-10px)', marginRight: '8px', opacity: 0.7 }} />
                    {userData.motto}
                  </h2>
                )}
              </div>

              {/* Info Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>

                {/* Nickname */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '16px', width: '350px' }}>
                  <span style={{ width: '20px', color: 'var(--accent-color)' }}>•</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '12px', width: '80px', textAlign: 'right' }}>NAME:</span>
                  {editMode === 'info' ? (
                    <input
                      type="text" value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderBottom: '1px solid var(--accent-color)', color: '#fff', padding: '2px 5px', flex: 1 }}
                    />
                  ) : (
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{userData.name}</span>
                  )}
                </div>

                {/* Role */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '16px', width: '350px' }}>
                  <span style={{ width: '20px', color: 'var(--accent-color)' }}><Fingerprint size={14} /></span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '12px', width: '80px', textAlign: 'right' }}>ROLE:</span>
                  {editMode === 'info' ? (
                    <input
                      type="text" value={userData.role}
                      onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderBottom: '1px solid var(--accent-color)', color: '#fff', padding: '2px 5px', flex: 1 }}
                    />
                  ) : (
                    <span style={{ fontWeight: 'bold' }}>{userData.role}</span>
                  )}
                </div>

                {/* Email (Read Only) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '16px', width: '350px' }}>
                  <span style={{ width: '20px', color: 'var(--accent-color)' }}><Mail size={14} /></span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '12px', width: '80px', textAlign: 'right' }}>EMAIL:</span>
                  {editMode === 'info' ? (
                    <input
                      type="text"
                      value={userData.email}
                      readOnly 
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderBottom: '1px solid var(--accent-color)', color: '#fff', padding: '2px 5px', flex: 1, opacity: 0.7 }}
                    />
                  ) : (
                    <span style={{ fontWeight: 'bold' }}>{userData.email}</span>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        </Section>

        {/* PAGE 2: ARCHIVES */}
        <Section><h2 style={{ opacity: 0.5 }}>ARCHIVES</h2></Section>

        {/* PAGE 3: UNEXPLORED */}
        <Section><h2 style={{ opacity: 0.5 }}>UNEXPLORED</h2></Section>

      </motion.div>
    </div>
  );
};

// Helpers
const Section = ({ children }) => (
  <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
    {children}
  </div>
);

const NavButton = ({ icon, onClick, tooltip, color }) => (
  <div style={{ position: 'relative', group: true }} className="nav-btn-wrapper">
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)', scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'rgba(0,0,0,0)', border: `1px solid ${color || 'rgba(255,255,255,0.3)'}`, color: color || '#fff',
        width: '40px', height: '40px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.3s'
      }}
    >
      {icon}
    </motion.button>
    <style jsx>{`
        .nav-btn-wrapper:hover::after {
            content: "${tooltip}"; position: absolute; top: 115%; left: 50%; transform: translateX(-50%);
            font-size: 10px; background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 4px; white-space: nowrap; pointer-events: none;
        }
    `}</style>
  </div>
);

export default Profile;
