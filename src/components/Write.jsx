import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Tag, X, Save, ChevronLeft, Clock, AlignLeft, BookOpen, PenTool, Film, Image as ImageIcon } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import NasaEditor from './editor/NasaEditor';
import { API_BASE } from '../data/config.js';
import write_bg from '../assets/natural-3273491.jpg';

// ... (COLORS, BOOKMARK_IMGS, getArticle, save, etc. 保持不变) ...
const COLORS = {
  bg: '#EBF0F3',
  deepBlue: '#2C3E50',
  warmEarth: '#8D7B68',
  textMain: '#2C3E50',
  textSub: '#7F8C8D',
  paper: '#FDFBF7',
  line: 'rgba(44, 62, 80, 0.1)'
};
const BOOKMARK_IMGS = [
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=600&auto=format&fit=crop"
];

const Write = () => {
  // ... (Hooks, States, Handlers 全部保持不变) ...
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const articleId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [bookmarkBg, setBookmarkBg] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' }));

  useEffect(() => {
    setBookmarkBg(BOOKMARK_IMGS[Math.floor(Math.random() * BOOKMARK_IMGS.length)]);
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' })), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (articleId) {
      setIsLoading(true);
      fetch(`${API_BASE}/get-article/${articleId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setTitle(data.article.title);
            setMarkdown(data.article.content || '');
            setTags(data.article.tags || []);
            setExcerpt(data.article.excerpt || '');
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    } else {
        setMarkdown('> "The memory begins with..."\n\n');
    }
  }, [articleId]);

  const handleSave = async (status) => {
    if (!title.trim()) { alert('Title is missing.'); return; }
    setIsSaving(true);
    const payload = { id: articleId, title, markdown, tags, excerpt, status };
    try {
      const response = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
         alert(`Memory ${status === 'published' ? 'published' : 'saved'} successfully.`);
         if (!articleId && result.id) navigate(`?id=${result.id}`, { replace: true });
      } else {
         alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      e.preventDefault();
      if (!tags.includes(categoryInput.trim())) setTags([...tags, categoryInput.trim()]);
      setCategoryInput('');
    }
  };
  const removeTag = (tag => setTags(tags.filter(t => t !== tag)));
  const wordCount = markdown ? markdown.split(/\s+/).filter(w => w.length > 0).length : 0;
  const readTime = Math.ceil(wordCount / 200);

  if (isLoading) return <LoadingScreen />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: COLORS.bg, position: 'relative', overflowX: 'hidden' }}>

      {/*
         Layer 0: 背景图片层 (Sky - Sea - Land)
         zIndex: 0 (最底层)
      */}
      <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '75vh',
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none' // 防止遮挡点击
      }}>
          <img
             src={write_bg}
            alt="atmosphere"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%) contrast(85%) brightness(105%) sepia(10%)' }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `linear-gradient(to bottom, transparent 0%, rgba(235, 240, 243, 0.4) 60%, ${COLORS.bg} 100%)` }} />
      </div>

      {/*
         Layer 1: 左侧胶卷 (Film Strip)
         zIndex: 10 (在背景图之上，但在内容之下，不影响正文阅读)
      */}
      <div style={{
          position: 'fixed', left: '20px', top: '0', bottom: '0', width: '40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
          opacity: 0.4,
          pointerEvents: 'none'
      }}>
          <div style={{ width: '1px', height: '100%', background: COLORS.line }}></div>
          <div style={{ position: 'absolute', top: '10%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ width: '12px', height: '18px', border: `1px solid ${COLORS.deepBlue}`, borderRadius: '2px', opacity: 0.5 }} />
              ))}
          </div>
          <div style={{ position: 'absolute', bottom: '50px' }}>
              <Film size={20} color={COLORS.deepBlue} style={{ opacity: 0.5 }} />
          </div>
      </div>

      {/*
         Layer 2: 主内容区 (Main Editor)
         zIndex: 20 (确保文字在背景图和装饰之上，可点击)
      */}
      <div style={{
          flex: 1, width: '100%', paddingTop: '100px', paddingBottom: '100px',
          position: 'relative',
          zIndex: 20
      }}>
        <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px', position: 'relative' }}>

          {/* 装饰：红色邮戳 (Postmark) - 绝对定位相对于 page-container */}
          <div style={{
              position: 'absolute', top: '-20px', right: '40px',
              width: '100px', height: '100px',
              border: '2px solid #C0392B', borderRadius: '50%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#C0392B', fontFamily: '"Courier New", monospace', fontSize: '10px', fontWeight: 'bold',
              transform: 'rotate(-15deg)', opacity: 0.6, pointerEvents: 'none',
              maskImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")'
          }}>
              <div style={{ borderBottom: '1px solid #C0392B', paddingBottom: '2px', marginBottom: '2px' }}>ARCHIVE</div>
              <div style={{ fontSize: '14px' }}>{new Date().getDate()} . {new Date().getMonth() + 1}</div>
              <div style={{ letterSpacing: '2px', marginTop: '2px' }}>2025</div>
              <div style={{ position: 'absolute', bottom: '15px', width: '60%', height: '2px', background: 'repeating-linear-gradient(90deg, #C0392B 0, #C0392B 2px, transparent 2px, transparent 4px)' }}></div>
          </div>

          {/* A. Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px', borderBottom: `1px solid ${COLORS.line}`, paddingBottom: '15px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.textSub }}>
                <Clock size={14} />
                <span>{new Date().toLocaleDateString()} . {time}</span>
             </div>
             <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.deepBlue, fontWeight: 'bold' }}>
                ADMIN_MODE
             </div>
          </div>

          {/* B. Title Input */}
          <div style={{ marginBottom: '40px' }}>
            <input
              type="text" placeholder="Untitled Memory..." value={title} onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid transparent`,
                fontSize: 'clamp(36px, 4vw, 56px)', fontFamily: '"Georgia", serif', fontWeight: 'normal', color: COLORS.deepBlue, outline: 'none', lineHeight: 1.2, transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderBottom = `1px solid ${COLORS.line}`}
              onBlur={(e) => e.target.style.borderBottom = `1px solid transparent`}
            />
            <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <Tag size={16} color={COLORS.textSub} />
                {tags.map(tag => (
                  <span key={tag} style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.textMain, padding: '4px 10px', fontSize: '11px', fontFamily: '"Courier New", monospace', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '2px' }}>
                    {tag} <X size={10} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => removeTag(tag)} />
                  </span>
                ))}
                <input type="text" placeholder="+ Tag" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} onKeyDown={handleTagInput} style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.line}`, color: COLORS.textSub, padding: '2px 5px', fontFamily: '"Courier New", monospace', fontSize: '12px', outline: 'none', width: '80px' }} />
            </div>
          </div>

          {/* C. Excerpt Area */}
          <div style={{ marginBottom: '40px', padding: '20px', background: COLORS.paper, borderLeft: `3px solid ${COLORS.warmEarth}`, borderRadius: '0 4px 4px 0' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '11px', fontFamily: '"Inter", sans-serif', color: COLORS.textSub, fontWeight: 'bold', textTransform: 'uppercase' }}>
                <PenTool size={12} /> Abstract / Summary
             </div>
             <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Write a brief summary for the archive index..." style={{ width: '100%', background: 'transparent', border: 'none', color: COLORS.textMain, fontFamily: '"Georgia", serif', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic', minHeight: '60px', outline: 'none', resize: 'vertical' }} />
          </div>

          {/* D. Main Editor */}
          <div style={{ minHeight: '60vh', marginBottom: '60px' }}>
            <NasaEditor value={markdown} onChange={(v) => setMarkdown(v)} />
          </div>

          {/* E. Footer Stats */}
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: '20px', display: 'flex', justifyContent: 'space-between', color: COLORS.textSub, fontFamily: '"Courier New", monospace', fontSize: '11px' }}>
             <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlignLeft size={14} /> {wordCount} Words</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={14} /> {readTime} Min Read</span>
             </div>
             <div>AUTO-SAVING ENABLED</div>
          </div>
        </div>
      </div>

      {/*
         Layer 3: 右侧书签 (Sidebar)
         zIndex: 999 (最高层级，确保无论如何都能点到)
      */}
      <motion.div
        initial={{ x: 'calc(100% - 40px)' }}
        animate={{ x: isHovered ? 0 : 'calc(100% - 40px)' }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        style={{ position: 'fixed', right: 0, top: '15%', zIndex: 999, display: 'flex', height: '500px', filter: 'drop-shadow(-5px 5px 15px rgba(0,0,0,0.15))', cursor: 'pointer' }}
      >
          {/* 左侧：拉手 */}
          <div style={{ width: '40px', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: `1px solid ${COLORS.line}` }}>
             <ChevronLeft size={20} color={COLORS.deepBlue} />
             <div style={{ writingMode: 'vertical-rl', marginTop: '20px', fontFamily: '"Courier New", monospace', fontSize: '10px', letterSpacing: '2px', color: COLORS.textSub }}>ACTIONS</div>
          </div>
          {/* 右侧：书签主体 */}
          <div style={{ width: '280px', position: 'relative', overflow: 'hidden', backgroundColor: COLORS.deepBlue }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
               <img src={bookmarkBg} alt="bookmark" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, filter: 'grayscale(30%)' }} />
               <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(44,62,80,0.8), rgba(44,62,80,0.9))' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1, padding: '40px 30px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff' }}>
                <div>
                   <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', opacity: 0.7, letterSpacing: '2px', marginBottom: '10px' }}>STATUS: {isSaving ? 'SAVING...' : 'WRITING'}</div>
                   <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '28px', fontStyle: 'italic', margin: 0 }}>Control Panel</h2>
                   <div style={{ width: '40px', height: '2px', background: COLORS.warmEarth, marginTop: '15px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   <button onClick={() => handleSave('draft')} disabled={isSaving} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '15px', color: '#fff', fontFamily: '"Inter", sans-serif', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backdropFilter: 'blur(5px)' }}><span>Save as Draft</span><Save size={16} /></button>
                   <button onClick={() => handleSave('published')} disabled={isSaving} style={{ background: '#fff', border: 'none', padding: '15px', color: COLORS.deepBlue, fontFamily: '"Inter", sans-serif', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}><span>Publish Now</span><UploadCloud size={16} /></button>
                </div>
                <div style={{ fontSize: '10px', fontFamily: '"Courier New", monospace', opacity: 0.5, textAlign: 'center' }}>System Ready.</div>
            </div>
          </div>
      </motion.div>

      <Footer />
    </div>
  );
};

// ... LoadingScreen ...
const LoadingScreen = () => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: COLORS.bg, flexDirection: 'column' }}>
     <div style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', color: COLORS.textSub, marginBottom: '20px' }}>Retrieving manuscript...</div>
     <motion.div animate={{ width: ['0px', '100px'] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ height: '2px', background: COLORS.deepBlue }} />
  </div>
);

export default Write;
