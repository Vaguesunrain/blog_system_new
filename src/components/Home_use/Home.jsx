import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import CinematicCard from '../CinematicCard';
import { API_BASE } from '../../data/config';
import ThemeHistory from '../ThemeHistory';
import Newsletter from '../Newsletter';
import TerrestrialGrid from '../TerrestrialGrid';
import AdviceSection from '../AdviceSection';
import Home_bg from '../../assets/home_header_bg.avif';
// 1. Mock 数据
const MOCK_POSTS = [
  { uid: '084', category: 'SCENE 01', title: 'Refactoring the Core', excerpt: 'Transitioning to a component-driven React architecture.', author: 'Cmdr. Shephard', date: '2024.11.20' },
  { uid: '083', category: 'SCENE 02', title: 'NASA Graphic Standards', excerpt: 'A deep dive into the 1975 NASA Graphics Standards Manual.', author: 'Dr. Cooper', date: '2024.10.15' },
  { uid: '082', category: 'SCENE 03', title: 'Optimizing Metrics', excerpt: 'Reducing Time to Interactive (TTI) by 40% using Vite.', author: 'Eng. Ripley', date: '2024.09.28' },
  { uid: '081', category: 'SCENE 04', title: 'The Void Stares Back', excerpt: 'Philosophy of empty states in UI design.', author: 'Deckard', date: '2024.09.10' },
  { uid: '080', category: 'SCENE 05', title: 'State Management', excerpt: 'Handling complex data flows in large scale apps.', author: 'Neo', date: '2024.08.22' },
  { uid: '079', category: 'SCENE 06', title: 'Digital Decay', excerpt: 'How software entropy affects user experience over time.', author: 'Flynn', date: '2024.08.01' }
];

// 2. 图片生成器：海蓝/抑郁风格
const getMoodImage = (id) => {
  const images = [
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1000&auto=format&fit=crop", // 阴天海
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1000&auto=format&fit=crop", // 窗外
    "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1000&auto=format&fit=crop", // 工业灰
    "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=1000&auto=format&fit=crop", // 雾
    "https://images.unsplash.com/photo-1534234828563-025c27635b55?q=80&w=1000&auto=format&fit=crop", // 雨
    "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?q=80&w=1000&auto=format&fit=crop"  // 寂静海
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % images.length;
  return images[index];
};

const Home = () => {
  const navigate = useNavigate();
  const [dbPosts, setDbPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/get-all-public-articles`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const formatted = data.articles.map(art => ({
            realId: art.id,
            uid: `EXT.${art.id.toString().padStart(3, '0')}`,
            title: art.title,
            excerpt: art.preview || 'Content encrypted.',
            category: (art.tags && art.tags.length > 0) ? art.tags[0].toUpperCase() : 'NARRATIVE',
            author: art.author_nickname || art.author_username,
            date: art.date.split(' ')[0].replace(/-/g, '.'),
            coverImage: getMoodImage(art.id.toString()),
            isReal: true
          }));
          setDbPosts(formatted);
        }
      })
      .catch(err => console.error("Home Data Fetch Error:", err));
  }, []);

  const displayPosts = useMemo(() => {
    let combined = [...dbPosts];
    if (combined.length < 6) {
      const needed = 6 - combined.length;
      const fillers = MOCK_POSTS.slice(0, needed).map((post, idx) => ({
        ...post,
        uid: `DRAFT-${idx}`,
        coverImage: getMoodImage(`mock-${idx}`),
        isReal: false
      }));
      combined = [...combined, ...fillers];
    }
    return combined.slice(0, 6);
  }, [dbPosts]);

  const handleCardClick = (post) => {
    if (post.isReal) navigate(`/read/${post.realId}`);
  };

  // 分配数据
  const col1Data = displayPosts[0];
  const col2Data = displayPosts.slice(1, 3);
  const col3Data = displayPosts.slice(3, 6);

  return (
    <div style={{
      minHeight: '100vh',
      // 这里的背景色就是一切的基础
      backgroundColor: '#EBF0F3',
      color: '#34495E',
      fontFamily: '"Georgia", "Times New Roman", serif',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* --- Header: 沉浸式顶部 (与背景融合) --- */}
      <div style={{ position: 'relative', width: '100%', height: '55vh', overflow: 'hidden' }}>
        <img
          src={Home_bg}
          alt="Atmosphere"
          style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%',
            // 滤镜：调出一种“那年夏天宁静的海”的色调
            filter: 'grayscale(50%) contrast(95%) brightness(95%) sepia(10%)'
          }}
        />

        {/* 渐变遮罩：让图片底部淡出到背景色 #EBF0F3 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(235, 240, 243, 0.6) 50%, #EBF0F3 100%)'
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }}
          style={{
            position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center', zIndex: 2
          }}
        >
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', letterSpacing: '4px', color: '#566573', marginBottom: '10px' }}>
            ARCHIVE COLLECTION
          </div>
          <h1 style={{ fontSize: '64px', color: '#2C3E50', margin: 0, fontWeight: 'normal', fontStyle: 'italic', opacity: 0.9 }}>
            Blue Melancholy.
          </h1>
        </motion.div>
      </div>
 <ThemeHistory />
      {/* --- Body: 不规则三列布局 (无边框卡片) --- */}
      <div className="page-container" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '20px 40px 100px 40px', // 底部留多点白
        display: 'flex',
        gap: '60px', // 因为没有边框，列间距要稍微大一点，用留白来区分
        alignItems: 'stretch'
      }}>

        {/* Column 1: 主视觉 (40% 宽度) */}
        <div style={{ flex: '1.4' }}>
          {col1Data && (
            <CinematicCard mode={1} data={col1Data} onClick={() => handleCardClick(col1Data)} />
          )}
        </div>

        {/* Column 2: 次视觉 (30% 宽度) */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {col2Data.map(post => (
             <div key={post.uid} style={{ flex: 1 }}>
               <CinematicCard mode={2} data={post} onClick={() => handleCardClick(post)} />
             </div>
          ))}
        </div>

        {/* Column 3: 碎片信息 (25% 宽度) */}
        <div style={{ flex: '0.8', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {col3Data.map((post, index) => (
             <div key={post.uid} style={{ flex: 1 }}>
               {/* 前两个用 Mode 3，最后一个用 Mode 4 */}
               <CinematicCard
                 mode={index === 2 ? 4 : 3}
                 data={post}
                 onClick={() => handleCardClick(post)}
               />
             </div>
          ))}
        </div>

      </div>
<Newsletter />
<TerrestrialGrid />
<AdviceSection />
      <Footer />
    </div>
  );
};

export default Home;
