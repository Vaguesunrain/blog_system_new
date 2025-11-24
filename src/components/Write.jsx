import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Tag, X, Save, ChevronLeft, Activity, Clock, AlignLeft, Wifi, FileText } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import NasaEditor from './editor/NasaEditor';
import { API_BASE } from '../data/config.js';

const Write = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const articleId = searchParams.get('id');

  const [title, setTitle] = useState('');

  const [excerpt, setExcerpt] = useState(''); 
  const [markdown, setMarkdown] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ... (时间、字数统计逻辑不变) ...
  const wordCount = markdown ? markdown.split(/\s+/).filter(w => w.length > 0).length : 0;
  const readTime = Math.ceil(wordCount / 200);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
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
          } else {
            alert('文章加载失败: ' + data.message);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    } else {
        setMarkdown('# LOG ENTRY: NEW\n\nStart typing...');
    }
  }, [articleId]);

  const handleSave = async (status) => {
    if (!title.trim()) {
      alert('请输入标题 / ERROR: TITLE_REQUIRED');
      return;
    }

    setIsSaving(true);
    const payload = {
      id: articleId,
      title,
      markdown,
      tags,
      excerpt, 
      status
    };

    try {
      const response = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      // ... (后续处理不变) ...
      const result = await response.json();
      if (response.ok && result.status === 'success') {
         alert(`SUCCESS: ${status.toUpperCase()} SAVED`);
         if (!articleId && result.id) navigate(`?id=${result.id}`, { replace: true });
      } else {
         alert(`ERROR: ${result.message}`);
      }
    } catch (error) {
      console.error('Save failed', error);
      alert('SYSTEM_FAILURE: NET_ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  // ... (标签处理函数 handleTagInput, removeTag 不变) ...
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      e.preventDefault();
      if (!tags.includes(categoryInput.trim())) {
        setTags([...tags, categoryInput.trim()]);
      }
      setCategoryInput('');
    }
  };
  const removeTag = (tag => setTags(tags.filter(t => t !== tag)));

  const C_ORANGE = '#ff4d00';
  const C_BLUE = '#38bdf8';
  const C_GREEN = '#2bff00';

  if (isLoading) return <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#000', color:'#fff', fontFamily:'var(--font-mono)'}}>LOADING DATA STREAM...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <motion.div
        initial={{ x: 'calc(100% - 60px)' }}
        whileHover={{ x: 0 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        style={{ position: 'fixed', right: 0, top: '20%', zIndex: 999, display: 'flex', alignItems: 'stretch', height: '380px', filter: 'drop-shadow(-10px 10px 20px rgba(0,0,0,0.5))' }}
      >
          {/* ... Sidebar 内容 ... */}
          <AnimatePresence>{!isHovered && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ position: 'absolute', left: '-160px', top: '45px', display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold', color: '#000', background: '#fff', padding: '4px 8px', clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}>::: OPEN_OPS :::</div><motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronLeft size={24} color="#fff" /></motion.div></motion.div>)}</AnimatePresence>
          <motion.div animate={{ backgroundColor: isHovered ? '#000000' : '#ffffff', color: isHovered ? '#ffffff' : '#000000', borderLeftColor: isHovered ? '#333' : '#fff' }} style={{ width: '60px', borderLeft: '1px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 88%)', paddingBottom: '40px' }}><div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '900', letterSpacing: '4px', gap: '20px', display: 'flex', alignItems: 'center' }}><span style={{ fontSize: '10px', opacity: 0.6 }}>SYSTEM</span><span>MENU</span></div><div style={{ marginTop: '20px' }}><Activity size={16} /></div></motion.div>
          <div style={{ width: '300px', backgroundColor: '#ffffff', color: '#000000', padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', clipPath: 'polygon(0 0, 100% 0, 100% 95%, 0 100%)' }}><div><div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#666', letterSpacing: '1px', marginBottom: '10px' }}>// READY_TO_PUBLISH?</div><div style={{ fontSize: '28px', fontFamily: 'var(--font-sans)', fontWeight: '900', lineHeight: '1', marginBottom: '5px' }}>{isSaving ? 'SAVING...' : 'AWAITING\nINPUT'}</div><div style={{ width: '100%', height: '4px', background: '#eee', marginTop: '20px' }}><motion.div animate={{ width: isSaving ? '100%' : '40%' }} style={{ height: '100%', background: '#000' }} /></div></div><div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}><button onClick={() => handleSave('draft')} disabled={isSaving} style={{ background: 'transparent', border: '1px solid #000', color: '#000', padding: '12px', cursor: isSaving ? 'wait' : 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isSaving ? 0.5 : 1 }}><span>SAVE_DRAFT</span> <Save size={14} /></button><button onClick={() => handleSave('published')} disabled={isSaving} style={{ background: '#000', border: 'none', color: '#fff', padding: '14px', cursor: isSaving ? 'wait' : 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', opacity: isSaving ? 0.5 : 1 }}><span>PUBLISH_NOW</span> <UploadCloud size={16} /></button></div><div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#999', borderTop: '1px solid #eee', paddingTop: '10px' }}>SECURE CHANNEL: #88-X2</div></div>
      </motion.div>


      <div style={{ flex: 1, width: '100%', paddingTop: '100px', paddingBottom: '60px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '40px', top: '150px', bottom: '100px', width: '2px', background: 'rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           {/* ... */}
           <div style={{ width: '6px', height: '6px', background: C_BLUE, borderRadius: '50%', marginBottom: '10px' }}></div>
           <div style={{ width: '10px', height: '1px', background: '#fff', margin: '20px 0', opacity: 0.5 }}></div>
        </div>

        <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>
          
          {/* HUD Header */}
          <div style={{ background: '#fff', color: '#000', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '40px', clipPath: 'polygon(0 0, 100% 0, 100% 80%, 98% 100%, 0 100%)' }}>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <span style={{ fontWeight: '900', letterSpacing: '1px' }}>EDITOR_PROTOCOL_V2</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}><Clock size={12} /> {time} UTC</span>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: C_ORANGE, color: '#fff', padding: '2px 8px', fontWeight: 'bold', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></div> REC
              </motion.div>
              <span style={{ fontWeight: 'bold' }}>USER: ADMIN</span>
            </div>
          </div>


          {/* 标题输入区 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
              <input type="text" placeholder="ENTER_SUBJECT_TITLE..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 'clamp(32px, 4vw, 56px)', fontFamily: 'var(--font-sans)', fontWeight: '900', color: 'var(--solid-white)', outline: 'none', textTransform: 'uppercase', lineHeight: 1 }} />
            </div>

            {/* Tags */}
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}><Tag size={16} /> TAGS:</div>
                {tags.map(tag => (<div key={tag} style={{ background: '#fff', color: '#000', padding: '2px 8px', fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>{tag} <X size={10} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} /></div>))}
                <input type="text" placeholder="ADD +" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} onKeyDown={handleTagInput} style={{ background: 'transparent', borderBottom: `1px solid ${C_BLUE}`, color: C_BLUE, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: '12px', outline: 'none', width: '100px' }} />
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* 摘要输入区域 (Manual Excerpt) */}
          {/* ----------------------------------------------------------- */}
          <div style={{ marginBottom: '30px', position: 'relative' }}>
             <div style={{ 
                 display: 'flex', alignItems: 'center', gap: '6px', 
                 color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '8px' 
             }}>
                 <FileText size={14} /> MANUAL_EXCERPT // <span style={{ opacity: 0.5 }}>Optional for SEO & Preview</span>
             </div>
             
             <div style={{ position: 'relative' }}>
                 {/* 左侧装饰条 */}
                 <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: C_ORANGE, opacity: 0.7 }}></div>
                 
                 <textarea 
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="> Input a brief summary of the log entry..."
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderLeft: 'none', // 左侧用装饰条代替
                        color: '#ddd',
                        padding: '15px 20px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        minHeight: '80px',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'all 0.3s'
                    }}
                    onFocus={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                    onBlur={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                 />
                 
                 {/* 右下角字数统计 */}
                 <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>
                     {excerpt.length} CHARS
                 </div>
             </div>
          </div>
          {/* ----------------------------------------------------------- */}


          {/* 编辑器区域 */}
          <div style={{ minHeight: '500px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px', maxWidth: '100%' }}>
            <NasaEditor value={markdown} onChange={(v) => setMarkdown(v)} />
          </div>

          {/* 底部统计栏 */}
          <div style={{ marginTop: '20px', background: '#fff', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', color: '#000', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 2% 100%, 0 70%)' }}>
            {/* ... 保持不变 */}
             <div style={{ display: 'flex', gap: '20px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlignLeft size={14} /> WORDS: {wordCount}</span><span style={{ opacity: 0.5 }}>|</span><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> READ: {readTime} MIN</span></div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#666', fontSize: '10px' }}>AUTO-SYNC ENABLED</span><div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C_GREEN, background: '#000', padding: '4px 8px', borderRadius: '2px' }}><Wifi size={10} /><span style={{ fontSize: '10px' }}>ONLINE</span></div></div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Write;