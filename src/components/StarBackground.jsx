import React from 'react';
import { motion } from 'framer-motion';

const StarBackground = () => {
  // 1. 静态背景星（模拟遥远的恒星，只会缓慢位移）
  const bgStars = Array.from({ length: 250 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 20 + 20, // 极慢
  }));

  // 2. 高速飞行流线（模拟近处飞掠的太空尘埃/光速飞行感）
  const warpLines = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    // 让线条长度不一
    width: Math.random() * 150 + 50,
    // 速度不一
    duration: Math.random() * 2 + 0.5,
    // 延迟不一，避免同时出现
    delay: Math.random() * 5,
    // 颜色：白色或淡淡的蓝色
    color: Math.random() > 0.5 ? 'var(--solid-white)' : 'var(--data-color)',
  }));

  return (
    <>
      {/* 工程网格 (保持不变) */}
      <div className="grid-bg" />

      {/* 容器 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none',
        overflow: 'hidden' // 防止星星飞出屏幕出现滚动条
      }}>

        {/* 深色底板 (防止漏白) */}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-color)' }} />

        {/* --- 第一层：缓慢漂移的背景星 --- */}
        {bgStars.map((star) => (
          <motion.div
            key={`bg-${star.id}`}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left, // 初始位置
              width: star.size,
              height: star.size,
              backgroundColor: 'white',
              opacity: star.opacity,
              borderRadius: '50%',
            }}
            // 动画：从当前位置向左移动，模拟飞船前进
            animate={{ x: [0, -100] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* --- 第二层：高速掠过的飞行流线 (Warp Lines) --- */}
        {warpLines.map((line) => (
          <motion.div
            key={`warp-${line.id}`}
            style={{
              position: 'absolute',
              top: line.top,
              left: '110%', // 起始点在屏幕右侧外
              width: line.width,
              height: '1px', // 细长的线
              background: `linear-gradient(90deg, transparent, ${line.color}, transparent)`,
              opacity: 0.4,
            }}
            // 动画：从右侧外飞到左侧外
            animate={{ left: ['110%', '-20%'] }}
            transition={{
              duration: line.duration,
              repeat: Infinity,
              ease: "linear",
              delay: line.delay
            }}
          />
        ))}

      </div>
    </>
  );
};

export default StarBackground;
