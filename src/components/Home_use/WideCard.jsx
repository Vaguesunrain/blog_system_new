import React, { useState } from 'react';
import { motion } from 'framer-motion';

const WideCard = ({ id, category, title, excerpt, author, date, avatar, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // 动画：Hover时文字稍微变暗，而不是改变背景色
      whileHover={{ opacity: 1 }}
      initial={{ opacity: 0.8 }}
      style={{
        padding: '50px 0',
        // 【关键修改】线条颜色加深，匹配蓝灰背景
        borderTop: '1px solid #CFD8DC',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: '100px 1fr',
        gap: '40px',
        alignItems: 'start',
        position: 'relative'
      }}
    >
      {/* 左侧：打字机时间戳 */}
      <div style={{
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        // Hover时颜色加深
        color: isHovered ? '#2C3E50' : '#808B96',
        textAlign: 'right',
        paddingTop: '6px',
        transition: 'color 0.4s ease'
      }}>
        <div>{date}</div>
        <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>{id}</div>
      </div>

      {/* 右侧：主体 */}
      <div>
        <div style={{
          fontSize: '11px',
          letterSpacing: '2px',
          color: '#566573',
          marginBottom: '12px',
          textTransform: 'uppercase',
          fontFamily: '"Helvetica Neue", sans-serif',
          opacity: 0.8
        }}>
          {category}
        </div>

        <h3 style={{
          fontSize: '30px',
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontWeight: 'normal',
          fontStyle: isHovered ? 'italic' : 'normal',
          color: '#212F3C', // 接近黑色的深蓝
          margin: '0 0 18px 0',
          lineHeight: '1.3',
          transition: 'all 0.4s ease' // 慢一点的过渡，更优雅
        }}>
          {title}
        </h3>

        <p style={{
          fontSize: '16px',
          fontFamily: '"Helvetica Neue", sans-serif',
          fontWeight: '300',
          color: '#566573', // 灰蓝色文字
          lineHeight: '1.8',
          margin: '0 0 25px 0',
          maxWidth: '580px',
          // Hover时摘要颜色稍微加深
          opacity: isHovered ? 1 : 0.9,
          transition: 'opacity 0.4s ease'
        }}>
          {excerpt}
        </p>

        {/* 底部信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div style={{
             width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden',
             filter: 'grayscale(100%)', opacity: 0.7,
             border: '1px solid #BDC3C7' // 给头像加个淡淡的边框
           }}>
              {avatar && !imgError ? (
                <img src={avatar} alt={author} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ background: '#BDC3C7', width: '100%', height: '100%' }} />
              )}
           </div>
           <span style={{ fontSize: '11px', fontFamily: '"Courier New", monospace', color: '#808B96', letterSpacing: '1px' }}>
             {author.toUpperCase()}
           </span>
        </div>
      </div>
    </motion.div>
  );
};

export default WideCard;
