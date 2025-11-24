import React, { useState, useEffect, useRef } from 'react'; // 引入 useRef
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import gemoji from '@bytemd/plugin-gemoji';
import highlight from '@bytemd/plugin-highlight';
import { ChevronLeft, Eye, Clock, FileText, Share2, User, List, CornerDownRight } from 'lucide-react'; // 引入 List 图标
import Footer from '../Footer';
import {API_BASE} from '../../data/config';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/monokai.css'
import '../../bytemd-override.css';

const plugins = [gfm(), gemoji(), highlight()];

const Read = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  
  
  const [toc, setToc] = useState([]);
  const contentRef = useRef(null); // 用于定位 Viewer 容器

  // 获取数据
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


// --- 生成目录逻辑 (索引版 - 更稳健) ---
  useEffect(() => {
    if (article && !loading) {
      const timer = setTimeout(() => {
        // 1. 抓取所有标题
        const headings = document.querySelectorAll('.dark-mode-viewer h1, .dark-mode-viewer h2, .dark-mode-viewer h3');
        
        if (headings.length === 0) return;

        // 2. 生成数据 (不修改 DOM，只记录它是第几个)
        const tocData = Array.from(headings).map((head, index) => {
           return {
             index: index, // 核心：记录它是第几个标题
             text: head.innerText,
             level: parseInt(head.tagName.replace('H', '')),
           };
        });
        
        setToc(tocData);
      }, 500); // 这里的延迟可以保留，确保内容已渲染

      return () => clearTimeout(timer);
    }
  }, [article, loading]);
  // --- 新增：平滑滚动 ---

  const scrollToHeading = (index) => {
    // 再次实时获取所有标题
    const headings = document.querySelectorAll('.dark-mode-viewer h1, .dark-mode-viewer h2, .dark-mode-viewer h3');
    
    // 根据索引直接拿到 DOM 元素
    const targetElement = headings[index];

    if (targetElement) {
      // 计算位置：元素距离顶部的距离 + 当前滚动条位置 - 顶部 Header 高度 (100px)
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset - 100;
      
      window.scrollTo({ 
        top: y, 
        behavior: 'smooth' 
      });
    } else {
      console.warn(`Heading at index ${index} not found!`);
    }
  };
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen msg={error} />;

  const C_ACCENT = '#ff4d00';
  const C_DIM = 'rgba(255,255,255,0.4)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0a0a', color: '#fff', overflowX: 'hidden' }}>
      
      {/* 1. Header (保持不变) */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}
      >
        <div onClick={() => navigate('/blog')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          <ChevronLeft size={16} color={C_ACCENT} />
          <span style={{ letterSpacing: '2px' }}>RETURN_ROOT</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: C_DIM }}>
          <span>PROTOCOL: READ_ONLY_V1</span>
        </div>
      </motion.div>


      {/* --- 新增：左侧白色目录框 (Desktop Only) --- */}
      {toc.length > 0 && (
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="desktop-only" 
          style={{
            position: 'fixed',
            left: '40px',
            top: '120px',
            width: '240px',
            background: '#fff', // 白色背景
            color: '#000',      // 黑色文字
            padding: '20px',
            zIndex: 90,
            fontFamily: 'var(--font-mono)',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            // 添加一个切角效果，符合整体设计
            clipPath: 'polygon(0 0, 100% 0, 100% 95%, 90% 100%, 0 100%)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
            <div style={{ 
                borderBottom: '2px solid #000', 
                paddingBottom: '10px', 
                marginBottom: '15px', 
                fontSize: '12px', 
                fontWeight: '900',
                display: 'flex', alignItems: 'center', gap: '8px'
            }}>
                <List size={14} /> 
                STRUCTURE_MAP
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {toc.map((item, i) => (
                    <div 
                        key={i}
                        onClick={() => scrollToHeading(item.index)}
                        style={{
                            fontSize: '11px',
                            cursor: 'pointer',
                            paddingLeft: `${(item.level - 1) * 12}px`, // 根据标题层级缩进
                            opacity: 0.8,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            lineHeight: '1.4'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.opacity = 1;
                            e.target.style.color = '#ff4d00'; // 悬停变橙色
                            e.target.style.fontWeight = 'bold';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.opacity = 0.8;
                            e.target.style.color = '#000';
                            e.target.style.fontWeight = 'normal';
                        }}
                    >
                       {item.level > 1 && <CornerDownRight size={10} style={{minWidth:'10px'}} />}
                       {item.text}
                    </div>
                ))}
            </div>

            {/* 底部装饰 */}
            <div style={{ 
                marginTop: '20px', 
                paddingTop: '10px', 
                borderTop: '1px dashed #ccc', 
                fontSize: '9px', 
                opacity: 0.5 
            }}>
                SCAN_COMPLETE // {toc.length} NODES
            </div>
        </motion.div>
      )}


      {/* 2. Main Content (保持基本不变) */}
      <div className="page-container" style={{ flex: 1, width: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: '120px', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}>
        
        {/* 文章头部信息 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
             <span style={{ color: C_ACCENT, border: `1px solid ${C_ACCENT}`, padding: '2px 6px' }}>
                PID: {article.id.toString().padStart(4, '0')}
             </span>
             {article.tags.map(tag => (
                 <span key={tag} style={{ background: '#222', padding: '2px 8px', color: '#ccc' }}>#{tag}</span>
             ))}
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontFamily: 'var(--font-sans)', fontWeight: '900', lineHeight: 1.1, marginBottom: '30px', textTransform: 'uppercase', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
            {article.title}
          </h1>

       
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '15px 0', marginBottom: '60px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#888' }}>
             <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {article.date}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> <span style={{ marginRight: '4px' }}>AUTHOR:</span>
                  {/* 显示作者图片，可以暂时关掉，反正太小了看不出来 */}
                  {/* <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444' }}>
                    {!imgError ? (
                      <img src={`${API_BASE}/get-author-avatar/${article.author_username || article.author}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
                    ) : (<User size={12} color="#999" />)}
                  </div> */}
                  <span style={{ fontWeight: 'bold', color: '#fff', borderBottom: '1px dashed #666' }}>{article.author_nickname || article.author}</span>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}><Eye size={14} color={C_ACCENT} /> VIEWS: {article.views} <span style={{color: C_ACCENT, fontSize:'10px'}}>+1</span></span>
             </div>
          </div>
        </motion.div>

        {/* --- Markdown 内容 --- */}
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
            style={{ minHeight: '400px', position: 'relative' }}
            ref={contentRef} // 绑定 Ref
        >
            <div style={{ position: 'absolute', left: '-20px', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(to bottom, #ff4d00, transparent)' }} />
            {/* dark-mode-viewer 是关键类名，用于抓取标题 */}
            <div className="dark-mode-viewer" style={{ fontSize: '16px', lineHeight: 1.8, color: '#e0e0e0' }}>
                <Viewer 
  value={article.content} 
  plugins={plugins}
  sanitize={(schema) => {
    // 复制默认的安全配置
    const customSchema = { ...schema };
    
    // 1. 允许的标签列表：确保包含 'span' 和 'code'

    customSchema.tagNames = [...(customSchema.tagNames || []), 'span', 'code', 'pre'];

    // 2. 允许的属性列表：给 code, span, pre 开放 className 和 class 权限
    customSchema.attributes = {
      ...customSchema.attributes,
      code: ['className', 'class'],
      span: ['className', 'class'],
      pre:  ['className', 'class'],
    };

    return customSchema;
  }}
/>
            </div>
            <div style={{ marginTop: '80px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#444' }}>*** END OF LOG ***</div>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
};

const LoadingScreen = () => (<div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-mono)' }}><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '2px solid #333', borderTopColor: '#ff4d00', borderRadius: '50%' }} /><div style={{ color: '#ff4d00', fontSize: '12px', letterSpacing: '2px' }}>DOWNLOADING_PACKET...</div></div>);

const ErrorScreen = ({ msg }) => (<div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-mono)' }}><div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>SYSTEM_ERROR</div><div style={{ color: '#666' }}>{msg}</div><a href="/blog" style={{ color: '#ff4d00', textDecoration: 'underline', fontSize: '12px', marginTop: '20px' }}>RETURN TO SAFETY</a></div>);

export default Read;