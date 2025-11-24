import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2, Eye, ChevronLeft, AlertTriangle, Terminal, Check } from 'lucide-react';
import {API_BASE} from '../data/config';
import Footer from './Footer';

const BlogManage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 删除确认弹窗状态
  const [deleteTarget, setDeleteTarget] = useState(null); // 存储要删除的文章对象

  // 获取数据
  const fetchArticles = () => {
    fetch(`${API_BASE}/my-articles-list`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setArticles(data.articles);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // 执行删除
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/delete-article/${deleteTarget.id}`, { 
          method: 'DELETE',
          credentials: 'include'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setArticles(articles.filter(a => a.id !== deleteTarget.id)); // 本地移除
        setDeleteTarget(null); // 关闭弹窗
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Network Error");
    }
  };

  const C_RED = '#ff3333';
  const C_DIM = 'rgba(255,255,255,0.1)';

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* 顶部导航 */}
      <div style={{ height: '60px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', padding: '0 30px', justifyContent: 'space-between' }}>
        <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#888' }}>
          <ChevronLeft size={16} /> RETURN
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '2px' }}>DATABASE_MANAGER // ADMIN_MODE</div>
      </div>

      {/* 主体内容 */}
      <div className="page-container" style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
          <h1 style={{ fontSize: '48px', fontFamily: 'var(--font-sans)', fontWeight: '900', margin: 0, lineHeight: 1 }}>ARCHIVES</h1>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#444' }}>{articles.length} RECORDS FOUND</span>
        </div>

        {/* 表格头 */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 3fr 1fr 1fr 150px', padding: '15px', borderBottom: '1px solid #333', color: '#666', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
           <div>ID</div>
           <div>TITLE</div>
           <div>STATUS</div>
           <div>DATE</div>
           <div style={{ textAlign: 'right' }}>ACTIONS</div>
        </div>

        {/* 列表内容 */}
        {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#444' }}>LOADING_DATA...</div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {articles.map(art => (
                    <motion.div 
                        key={art.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ 
                            display: 'grid', gridTemplateColumns: '80px 3fr 1fr 1fr 150px', 
                            padding: '20px 15px', borderBottom: '1px solid #1a1a1a', 
                            alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '13px'
                        }}
                        whileHover={{ background: '#0a0a0a' }}
                    >
                        <div style={{ color: '#444' }}>#{art.id}</div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: '16px', color: '#eee' }}>{art.title}</div>
                        <div>
                            <span style={{ 
                                padding: '2px 6px', fontSize: '10px', 
                                background: art.status === 'published' ? 'rgba(43, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                color: art.status === 'published' ? '#2bff00' : '#888',
                                border: `1px solid ${art.status === 'published' ? 'rgba(43, 255, 0, 0.3)' : '#333'}`
                            }}>
                                {art.status.toUpperCase()}
                            </span>
                        </div>
                        <div style={{ color: '#666' }}>{art.date.split(' ')[0]}</div>
                        
                        {/* 按钮组 */}
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                            <button onClick={() => navigate(`/read/${art.id}`)} title="View" style={btnStyle}><Eye size={16} /></button>
                            <button onClick={() => navigate(`/write?id=${art.id}`)} title="Edit" style={btnStyle}><Edit3 size={16} /></button>
                            <button onClick={() => setDeleteTarget(art)} title="Delete" style={{...btnStyle, color: '#666', ':hover': { color: C_RED }}}><Trash2 size={16} /></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>

      {/* Delete Confirmation Modal (赛博风格) */}
      <AnimatePresence>
        {deleteTarget && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    style={{ background: '#111', border: `1px solid ${C_RED}`, width: '400px', padding: '30px', position: 'relative' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: C_RED, marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold' }}>
                        <AlertTriangle size={18} /> WARNING: DESTRUCTIVE ACTION
                    </div>
                    
                    <p style={{ color: '#ccc', fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: '1.5', marginBottom: '30px' }}>
                        Are you sure you want to delete article <b>"{deleteTarget.title}"</b>? <br/>
                        This action cannot be undone. Database record # {deleteTarget.id} will be erased.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button onClick={() => setDeleteTarget(null)} style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>CANCEL</button>
                        <button onClick={confirmDelete} style={{ background: C_RED, border: 'none', color: '#000', padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <Trash2 size={14} /> CONFIRM DELETE
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

const btnStyle = {
    background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s'
};

export default BlogManage;