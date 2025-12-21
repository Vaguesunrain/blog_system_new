import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, AlignLeft, ArrowDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE } from '../data/config';

// 🎨 配色系统 (复用)
const COLORS = {
  bg: '#EBF0F3',
  ink: '#2C3E50',
  paper: '#FDFBF7',
  sub: '#7F8C8D',
  line: 'rgba(44, 62, 80, 0.1)',
};

const Gallery = ({ isEmbedded = false }) => {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // --- Fetch Data ---
  const loadPhotos = (pageNum) => {
    setLoading(true);
    fetch(`${API_BASE}/gallery-photos?page=${pageNum}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          // 如果是第一页，直接覆盖；否则追加
          if (pageNum === 1) {
            setPhotos(data.photos);
          } else {
            setPhotos(prev => [...prev, ...data.photos]);
          }
          setHasMore(data.has_more);
        }
      })
      .catch(err => console.error("Gallery Load Error:", err))
      .finally(() => setLoading(false));
  };

  // 初始化加载第一页
  useEffect(() => {
    loadPhotos(1);
  }, []);

  // 加载更多
  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPhotos(nextPage);
  };

  // --- 核心逻辑：数据清洗与分组 ---
  // 后端返回的 date 是 'YYYY-MM-DD'，我们需要把它转成 'WEEK X / MONTH'
  const groupedPhotos = useMemo(() => {
    const groups = {};
    photos.forEach(photo => {
      const d = new Date(photo.date); // '2024-03-10'
      // 这里的周数计算只是简易版，为了视觉分组
      const weekNum = Math.ceil((d.getDate() + 1) / 7);
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const weekKey = `WEEK ${weekNum} / ${month}`; // e.g. "WEEK 2 / MAR"

      if (!groups[weekKey]) groups[weekKey] = [];
      groups[weekKey].push(photo);
    });
    // 如果你想按时间倒序排列 Key (通常 JS 对象的 key 顺序不保证，但如果是新浏览器通常按插入顺序)
    // 这里简单处理直接返回对象，渲染时 Object.entries 通常会保持顺序
    return groups;
  }, [photos]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, position: 'relative' }}>
      {!isEmbedded && <Navbar />}

      {/* Header */}
      <div style={{ paddingTop: isEmbedded ? '180px' : '120px', paddingBottom: '60px', textAlign: 'center' }}>
         <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub, letterSpacing: '4px', marginBottom: '10px' }}>
            VISUAL ARCHIVE
         </div>
         <h1 style={{ fontFamily: '"Georgia", serif', fontSize: '48px', color: COLORS.ink, margin: 0, fontStyle: 'italic' }}>
            Frozen Time.
         </h1>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 100px 40px' }}>

         {/* 空状态 */}
         {photos.length === 0 && !loading && (
             <div style={{ textAlign: 'center', padding: '60px', color: COLORS.sub, fontFamily: '"Courier New", monospace' }}>
                 <div style={{ width: '100%', height: '1px', background: COLORS.line, marginBottom: '20px' }} />
                 NO_DATA_AVAILABLE // ARCHIVE_EMPTY
             </div>
         )}

         {/* 渲染分组 */}
         {Object.entries(groupedPhotos).map(([week, groupPhotos]) => (
            <div key={week} style={{ marginBottom: '80px' }}>
                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ fontFamily: '"Courier New", monospace', fontSize: '14px', fontWeight: 'bold', color: COLORS.ink, background: COLORS.paper, padding: '5px 15px', border: `1px solid ${COLORS.line}`, borderRadius: '20px' }}>
                        {week}
                    </div>
                    <div style={{ flex: 1, height: '1px', background: COLORS.line }}></div>
                </div>

                {/* Masonry Grid */}
                <div className="masonry-grid">
                    {groupPhotos.map((photo) => (
                        <motion.div
                           key={photo.id}
                           layoutId={`photo-${photo.id}`}
                           onClick={() => setSelectedPhoto(photo)}
                           whileHover={{ y: -5, opacity: 0.9 }}
                           style={{ marginBottom: '20px', breakInside: 'avoid', cursor: 'zoom-in', position: 'relative', overflow: 'hidden', borderRadius: '2px', backgroundColor: '#eee' }}
                        >
                           {/* 使用缩略图 thumb */}
                           <img src={`${API_BASE}${photo.thumb}`} alt="moment" style={{ width: '100%', display: 'block', filter: 'grayscale(20%)' }} />
                           <div className="photo-overlay">
                              <span style={{ fontSize: '10px', color: '#fff', fontFamily: '"Courier New", monospace' }}>{photo.date}</span>
                           </div>
                        </motion.div>
                    ))}
                </div>
            </div>
         ))}

         {/* Load More Button */}
         {hasMore && (
             <div style={{ textAlign: 'center', marginTop: '60px' }}>
                 <button
                    onClick={handleLoadMore} disabled={loading}
                    style={{ background: 'transparent', border: `1px solid ${COLORS.ink}`, padding: '10px 30px', borderRadius: '30px', cursor: 'pointer', fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.ink, display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                 >
                    {loading ? 'LOADING...' : 'LOAD MORE MEMORIES'}
                    {!loading && <ArrowDown size={14} />}
                 </button>
             </div>
         )}

         {/* No More Data Line */}
         {!hasMore && photos.length > 0 && (
             <div style={{ textAlign: 'center', marginTop: '80px', display: 'flex', alignItems: 'center', gap: '20px', opacity: 0.5 }}>
                 <div style={{ flex: 1, height: '1px', background: COLORS.ink }} />
                 <span style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: COLORS.ink }}>END OF ARCHIVE</span>
                 <div style={{ flex: 1, height: '1px', background: COLORS.ink }} />
             </div>
         )}

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(235, 240, 243, 0.95)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
          >
             <div style={{ position: 'absolute', top: 40, right: 40, cursor: 'pointer', color: COLORS.ink }}><X size={32} /></div>
             <motion.div
                layoutId={`photo-${selectedPhoto.id}`}
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: COLORS.paper, padding: '20px 20px 60px 20px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
             >
                <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {/* 显示大图 src */}
                    <img src={`${API_BASE}${selectedPhoto.src}`} alt="moment" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
                </div>
                <div style={{ marginTop: '30px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', color: COLORS.sub, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>"{selectedPhoto.desc}"</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px', borderLeft: `1px solid ${COLORS.line}`, paddingLeft: '20px' }}>
                        <MetaItem icon={<Calendar size={12}/>} label={selectedPhoto.date} />
                        <MetaItem icon={<User size={12}/>} label={selectedPhoto.author} />
                        <MetaItem icon={<AlignLeft size={12}/>} label="RAW IMAGE" />
                    </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        .masonry-grid { column-count: 3; column-gap: 20px; }
        @media (max-width: 900px) { .masonry-grid { column-count: 2; } }
        @media (max-width: 600px) { .masonry-grid { column-count: 1; } }
        .photo-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); opacity: 0; transition: opacity 0.3s; }
        .masonry-grid > div:hover .photo-overlay { opacity: 1; }
      `}</style>
    </div>
  );
};

const MetaItem = ({ icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.sub, fontSize: '11px', fontFamily: '"Courier New", monospace' }}>
        {icon} <span>{label}</span>
    </div>
);

export default Gallery;
