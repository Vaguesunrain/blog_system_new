import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ArrowLeft, Image as ImageIcon, Mail, Fingerprint, Quote, Edit3, Palette, Save, X, User, Camera, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../data/config.js';
import ArchiveSection from './ArchiveSection';
import { useUser } from '../../context/UserContext'; // 引入全局状态

const Profile = () => {
  const navigate = useNavigate();
  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // --- 1. 从 Context 获取所有数据 ---
  const {
    userInfo,
    themeConfig, // { color, opacity, gradientStop }
    bgUrl,
    avatarUrl,
    loading,
    error,
    setUserInfo,
    setThemeConfig,
    setBgUrl,
    setAvatarUrl
  } = useUser();

  // --- 2. 本地 UI 状态 ---
  const [currentPage, setCurrentPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [editMode, setEditMode] = useState('none'); // 'none' | 'info' | 'bg'

  // 临时状态：用于编辑模式下的实时预览 (不直接修改 Context，防止取消后回不去)
  const [tempInfo, setTempInfo] = useState({});
  const [tempTheme, setTempTheme] = useState({});

  // 鉴权失败倒计时
  const [redirectCount, setRedirectCount] = useState(3);

  // --- 3. 初始化临时状态 ---
  useEffect(() => {
    if (userInfo) setTempInfo(userInfo);
    if (themeConfig) setTempTheme(themeConfig);
  }, [userInfo, themeConfig, editMode]);

  // --- 4. 鉴权失败自动跳转 ---
  useEffect(() => {
    if (error === 'Unauthorized') {
      const timer = setInterval(() => {
        setRedirectCount(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/'); // 回首页或登录页
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [error, navigate]);

  // --- 5. 核心逻辑：保存修改 ---
  const handleSave = async () => {
    // 构造 payload: 只有在对应模式下才提交对应的数据
    const payload = {};

    if (editMode === 'info') {
        payload.nickname = tempInfo.name;
        payload.motto = tempInfo.motto;
        payload.role = tempInfo.role;
    }

    if (editMode === 'bg') {
        payload.themeConfig = tempTheme;
    }

    try {
      const res = await fetch(`${API_BASE}/user-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const resData = await res.json();

      if (resData.success) {
        // [关键] 更新全局 Context，这样切换页面数据依然保持
        if (editMode === 'info') setUserInfo(prev => ({ ...prev, ...tempInfo }));
        if (editMode === 'bg') setThemeConfig(tempTheme);

        setEditMode('none');
        alert("UPDATED // SUCCESS");
      } else {
        alert("FAILED: " + resData.message);
      }
    } catch (e) {
        alert("NETWORK ERROR");
    }
  };

  // --- 6. 上传逻辑 ---
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    const fieldName = type === 'bg' ? 'background' : 'avatar';
    const endpoint = type === 'bg' ? '/push-background' : '/push-photo';
    formData.append(fieldName, file);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST', body: formData, credentials: 'include'
      });

      if (res.ok) {
        const newUrl = URL.createObjectURL(file);
        // [关键] 直接更新 Context，无需刷新页面
        if (type === 'bg') setBgUrl(newUrl);
        else setAvatarUrl(newUrl);

        alert(`${type.toUpperCase()} UPLOADED`);
      } else {
        alert("UPLOAD FAILED");
      }
    } catch (err) {
        alert("NETWORK ERROR");
    }
  };

  // --- 滚动逻辑 ---
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling || editMode !== 'none' || error) return;
      if (e.deltaY > 50 && currentPage < 2) scrollPage(currentPage + 1);
      else if (e.deltaY < -50 && currentPage > 0) scrollPage(currentPage - 1);
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentPage, isScrolling, editMode, error]);

  const scrollPage = (page) => {
    setIsScrolling(true);
    setCurrentPage(page);
    setTimeout(() => setIsScrolling(false), 800);
  };

  // --- 动态背景样式生成器 ---
  const getMaskStyle = () => {
    // 决定使用当前配置还是临时配置
    const t = editMode === 'bg' ? tempTheme : (themeConfig || { color: '#000', opacity: 50, gradientStop: 50 });

    // Hex to RGB 转换
    let r=0, g=0, b=0;
    if (t.color && t.color.startsWith('#')) {
        const hex = t.color;
        if(hex.length === 4) {
            r = parseInt(hex[1]+hex[1], 16); g = parseInt(hex[2]+hex[2], 16); b = parseInt(hex[3]+hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1,3), 16); g = parseInt(hex.substring(3,5), 16); b = parseInt(hex.substring(5,7), 16);
        }
    }
    const alpha = t.opacity / 100;
    const rgbaColor = `rgba(${r},${g},${b},${alpha})`;

    // 生成渐变：上部透明 -> 下部纯色
    return {
        background: `linear-gradient(to bottom, rgba(${r},${g},${b},0.1) 0%, ${rgbaColor} ${t.gradientStop}%, ${t.color} 100%)`,
        transition: 'background 0.3s ease'
    };
  };

  // --- Render ---

  // 1. Loading 状态
  if (loading) return (
      <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
          LOADING_PROFILE_DATA...
      </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      backgroundColor: '#0b0d17', color: '#fff', fontFamily: 'var(--font-mono)',
      overflow: 'hidden'
    }}>

      {/* 鉴权失败弹窗 */}
      <AnimatePresence>
        {error === 'Unauthorized' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
             <Lock size={60} color="#ff4d4d" style={{ marginBottom: 20 }} />
             <h2 style={{ color: '#ff4d4d', letterSpacing: 2 }}>ACCESS DENIED</h2>
             <p style={{ color: '#888', marginTop: 10 }}>Session expired. Redirecting in {redirectCount}s...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 1: 背景与掩膜 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
        {bgUrl && (
          <img src={bgUrl} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {/* 动态渐变掩膜 */}
        <div className="mask-layer" style={{ position: 'absolute', inset: 0, ...getMaskStyle() }} />
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
              <NavButton icon={<X size={20} />} onClick={() => { setEditMode('none'); setTempTheme(themeConfig); setTempInfo(userInfo); }} tooltip="CANCEL" color="#ff4d4d" />
              <NavButton icon={<Save size={20} />} onClick={handleSave} tooltip="SAVE" color="#4dff88" />
            </>
          ) : (
            <>
              <NavButton icon={<Edit3 size={20} />} onClick={() => setEditMode('info')} tooltip="EDIT INFO" />
              <NavButton icon={<Palette size={20} />} onClick={() => setEditMode('bg')} tooltip="EDIT THEME" />
            </>
          )}

          {/* 背景上传 */}
          <input type="file" ref={bgInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'bg')} />
          <NavButton icon={<ImageIcon size={20} />} onClick={() => bgInputRef.current.click()} tooltip="UPLOAD BG" />
        </div>
      </nav>

      {/* LAYER 3: 调色板 (bg模式) */}
      <AnimatePresence>
        {editMode === 'bg' && tempTheme && (
          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{
              position: 'absolute', top: '90px', right: '40px', zIndex: 110,
              background: 'rgba(255, 255, 255, 0.95)', color: '#333',
              padding: '20px', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', minWidth: '240px'
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '15px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              THEME SETTINGS
            </div>

            {/* Color Picker */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Base Color</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={tempTheme.color} onChange={e => setTempTheme({...tempTheme, color: e.target.value})} style={{ border: 'none', width: '24px', height: '24px', cursor: 'pointer', padding: 0, background: 'none' }} />
                    <span style={{ fontSize: '10px', fontFamily: 'monospace' }}>{tempTheme.color}</span>
                </div>
            </div>

            {/* Opacity Slider */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                    <span>Fog Intensity</span>
                    <span>{tempTheme.opacity}%</span>
                </div>
                <input type="range" min="0" max="100" value={tempTheme.opacity} onChange={e => setTempTheme({...tempTheme, opacity: parseInt(e.target.value)})} style={{ width: '100%' }} />
            </div>

            {/* Gradient Stop Slider */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                    <span>Gradient Stop</span>
                    <span>{tempTheme.gradientStop}%</span>
                </div>
                <input type="range" min="0" max="100" value={tempTheme.gradientStop} onChange={e => setTempTheme({...tempTheme, gradientStop: parseInt(e.target.value)})} style={{ width: '100%' }} />
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

            {/* 头像区域 */}
            <input type="file" ref={avatarInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'avatar')} />
            <div
              className="avatar-container"
              onClick={() => avatarInputRef.current.click()}
              title="Change Avatar"
              style={{
                width: '160px', height: '160px', margin: '0 auto 40px', position: 'relative', cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', inset: -10, border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '50%', animation: 'spin 10s linear infinite' }} />
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '3px solid #fff', background: '#000' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={60} style={{ margin: '40px auto' }} />
                )}
                {/* Hover Overlay */}
                <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }}>
                    <Camera size={30} color="#fff" />
                </div>
              </div>
              <style>{`.avatar-container:hover .avatar-overlay { opacity: 1; }`}</style>
            </div>

            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', margin: '30px 0' }} />

            {/* User Info Fields */}
            {userInfo && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    {/* Motto */}
                    <div style={{ marginBottom: '40px', minHeight: '60px', display: 'flex', justifyContent: 'center' }}>
                        {editMode === 'info' ? (
                        <textarea
                            value={tempInfo.motto}
                            onChange={(e) => setTempInfo({ ...tempInfo, motto: e.target.value })}
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #fff', color: '#fff', width: '100%', maxWidth: '600px', textAlign: 'center', padding: '10px', fontSize: '18px', fontStyle: 'italic', borderRadius: '4px' }}
                            rows={2}
                        />
                        ) : (
                        <h2 style={{ fontSize: '24px', lineHeight: 1.4, fontStyle: 'italic', position: 'relative', maxWidth: '700px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                            <Quote size={14} style={{ display: 'inline', transform: 'translateY(-10px)', marginRight: '8px', opacity: 0.7 }} />
                            {userInfo.motto}
                        </h2>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                        <InfoRow
                            label="NAME" icon="•"
                            value={editMode === 'info' ? tempInfo.name : userInfo.name}
                            isEdit={editMode === 'info'}
                            onChange={(val) => setTempInfo({...tempInfo, name: val})}
                        />
                        <InfoRow
                            label="ROLE" icon={<Fingerprint size={14} />}
                            value={editMode === 'info' ? tempInfo.role : userInfo.role}
                            isEdit={editMode === 'info'}
                            onChange={(val) => setTempInfo({...tempInfo, role: val})}
                        />
                        <InfoRow
                            label="EMAIL" icon={<Mail size={14} />}
                            value={userInfo.email}
                            isEdit={false} // Email 通常不支持直接改
                        />
                    </div>
                </motion.div>
            )}
          </div>
        </Section>

        {/* PAGE 2: ARCHIVES */}
        <Section>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <ArchiveSection />
            </div>
        </Section>

        {/* PAGE 3: UNEXPLORED */}
        <Section><h2 style={{ opacity: 0.5, letterSpacing: 4 }}>UNEXPLORED TERRITORY</h2></Section>

      </motion.div>
    </div>
  );
};

// --- Helper Components ---

const Section = ({ children }) => (
  <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
    {children}
  </div>
);

const NavButton = ({ icon, onClick, tooltip, color }) => (
  <button
    onClick={onClick}
    title={tooltip}
    style={{
        background: 'rgba(255,255,255,0.1)', border: `1px solid ${color || 'rgba(255,255,255,0.2)'}`, color: color || '#fff',
        width: '40px', height: '40px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
        backdropFilter: 'blur(5px)'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
  >
    {icon}
  </button>
);

const InfoRow = ({ label, icon, value, isEdit, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '16px', width: '350px' }}>
        <span style={{ width: '20px', color: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'center' }}>{icon}</span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', width: '60px', textAlign: 'right' }}>{label}:</span>
        {isEdit ? (
            <input
                type="text" value={value} onChange={(e) => onChange(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderBottom: '1px solid #fff', color: '#fff', padding: '2px 5px', flex: 1, fontFamily: 'inherit' }}
            />
        ) : (
            <span style={{ fontWeight: 'bold', fontSize: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{value}</span>
        )}
    </div>
);

export default Profile;
