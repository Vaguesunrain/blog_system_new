import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, FileText, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../data/config';

// 🎨 档案馆配色
const COLORS = {
  bg: '#FDFBF7',         // 纸张底色 (Warm White)
  ink: '#2C3E50',        // 墨水蓝
  line: 'rgba(44, 62, 80, 0.1)', // 淡灰线条
  accent: '#C0392B',     // 红色印泥
  tag: '#8D7B68',        // 枯茶色标签
  draft: '#E67E22',      // 草稿色 (琥珀色)
  sub: '#7F8C8D'         // 辅助灰
};

const ArchiveSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const MAX_SLOTS = 5; // 档案盒容量

  useEffect(() => {
    fetch(`${API_BASE}/my-articles-list`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setArticles(data.articles);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const displayList = articles.slice(0, MAX_SLOTS);

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: COLORS.bg,
      boxShadow: '0 2px 20px rgba(0,0,0,0.05)', // 轻微纸张投影
      borderRadius: '2px', // 几乎直角，像书本
      padding: '40px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* 装饰：顶部装订线 */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: `repeating-linear-gradient(90deg, ${COLORS.ink} 0, ${COLORS.ink} 10px, transparent 10px, transparent 12px)`
      }} />

      {/* 1. 档案室表头 (Archive Header) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '40px', borderBottom: `2px solid ${COLORS.ink}`, paddingBottom: '15px'
      }}>
        <div>
           <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub, letterSpacing: '2px', marginBottom: '5px' }}>
              PERSONAL COLLECTION
           </div>
           <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '28px', color: COLORS.ink, margin: 0, fontStyle: 'italic' }}>
              Manuscripts & Drafts
           </h2>
        </div>
        <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub }}>
           INDEX: {articles.length} ITEMS
        </div>
      </div>

      {/* 2. 档案列表 (The File List) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {loading ? (
           <div style={{ padding: '40px', textAlign: 'center', fontFamily: '"Georgia", serif', color: COLORS.sub, fontStyle: 'italic' }}>
              Retrieving documents from the shelf...
           </div>
        ) : (
          <>
            {/* 如果没有文章 */}
            {articles.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: COLORS.sub, fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
                    The archive is empty. Start writing your first chapter.
                </div>
            )}

            {displayList.map((art, i) => (
              <ArchiveRow
                key={art.id}
                art={art}
                index={i}
                onClick={() => navigate(`/write?id=${art.id}`)}
              />
            ))}
          </>
        )}
      </div>

      {/* 3. 底部操作栏 (Footer Action) */}
      <div style={{
         marginTop: '30px', paddingTop: '20px',
         borderTop: `1px dashed ${COLORS.line}`, // 虚线分割
         display: 'flex', justifyContent: 'flex-end'
      }}>
          <motion.button
            whileHover={{ x: 5 }}
            onClick={() => navigate('/blog-manage')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: COLORS.ink, fontFamily: '"Courier New", monospace', fontSize: '12px', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
             VIEW FULL CATALOG <ArrowRight size={14} />
          </motion.button>
      </div>

    </div>
  );
};

// 子组件：单行档案 (File Row)
const ArchiveRow = ({ art, index, onClick }) => {
  const isDraft = art.status === 'draft';
  const statusColor = isDraft ? COLORS.draft : COLORS.tag;
  const statusLabel = isDraft ? 'DRAFT COPY' : 'PUBLISHED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', paddingLeft: '15px' }} // 悬浮时轻微右移
      style={{
        display: 'grid',
        // 布局：状态标签 | 标题 | 日期 | 图标
        gridTemplateColumns: '100px 1fr 100px 30px',
        alignItems: 'center',
        padding: '20px 0',
        borderBottom: `1px solid ${COLORS.line}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 1. 状态标签 (像贴在文件上的标签) */}
      <div>
         <span style={{
             fontFamily: '"Courier New", monospace', fontSize: '10px', fontWeight: 'bold', color: '#fff',
             backgroundColor: statusColor, padding: '3px 6px', borderRadius: '2px', letterSpacing: '0.5px'
         }}>
            {statusLabel}
         </span>
      </div>

      {/* 2. 标题 (手写体感觉) */}
      <div style={{ paddingRight: '20px' }}>
         <div style={{ fontFamily: '"Georgia", serif', fontSize: '18px', color: COLORS.ink }}>
            {art.title || "Untitled Manuscript"}
         </div>
         {/* 摘要/标签 (小字) */}
         <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: COLORS.sub, fontFamily: '"Inter", sans-serif' }}>
               <Tag size={10} /> {art.tags && art.tags.length > 0 ? art.tags.join(', ') : 'Uncategorized'}
            </span>
         </div>
      </div>

      {/* 3. 日期 (旧打字机字体) */}
      <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub }}>
         {art.date.split(' ')[0]}
      </div>

      {/* 4. 操作图标 */}
      <div style={{ opacity: 0.4 }}>
         <BookOpen size={16} color={COLORS.ink} />
      </div>

    </motion.div>
  );
};

export default ArchiveSection;
