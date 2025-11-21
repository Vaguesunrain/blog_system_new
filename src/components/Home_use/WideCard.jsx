import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, User } from 'lucide-react';

const WideCard = ({ id, category, title, excerpt, author, date, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: 'var(--panel-bg)', paddingLeft: '30px' }}
      style={{
        display: 'flex',
        alignItems: 'flex-start', // 改为顶部对齐，因为内容多了
        gap: '40px',
        padding: '40px 0', // 上下间距加大
        borderTop: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {/* --- 1. 左侧：竖排 ID (替代原来的序号) --- */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        color: 'var(--data-color)',
        fontSize: '14px',
        fontWeight: 'bold',
        writingMode: 'vertical-rl', // 竖排文字，更有工业感
        transform: 'rotate(180deg)', // 调整方向
        height: '10%',
        opacity: 0.8,
        marginTop: '5px'
      }}>
        {id}
      </div>

      {/* --- 2. 右侧：主体内容区 --- */}
      <div style={{ flex: 1 }}>

        {/* A. 分类标签 */}
        <div style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-color)', // 用橙色强调分类
          marginBottom: '10px',
          letterSpacing: '1px'
        }}>
          // {category}
        </div>

        {/* B. 标题 */}
        <h3 style={{
          fontSize: '25px', // 保持大字体
          fontWeight: '600',
          color: 'var(--text-main)',
          margin: '0 0 15px 0',
          lineHeight: '1.0',
          letterSpacing: '-0.5px'
        }}>
          {title}
        </h3>

        {/* C. 文章摘要 (新增) */}
        <p style={{
          fontSize: '13px',
          color: 'var(--text-dim)',
          lineHeight: '1.0',
          margin: '0 0 25px 0',
          maxWidth: '90%', // 防止太宽
          display: '-webkit-box', // 限制行数
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {excerpt}
        </p>

        {/* D. 底部元数据栏：作者 + 日期 + 箭头 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px dashed rgba(255,255,255,0.1)', // 虚线分割
          paddingTop: '10px',
          marginTop: 'auto'
        }}>

          {/* 作者信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 头像框 */}
            <div style={{
              width: '24px', height: '24px',
              borderRadius: '50%',
              background: 'var(--text-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {/* 如果有头像图片用 img，没有用图标 */}
              <User size={16} color="#000" />
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-main)',
              fontWeight: 'bold'
            }}>
              {author}
            </span>
          </div>

          {/* 日期与箭头 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '12px' }}>
               POSTED: {date}
             </span>
             <div style={{
               width: '32px', height: '32px',
               borderRadius: '50%',
               border: '1px solid var(--border-color)',
               display: 'flex', alignItems: 'center', justifyContent: 'center'
             }}>
                <ArrowUpRight size={18} color="var(--accent-color)" />
             </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default WideCard;
