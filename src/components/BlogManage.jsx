import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit3, Trash2, Eye, ChevronLeft, AlertTriangle, FileText, CheckCircle, Clock, Image as ImageIcon, LayoutList, X } from 'lucide-react';
import { API_BASE } from '../data/config';
import Footer from './Footer';
import { useUser } from '../context/UserContext';

const BlogManage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. 获取当前 Tab (默认 articles)
  const activeTab = searchParams.get('tab') || 'articles';

  // 2. 数据状态
  const [articles, setArticles] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. 交互状态
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, type: 'article'|'photo', title }
  const [viewPhoto, setViewPhoto] = useState(null);       // 查看大图

  // 4. 从 Context 获取背景 (省流量)
  const { bgUrl, themeConfig } = useUser();
const [photoOffset, setPhotoOffset] = useState(0);
  const [hasMorePhotos, setHasMorePhotos] = useState(false);
  const PHOTO_LIMIT = 16;
  // --- 初始化数据 ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 并行请求：文章列表 + 图片列表
        const [artRes, photoRes] = await Promise.all([
          fetch(`${API_BASE}/my-articles-list`, { credentials: 'include' }),
          fetch(`${API_BASE}/my-photos?limit=${PHOTO_LIMIT}&offset=0`, { credentials: 'include' })
        ]);

        const artData = await artRes.json();
        const photoData = await photoRes.json();

        if (artData.status === 'success') setArticles(artData.articles);
        if (photoData.status === 'success'){
          setPhotos(photoData.photos);
            setHasMorePhotos(photoData.has_more);
            setPhotoOffset(PHOTO_LIMIT);
        }

      } catch (err) {
        console.error("Data Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
// --- 加载更多照片 ---
  const loadMorePhotos = async () => {
      try {
          const res = await fetch(`${API_BASE}/my-photos?limit=${PHOTO_LIMIT}&offset=${photoOffset}`, { credentials: 'include' });
          const data = await res.json();
          if (data.status === 'success') {
              setPhotos(prev => [...prev, ...data.photos]);
              setHasMorePhotos(data.has_more);
              setPhotoOffset(prev => prev + PHOTO_LIMIT);
          }
      } catch (e) {
          console.error(e);
      }
  };

  // --- 切换 Tab ---
  const switchTab = (tab) => {
    setSearchParams({ tab });
  };

  // --- 删除逻辑 (通用) ---
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const isPhoto = deleteTarget.type === 'photo';
    const endpoint = isPhoto
        ? `${API_BASE}/delete-photo/${deleteTarget.id}`
        : `${API_BASE}/delete-article/${deleteTarget.id}`;

    try {
      const res = await fetch(endpoint, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();

      if (data.status === 'success') {
        if (isPhoto) {
            setPhotos(photos.filter(p => p.id !== deleteTarget.id));
        } else {
            setArticles(articles.filter(a => a.id !== deleteTarget.id));
        }
        setDeleteTarget(null);
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Network Error");
    }
  };

  // --- 背景样式 ---
  const getBackgroundStyle = () => {
    if (!themeConfig) return { background: '#EBF0F3' };
    const t = themeConfig;
    let r=0, g=0, b=0;
    if(t.color.length === 4) {
      r = parseInt(t.color[1]+t.color[1], 16); g = parseInt(t.color[2]+t.color[2], 16); b = parseInt(t.color[3]+t.color[3], 16);
    } else if (t.color.length === 7) {
      r = parseInt(t.color.substring(1,3), 16); g = parseInt(t.color.substring(3,5), 16); b = parseInt(t.color.substring(5,7), 16);
    }
    const alpha = t.opacity / 100;
    const rgbaColor = `rgba(${r},${g},${b},${alpha})`;
    return `linear-gradient(to bottom, rgba(${r},${g},${b},0.4) 0%, ${rgbaColor} ${t.gradientStop}%, ${t.color} 100%)`;
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden', fontFamily: '"Inter", sans-serif' }}>

      {/* 背景层 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        {bgUrl && <img src={bgUrl} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: getBackgroundStyle() }} />
      </div>

      {/* 顶部导航 */}
      <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: '"Courier New", monospace', color: '#555' }}>
          <ChevronLeft size={16} /> BACK_TO_PROFILE
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.5)', padding: '4px', borderRadius: '8px' }}>
            <TabButton
                active={activeTab === 'articles'}
                icon={<LayoutList size={14} />}
                label="ARTICLES"
                onClick={() => switchTab('articles')}
            />
            <TabButton
                active={activeTab === 'photos'}
                icon={<ImageIcon size={14} />}
                label="PHOTOS"
                onClick={() => switchTab('photos')}
            />
        </div>
      </div>

      {/* 主体内容 */}
      <div className="page-container" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
             <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#7F8C8D', marginBottom: '10px' }}>
                 {activeTab === 'articles' ? 'TEXT ARCHIVE' : 'VISUAL ARCHIVE'}
             </div>
             <h1 style={{ fontSize: '48px', fontFamily: '"Georgia", serif', fontStyle: 'italic', margin: 0, color: '#2C3E50' }}>
               {activeTab === 'articles' ? 'Manage Stories.' : 'Manage Visuals.'}
             </h1>
          </div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#2C3E50', borderBottom: '2px solid #2C3E50', paddingBottom: '5px' }}>
             {activeTab === 'articles' ? articles.length : photos.length} RECORDS
          </div>
        </div>

        {/* 列表容器 */}
        <div style={{ background: '#FDFBF7', borderRadius: '2px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', minHeight: '400px' }}>

            {loading ? (
                 <div style={{ padding: '100px', textAlign: 'center', fontFamily: '"Georgia", serif', fontStyle: 'italic', color: '#999' }}>Loading Database...</div>
            ) : (
                <>
                    {/* --- MODE 1: ARTICLE LIST --- */}
                    {activeTab === 'articles' && (
                        <div>
                            {/* Table Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 3fr 120px 120px 120px', padding: '20px 30px', borderBottom: '2px solid #eee', color: '#95A5A6', fontFamily: '"Courier New", monospace', fontSize: '11px', letterSpacing: '1px' }}>
                               <div>ID</div><div>TITLE</div><div>STATUS</div><div>DATE</div><div style={{ textAlign: 'right' }}>ACTIONS</div>
                            </div>

                            {articles.map(art => (
                                <motion.div
                                    key={art.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                    style={{ display: 'grid', gridTemplateColumns: '80px 3fr 120px 120px 120px', padding: '25px 30px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}
                                >
                                    <div style={{ fontFamily: '"Courier New", monospace', color: '#BDC3C7', fontSize: '12px' }}>#{art.id}</div>
                                    <div style={{ fontFamily: '"Georgia", serif', fontSize: '18px', color: '#2C3E50', fontWeight: '500' }}>{art.title}</div>
                                    <div><StatusBadge status={art.status} /></div>
                                    <div style={{ color: '#95A5A6', fontSize: '12px', fontFamily: '"Courier New", monospace' }}>{art.date.split(' ')[0]}</div>
                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                        <IconButton onClick={() => navigate(`/read/${art.id}`)} icon={<Eye size={16} />} tooltip="View" />
                                        <IconButton onClick={() => navigate(`/write?id=${art.id}`)} icon={<Edit3 size={16} />} tooltip="Edit" />
                                        <IconButton onClick={() => setDeleteTarget({ id: art.id, type: 'article', title: art.title })} icon={<Trash2 size={16} />} tooltip="Delete" color="#E74C3C" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* --- MODE 2: PHOTO GRID --- */}
                    {activeTab === 'photos' && (
                      <>
                        <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                            {photos.map(photo => (
                                <motion.div
                                    key={photo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#eee', border: '1px solid rgba(0,0,0,0.05)', group: true }}
                                >
                                    {/* 缩略图 */}
                                    <img src={`${API_BASE}${photo.thumb}`} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                                    {/* 悬浮操作层 */}
                                    <div className="photo-actions" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', opacity: 0, transition: 'opacity 0.2s' }}>
                                        <IconButton color="#fff" icon={<Eye size={20} />} onClick={() => setViewPhoto(photo)} tooltip="View Original" />
                                        <IconButton color="#ff4d4d" icon={<Trash2 size={20} />} onClick={() => setDeleteTarget({ id: photo.id, type: 'photo', title: 'Snapshot #' + photo.id })} tooltip="Delete" />
                                    </div>

                                    {/* 底部日期标签 */}
                                    <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', padding: '2px 5px', borderRadius: '2px', fontFamily: '"Courier New", monospace' }}>
                                        {photo.date}
                                    </div>
                                </motion.div>
                            ))}

                            <style>{`.photo-actions:hover { opacity: 1 !important; }`}</style>
                        </div>
                        {hasMorePhotos && (
                          <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #eee' }}>
                            <button
                            onClick={loadMorePhotos}
                            style={{
                            background: '#fff', border: '1px solid #ddd', padding: '8px 20px',
                            borderRadius: '20px', cursor: 'pointer', fontSize: '12px',
                            color: '#555', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                              }}
                          >
                        LOAD MORE (+16)
                        </button>
                        </div>
                        )}
                      </>
                    )}

                    {/* Empty State */}
                    {((activeTab === 'articles' && articles.length === 0) || (activeTab === 'photos' && photos.length === 0)) && (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#ccc' }}>
                           <FileText size={40} strokeWidth={1} style={{ marginBottom: '10px', opacity: 0.5 }} />
                           <div style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>No records found in this section.</div>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>

      {/* --- Delete Modal (通用) --- */}
      <AnimatePresence>
        {deleteTarget && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    style={{ background: '#fff', border: '1px solid #eee', width: '420px', padding: '40px', borderRadius: '4px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ width: '50px', height: '50px', background: '#FDEDEC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C', marginBottom: '20px' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontFamily: '"Georgia", serif', color: '#2C3E50' }}>
                            Delete {deleteTarget.type === 'photo' ? 'Snapshot' : 'Article'}?
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#7F8C8D', lineHeight: '1.6' }}>
                            You are about to delete <b>"{deleteTarget.title}"</b>.<br/>
                            This process cannot be undone.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, background: '#f5f5f5', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: '600', color: '#555' }}>Cancel</button>
                        <button onClick={confirmDelete} style={{ flex: 1, background: '#E74C3C', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: '600', color: '#fff' }}>Confirm Delete</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- Photo Lightbox (查看大图) --- */}
      <AnimatePresence>
        {viewPhoto && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 40 }} onClick={() => setViewPhoto(null)}>
                <img src={`${API_BASE}${viewPhoto.src}`} alt="full" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} />
                <div style={{ position: 'absolute', top: 20, right: 20, color: '#fff', cursor: 'pointer' }}><X size={30} /></div>
            </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

// --- Sub Components ---

const TabButton = ({ active, icon, label, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
            fontSize: '11px', fontFamily: '"Inter", sans-serif', fontWeight: '600',
            background: active ? '#fff' : 'transparent',
            color: active ? '#2C3E50' : '#7F8C8D',
            boxShadow: active ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s'
        }}
    >
        {icon} {label}
    </button>
);

const StatusBadge = ({ status }) => (
    <span style={{
        padding: '4px 8px', fontSize: '10px', fontFamily: '"Courier New", monospace', fontWeight: 'bold', borderRadius: '4px',
        backgroundColor: status === 'published' ? '#E8F8F5' : '#FEF9E7',
        color: status === 'published' ? '#1ABC9C' : '#F39C12',
        display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
        {status === 'published' ? <CheckCircle size={10} /> : <Clock size={10} />}
        {status.toUpperCase()}
    </span>
);

const IconButton = ({ icon, onClick, color, tooltip }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.05)' }}
        whileTap={{ scale: 0.95 }}
        title={tooltip}
        style={{
            background: 'transparent', border: 'none',
            color: color || '#7F8C8D', cursor: 'pointer',
            padding: '8px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s'
        }}
    >
        {icon}
    </motion.button>
);

export default BlogManage;
