import React from 'react';
import { motion } from 'framer-motion';
import { User, PenTool, LayoutGrid, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // 1. 引入路由钩子
import UserAuthSystem from './UserAuthSystem';

// 删除 props 接收，因为不再需要父组件传 state 进来
const Navbar = () => {
  const navigate = useNavigate(); // 用来跳转
  const location = useLocation(); // 用来获取当前路径

  // 判断当前由哪个 Tab 激活
  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
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
          onClick={() => navigate('/')} // 点击 Logo 回首页
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
      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      border: 'none',
      borderBottom: active ? '2px solid var(--accent-color)' : '2px solid transparent',
      color: active ? 'var(--solid-white)' : 'var(--text-dim)',
      padding: '0 16px', height: '40px',
      display: 'flex', alignItems: 'center', gap: '8px',
      cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px',
      transition: 'color 0.3s'
    }}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

export default Navbar;