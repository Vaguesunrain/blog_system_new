import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, LayoutGrid, Home, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);

  // --- 滚动监听 (保持原逻辑) ---
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }} // 隐藏时完全移出
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // 更优雅的缓动
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '80px', //稍微加高一点，让布局更舒展
        background: 'transparent', // 完全透明
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 50px', // 加大左右间距
        zIndex: 100,
        pointerEvents: hidden ? 'none' : 'auto' // 隐藏时禁止点击
      }}
    >
      {/* 左侧 Logo: 艺术字体 */}
      <div
        onClick={() => navigate('/')}
        style={{
          fontFamily: '"Georgia", serif',
          fontStyle: 'italic',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#17202A', // 深黑色
          cursor: 'pointer',
          textShadow: '0 2px 10px rgba(255,255,255,0.5)' // 防止背景太深看不清
        }}
      >
        Melancholy.
      </div>

      {/* 右侧：纯图标导航 */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <IconItem
          icon={<Home size={22} />}
          label="Home"
          active={isActive('/')}
          onClick={() => navigate('/')}
        />
        <IconItem
          icon={<LayoutGrid size={22} />}
          label="Archive"
          active={isActive('/blog')}
          onClick={() => navigate('/blog')}
        />
        <IconItem
          icon={<PenTool size={22} />}
          label="Write"
          active={isActive('/write')}
          onClick={() => navigate('/write')}
        />
        <IconItem
          icon={<Camera size={22} />}
          label="Share"
          active={isActive('/share-photo')}
          onClick={() => navigate('/share-photo')}
        />
      </div>

    </motion.nav>
  );
};

// 子组件：带 Tooltip 的图标按钮
const IconItem = ({ icon, label, active, onClick }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '10px',
          // 选中为纯黑，未选中为灰色
          color: active || hover ? '#17202A' : '#95A5A6',
          transition: 'color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </motion.button>

      {/* 悬浮提示文字 (Tooltip) */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%', // 在图标下方
              fontFamily: '"Courier New", monospace',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#17202A',
              letterSpacing: '1px',
              pointerEvents: 'none', // 不阻挡鼠标
              marginTop: '5px'
            }}
          >
            {label.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
