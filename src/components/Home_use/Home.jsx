import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Globe, Maximize2 } from 'lucide-react';
import SplitControl from './SplitControl';
import Footer from '../Footer';
import WideCard from './WideCard';

const BLOG_POSTS = [
  {
    uid: 'LOG-084',
    category: 'ENGINEERING',
    title: 'Refactoring the UI Core Architecture',
    excerpt: 'Transitioning from a legacy HTML/CSS structure to a component-driven React architecture. We analyze performance gains, state management strategies, and the integration of Framer Motion for complex animations.',
    author: 'Cmdr. Shephard',
    date: '2024.11.20'
  },
  {
    uid: 'LOG-083',
    category: 'DESIGN SYSTEM',
    title: 'NASA Graphic Standards Manual Study',
    excerpt: 'A deep dive into the 1975 NASA Graphics Standards Manual. How distinct typography, grid systems, and the "Worm" logo influenced modern aerospace interface design and this website\'s aesthetic.',
    author: 'Dr. Cooper',
    date: '2024.10.15'
  },
  {
    uid: 'LOG-082',
    category: 'PERFORMANCE',
    title: 'Optimizing React Rendering Metrics',
    excerpt: 'Reducing Time to Interactive (TTI) by 40% using Vite\'s build optimizations and lazy loading heavy assets. A technical breakdown of our lighthouse scores before and after the migration.',
    author: 'Eng. Ripley',
    date: '2024.09.28'
  }
];

const Home = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <div className="layout-grid page-container" style={{ flex: 1 }}>

      {/* --- 左侧区域：内容核心 (Content Core) --- */}
      <div style={{
        padding: '120px 60px 60px 60px', // 给顶部导航留出空间，增加左右内边距
        borderRight: '1px solid var(--border-color)',
        position: 'relative'
      }}>

        {/* 装饰：左上角坐标 */}
        <div style={{
          position: 'absolute', top: '80px', left: '20px',
          fontSize: '18px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)',
          writingMode: 'vertical-rl', transform: 'rotate(180deg)'
        }}>
          SECTOR 7 // CONTENT FLOW
        </div>

        {/* Hero 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '80px', borderBottom: '1px solid var(--border-color)', paddingBottom: '40px' }}
        >
        <h1 style={{
          fontSize: 'clamp(48px, 6vw, 96px)',
          lineHeight: 0.9,
          margin: '0 0 20px 0',
          letterSpacing: '-2px',
          textTransform: 'uppercase'
          }}>

          <span style={{
             color: 'transparent',
            WebkitTextStroke: '1px var(--solid-white)',}}>
            Orbital
          </span>
           {' '} {/* 加上这个空格，防止单词粘在一起 */}
          <span style={{ color: 'var(--text-dim)' }}>View</span>
            <br/>
               <span style={{ color: 'var(--accent-color)' }}>System.</span>
          </h1>
          <p style={{ maxWidth: '500px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)',fontSize: '20px' }}>
            Connect the dots between industrial design and digital experiences.
            Full-width telemetry activated.
          </p>
        </motion.div>

        <SplitControl />
        {/* 文章列表 - 现在它们横向铺满左侧区域 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--data-color)',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ width: '14px', height: '14px', background: 'var(--data-color)' }} />
            LATEST_LOGS
          </h3>

         {BLOG_POSTS.map((post) => (
          <WideCard
        key={post.uid}
        id={post.uid} // 直接传 LOG-XXX
        category={post.category}
        title={post.title}
        excerpt={post.excerpt} // 新增
        author={post.author}   // 新增
        date={post.date}
        onClick={() => console.log(`Clicked post: ${post.uid}`)}
          />
          ))}

        </div>



      </div>


      {/* --- 右侧区域：视觉遥测 (Visual Telemetry) --- */}
      {/* 只有桌面端显示，放高清大图 */}
      <div className="desktop-only" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* 1. 高清背景图  */}
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
          alt="Satellite View"
          className="satellite-img"
        />

        {/* 2. 图片之上的 UI 覆盖层 (Overlay UI) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(11,13,23,0.2), rgba(11,13,23,0.8))',
          pointerEvents: 'none'
        }} />

        {/* 3. 覆盖在图上的数据信息 */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--data-color)' }}>
                  TARGET
                </div>
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

        {/* 4. 装饰性扫描线 */}
        <div style={{
          position: 'absolute', top: '50%', width: '100%', height: '1px',
          background: 'rgba(56, 189, 248, 0.5)',
          boxShadow: '0 0 10px var(--data-color)'
        }} />

        <motion.div
          style={{ position: 'absolute', top: '50%', left: '50%', width: '200px', height: '200px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '50%', x: '-50%', y: '-50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

      </div>

    </div>
    <Footer />
    </div>
  );
};


// --- 子组件：图上数据点 ---
const DataPoint = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>{label}</div>
    <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{value}</div>
  </div>
);

export default Home;
