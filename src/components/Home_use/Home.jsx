import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SplitControl from './SplitControl';
import Footer from '../Footer';
import WideCard from './WideCard';
import {API_BASE} from '../../data/config';

// Mock 数据 (当真实文章不足3篇时使用)
const MOCK_POSTS = [
  {
    uid: 'LOG-084',
    category: 'ENGINEERING',
    title: 'Refactoring the UI Core Architecture',
    excerpt: 'Transitioning from a legacy HTML/CSS structure to a component-driven React architecture.',
    author: 'Cmdr. Shephard',
    date: '2024.11.20'
  },
  {
    uid: 'LOG-083',
    category: 'DESIGN SYSTEM',
    title: 'NASA Graphic Standards Manual Study',
    excerpt: 'A deep dive into the 1975 NASA Graphics Standards Manual.',
    author: 'Dr. Cooper',
    date: '2024.10.15'
  },
  {
    uid: 'LOG-082',
    category: 'PERFORMANCE',
    title: 'Optimizing React Rendering Metrics',
    excerpt: 'Reducing Time to Interactive (TTI) by 40% using Vite optimizations.',
    author: 'Eng. Ripley',
    date: '2024.09.28'
  }
];

// 辅助函数：为 Mock 数据生成头像 URL
const getMockAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=333&color=fff&bold=true`;
};

const Home = () => {
  const navigate = useNavigate();
  const [dbPosts, setDbPosts] = useState([]);

  // --- 1. 获取后端数据 ---
  useEffect(() => {
    fetch(`${API_BASE}/get-all-public-articles`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
        
          const formatted = data.articles.map(art => ({
            realId: art.id,
            uid: `LOG-${art.id.toString().padStart(3, '0')}`,
            title: art.title,
            excerpt: art.preview || 'Content data encrypted.',
            category: (art.tags && art.tags.length > 0) ? art.tags[0].toUpperCase() : 'SYSTEM',
            
            author: art.author_nickname || art.author_username,
            
            // 头像：必须用原始 username 去请求文件夹图片
            avatar: `${API_BASE}/get-author-avatar/${art.author_username}`,
            
            date: art.date.split(' ')[0].replace(/-/g, '.'),
            isReal: true
          }));
          setDbPosts(formatted);
        }
      })
      .catch(err => console.error("Home Data Fetch Error:", err));
  }, []);

  // --- 2. 混合数据策略 (只取前 3 个) ---
  const displayPosts = useMemo(() => {
    let combined = [...dbPosts];
    
    if (combined.length < 3) {
      const needed = 3 - combined.length;
      const fillers = MOCK_POSTS.slice(0, needed).map(post => ({
        ...post,
        isReal: false,
        avatar: getMockAvatar(post.author) 
      }));
      combined = [...combined, ...fillers];
    }
    
    // 强制只取前 3 篇
    return combined.slice(0, 3);
  }, [dbPosts]);

  const handleCardClick = (post) => {
    if (post.isReal) {
      navigate(`/read/${post.realId}`);
    } else {
      console.log('Clicked mock post (Access Denied)');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="layout-grid page-container" style={{ flex: 1 }}>

        {/* --- 左侧区域 --- */}
        <div style={{
          padding: '120px 60px 60px 60px',
          borderRight: '1px solid var(--border-color)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: '80px', left: '20px',
            fontSize: '18px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)',
            writingMode: 'vertical-rl', transform: 'rotate(180deg)'
          }}>
            SECTOR 7 // CONTENT FLOW
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '80px', borderBottom: '1px solid var(--border-color)', paddingBottom: '40px' }}
          >
            <h1 style={{
              fontSize: 'clamp(48px, 6vw, 96px)', lineHeight: 0.9, margin: '0 0 20px 0',
              letterSpacing: '-2px', textTransform: 'uppercase'
            }}>
              <span style={{ color: 'transparent', WebkitTextStroke: '1px var(--solid-white)', }}>Orbital</span>{' '}
              <span style={{ color: 'var(--text-dim)' }}>View</span><br />
              <span style={{ color: 'var(--accent-color)' }}>System.</span>
            </h1>
            <p style={{ maxWidth: '500px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '20px' }}>
              Connect the dots between industrial design and digital experiences. Full-width telemetry activated.
            </p>
          </motion.div>

          <SplitControl />
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
              fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--data-color)',
              marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{ width: '14px', height: '14px', background: 'var(--data-color)' }} />
              LATEST_LOGS
            </h3>

            {displayPosts.map((post) => (
              <WideCard
                key={post.uid}
                id={post.uid}
                category={post.category}
                title={post.title}
                excerpt={post.excerpt}
                author={post.author}
                date={post.date}
                avatar={post.avatar}
                onClick={() => handleCardClick(post)}
              />
            ))}
          </div>
        </div>

        {/* --- 右侧区域 (桌面端显示) --- */}
        <div className="desktop-only" style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" alt="Satellite View" className="satellite-img" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,13,23,0.2), rgba(11,13,23,0.8))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--data-color)' }}>TARGET</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>EARTH_ORBIT</div>
                </div>
                <Maximize2 size={20} color="var(--solid-white)" />
              </div>
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <DataPoint label="ALTITUDE" value="420 KM" />
                <DataPoint label="VELOCITY" value="7.66 KM/S" />
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(56, 189, 248, 0.5)', boxShadow: '0 0 10px var(--data-color)' }} />
          <motion.div style={{ position: 'absolute', top: '50%', left: '50%', width: '200px', height: '200px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '50%', x: '-50%', y: '-50%' }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
        </div>

      </div>
      <Footer />
    </div>
  );
};

const DataPoint = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>{label}</div>
    <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{value}</div>
  </div>
);

export default Home;