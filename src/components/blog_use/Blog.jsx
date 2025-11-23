import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Flame, ChevronRight, Activity, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import { BLOG_DATA as MOCK_DATA } from '../../data/mockData';
import {API_BASE} from '../../data/config';

const Blog = () => {
  const [booted, setBooted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // 新增状态：存储数据库取回的数据
  const [dbArticles, setDbArticles] = useState([]);
  const navigate = useNavigate();

  // --- 核心逻辑 1: 获取后端数据 ---
  useEffect(() => {
    fetch(`${API_BASE}/get-all-public-articles`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          // 数据清洗：将后端格式转换为前端 UI 组件需要的格式
          const formatted = data.articles.map(art => ({
            realId: art.id, // 保留真实数据库 ID 用于跳转
            uid: `DB-PID-${art.id.toString().padStart(4, '0')}`, // 伪装成 PID 格式
            title: art.title,
            // 如果有标签取第一个作为分类，否则归为 'SYSTEM'
            category: (art.tags && art.tags.length > 0) ? art.tags[0].toUpperCase() : 'SYSTEM',
            date: art.date.split(' ')[0], // 只取日期部分
            views: art.views || 0, // 确保有浏览量
            isReal: true // 标记为真实数据
          }));
          setDbArticles(formatted);
        }
      })
      .catch(err => console.error("Data Link Severed:", err));
  }, []);

  // --- 核心逻辑 2: 数据混合策略 (The Hybrid Engine) ---
  const displayData = useMemo(() => {
    // 策略：总是显示所有真实文章。
    // 如果真实文章少于 6 篇，就从 Mock 数据里拿一些来充数，保证页面丰满。
    const MIN_DISPLAY_COUNT = 6;

    let combined = [...dbArticles];

    if (combined.length < MIN_DISPLAY_COUNT) {
        const needed = MIN_DISPLAY_COUNT - combined.length;
        // 截取 Mock 数据补充，并避免 ID 冲突（Mock数据通常已有 uid）
        const fillers = MOCK_DATA.slice(0, needed).map(item => ({
            ...item,
            isReal: false // 标记为模拟数据
        }));
        combined = [...combined, ...fillers];
    } else {
        // 如果真实数据足够多，我们依然可以把 Mock 数据加在最后面作为“历史归档”，
        // 或者你可以选择不加。这里为了演示效果，我们把 Mock 数据全部加在后面。
        // combined = [...combined, ...MOCK_DATA.map(i => ({...i, isReal: false}))];
    }

    return combined;
  }, [dbArticles]);


  // --- 筛选逻辑 (基于混合后的 displayData) ---
  const filteredPosts = useMemo(() => {
    return displayData.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.uid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'ALL' || post.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, displayData]);

  // --- Hottest 逻辑 (重新计算，优先展示浏览量高的) ---
  const hottestPosts = useMemo(() => {
      // 复制数组以免影响原数组顺序
      return [...displayData].sort((a, b) => b.views - a.views).slice(0, 3);
  }, [displayData]);

  // 提取分类列表
  const categories = useMemo(() => ['ALL', ...new Set(displayData.map(p => p.category))], [displayData]);

  // 计算最大视图 (防止分母为0)
  const maxViews = useMemo(() => Math.max(...displayData.map(p => p.views), 100), [displayData]);

 const handlePostClick = (post) => {
      if (post.isReal) {
          // 修改为跳转到 /read/:id
          navigate(`/read/${post.realId}`);
      } else {
          alert("ACCESS DENIED: ARCHIVED_SIMULATION_DATA (This is a mock post)");
      }
  };

  return (
    <>
      {!booted && <TerminalBoot onComplete={() => setBooted(true)} />}

      {booted && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}
        >
          <div className="page-container" style={{ flex: 1, width: '100%', paddingTop: '100px' }}>

            {/* --- A. Header (保持不变) --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 40px', marginBottom: '40px', flexWrap: 'wrap', gap: '40px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '10px' }}>
                    <span style={{ color: '#2bff00' }}>root@galaxy</span>
                    <span style={{ color: 'var(--solid-white)' }}>:</span>
                    <span style={{ color: 'var(--data-color)' }}>~/archives#</span>
                    <span style={{ color: 'var(--solid-white)' }}> ls -la --mixed-mode</span>
                </div>
                <h1 style={{ fontSize: 'clamp(60px, 8vw, 120px)', lineHeight: 0.8, margin: 0, letterSpacing: '-4px', color: 'var(--solid-white)', textTransform: 'uppercase' }}>
                  Data<span style={{color: 'var(--accent-color)'}}>.</span>Log
                </h1>
              </div>

              {/* 右侧：控制终端 */}
              <div style={{ flex: 1, maxWidth: '600px', minWidth: '300px' }}>
                <div style={{ background: '#000', border: '1px solid var(--text-dim)', padding: '20px', fontFamily: 'var(--font-mono)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -10, left: 10, background: '#000', padding: '0 10px', fontSize: '10px', color: 'var(--text-dim)' }}>BASH_SHELL</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
                    <span style={{ color: '#2bff00' }}>root@user:~#</span>
                    <span style={{ color: 'var(--accent-color)' }}>grep</span>
                    <input type="text" autoFocus placeholder=' "Search pattern..."' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--solid-white)', fontFamily: 'var(--font-mono)', fontSize: '16px', flex: 1, caretColor: '#006effff' }} />
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setActiveFilter(cat)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', color: activeFilter === cat ? '#2bff00' : 'var(--text-dim)' }}>
                        --category={cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

           {/* --- B. Hottest Process Monitors --- */}
            <div style={{ marginBottom: '40px', padding: '0 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <Activity size={16} />
                <span>SYSTEM_MONITOR // HIGH_LOAD_PROCESSES</span>
                <div style={{ height: '1px', flex: 1, background: 'var(--accent-color)', opacity: 0.3 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {hottestPosts.map((post, i) => (
                  <HotProcessCard
                    key={`${post.uid}-hot`} // 确保 Key 唯一
                    post={post}
                    rank={i + 1}
                    maxViews={maxViews}
                    onClick={() => handlePostClick(post)} // 绑定点击
                  />
                ))}
              </div>
            </div>

            {/* --- C. The Zebra List --- */}
            <div style={{ width: '100%', overflowX: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 3fr 1fr 150px', padding: '15px 40px', borderBottom: '1px solid var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
                 <div>PID</div>
                 <div>PROCESS_NAME</div>
                 <div>GROUP</div>
                 <div style={{ textAlign: 'right' }}>TIMESTAMP</div>
              </div>

              {filteredPosts.map((post, index) => (
                <ZebraRow
                    key={post.uid}
                    post={post}
                    isEven={index % 2 !== 0}
                    onClick={() => handlePostClick(post)} // 绑定点击
                />
              ))}

              {/* 如果没有搜索结果 */}
              {filteredPosts.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      [ERROR] NO_PROCESS_FOUND matching query "{searchQuery}"
                  </div>
              )}
            </div>

          </div>
          <Footer />
        </motion.div>
      )}
    </>
  );
};

// --- TerminalBoot 组件 (保持不变) ---
const TerminalBoot = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const bootLogs = ["Initialising kernel...", "Loading modules: react, vite, framer-motion...", "Mounting virtual filesystem...", "[OK] Started User Manager Service.", "[OK] Started Galaxy Log Daemon.", "Connection established.", "Starting graphical interface..."];
  useEffect(() => {
    let delay = 0;
    bootLogs.forEach((log, index) => {
      delay += Math.random() * 100 + 10;
      setTimeout(() => {
        setLines(prev => [...prev, log]);
        if (index === bootLogs.length - 1) setTimeout(onComplete, 150);
      }, delay);
    });
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, padding: '40px', fontFamily: 'var(--font-mono)', color: '#ccc', fontSize: '14px', overflow: 'hidden' }}>
      {lines.map((line, i) => <div key={i} style={{ marginBottom: '5px' }}><span style={{ color: '#2bff00', marginRight: '10px' }}>[{ (i * 0.134).toFixed(4) }]</span>{line}</div>)}
      <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} style={{ width: '10px', height: '16px', background: '#2bff00', marginTop: '5px' }} />
    </div>
  );
};

// --- ZebraRow (添加 onClick) ---
const ZebraRow = ({ post, isEven, onClick }) => {
  const defaultBg = isEven ? 'var(--half-white)' : 'transparent';
  const defaultText = isEven ? 'var(--half-black)' : 'var(--text-main)';
  const hoverBg = isEven ? 'var(--half-black)' : 'var(--half-white)';
  const hoverText = isEven ? 'var(--half-white)' : 'var(--half-black)';

  return (
    <motion.div
      initial="rest" whileHover="hover" animate="rest" onClick={onClick} // 添加点击事件
      style={{ width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: defaultBg, borderBottom: isEven ? 'none' : '1px solid rgba(255,255,255,0.1)', padding: '30px 40px', display: 'grid', gridTemplateColumns: '100px 3fr 1fr 150px', alignItems: 'center', cursor: 'pointer', fontFamily: 'var(--font-mono)', zIndex: 1 }}
    >
      <motion.div variants={{ rest: { width: '0%' }, hover: { width: '100%' } }} transition={{ type: 'tween', ease: 'circOut', duration: 0.5 }} style={{ borderBottom:'5px solid var(--data-color)', position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: hoverBg, zIndex: -1 }} />

      {/* 真实数据用绿色/白色，虚拟数据用暗色，增强区分度 */}
      <TextElement color={post.isReal ? '#2bff00' : defaultText} hoverColor={hoverText}>
        <span style={{fontWeight:'bold'}}>{post.uid.includes('PID') ? post.uid.split('-')[2] : post.uid.split('-')[1]}</span>
      </TextElement>
      <TextElement color={defaultText} hoverColor={hoverText}>
         <span style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>{post.title}</span>
      </TextElement>
      <TextElement color={defaultText} hoverColor={hoverText}>
        <span style={{ fontSize: '12px', opacity: 0.8 }}>[{post.category}]</span>
      </TextElement>
      <TextElement color={defaultText} hoverColor={hoverText}>
        <div style={{ textAlign: 'right', fontSize: '12px' }}>{post.date}</div>
      </TextElement>
    </motion.div>
  );
};

const TextElement = ({ children, color, hoverColor }) => (
  <motion.div variants={{ rest: { color: color }, hover: { color: hoverColor } }} transition={{ duration: 0.5 }} style={{ zIndex: 2 }}>{children}</motion.div>
);

// --- HotProcessCard (添加 onClick) ---
const HotProcessCard = ({ post, rank, maxViews, onClick }) => {
  const loadPercent = Math.round((post.views / maxViews) * 100);
  const barLength = 20;
  const filledLength = Math.round((barLength * loadPercent) / 100);
  const asciiBar = '[' + '#'.repeat(filledLength) + '.'.repeat(barLength - filledLength) + ']';
  const memAddress = `0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`;

  return (
    <motion.div
      whileHover={{ y: -5, borderColor: 'var(--data-color)' }}
      onClick={onClick} // 添加点击
      style={{ background: 'rgba(255, 77, 0, 0.05)', border: '1px solid var(--accent-color)', padding: '20px', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px', position: 'relative', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--accent-color)', marginBottom: '15px', opacity: 0.8 }}>
        <span>PID: {post.uid.includes('PID') ? post.uid.split('-')[2] : 'UNK'}</span>
        <span>ADDR: {memAddress}</span>
        <span style={{ fontWeight: 'bold' }}>PRIORITY: 1</span>
      </div>
      <div style={{ marginBottom: '20px', flex: 1 }}>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '5px' }}>PROCESS_NAME:</div>
        <h3 style={{ fontSize: '20px', margin: 0, color: 'var(--solid-white)', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: '900' }}>{post.title}</h3>
      </div>
      <div style={{ fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: 'var(--solid-white)' }}><span>TRAFFIC_LOAD:</span><span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{post.views.toLocaleString()} OPS</span></div>
        <div style={{ color: 'var(--accent-color)', letterSpacing: '1px', marginBottom: '8px', whiteSpace: 'nowrap' }}>{asciiBar} {loadPercent}%</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,77,0,0.3)', paddingTop: '10px' }}>
          <AlertTriangle size={12} color="var(--accent-color)" />
          <span>WARNING: High interaction detected.</span>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 10, top: 10, fontSize: '64px', fontWeight: 'bold', color: 'var(--accent-color)', opacity: 0.05, pointerEvents: 'none', lineHeight: 0.8 }}>{rank}</div>
    </motion.div>
  );
};

export default Blog;
