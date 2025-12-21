import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CinematicCard = ({
  mode = 1,
  data,
  onClick
}) => {
  const { title, excerpt, author, date, category, uid, coverImage } = data;
  const [isHovered, setIsHovered] = useState(false);

  // 辅助：图片组件
  const CardImage = ({ height }) => (
    <div style={{
      width: '100%',
      height: height,
      overflow: 'hidden',
      marginBottom: '16px',
      // 图片容器不需要背景色了，让它空着
    }}>
      <img
        src={coverImage}
        alt="cover"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // 滤镜：默认低饱和度，Hover时恢复一点色彩
          filter: isHovered ? 'grayscale(20%) contrast(100%)' : 'grayscale(60%) contrast(90%) sepia(10%)',
          transition: 'transform 0.6s ease, filter 0.6s ease',
          transform: isHovered ? 'scale(1.03)' : 'scale(1)'
        }}
      />
    </div>
  );

  // 辅助：标题
  const CardTitle = ({ size = '24px' }) => (
    <h3 style={{
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontSize: size,
      color: '#2C3E50', // 深蓝灰
      margin: '0 0 12px 0',
      fontWeight: 'normal',
      lineHeight: '1.25',
      // Hover时标题变为斜体，增加叙事感
      fontStyle: isHovered ? 'italic' : 'normal',
      transition: 'all 0.3s ease'
    }}>
      {title}
    </h3>
  );

  // 辅助：摘要
  const CardExcerpt = ({ lineClamp = 3 }) => (
    <p style={{
      fontFamily: '"Helvetica Neue", sans-serif',
      fontSize: '14px',
      color: '#566573', // 较淡的灰蓝
      lineHeight: '1.7',
      margin: 0,
      display: '-webkit-box',
      WebkitLineClamp: lineClamp,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      opacity: 0.9
    }}>
      {excerpt}
    </p>
  );

  // 辅助：顶部元数据 (分类/日期) - 像报纸的眉批
  const MetaHeader = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '15px',
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: '#95A5A6',
      letterSpacing: '1px'
    }}>
      <span>{uid}</span>
      <span>{date}</span>
    </div>
  );

  // 容器样式：关键是背景透明，无阴影
  const containerStyle = {
    backgroundColor: 'transparent',
    padding: '20px 0', // 上下留白，左右不留（紧贴网格）
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    // 只保留顶部一条极细的线，像打印出来的剧本分隔
    borderTop: '1px solid rgba(44, 62, 80, 0.1)',
    transition: 'opacity 0.3s ease'
  };

  return (
    <motion.div
      style={containerStyle}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      // Hover时整体稍微变清晰一点，不做位移
      whileHover={{ opacity: 1 }}
      initial={{ opacity: 0.85, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <MetaHeader />

      {/* --- Mode 1: 大图全内容 --- */}
      {mode === 1 && (
        <>
          <CardImage height="320px" />
          <div style={{ flex: 1, paddingRight: '10px' }}>
            <div style={{ fontSize:'10px', color:'#2C3E50', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'2px' }}>{category}</div>
            <CardTitle size="36px" />
            <CardExcerpt lineClamp={6} />
          </div>
          <div style={{ marginTop: '20px', fontSize: '11px', fontFamily: '"Courier New", monospace', color: '#7F8C8D' }}>
             Written by {author}
          </div>
        </>
      )}

      {/* --- Mode 2: 中图无作者 --- */}
      {mode === 2 && (
        <>
          <CardImage height="180px" />
          <div style={{ flex: 1 }}>
            <CardTitle size="22px" />
            <CardExcerpt lineClamp={4} />
          </div>
        </>
      )}

      {/* --- Mode 3: 小图意境 (无标题) --- */}
      {mode === 3 && (
        <>
          <CardImage height="140px" />
          <div style={{ flex: 1 }}>
            {/* 这里的摘要作为引言显示 */}
            <p style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '14px', color: '#34495E' }}>
              "{excerpt.substring(0, 80)}..."
            </p>
          </div>
        </>
      )}

      {/* --- Mode 4: 纯文字 --- */}
      {mode === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <CardTitle size="20px" />
            <CardExcerpt lineClamp={8} />
          </div>
          <div style={{ fontSize: '10px', color: '#BDC3C7', marginTop: '10px', textAlign: 'right' }}>
            READ_ENTRY ->
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CinematicCard;
