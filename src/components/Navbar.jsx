import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PenTool, LayoutGrid, Home } from 'lucide-react';
import UserAuthSystem from './UserAuthSystem';

// 子组件：导航按钮
const NavItem = ({ icon, label, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
    whileTap={{ scale: 0.98 }}
    style={{
      background: active ? 'rgba(242, 95, 92, 0.15)' : 'transparent',
      border: 'none',
      boxShadow: active
        ? '0 2px 8px rgba(242, 95, 92, 0.3), inset 0 0 5px rgba(242, 95, 92, 0.2)'
        : 'none',
      color: active ? 'var(--accent-color)' : 'var(--text-dim)',
      padding: '0 18px',
      height: '36px',
      borderRadius: '4px',
      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
      fontFamily: 'var(--font-mono)', fontSize: '13px',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'background 0.3s, color 0.3s, box-shadow 0.3s'
    }}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

const Navbar = ({ currentTab, onTabChange }) => {

  // --- 滚动状态逻辑 ---
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const NAVBAR_HEIGHT = 64;
  const SCROLL_THRESHOLD = 50;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY <= NAVBAR_HEIGHT) {
      setIsHidden(false);
    } else if (currentScrollY > lastScrollY && currentScrollY > NAVBAR_HEIGHT + SCROLL_THRESHOLD) {
      setIsHidden(true);
    } else if (currentScrollY < lastScrollY) {
      setIsHidden(false);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <motion.nav
      initial={{ y: -NAVBAR_HEIGHT, opacity: 0 }}
      animate={{
        y: isHidden ? -NAVBAR_HEIGHT : 0,
        opacity: isHidden ? 0 : 1 // 隐藏时建议 opacity 0，不然会阻挡点击
      }}
      transition={{
        y: { type: 'spring', stiffness: 200, damping: 25 },
        opacity: { duration: 0.3 }
      }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: `${NAVBAR_HEIGHT}px`,
        background: 'rgba(11, 13, 23, 0.85)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 100,
        willChange: 'transform, opacity'
      }}
    >
      {/* --- 左侧：系统铭牌 --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          background: 'var(--solid-white)', 
          color: 'var(--solid-black)',
          padding: '6px 12px', fontWeight: '900', fontSize: '16px', letterSpacing: '2px',
          cursor: 'pointer', borderRadius: '2px',
          fontFamily: 'var(--font-mono)',
        }}>
          GALAXY.LOG
        </div>
        {/* 简单的版本号显示 */}
        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          V.5.4
        </span>
      </div>

      {/* --- 中间：Nav Items --- */}
       <div style={{ display: 'flex', gap: '5px' }}>
        <NavItem
          icon={<Home size={14} />}
          label="HOME"
          active={currentTab === 'HOME'}
          onClick={() => onTabChange('HOME')}
        />
        <NavItem
          icon={<LayoutGrid size={14} />}
          label="BLOG"
          active={currentTab === 'BLOG'}
          onClick={() => onTabChange('BLOG')}
        />
        <NavItem
          icon={<PenTool size={14} />}
          label="WRITE"
          active={currentTab === 'WRITE'}
          onClick={() => onTabChange('WRITE')}
        />
      </div>

      {/* 右侧认证 */}
      <UserAuthSystem />

    </motion.nav>
  );
};

export default Navbar;
