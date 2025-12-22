import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, ChevronLeft, FileText, LayoutList, Image as ImageIcon } from 'lucide-react';
import { API_BASE } from '../data/config';
import Footer from '../components/Footer';

const PublicAuthorSpace = () => {
  const navigate = useNavigate();
  const { username } = useParams(); // 获取 URL 中的 username
  const [activeTab, setActiveTab] = useState('articles');

  const [articles, setArticles] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewPhoto, setViewPhoto] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 请求该作者的公开数据
        const [artRes, photoRes] = await Promise.all([
          fetch(`${API_BASE}/public-author/${username}/articles?limit=50`),
          fetch(`${API_BASE}/public-author/${username}/photos?limit=50`)
        ]);

        const artData = await artRes.json();
        const photoData = await photoRes.json();

        if (artData.status === 'success') setArticles(artData.articles);
        if (photoData.status === 'success') setPhotos(photoData.photos);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#EBF0F3', fontFamily: '"Inter", sans-serif' }}>

      {/* 背景层 (复用 Search Result 里的接口) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
         <img
            src={`${API_BASE}/author-background/${username}`}
            onError={(e) => e.target.style.display = 'none'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
         />
         <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(235,240,243,0.8) 0%, rgba(235,240,243,0.95) 100%)' }} />
      </div>

      {/* 顶部导航 */}
      <div style={{ position: 'relative', zIndex: 10, height: '80px', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between' }}>
        <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: '"Courier New", monospace', color: '#555' }}>
          <ChevronLeft size={16} /> BACK
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.5)', padding: '4px', borderRadius: '8px' }}>
            <TabButton active={activeTab === 'articles'} icon={<LayoutList size={14} />} label="ARTICLES" onClick={() => setActiveTab('articles')} />
            <TabButton active={activeTab === 'photos'} icon={<ImageIcon size={14} />} label="PHOTOS" onClick={() => setActiveTab('photos')} />
        </div>
      </div>

      {/* 主体内容 */}
      <div className="page-container" style={{ position: 'relative', zIndex: 10, padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ marginBottom: '40px' }}>
             <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#7F8C8D', marginBottom: '10px' }}>PUBLIC SPACE</div>
             <h1 style={{ fontSize: '48px', fontFamily: '"Georgia", serif', fontStyle: 'italic', margin: 0, color: '#2C3E50' }}>
               {username}'s Collection.
             </h1>
        </div>

        <div style={{ background: '#FDFBF7', borderRadius: '2px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', minHeight: '400px', padding: '30px' }}>

            {loading ? (
                 <div style={{ padding: '100px', textAlign: 'center', color: '#999' }}>Retrieving...</div>
            ) : (
                <>
                    {/* Articles List */}
                    {activeTab === 'articles' && (
                        <div>
                            {articles.map(art => (
                                <motion.div
                                    key={art.id} whileHover={{ x: 5 }}
                                    onClick={() => navigate(`/read/${art.id}`)}
                                    style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                                >
                                    <div>
                                        <div style={{ fontSize: '18px', fontFamily: '"Georgia", serif', color: '#2C3E50' }}>{art.title}</div>
                                        <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>{art.preview}</div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#ccc', fontFamily: '"Courier New", monospace' }}>{art.date.split(' ')[0]}</div>
                                </motion.div>
                            ))}
                            {articles.length === 0 && <EmptyState />}
                        </div>
                    )}

                    {/* Photos Grid */}
                    {activeTab === 'photos' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                            {photos.map(photo => (
                                <motion.div
                                    key={photo.id}
                                    onClick={() => setViewPhoto(photo)}
                                    whileHover={{ y: -5 }}
                                    style={{ aspectRatio: '1/1', borderRadius: '4px', overflow: 'hidden', cursor: 'zoom-in', position: 'relative' }}
                                >
                                    <img src={`${API_BASE}${photo.thumb}`} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0} />
                                </motion.div>
                            ))}
                            {photos.length === 0 && <EmptyState />}
                        </div>
                    )}
                </>
            )}
        </div>
      </div>

      {/* Lightbox */}
      {viewPhoto && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setViewPhoto(null)}>
              <img src={`${API_BASE}${viewPhoto.src}`} alt="full" style={{ maxWidth: '90%', maxHeight: '90%' }} />
          </div>
      )}

      <Footer />
    </div>
  );
};

const TabButton = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: active ? '#fff' : 'transparent', color: active ? '#2C3E50' : '#7F8C8D' }}>
        {icon} {label}
    </button>
);

const EmptyState = () => (
    <div style={{ padding: '60px', textAlign: 'center', color: '#ccc', fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
       No public records found.
    </div>
);

export default PublicAuthorSpace;
