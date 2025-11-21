import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, UserPlus, Power, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginTerminal from './LoginTerminal';


const API_BASE = 'http://vagueame.top:5000';

const UserAuthSystem = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [terminalMode, setTerminalMode] = useState(null); // 控制全屏登录页的显示 ('login' | 'register' | null)
  const [currentUser, setCurrentUser] = useState(null); // 存储用户名
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, { credentials: 'include' });
        const data = await res.json();
        if (data.loggedIn) {
          setCurrentUser(data.username);

          // --- 如果已登录，立即加载头像 ---
          const url = await fetchUserAvatar();
          if (url) setAvatarUrl(url);
        }
      } catch (e) {
        console.log("Auth check failed", e);
      }
    };
    checkSession();
  }, []);

  // 2. 处理注销
  const handleLogout = () => {
    setCurrentUser(null);
    setAvatarUrl(null); // 清空头像
    setIsMenuOpen(false);
    navigate('/');
    // 记得通知后端 logout...
  };

  // 3. 登录成功后的回调
  const handleLoginSuccess = async (username) => {
    setCurrentUser(username);
    setTerminalMode(null);

    // --- 登录成功瞬间，加载头像 ---
    const url = await fetchUserAvatar();
    if (url) setAvatarUrl(url);
  };


  const COLOR_STANDBY = '#ffaa00';
  const COLOR_ACTIVE = '#00e0ff';
  const COLOR_ONLINE = '#00ff41';

  let currentColor = COLOR_STANDBY;
  if (currentUser) currentColor = COLOR_ONLINE;
  else if (isMenuOpen) currentColor = COLOR_ACTIVE;

  return (
    <div style={{ position: 'relative', fontFamily: 'var(--font-mono)' }}>

      {/* --- 触发器按钮 (Navbar Item) --- */}
      <motion.div
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        whileHover={{ borderColor: currentColor, boxShadow: `0 0 10px ${currentColor}40` }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px',
          border: `1px solid ${isMenuOpen ? currentColor : 'rgba(255,255,255,0.2)'}`,
          background: isMenuOpen ? `${currentColor}1a` : 'transparent',
          cursor: 'pointer', borderRadius: '4px', zIndex: 200, position: 'relative',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ textAlign: 'right', lineHeight: 1 }}>
          <div style={{ fontSize: '10px', color: isMenuOpen || currentUser ? currentColor : '#888', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontWeight: 'bold' }}>
            <motion.div animate={{ backgroundColor: currentColor }} style={{ width: '6px', height: '6px', borderRadius: '50%', boxShadow: currentUser ? `0 0 5px ${currentColor}` : 'none' }} />
            {currentUser ? 'USER ONLINE' : (isMenuOpen ? 'LINK_ACTIVE' : 'STANDBY')}
          </div>
          <motion.div animate={{ color: currentColor }} style={{ fontSize: '13px', fontWeight: '900', marginTop: '2px' }}>
            {currentUser ? currentUser.toUpperCase() : 'USER.ACCESS'}
          </motion.div>
        </div>

        {/* --- 头像渲染区域 --- */}
        <motion.div
            animate={{
                rotate: isMenuOpen ? 180 : 0,
                backgroundColor: isMenuOpen ? currentColor : 'transparent',
                borderColor: currentColor
            }}
            style={{
                width: '32px', height: '32px',
                border: '1px solid',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                overflow: 'hidden', // 确保图片不溢出圆角
                position: 'relative'
            }}
        >
          {/* 如果有头像 URL，显示图片；否则显示默认 User 图标 */}
          {avatarUrl ? (
            <motion.img
              key="avatar" // 加上 key 触发切换动画
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: isMenuOpen ? -180 : 0 }} // 反向旋转图片，防止图片跟着外框倒过来，或者干脆不处理
              src={avatarUrl}
              alt="User"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <User size={18} color={isMenuOpen ? '#000' : currentColor} />
          )}
        </motion.div>
      </motion.div>

      {/* --- 轨道菜单 (右上角圆弧) --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 190 }} onClick={() => setIsMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              style={{
                position: 'absolute', top: '35px', right: '20px',
                width: '240px', height: '240px', pointerEvents: 'none', zIndex: 195,
                transformOrigin: 'top right',
              }}
            >
              <svg style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible' }}>
                <motion.path d="M 30 10 A 210 210 0 0 0 230 210" fill="none" stroke={currentColor} strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.3 }} transition={{ duration: 0.5 }} />
              </svg>

              {!currentUser ? (
                // 未登录状态：显示 LOGIN / REG -> 点击打开 Terminal
                <>
                  <PlanetNode x={65} y={85} label="LOGIN" icon={<LogIn size={15} />} color={currentColor} delay={0.1}
                    onClick={() => { setIsMenuOpen(false); setTerminalMode('login'); }}
                  />
                  <PlanetNode x={155} y={175} label="REG" icon={<UserPlus size={15} />} color={currentColor} delay={0.2}
                    onClick={() => { setIsMenuOpen(false); setTerminalMode('register'); }}
                  />
                </>
              ) : (
                // 已登录状态：显示 HOME / OUT
                <>
                  <PlanetNode x={65} y={85} label="HOME" icon={<LayoutDashboard size={15} />} color={currentColor} delay={0.1}
                    onClick={() => { setIsMenuOpen(false); navigate('/'); }}
                  />
                  <PlanetNode x={155} y={175} label="OUT" icon={<Power size={15} />} color={currentColor} delay={0.2}
                    onClick={handleLogout}
                  />
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- 独立的全屏登录终端 --- */}
      {/* 当 terminalMode 有值时，渲染全屏覆盖层 */}
      <AnimatePresence>
        {terminalMode && (
          <LoginTerminal
            initialMode={terminalMode}
            onClose={() => setTerminalMode(null)}
            onSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

// 行星按钮组件
const PlanetNode = ({ x, y, label, icon, onClick, delay, color }) => (
  <motion.button
    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
    transition={{ delay, type: 'spring', stiffness: 300 }}
    onClick={onClick}
    whileHover={{ scale: 1.15, backgroundColor: color, color: '#000', boxShadow: `0 0 20px ${color}` }}
    style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'auto',
      background: 'rgba(11, 13, 23, 0.9)', border: `1px solid ${color}`, color: color,
      width: '44px', height: '44px', borderRadius: '50%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: `0 0 10px ${color}30`, padding: 0, zIndex: 200
    }}
  >
    {icon}
    <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px', lineHeight: 1 }}>{label}</span>
  </motion.button>
);

const fetchUserAvatar = async () => {
  try {
    // 加上时间戳防止浏览器强缓存导致头像更新后不刷新 (可选)
    const res = await fetch(`${API_BASE}/get-photo?t=${new Date().getTime()}`, {
      credentials: 'include'
    });
    if (res.ok) {
      const blob = await res.blob();
      return URL.createObjectURL(blob); // 生成内存链接
    }
  } catch (e) {
    console.error("Avatar fetch failed", e);
  }
  return null;
};

export default UserAuthSystem;
