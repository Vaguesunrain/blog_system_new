import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, GitCommitVertical } from 'lucide-react';

const ThemeHistory = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // 关键修改：让它独立出来，距离上方元素(Header)有明显距离，距离下方也有距离
      margin: '60px auto 20px auto',
      position: 'relative',
      zIndex: 20
    }}>

      {/* 1. 主印章：尺寸加大 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(44, 62, 80, 0.25)' }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '72px',  // 加大
          height: '72px', // 加大
          borderRadius: '50%',
          backgroundColor: '#2C3E50',
          color: '#EBF0F3',
          border: '4px solid #EBF0F3', // 边框加粗
          boxShadow: '0 6px 25px rgba(44, 62, 80, 0.15)',
          cursor: 'pointer',
          fontFamily: '"Georgia", serif',
          fontStyle: 'italic',
          fontSize: '16px', // 字体加大
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          position: 'relative'
        }}
      >
        Blue
      </motion.button>

      {/* 装饰：印章上方的一点点连接线，暗示它连接着上面的回忆 */}
      <div style={{
        position: 'absolute', top: '-60px', width: '1px', height: '60px',
        background: 'linear-gradient(to bottom, transparent, rgba(44,62,80,0.2))'
      }} />

      {/* 2. 展开区域：更长，更舒展 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // 类似纸张展开的缓动
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            {/* 第一段长线：拉开距离 */}
            <motion.div
              initial={{ height: 0 }} animate={{ height: '60px' }} exit={{ height: 0 }} transition={{ duration: 0.5 }}
              style={{ width: '1px', backgroundColor: '#BDC3C7' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '20px' }}>

              <VersionNode
                label="Solar"
                desc="v2.0_The_Warmth"
                link="https://github.com/Vaguesunrain/blog_system_new/tree/stars_blog" // 你的链接
                delay={0.3}
              />

              <VersionNode
                label="Stars"
                desc="v1.0_The_Origin"
                link="https://github.com/Vaguesunrain/blog_system_new/tree/legacy" // 你的链接
                delay={0.5}
              />

              {/* 结尾装饰：一个小黑点，表示结束 */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }}
                style={{ width: '4px', height: '4px', background: '#BDC3C7', borderRadius: '50%', margin: '0 auto' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VersionNode = ({ label, desc, link, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ delay: delay, duration: 0.6 }}
    style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
  >
    {/* 左侧：节点 */}
    <div style={{
      width: '40px', // 加大
      height: '40px',
      borderRadius: '50%',
      border: '1px solid #95A5A6',
      backgroundColor: '#EBF0F3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', fontFamily: '"Courier New", monospace', color: '#7F8C8D'
    }}>
      {label}
    </div>

    {/* 右侧：文字 */}
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        color: '#566573',
        borderBottom: '1px solid #BDC3C7',
        paddingBottom: '4px',
        fontStyle: 'italic'
      }}>
        {desc}
      </span>
      <Github size={14} color="#95A5A6" />
    </a>
  </motion.div>
);

export default ThemeHistory;
