import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpRight, Aperture, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import { BLOG_DATA as MOCK_DATA } from '../../data/mockData';
import { API_BASE } from '../../data/config';
import HEADER_BG from '../../assets/photo-1505118380757-91f5f5632de0.avif';
// 🎨 配色系统
const COLORS = {
  bg: '#EBF0F3',
  deepBlue: '#2C3E50',
  warmEarth: '#8D7B68', // 枯茶色
  textMain: '#2C3E50',
  textSub: '#7F8C8D',
  paper: '#FDFBF7',
  line: 'rgba(44, 62, 80, 0.1)',
  darkroomBg: '#151719' // 更深邃的暗房黑
};

// const HEADER_BG = "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2600&auto=format&fit=crop";

// 图片辅助函数
const getCardImage = (id) => {
  const images = [
    "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=800",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=800",
    "https://images.unsplash.com/photo-1505567745926-ba89000d255a?q=80&w=800",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800"
  ];
  return images[id % images.length];
};

const Blog = () => {
  const [booted, setBooted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [dbArticles, setDbArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/get-all-public-articles`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const formatted = data.articles.map(art => ({
            realId: art.id,
            uid: `No.${art.id.toString().padStart(3, '0')}`,
            title: art.title,
            // 确保摘要存在，如果后端没返回 preview，给一段默认的文艺文本
            excerpt: art.preview || "The memory is vague, blurred by the fog of time, yet the feeling remains distinctive and heavy...",
            category: (art.tags && art.tags.length > 0) ? art.tags[0].toUpperCase() : 'NOTE',
            date: art.date.split(' ')[0].replace(/-/g, '.'),
            views: art.views || 0,
            isReal: true
          }));
          setDbArticles(formatted);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const displayData = useMemo(() => {
    const MIN = 6;
    let combined = [...dbArticles];
    if (combined.length < MIN) {
      combined = [...combined, ...MOCK_DATA.slice(0, MIN - combined.length).map((item) => ({
        ...item,
        // Mock 数据也给默认摘要
        excerpt: item.excerpt || "A placeholder for a memory that has not yet been written. Waiting for the signal.",
        isReal: false
      }))];
    }
    return combined;
  }, [dbArticles]);

  const filteredPosts = useMemo(() => {
    return displayData.filter(post => {
      const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = activeFilter === 'ALL' || post.category === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [searchQuery, activeFilter, displayData]);

  const hottestPosts = useMemo(() => [...displayData].sort((a, b) => b.views - a.views).slice(0, 3), [displayData]);
  const categories = useMemo(() => ['ALL', ...new Set(displayData.map(p => p.category))], [displayData]);
  const handlePostClick = (post) => post.isReal && navigate(`/read/${post.realId}`);

  return (
    <>
      <AnimatePresence>{!booted && <FogLifter onComplete={() => setBooted(true)} />}</AnimatePresence>

      {booted && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
          style={{ minHeight: '100vh', backgroundColor: COLORS.bg, color: COLORS.textMain, fontFamily: '"Inter", sans-serif', position: 'relative' }}
        >
          {/* --- Background --- */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '70vh', zIndex: 0, overflow: 'hidden' }}>
            <img src={HEADER_BG} alt="sea" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(70%) contrast(90%) opacity(0.5)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', background: `linear-gradient(to bottom, transparent 0%, ${COLORS.bg} 95%)` }} />
          </div>

          <div className="page-container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

            {/* --- 1. Header  --- */}
            <div style={{ paddingTop: '220px', marginBottom: '100px' }}>
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }} style={{ fontFamily: '"Courier New", monospace', fontSize: '11px', letterSpacing: '3px', color: COLORS.deepBlue, marginBottom: '20px', opacity: 0.7 }}>
                THE ARCHIVE COLLECTION
              </motion.div>
              <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.4 }} style={{ fontSize: 'clamp(50px, 6vw, 90px)', fontFamily: '"Georgia", serif', fontWeight: '300', fontStyle: 'italic', margin: '0 0 40px 0', color: COLORS.deepBlue, letterSpacing: '-2px', lineHeight: 1.1 }}>
                Silent Echoes.
              </motion.h1>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${COLORS.line}`, paddingBottom: '15px' }}>
                 <div style={{ display: 'flex', gap: '30px' }}>
                    {categories.map((cat) => (
                        <button key={cat} onClick={() => setActiveFilter(cat)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: '"Courier New", monospace', color: activeFilter === cat ? COLORS.deepBlue : COLORS.textSub, opacity: activeFilter === cat ? 1 : 0.6 }}>{cat}</button>
                    ))}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
                    <Search size={14} color={COLORS.deepBlue} />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '120px', fontSize: '14px', fontFamily: '"Georgia", serif', fontStyle: 'italic', color: COLORS.deepBlue }} />
                 </div>
              </div>
            </div>

            {/* --- 2. Featured Section ) --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px', marginBottom: '140px' }}>

              {/* LEFT: Large Card */}
              {hottestPosts[0] && (
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  onClick={() => handlePostClick(hottestPosts[0])}
                  style={{ backgroundColor: COLORS.paper, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '550px', cursor: 'pointer', boxShadow: '0 5px 20px rgba(0,0,0,0.02)', position: 'relative' }}
                >
                   <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.textSub, marginBottom: '20px' }}>VOL. 01 — ESSENTIAL</div>
                   <h2 style={{ fontSize: '42px', fontFamily: '"Georgia", serif', margin: 0, color: COLORS.textMain, lineHeight: 1.1, fontWeight: 'normal' }}>{hottestPosts[0].title}</h2>

                   <div style={{ margin: '30px 0', height: '220px', overflow: 'hidden' }}>
                      <img src={getCardImage(0)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%)' }} />
                   </div>

                   <p style={{ fontSize: '16px', color: COLORS.textSub, lineHeight: 1.6, fontFamily: '"Georgia", serif', maxWidth: '100%', margin: 0 }}>{hottestPosts[0].excerpt}</p>
                   <div style={{ position:'absolute', top: 50, right: 50 }}><ArrowUpRight size={24} color={COLORS.deepBlue} /></div>
                </motion.div>
              )}

              {/* RIGHT: Optimized Small Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                {/*  Right Top: Warm Earth  */}
                {hottestPosts[1] && (
                    <SmallCard
                        post={hottestPosts[1]}
                        bgColor={COLORS.warmEarth}
                        textColor="#FDFBF7"
                        imgIndex={1}
                        onClick={() => handlePostClick(hottestPosts[1])}
                    />
                )}

                {/*  Right Bottom: Deep Blue  */}
                {hottestPosts[2] && (
                    <SmallCard
                        post={hottestPosts[2]}
                        bgColor={COLORS.deepBlue}
                        textColor="#FFFFFF"
                        imgIndex={2}
                        onClick={() => handlePostClick(hottestPosts[2])}
                    />
                )}
              </div>
            </div>

            {/* --- 3. Timeline --- */}
            <div style={{ marginBottom: '160px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${COLORS.deepBlue}`, paddingBottom: '20px', marginBottom: '0' }}>
                 <span style={{ fontFamily: '"Georgia", serif', fontSize: '24px', fontStyle: 'italic', color: COLORS.deepBlue }}>The Timeline</span>
                 <span style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.textSub }}>{filteredPosts.length} RECORDS</span>
               </div>
               {filteredPosts.map((post) => (
                  <HorizonRow key={post.uid} post={post} onClick={() => handlePostClick(post)} />
               ))}
            </div>

          </div>

          {/* --- 4. Darkroom Exhibition  --- */}
          <div style={{
              backgroundColor: COLORS.darkroomBg,
              padding: '100px 0 120px 0',
              width: '100%',
              // [UI升级] 增加网格线背景，模拟剪辑台
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
          }}>
              <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                     <div style={{ fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#fff', letterSpacing: '2px' }}>
                        DARKROOM // ARCHIVE
                     </div>
                     <div style={{ fontFamily: '"Courier New", monospace', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                        ISO 400 . 35MM
                     </div>
                  </div>

                  {/* 第一行：3 张博物馆展架风格照片 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '60px' }}>
                      {[0, 1, 2].map((i) => (
                          <MuseumFrame key={i} src={getCardImage(i + 4)} title={`Fig. 0${i+1} - COASTLINE`} />
                      ))}
                  </div>

                  {/* 第二行：2 张 + 留白 */}
                  <div style={{ display: 'flex', gap: '40px' }}>
                      {[3, 4].map((i) => (
                          <MuseumFrame key={i} src={getCardImage(i + 2)} title={`Fig. 0${i+4} - FRAGMENT`} size="small" />
                      ))}
                      {/* 留白区域：放一句深沉的 Slogan */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: '30px' }}>
                         <div style={{ textAlign: 'right', opacity: 0.3 }}>
                            <Aperture size={48} color="#fff" strokeWidth={1} style={{ marginLeft: 'auto', display: 'block', marginBottom: '10px' }} />
                            <div style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', color: '#fff', fontSize: '14px' }}>
                                "Light remembers what the eyes forget."
                            </div>
                         </div>
                      </div>
                  </div>
              </div>
          </div>

          <Footer />
        </motion.div>
      )}
    </>
  );
};


const SmallCard = ({ post, bgColor, textColor, imgIndex, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                flex: 1,
                backgroundColor: bgColor,
                color: textColor,
                padding: '35px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // 关键：拉开上下距离
                minHeight: '260px' // 稍微加高一点，给文字空间
            }}
        >
            {/* 上半部分：标题 */}
            <div>
                <div style={{ fontSize: '11px', fontFamily: '"Courier New", monospace', opacity: 0.7, marginBottom: '10px' }}>{post.date}</div>
                <h3 style={{ fontSize: '24px', fontFamily: '"Georgia", serif', margin: 0, fontWeight: 'normal', lineHeight: 1.2 }}>{post.title}</h3>
            </div>

            {/* 下半部分：[修改] 左文右图布局 */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginTop: '20px' }}>
                {/* 左侧：摘要 (自动省略) */}
                <div style={{ flex: 1 }}>
                    <p style={{
                        margin: 0,
                        fontSize: '13px',
                        opacity: 0.85,
                        lineHeight: 1.5,
                        fontFamily: '"Inter", sans-serif',
                        // CSS 多行省略号魔法
                        display: '-webkit-box',
                        WebkitLineClamp: 3, // 限制3行
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {post.excerpt}
                    </p>
                    <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: '"Courier New", monospace', opacity: 0.6, textDecoration: 'underline' }}>Read Entry</div>
                </div>

                {/* 右侧：方形图片 */}
                <div style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                    <img
                        src={getCardImage(imgIndex)}
                        alt=""
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            borderRadius: '2px', // 轻微圆角
                            opacity: 0.9,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

// --- [新组件] Museum Frame (UI 升级版照片架) ---
const MuseumFrame = ({ src, title, size }) => {
    const isSmall = size === 'small';
    return (
        <motion.div
            whileHover={{ y: -5 }}
            style={{
                width: isSmall ? '240px' : '100%',
                cursor: 'pointer'
            }}
        >
            {/* 照片主体：宽白边 + 阴影 */}
            <div style={{
                backgroundColor: '#fff',
                padding: '12px 12px 40px 12px', // 底部留宽，像博物馆展签
                boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                position: 'relative'
            }}>
                <div style={{ overflow: 'hidden', height: isSmall ? '160px' : '220px', backgroundColor: '#eee' }}>
                    <motion.img
                        whileHover={{ scale: 1.05 }} transition={{ duration: 0.5 }}
                        src={src} alt="art"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* 展签信息 */}
                <div style={{
                    position: 'absolute', bottom: '10px', left: '15px', right: '15px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span style={{ fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#888', letterSpacing: '1px' }}>{title}</span>
                    <Maximize2 size={10} color="#ccc" />
                </div>
            </div>
        </motion.div>
    );
};

const FogLifter = ({ onComplete }) => {
  useEffect(() => { const t = setTimeout(onComplete, 1500); return () => clearTimeout(t); }, [onComplete]);
  return <div style={{position:'fixed', inset:0, background:'#EBF0F3', zIndex:99}} />;
};

const HorizonRow = ({ post, onClick }) => (
  <motion.div whileHover={{ backgroundColor: 'rgba(255,255,255,0.6)', paddingLeft: '20px' }} onClick={onClick} style={{ borderBottom: `1px solid ${COLORS.line}`, padding: '45px 0', cursor: 'pointer', display: 'grid', gridTemplateColumns: '120px 1fr 120px', alignItems: 'start', gap: '20px', transition: 'all 0.3s ease' }}>
     <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.textSub, paddingTop: '5px' }}>{post.date}</div>
     <div>
       <div style={{ fontSize: '22px', fontFamily: '"Georgia", serif', color: COLORS.textMain, marginBottom: '8px' }}>{post.title}</div>
       <div style={{ fontSize: '14px', fontFamily: '"Inter", sans-serif', color: COLORS.textSub, opacity: 0.8, maxWidth: '600px', lineHeight: 1.5 }}>{post.excerpt}</div>
     </div>
     <div style={{ textAlign: 'right' }}><span style={{ fontSize: '11px', fontFamily: '"Courier New", monospace', color: COLORS.textSub, border: `1px solid ${COLORS.line}`, padding: '4px 8px', borderRadius: '4px' }}>{post.category}</span></div>
  </motion.div>
);

export default Blog;
