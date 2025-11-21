import React, { useState, useEffect } from 'react'; // 1. 引入 hooks
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { User, PenTool, LayoutGrid, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserAuthSystem from './UserAuthSystem';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 滚动监听 ---
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 逻辑：如果向下滑动 且 滚动距离超过 100px -> 隐藏
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        // 否则（向上滑动或在顶部） -> 显示
        setHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // --- 新增功能结束 ---

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      // 2. 修改动画逻辑：根据 hidden 状态改变 Y 轴位置
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: hidden ? -80 : 0,  // hidden为真时向上移出屏幕(-80px)，否则归位(0)
        opacity: 1
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }} // 动画时长

      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
        background: 'rgba(11, 13, 23, 0.8)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 100, fontFamily: 'var(--font-mono)'
      }}
    >
      {/* 左侧 Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          onClick={() => navigate('/')}
          style={{
            background: 'var(--solid-white)', color: 'var(--solid-black)',
            padding: '4px 8px', fontWeight: 'bold', fontSize: '14px',
            letterSpacing: '1px', cursor: 'pointer'
          }}
        >
          GALAXY.LOG
        </div>
      </div>

      {/* 中间：路由切换 */}
      <div style={{ display: 'flex', gap: '5px' }}>
        <NavItem
          icon={<Home size={14} />}
          label="HOME"
          active={isActive('/')}
          onClick={() => navigate('/')}
        />
        <NavItem
          icon={<LayoutGrid size={14} />}
          label="BLOG"
          active={isActive('/blog')}
          onClick={() => navigate('/blog')}
        />
        <NavItem
          icon={<PenTool size={14} />}
          label="WRITE"
          active={isActive('/write')}
          onClick={() => navigate('/write')}
        />
      </div>

      {/* 右侧：用户模块 */}
      <UserAuthSystem />
    </motion.nav>
  );
};


const NavItem = ({ icon, label, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.95 }}
    style={{
      backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      outline: 'none',
      border: 'none',
      borderBottom: active ? '2px solid var(--accent-color)' : '2px solid transparent',
      color: active ? 'var(--solid-white)' : 'var(--text-dim)',
      padding: '0 16px', height: '40px',
      display: 'flex', alignItems: 'center', gap: '8px',
      cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px',
      transition: 'all 0.3s'
    }}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

export default Navbar;
