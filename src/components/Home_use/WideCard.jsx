import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, User } from 'lucide-react';

const WideCard = ({ id, category, title, excerpt, author, date, avatar, onClick }) => {
  // 图片加载状态管理：如果图片加载失败，显示默认图标
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: 'var(--panel-bg)', paddingLeft: '30px' }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '40px',
        padding: '40px 0',
        borderTop: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 左侧 ID */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        color: 'var(--data-color)',
        fontSize: '14px',
        fontWeight: 'bold',
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        height: '10%',
        opacity: 0.8,
        marginTop: '5px'
      }}>
        {id}
      </div>

      {/* 右侧主体 */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-color)', marginBottom: '10px', letterSpacing: '1px' }}>
          // {category}
        </div>
        <h3 style={{ fontSize: '25px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 15px 0', lineHeight: '1.0', letterSpacing: '-0.5px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.6', margin: '0 0 25px 0', maxWidth: '90%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {excerpt}
        </p>

        {/* 底部信息栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: 'auto' }}>
          
          {/* 作者信息区域 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 头像圆圈 */}
            <div style={{
              width: '24px', height: '24px',
              borderRadius: '50%',
              background: 'var(--text-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid var(--border-color)'
            }}>
              {/* 逻辑：如果有头像地址且没报错，显示图片；否则显示图标 */}
              {avatar && !imgError ? (
                <img 
                  src={avatar} 
                  alt={author} 
                  onError={() => setImgError(true)} // 加载失败时触发
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <User size={16} color="#000" />
              )}
            </div>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-main)', fontWeight: 'bold' }}>
              {author}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '12px' }}>POSTED: {date}</span>
             <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowUpRight size={18} color="var(--accent-color)" />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WideCard;