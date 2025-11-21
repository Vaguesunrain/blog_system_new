import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, User, Globe, Cpu, Layers, Github, Command } from 'lucide-react';

const SplitControl = () => {
  // 状态：'neutral' (默认), 'left' (左侧扩张), 'right' (右侧扩张)
  const [hoverState, setHoverState] = useState('neutral');

  // 动画配置：弹簧效果，模拟机械阻尼感
  const springTransition = { type: 'spring', stiffness: 200, damping: 25 };

  // 核心：控制白色区域的裁剪路径 (Clip Path)
  const clipVariants = {
    neutral: { clipPath: 'polygon(0 0, 55% 0, 45% 100%, 0 100%)' }, // 默认：中间斜切
    left:    { clipPath: 'polygon(0 0, 85% 0, 75% 100%, 0 100%)' }, // 左侧扩张
    right:   { clipPath: 'polygon(0 0, 25% 0, 15% 100%, 0 100%)' }, // 右侧扩张（即白色收缩）
  };

  // 内容淡入淡出控制：当空间变小时，隐藏内容以防挤压
  const contentOpacity = (section) => {
    if (hoverState === 'neutral') return 1;
    if (section === 'left') return hoverState === 'left' ? 1 : 0.3;
    if (section === 'right') return hoverState === 'right' ? 1 : 0.3;
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '280px', // 大长方形高度
        marginBottom: '80px',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        background: 'rgba(0,0,0,0.3)' // 暗部背景
      }}
      onMouseLeave={() => setHoverState('neutral')}
    >
      
      {/* --- 右侧：暗色区域 (底层) --- */}
      {/* 实际上它铺满全屏，只是被上面的白色层遮挡了左半部分 */}
      <div 
        style={{ 
          position: 'absolute', inset: 0, 
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          paddingRight: '5%', // 给斜角留出余量
        }}
        onMouseEnter={() => setHoverState('right')}
      >
        <motion.div 
          animate={{ opacity: contentOpacity('right'), x: hoverState === 'right' ? 0 : 20 }}
          transition={springTransition}
          style={{ width: '50%', textAlign: 'right', zIndex: 1 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
            
            {/* 标题 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '2px' }}>SYSTEM TELEMETRY</span>
              <Cpu size={18} />
            </div>

            {/* 数据展示块 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
              <StatBlock label="UPTIME" value="99.9%" sub="NOMINAL" />
              <StatBlock label="FRAMEWORK" value="REACT" sub="VITE 5.4" />
              <StatBlock label="LAST COMMIT" value="4h AGO" sub="MASTER" />
              <StatBlock label="MEMORY" value="128MB" sub="ALLOCATED" />
            </div>

            {/* 底部链接 */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
               <TechIcon icon={<Github size={20} />} label="REPO" />
               <TechIcon icon={<Layers size={20} />} label="STACK" />
            </div>

          </div>
        </motion.div>
        
        {/* 装饰背景网格 (仅右侧) */}
        <div style={{ 
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', 
          background: 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.02) 100%)',
          pointerEvents: 'none'
        }} />
      </div>


      {/* --- 左侧：纯白区域 (顶层) --- */}
      <motion.div
        variants={clipVariants}
        initial="neutral"
        animate={hoverState}
        transition={springTransition}
        style={{
          position: 'absolute', inset: 0,
          background: 'var(--solid-white)',
          color: 'var(--solid-black)',
          zIndex: 10, // 确保在最上层
          cursor: 'pointer' // 白区一般可点击
        }}
        onMouseEnter={() => setHoverState('left')}
      >
        {/* 白区内容容器 */}
        <div style={{ 
          height: '100%', width: '100%', 
          position: 'relative' 
        }}>
          
          <motion.div 
            animate={{ opacity: contentOpacity('left'), x: hoverState === 'left' ? 0 : -20 }}
            transition={springTransition}
            style={{ 
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '60%', // 内容限制在左侧
              padding: '40px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}
          >
            {/* 顶部：身份 ID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '4px', border: '1px solid #000', borderRadius: '50%' }}>
                <User size={20} color="#000" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold' }}>
                OP_ID: ADMIN_01
              </div>
            </div>

            {/* 中部：大标题 */}
            <div>
              <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', lineHeight: 1, fontWeight: 800, letterSpacing: '-1px' }}>
                FULL STACK<br/>DEVELOPER
              </h2>
              <p style={{ margin: 0, opacity: 0.6, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                Available for freelance & <br/> collaboration missions.
              </p>
            </div>

            {/* 底部：行动按钮 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '14px' }}>
              <Command size={16} />
              <span>INITIATE CONTACT</span>
              <ArrowUpRight size={16} />
            </div>

          </motion.div>

          {/* 装饰：斜切线上的文字 (当白色收缩时显示) */}
          <AnimatePresence>
            {hoverState === 'right' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ 
                  position: 'absolute', bottom: '20px', left: '20px', 
                  fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold'
                }}
              >
                Hover to Expand 
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

    </div>
  );
};

// --- 子组件：暗区的小数据块 ---

const StatBlock = ({ label, value, sub }) => (
  <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '10px' }}>
    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{label}</div>
    <div style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: 'bold' }}>{value}</div>
    {/* 修改这里：把 sub 的颜色从 accent-color 改为 data-color */}
    <div style={{ fontSize: '10px', color: 'var(--data-color)' }}>{sub}</div>
  </div>
);
// --- 子组件：暗区图标按钮 ---
const TechIcon = ({ icon, label }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: '6px', 
    padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px',
    fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', cursor: 'pointer'
  }}>
    {icon} {label}
  </div>
);

export default SplitControl;