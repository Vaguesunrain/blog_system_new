import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import gemoji from '@bytemd/plugin-gemoji';
import highlight from '@bytemd/plugin-highlight';
import { ChevronLeft, Eye, Clock, Hash, AlertTriangle, FileText, Share2, User } from 'lucide-react'; 
import Footer from '../Footer';
import {API_BASE} from '../../data/config';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/vs2015.css';


import '../../bytemd-override.css';

const plugins = [gfm(), gemoji(), highlight()];

const Read = () => {
  const { id } = useParams(); // 获取 URL 中的 /read/:id
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取数据并增加阅读数
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/read-article/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setArticle(data.article);
        } else {
          setError(data.message);
        }
      })
      .catch(err => setError("NET_LINK_FAILURE"))
      .finally(() => setLoading(false));
  }, [id]);

  // --- 加载状态 UI ---
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen msg={error} />;

  // --- 颜色变量 ---
  const C_ACCENT = '#ff4d00';
  const C_DIM = 'rgba(255,255,255,0.4)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0a0a', color: '#fff', overflowX: 'hidden' }}>

      {/* 1. 顶部导航栏 (HUD Style) */}
      <motion.div
        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
          background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px'
        }}
      >
        <div
          onClick={() => navigate('/blog')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        >
          <ChevronLeft size={16} color={C_ACCENT} />
          <span style={{ letterSpacing: '2px' }}>RETURN_ROOT</span>
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: C_DIM }}>
          <span>PROTOCOL: READ_ONLY_V1</span>
          <span>SECURE_CONNECTION</span>
        </div>
      </motion.div>

      {/* 2. 主要内容区域 */}
      <div className="page-container" style={{ flex: 1, width: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: '120px', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}>

        {/* 文章头部信息 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          {/* Meta Tags */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
             <span style={{ color: C_ACCENT, border: `1px solid ${C_ACCENT}`, padding: '2px 6px' }}>
                PID: {article.id.toString().padStart(4, '0')}
             </span>
             {article.tags.map(tag => (
                 <span key={tag} style={{ background: '#222', padding: '2px 8px', color: '#ccc' }}>#{tag}</span>
             ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 64px)', fontFamily: 'var(--font-sans)', fontWeight: '900',
            lineHeight: 1.1, marginBottom: '30px', textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            {article.title}
          </h1>

          {/* Info Bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '15px 0', marginBottom: '60px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#888'
          }}>
             <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {article.date}</span>
               
<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
  <FileText size={14} /> 
  <span style={{ marginRight: '4px' }}>AUTHOR:</span>
  
  {/* {圖像部分，可以選擇要不要} */}
  {/* <div style={{ 
      width: '20px', height: '20px', borderRadius: '50%', 
      background: '#333', overflow: 'hidden', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid #444'
  }}>
    {!imgError ? (
      <img 
       
        src={`${API_BASE}/get-author-avatar/${article.author_username || article.author}`} 
        alt="avatar"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setImgError(true)}
      />
    ) : (
      <User size={12} color="#999" />
    )}
  </div> */}

  
      <span style={{ fontWeight: 'bold', color: '#fff', borderBottom: '1px dashed #666' }}>
        {article.author_nickname || article.author}
      </span>
            </div>

             </div>

             <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                    <Eye size={14} color={C_ACCENT} />
                    VIEWS: {article.views} <span style={{color: C_ACCENT, fontSize:'10px'}}>+1</span>
                </span>
                <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Share2 size={16} /></button>
             </div>
          </div>

        </motion.div>

        {/* --- Markdown 内容渲染器 --- */}
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
            style={{ minHeight: '400px', position: 'relative' }}
        >
            {/* 左侧装饰线 */}
            <div style={{ position: 'absolute', left: '-20px', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(to bottom, #ff4d00, transparent)' }} />

            {/* 这里的 className 'markdown-body' 用于在 CSS 中覆盖默认样式 */}
            <div className="dark-mode-viewer" style={{ fontSize: '16px', lineHeight: 1.8, color: '#e0e0e0' }}>
                <Viewer
                    value={article.content}
                    plugins={plugins}
                />
            </div>

            {/* 底部结束符 */}
            <div style={{ marginTop: '80px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#444' }}>
                *** END OF LOG ***
            </div>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
};

// 辅助组件：加载界面
const LoadingScreen = () => (
    <div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-mono)' }}>
        <motion.div
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ width: '40px', height: '40px', border: '2px solid #333', borderTopColor: '#ff4d00', borderRadius: '50%' }}
        />
        <div style={{ color: '#ff4d00', fontSize: '12px', letterSpacing: '2px' }}>DOWNLOADING_PACKET...</div>
    </div>
);

// 辅助组件：错误界面
const ErrorScreen = ({ msg }) => (
    <div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-mono)' }}>
        <AlertTriangle size={48} color="#ff4d00" />
        <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>SYSTEM_ERROR</div>
        <div style={{ color: '#666' }}>{msg}</div>
        <a href="/blog" style={{ color: '#ff4d00', textDecoration: 'underline', fontSize: '12px', marginTop: '20px' }}>RETURN TO SAFETY</a>
    </div>
);

export default Read;
