import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2, Eye, ChevronLeft, AlertTriangle, FileText, CheckCircle, Clock } from 'lucide-react';
import { API_BASE } from '../data/config';
import Footer from './Footer';
import { useUser } from '../context/UserContext';
// 🎨 默认主题 (如果加载失败时的兜底)
const DEFAULT_THEME = {
  color: '#EBF0F3',
  opacity: 90,
  gradientStop: 60
};

const BlogManage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // --- 1. 背景与主题状态 ---
const { bgUrl, themeConfig } = useUser();

  // --- 2. 初始化数据 (合并请求) ---
  useEffect(() => {
    const initData = async () => {
      try {
        // 并行请求：文章列表 + 用户信息(含主题) + 背景图
        const [articlesRes, infoRes, bgRes] = await Promise.all([
          fetch(`${API_BASE}/my-articles-list`, { credentials: 'include' }),
          fetch(`${API_BASE}/user-info`, { credentials: 'include' }),
          fetch(`${API_BASE}/get-background`, { credentials: 'include' })
        ]);

        // A. 处理文章列表
        const articlesData = await articlesRes.json();
        if (articlesData.status === 'success') setArticles(articlesData.articles);

        // B. 处理主题配置
        const infoData = await infoRes.json();
        if (infoData.success && infoData.data.themeConfig) {
          setThemeConfig(infoData.data.themeConfig);
        }

        // C. 处理背景图
        if (bgRes.ok) {
          const blob = await bgRes.blob();
          setBgUrl(URL.createObjectURL(blob));
        }

      } catch (err) {
        console.error("Init failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // --- 3. 删除逻辑 ---
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/delete-article/${deleteTarget.id}`, {
          method: 'DELETE',
          credentials: 'include'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setArticles(articles.filter(a => a.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Network Error");
    }
  };

  // --- 4. 动态背景样式生成器 ---
  const getBackgroundStyle = () => {
      if (!themeConfig) return { background: '#EBF0F3' }; // 防空
    const t = themeConfig;
    // Hex to RGB
    let r=0, g=0, b=0;
    if(t.color.length === 4) {
      r = parseInt(t.color[1]+t.color[1], 16);
      g = parseInt(t.color[2]+t.color[2], 16);
      b = parseInt(t.color[3]+t.color[3], 16);
    } else if (t.color.length === 7) {
      r = parseInt(t.color.substring(1,3), 16);
      g = parseInt(t.color.substring(3,5), 16);
      b = parseInt(t.color.substring(5,7), 16);
    }
    const alpha = t.opacity / 100;
    const rgbaColor = `rgba(${r},${g},${b},${alpha})`;

    // 生成与 Profile 一致的渐变掩膜
    return `linear-gradient(to bottom, rgba(${r},${g},${b},0.4) 0%, ${rgbaColor} ${t.gradientStop}%, ${t.color} 100%)`;
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden', fontFamily: '"Inter", sans-serif' }}>

      {/* LAYER 0: 背景层 (复用 Profile 逻辑) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        {bgUrl && (
          <img src={bgUrl} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: getBackgroundStyle() }} />
      </div>

      {/* LAYER 1: 顶部导航 */}
      <div style={{
          height: '80px', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(5px)'
      }}>
        <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: '"Courier New", monospace', color: '#555' }}>
          <ChevronLeft size={16} /> BACK_TO_PROFILE
        </div>
        <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', letterSpacing: '1px', opacity: 0.6 }}>
           CONTENT_MANAGER
        </div>
      </div>

      {/* LAYER 2: 主体内容 */}
      <div className="page-container" style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header Title */}
        <div style={{ marginBottom: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
             <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#7F8C8D', marginBottom: '10px' }}>ARCHIVE INDEX</div>
             <h1 style={{ fontSize: '48px', fontFamily: '"Georgia", serif', fontStyle: 'italic', margin: 0, color: '#2C3E50' }}>
               Manage Stories.
             </h1>
          </div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#2C3E50', borderBottom: '2px solid #2C3E50', paddingBottom: '5px' }}>
             {articles.length} ENTRIES
          </div>
        </div>

        {/* 列表容器：白色卡片 */}
        <div style={{
            background: '#FDFBF7', // 纸张色
            borderRadius: '2px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        }}>

            {/* Table Header */}
            <div style={{
                display: 'grid', gridTemplateColumns: '80px 3fr 120px 120px 120px',
                padding: '20px 30px', borderBottom: '2px solid #eee',
                color: '#95A5A6', fontFamily: '"Courier New", monospace', fontSize: '11px', letterSpacing: '1px'
            }}>
               <div>ID</div>
               <div>TITLE</div>
               <div>STATUS</div>
               <div>DATE</div>
               <div style={{ textAlign: 'right' }}>ACTIONS</div>
            </div>

            {/* List Items */}
            {loading ? (
                 <div style={{ padding: '60px', textAlign: 'center', fontFamily: '"Georgia", serif', fontStyle: 'italic', color: '#999' }}>
                    Retrieving records...
                 </div>
            ) : (
                <div>
                    {articles.map(art => (
                        <motion.div
                            key={art.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            style={{
                                display: 'grid', gridTemplateColumns: '80px 3fr 120px 120px 120px',
                                padding: '25px 30px', borderBottom: '1px solid #f0f0f0',
                                alignItems: 'center', transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ fontFamily: '"Courier New", monospace', color: '#BDC3C7', fontSize: '12px' }}>
                                #{art.id.toString().padStart(3, '0')}
                            </div>

                            <div style={{ fontFamily: '"Georgia", serif', fontSize: '18px', color: '#2C3E50', fontWeight: '500' }}>
                                {art.title || "Untitled"}
                            </div>

                            {/* Status Badge */}
                            <div>
                                <span style={{
                                    padding: '4px 8px', fontSize: '10px', fontFamily: '"Courier New", monospace', fontWeight: 'bold', borderRadius: '4px',
                                    backgroundColor: art.status === 'published' ? '#E8F8F5' : '#FEF9E7',
                                    color: art.status === 'published' ? '#1ABC9C' : '#F39C12',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                }}>
                                    {art.status === 'published' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                    {art.status.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ color: '#95A5A6', fontSize: '12px', fontFamily: '"Courier New", monospace' }}>
                                {art.date.split(' ')[0].replace(/-/g, '.')}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                <IconButton onClick={() => navigate(`/read/${art.id}`)} icon={<Eye size={16} />} tooltip="View" />
                                <IconButton onClick={() => navigate(`/write?id=${art.id}`)} icon={<Edit3 size={16} />} tooltip="Edit" />
                                <IconButton onClick={() => setDeleteTarget(art)} icon={<Trash2 size={16} />} tooltip="Delete" color="#E74C3C" />
                            </div>
                        </motion.div>
                    ))}

                    {articles.length === 0 && (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#ccc' }}>
                           <FileText size={40} strokeWidth={1} style={{ marginBottom: '10px', opacity: 0.5 }} />
                           <div style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>No articles found.</div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Delete Confirmation Modal (优雅风格) */}
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
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontFamily: '"Georgia", serif', color: '#2C3E50' }}>Delete Article?</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#7F8C8D', lineHeight: '1.6' }}>
                            You are about to delete <b>"{deleteTarget.title}"</b>.<br/>
                            This process cannot be undone.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={() => setDeleteTarget(null)}
                            style={{ flex: 1, background: '#f5f5f5', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: '600', color: '#555' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            style={{ flex: 1, background: '#E74C3C', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: '600', color: '#fff' }}
                        >
                            Confirm Delete
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

// 子组件：图标按钮
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
