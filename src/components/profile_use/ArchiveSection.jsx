import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Image as ImageIcon, Aperture } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../data/config';

// 🎨 配色系统
const COLORS = {
  bg: '#FDFBF7',         // 纸张底色
  ink: '#2C3E50',        // 墨水蓝
  line: 'rgba(44, 62, 80, 0.1)',
  sub: '#7F8C8D'         // 辅助灰
};

const MOCK_PHOTO = "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=600&auto=format&fit=crop";

const ArchiveSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const MAX_SLOTS = 5;

  useEffect(() => {
    fetch(`${API_BASE}/my-articles-list`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setArticles(data.articles); })
      .finally(() => setLoading(false));
  }, []);

  const displayList = articles.slice(0, MAX_SLOTS);

  // 公用的卡片样式 (提取出来复用)
  const cardStyle = {
    backgroundColor: COLORS.bg,
    boxShadow: '0 4px 30px rgba(0,0,0,0.08)', // 独立的投影
    borderRadius: '4px',
    padding: '50px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  // 顶部的装订线装饰
  const BindingLine = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `repeating-linear-gradient(90deg, ${COLORS.ink} 0, ${COLORS.ink} 10px, transparent 10px, transparent 12px)` }} />
  );

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px', // 容器加宽
      margin: '0 auto',
      // [关键] 外层容器透明，无背景，无阴影
      background: 'transparent',
      display: 'flex',
      gap: '40px',        // [关键] 中间留出 40px 的缝隙，透出背景
      alignItems: 'stretch' // 左右等高
    }}>

      {/* ======================= 卡片 1：文章列表 (左侧) ======================= */}
      <div style={{ flex: '1.6', ...cardStyle }}>
          <BindingLine />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: `2px solid ${COLORS.ink}`, paddingBottom: '15px' }}>
            <div>
               <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub, letterSpacing: '2px', marginBottom: '5px' }}>TEXT ARCHIVE</div>
               <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '32px', color: COLORS.ink, margin: 0, fontStyle: 'italic' }}>Manuscripts</h2>
            </div>
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub }}>VOL. {articles.length}</div>
          </div>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {loading ? (
               <div style={{ padding: '40px', textAlign: 'center', fontFamily: '"Georgia", serif', color: COLORS.sub }}>Retrieving...</div>
            ) : (
              <>
                {articles.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: COLORS.sub }}>Archive is empty.</div>}
                {displayList.map((art, i) => (
                  <ArchiveRow key={art.id} art={art} index={i} onClick={() => navigate(`/write?id=${art.id}`)} />
                ))}
              </>
            )}
          </div>

          {/* Footer Action */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: `1px dashed ${COLORS.line}`, display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ x: 5 }}
                onClick={() => navigate('/blog-manage')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: COLORS.ink, fontFamily: '"Courier New", monospace', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                 MANAGE RECORDS <ArrowRight size={14} />
              </motion.button>
          </div>
      </div>

      {/* ======================= 卡片 2：视觉档案 (右侧) ======================= */}
      <div style={{ flex: '1', ...cardStyle }}>
          <BindingLine />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: `2px solid ${COLORS.ink}`, paddingBottom: '15px' }}>
             <div>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub, letterSpacing: '2px', marginBottom: '5px' }}>VISUAL ARCHIVE</div>
                <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '32px', color: COLORS.ink, margin: 0, fontStyle: 'italic' }}>Snapshots</h2>
             </div>
             <div style={{ paddingBottom: '5px' }}><Aperture size={20} color={COLORS.sub} /></div>
          </div>

          {/* Content */}
          <motion.div whileHover={{ y: -5 }} style={{ marginBottom: '30px', cursor: 'pointer', backgroundColor: '#fff', padding: '12px 12px 40px 12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.02)', transform: 'rotate(1deg)' }}>
             <div style={{ width: '100%', height: '220px', backgroundColor: '#eee', overflow: 'hidden' }}>
                 <img src={MOCK_PHOTO} alt="memory" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) sepia(5%)' }} />
             </div>
             <div style={{ marginTop: '15px', padding: '0 5px' }}>
                 <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: COLORS.sub, marginBottom: '5px' }}>FILM_SEQ_01 // 2024</div>
                 <div style={{ fontFamily: '"Georgia", serif', fontSize: '14px', color: COLORS.ink, fontStyle: 'italic' }}>"A quiet place."</div>
             </div>
          </motion.div>

          {/* Empty State */}
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.02)', border: `1px dashed ${COLORS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px', minHeight: '100px', marginBottom: '40px' }}>
              <div style={{ width: '40px', height: '1px', background: COLORS.sub, opacity: 0.3 }} />
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: COLORS.sub, letterSpacing: '2px', opacity: 0.6 }}>NO MORE DATA</div>
              <div style={{ width: '40px', height: '1px', background: COLORS.sub, opacity: 0.3 }} />
          </div>

          {/* Footer Action */}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: `1px dashed ${COLORS.line}`, display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ x: 5 }}
                onClick={() => navigate('/gallery')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: COLORS.ink, fontFamily: '"Courier New", monospace', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                 EXPLORE GALLERY <ArrowRight size={14} />
              </motion.button>
          </div>
      </div>

    </div>
  );
};

// 子组件：单行档案 (保持不变)
const ArchiveRow = ({ art, index, onClick }) => {
  const isDraft = art.status === 'draft';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', paddingLeft: '20px' }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 0', borderBottom: `1px solid ${COLORS.line}`, cursor: 'pointer', transition: 'all 0.3s ease' }}
    >
      <div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontFamily: '"Georgia", serif', fontSize: '18px', color: COLORS.ink }}>{art.title || "Untitled"}</span>
            {isDraft && <span style={{ fontSize: '9px', background: '#E67E22', color: '#fff', padding: '2px 4px', borderRadius: '2px' }}>DRAFT</span>}
         </div>
         <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: COLORS.sub, fontFamily: '"Inter", sans-serif' }}>
            <Tag size={12} /> {art.tags && art.tags.length > 0 ? art.tags[0] : 'Uncategorized'}
         </div>
      </div>
      <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub }}>
         {art.date.split(' ')[0]}
      </div>
    </motion.div>
  );
};

export default ArchiveSection;
