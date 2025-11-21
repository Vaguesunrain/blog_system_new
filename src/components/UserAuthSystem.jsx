import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, UserPlus, X, Fingerprint, TrendingUp } from 'lucide-react';

const UserAuthSystem = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'login', 'register', or null

  // 切换轨道菜单
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // 打开 Iframe 模态框
  const openModal = (mode) => {
    setIsMenuOpen(false); // 关闭菜单
    setModalMode(mode);   // 打开模态框
  };

  // 使用亮青色作为菜单激活时的强调色，更匹配 Navbar
  const activeColor = 'var(--color-primary-light, #00e0ff)';

  return (
    <div style={{ position: 'relative' }}>

      {/* 1. 核心头像按钮 (Trigger) */}
      <motion.div
        onClick={toggleMenu}
        // 激活状态下使用强调色边框
        whileHover={{ borderColor: activeColor }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '6px 12px', // 略微加大内边距
          border: `1px solid ${isMenuOpen ? activeColor : 'var(--border-color)'}`,
          cursor: 'pointer',
          background: isMenuOpen ? 'rgba(0, 224, 255, 0.1)' : 'transparent', // 激活时背景带点颜色
          // 增加一个微妙的光晕
          boxShadow: isMenuOpen ? `0 0 10px ${activeColor}50` : 'none',
          zIndex: 200, position: 'relative',
          transition: 'all 0.3s ease-out'
        }}
      >
        <div style={{ textAlign: 'right', lineHeight: 1 }}>
          {/* 状态指示灯 */}
          <div style={{
            fontSize: '10px',
            color: isMenuOpen ? activeColor : 'var(--text-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '4px'
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: isMenuOpen ? activeColor : 'var(--text-dim)',
              // 增加一个闪烁动画（需要 CSS 关键帧）
              boxShadow: isMenuOpen ? `0 0 5px ${activeColor}` : 'none',
            }} />
            {isMenuOpen ? 'LINK_ACTIVE' : 'STANDBY'}
          </div>
          <div style={{
            fontSize: '13px', // 略微增大
            fontWeight: '900',
            fontFamily: 'var(--font-heading, sans-serif)', // 使用更有力的标题字体
            color: activeColor // 字体使用亮色
          }}>
            USER.ACCESS
          </div>
        </div>
        {/* 用户图标区域 */}
        <motion.div
          animate={{ rotate: isMenuOpen ? 360 : 0 }} // 菜单打开时旋转
          transition={{ duration: 0.5, type: 'spring' }}
          style={{
            width: '32px', height: '32px',
            background: isMenuOpen ? activeColor : 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${isMenuOpen ? activeColor : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '4px' // 边角略微方正
          }}
        >
          <User size={18} color={isMenuOpen ? 'var(--bg-dark)' : 'var(--text-main)'} />
        </motion.div>
      </motion.div>

      {/* 2. 卫星轨道菜单 (Orbit Menu) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 透明遮罩，点击空白处关闭 */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 190 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* 轨道容器 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', duration: 0.7, damping: 20, stiffness: 300 }}
              style={{
                position: 'absolute',
                top: '60px', right: '0px', // 调整位置，使其恰好在按钮下方
                width: '180px', height: '180px', // 略微缩小轨道尺寸
                pointerEvents: 'none',
                zIndex: 195,
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}
            >
              {/* 轨道圈 (装饰) - 使用 motion 实现轻微旋转动画 */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                style={{
                  position: 'absolute', inset: 0,
                  border: `1px dashed ${activeColor}50`, // 使用强调色的虚线
                  borderRadius: '50%',
                  opacity: 0.6,
                  scale: 0.8 // 轨道略微缩小
                }}
              />

              {/* 行星 A: Login */}
              <PlanetNode
                angle={135} // 右下角
                label="LOGIN"
                icon={<LogIn size={14} />}
                onClick={() => openModal('login')}
                delay={0.15}
                activeColor={activeColor}
              />

              {/* 行星 B: Register */}
              <PlanetNode
                angle={225} // 左下角
                label="REG"
                icon={<UserPlus size={14} />}
                onClick={() => openModal('register')}
                delay={0.25}
                activeColor={activeColor}
              />

              {/* 装饰性中心连线 */}
              <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.2 }}>
                <line x1="50%" y1="50%" x2="70%" y2="70%" stroke={activeColor} strokeDasharray="2 2" />
                <line x1="50%" y1="50%" x2="30%" y2="70%" stroke={activeColor} strokeDasharray="2 2" />
              </svg>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Iframe 模态框 (Modal) */}
      <AnimatePresence>
        {modalMode && (
          <AuthModal
            mode={modalMode}
            onClose={() => setModalMode(null)}
            activeColor={activeColor}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

// --- 子组件：行星节点 (按钮) ---
const PlanetNode = ({ angle, label, icon, onClick, delay, activeColor }) => {
  // 计算位置：简单的三角函数将角度转换为 x,y 坐标
  const radius = 70; // 配合容器 180x180 调整半径
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        background: 'var(--bg-color)',
        border: `1px solid ${activeColor}80`, // 稍微透明的边框
        color: activeColor,
        width: '42px', height: '42px', // 略微缩小尺寸
        borderRadius: '50%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: `0 0 10px ${activeColor}30`, // 基础光晕
        zIndex: 200,
        // 确保文字在小尺寸下居中
        padding: '2px',
        lineHeight: 1
      }}
      whileHover={{
        scale: 1.15,
        backgroundColor: activeColor,
        color: '#0b0d17', // 背景色
        boxShadow: `0 0 25px ${activeColor}` // 增强光晕
      }}
    >
      {icon}
      <span style={{ fontSize: '8px', fontWeight: 'bold', marginTop: '1px' }}>{label}</span>
    </motion.button>
  );
};

// --- 子组件：Iframe 模态框 ---
const AuthModal = ({ mode, onClose, activeColor }) => {
  const url = mode === 'login'
    ? 'https://example.com/login-placeholder'
    : 'https://example.com/register-placeholder';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.9)', // 更暗的背景
        backdropFilter: 'blur(8px)', // 更强的模糊
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}
    >
      {/* 窗口本体 */}
      <motion.div
        initial={{ scale: 0.9, rotateX: 10, opacity: 0 }}
        animate={{ scale: 1, rotateX: 0, opacity: 1 }}
        exit={{ scale: 0.9, rotateX: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        style={{
          width: '90%', maxWidth: '500px', height: '600px',
          background: '#0b0d17',
          // 边框使用强调色，并且有光晕
          border: `1px solid ${activeColor}`,
          boxShadow: `0 0 20px ${activeColor}50`,
          position: 'relative',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* 窗口 Header */}
        <div style={{
          padding: '15px',
          borderBottom: `1px solid ${activeColor}50`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.02)', // 更淡的 Header 背景
          color: activeColor // Header 文字使用强调色
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={18} color={activeColor} /> {/* 换一个更具科技感的图标 */}
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', letterSpacing: '1px' }}>
              SECURE_LINK :: {mode.toUpperCase()}
            </span>
          </div>
          <X
            size={22}
            style={{ cursor: 'pointer', opacity: 1 }}
            onClick={onClose}
            color={activeColor} // 关闭按钮使用强调色
            whileHover={{ scale: 1.1 }}
          />
        </div>

        {/* Iframe 区域 */}
        <div style={{ flex: 1, position: 'relative' }}>
          <iframe
            src={url}
            title="Auth Frame"
            style={{
              width: '100%', height: '100%', border: 'none',
              background: 'black' // 确保 iframe 区域颜色统一
            }}
          />
        </div>

      </motion.div>
      {/* 模态框背景点击关闭区域 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={onClose} />
    </motion.div>
  );
};

export default UserAuthSystem;
