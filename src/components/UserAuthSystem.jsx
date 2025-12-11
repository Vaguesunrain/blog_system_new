import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, UserPlus, Power, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginTerminal from './LoginPostcard.jsx';
import { API_BASE } from '../data/config.js';

const UserAuthSystem = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 菜单展开状态
  const [isDocked, setIsDocked] = useState(false);     // 停靠（缩进）状态
  const [isHovering, setIsHovering] = useState(false); // 鼠标是否悬停

  const [terminalMode, setTerminalMode] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const navigate = useNavigate();
  const dockTimerRef = useRef(null);

  // --- 1. 初始化检查登录状态 ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, { credentials: 'include' });
        const data = await res.json();
        if (data.loggedIn) {
          setCurrentUser(data.username);
          const url = await fetchUserAvatar();
          if (url) setAvatarUrl(url);
        }
      } catch (e) {
        console.log("Auth check failed", e);
      }
    };
    checkSession();
  }, []);

  // --- 2. 自动停靠逻辑 ---
  useEffect(() => {
    // 如果菜单打开了，或者是正在悬停，就不要停靠
    if (isMenuOpen || isHovering) {
      setIsDocked(false);
      if (dockTimerRef.current) clearTimeout(dockTimerRef.current);
      return;
    }

    // 否则，2秒后自动停靠
    dockTimerRef.current = setTimeout(() => {
      setIsDocked(true);
    }, 2000);

    return () => clearTimeout(dockTimerRef.current);
  }, [isMenuOpen, isHovering]);

  // --- 3. 动作处理 ---
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) { console.error(e); }
    setCurrentUser(null);
    setAvatarUrl(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleLoginSuccess = async (username) => {
    setCurrentUser(username);
    setTerminalMode(null);
    const url = await fetchUserAvatar();
    if (url) setAvatarUrl(url);
  };

  return (
    <>
      {/* --- 浮动容器 --- */}
           <motion.div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        // 【修改点 1】: 改成 100px (或者更大)，强制移出屏幕，只留一点点在边缘
        animate={{ x: isDocked ? '70px' : '0px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: '120px',
          right: '40px', // 这里保留 40px，所以我们需要移动 > 40px 才能碰到边缘
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // 改为靠右对齐，这样缩进时更自然
          gap: '15px'
        }}
      >

        {/* --- 展开的菜单列表 (向上展开) --- */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '5px', // 与主按钮的间距
                alignItems: 'flex-end' // 文字靠右
              }}
            >
              {!currentUser ? (
                <>
                  <MenuItem
                    label="LOGIN"
                    icon={<LogIn size={18} />}
                    onClick={() => { setIsMenuOpen(false); setTerminalMode('login'); }}
                  />
                  <MenuItem
                    label="REGISTER"
                    icon={<UserPlus size={18} />}
                    onClick={() => { setIsMenuOpen(false); setTerminalMode('register'); }}
                  />
                </>
              ) : (
                <>
                  <MenuItem
                    label="PROFILE"
                    icon={<LayoutDashboard size={18} />}
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                  />
                  <MenuItem
                    label="LOGOUT"
                    icon={<Power size={18} />}
                    onClick={handleLogout}
                    isDanger
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- 主按钮 (Avatar / Icon) --- */}
         <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#2C3E50',
            border: '2px solid #EBF0F3',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // 确保内容居中
            position: 'relative',
            zIndex: 901
          }}
        >
          {/* 停靠时的箭头 (尾巴) */}
          {/* 【修改点 2】: 调整位置，让它刚好在左边缘 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isDocked ? 1 : 0 }} // 只有停靠时显示
            transition={{ duration: 0.2 }}
            style={{
               position: 'absolute',
               left: '12px', // 靠左一点
               zIndex: 10
            }}
          >
             <ChevronLeft size={24} color="#fff" strokeWidth={3} />
          </motion.div>

          {/* 头像或图标 */}
          {/* 【修改点 3】: 停靠时完全透明 (opacity: 0)，避免和箭头重叠 */}
          <motion.div
             animate={{ opacity: isDocked ? 0 : 1 }}
             transition={{ duration: 0.2 }}
             style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {avatarUrl ? (
                <img
                src={avatarUrl}
                alt="User"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <User size={24} color="#EBF0F3" />
            )}
          </motion.div>
        </motion.button>

      </motion.div>

      {/* --- 全屏登录终端 --- */}
      <AnimatePresence>
        {terminalMode && (
          <LoginTerminal
            initialMode={terminalMode}
            onClose={() => setTerminalMode(null)}
            onSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// 子组件：菜单项
const MenuItem = ({ label, icon, onClick, isDanger }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ x: -5, backgroundColor: isDanger ? '#C0392B' : '#34495E' }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      background: '#2C3E50',
      color: '#EBF0F3',
      border: 'none',
      borderRadius: '30px', // 胶囊形状
      cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap'
    }}
  >
    <span>{label}</span>
    {icon}
  </motion.button>
);

// 辅助函数 (保持不变)
const fetchUserAvatar = async () => {
  try {
    const res = await fetch(`${API_BASE}/get-photo?t=${new Date().getTime()}`, { credentials: 'include' });
    if (res.ok) {
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) { console.error("Avatar fetch failed", e); }
  return null;
};

export default UserAuthSystem;
