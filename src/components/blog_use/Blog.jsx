import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Flame, ChevronRight, Activity, AlertTriangle } from 'lucide-react';
import Footer from '../Footer';
import { BLOG_DATA } from '../../data/mockData';

const Blog = () => {
  const [booted, setBooted] = useState(false); // 控制是否显示完启动动画
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // 筛选逻辑
  const filteredPosts = useMemo(() => {
    return BLOG_DATA.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.uid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'ALL' || post.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  const hottestPosts = useMemo(() => [...BLOG_DATA].sort((a, b) => b.views - a.views).slice(0, 3), []);
  const categories = ['ALL', ...new Set(BLOG_DATA.map(p => p.category))];
const maxViews = Math.max(...BLOG_DATA.map(p => p.views));
  return (
    <>
      {/* 1. 页面级启动动画 (Linux Boot Sequence) */}
      {!booted && <TerminalBoot onComplete={() => setBooted(true)} />}

      {/* 2. 主内容 (启动后显示) */}
      {booted && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}
        >
          <div className="page-container" style={{ flex: 1, width: '100%', paddingTop: '100px' }}>

            {/* --- A. 分散式布局 Header (Split Layout) --- */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              padding: '0 40px', marginBottom: '40px', flexWrap: 'wrap', gap: '40px'
            }}>

              {/* 左侧：巨大标题 */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '10px' }}>
                {/* 用户名绿色，路径蓝色，符号白色 */}
                    <span style={{ color: '#2bff00' }}>root@galaxy</span>
                    <span style={{ color: 'var(--solid-white)' }}>:</span>
                    <span style={{ color: 'var(--data-color)' }}>~/archives#</span>
                    <span style={{ color: 'var(--solid-white)' }}> ls -la</span>
                </div>
                <h1 style={{
                  fontSize: 'clamp(60px, 8vw, 120px)', lineHeight: 0.8, margin: 0,
                  letterSpacing: '-4px', color: 'var(--solid-white)', textTransform: 'uppercase'
                }}>
                  Data<span style={{color: 'var(--accent-color)'}}>.</span>Log
                </h1>
              </div>

              {/* 右侧：控制终端 (Terminal Input) */}
              <div style={{ flex: 1, maxWidth: '600px', minWidth: '300px' }}>
                {/* 模拟命令行输入框 */}
                <div style={{
                  background: '#000', border: '1px solid var(--text-dim)',
                  padding: '20px', fontFamily: 'var(--font-mono)', position: 'relative'
                }}>
                  {/* 装饰性 Header */}
                  <div style={{
                    position: 'absolute', top: -10, left: 10, background: '#000',
                    padding: '0 10px', fontSize: '10px', color: 'var(--text-dim)'
                  }}>
                    BASH_SHELL
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
                    <span style={{ color: '#2bff00' }}>root@user:~#</span>
                    <span style={{ color: 'var(--accent-color)' }}>grep</span>
                    <input
                      type="text"
                      autoFocus
                      placeholder=' "Search pattern..."'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'transparent', border: 'none', outline: 'none',
                        color: 'var(--solid-white)', fontFamily: 'var(--font-mono)',
                        fontSize: '16px', flex: 1, caretColor: '#006effff'
                      }}
                    />
                  </div>

                  {/* 过滤器作为命令行参数显示 */}
                  <div style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        style={{
                          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                          fontFamily: 'var(--font-mono)', fontSize: '12px',
                          color: activeFilter === cat ? '#2bff00' : 'var(--text-dim)',
                        }}
                      >
                        --category={cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

           {/* --- B. 升级版：Hottest Process Monitors --- */}
            <div style={{
              marginBottom: '40px',
              padding: '0 40px', // 保持左右对齐
            }}>

              {/* 区域标题 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px',
                color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', fontSize: '12px'
              }}>
                <Activity size={16} />
                <span>SYSTEM_MONITOR // HIGH_LOAD_PROCESSES</span>
                <div style={{ height: '1px', flex: 1, background: 'var(--accent-color)', opacity: 0.3 }} />
              </div>

              {/* 卡片网格 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', // 响应式，每张卡片至少350px宽
                gap: '20px'
              }}>
                {hottestPosts.map((post, i) => (
                  <HotProcessCard
                    key={post.uid}
                    post={post}
                    rank={i + 1}
                    maxViews={maxViews} // 传入最大值用于计算比例
                  />
                ))}
              </div>
            </div>

            {/* --- C. The Zebra List (修复溢出) --- */}
            <div style={{ width: '100%', overflowX: 'hidden' }}>

              {/* 表头 */}
              <div style={{
                display: 'grid',
                // 关键修改：使用百分比或 fr，不再固定像素，并且合计不要超过 100%
                // 手机端通过 CSS 媒体查询调整
                gridTemplateColumns: '100px 3fr 1fr 150px',
                padding: '15px 40px',
                borderBottom: '1px solid var(--text-dim)',
                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)',
              }}>
                 <div>PID</div>
                 <div>PROCESS_NAME</div>
                 <div>GROUP</div>
                 <div style={{ textAlign: 'right' }}>TIMESTAMP</div>
              </div>

              {filteredPosts.map((post, index) => (
                <ZebraRow key={post.uid} post={post} isEven={index % 2 !== 0} />
              ))}
            </div>

          </div>
          <Footer />
        </motion.div>
      )}
    </>
  );
};

// --- 组件：Linux 启动动画 ---
const TerminalBoot = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  // 模拟启动日志
  const bootLogs = [
    "Initialising kernel...",
    "Loading modules: react, vite, framer-motion...",
    "Mounting virtual filesystem...",
    "[OK] Started User Manager Service.",
    "[OK] Started Galaxy Log Daemon.",
    "Connection established.",
    "Starting graphical interface..."
  ];

  useEffect(() => {
    let delay = 0;
    bootLogs.forEach((log, index) => {
      // 随机延迟，模拟真实加载
      delay += Math.random() * 100 + 10;
      setTimeout(() => {
        setLines(prev => [...prev, log]);
        if (index === bootLogs.length - 1) {
          setTimeout(onComplete, 150);
        }
      }, delay);
    });
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000', zIndex: 9999,
      padding: '40px', fontFamily: 'var(--font-mono)', color: '#ccc', fontSize: '14px',
      overflow: 'hidden'
    }}>
      {lines.map((line, i) => (
        <div key={i} style={{ marginBottom: '5px' }}>
          <span style={{ color: '#2bff00', marginRight: '10px' }}>[{ (i * 0.134).toFixed(4) }]</span>
          {line}
        </div>
      ))}
      <motion.div
        animate={{ opacity: [0, 1] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        style={{ width: '10px', height: '16px', background: '#2bff00', marginTop: '5px' }}
      />
    </div>
  );
};


const ZebraRow = ({ post, isEven }) => {
  // 定义颜色逻辑
  const defaultBg = isEven ? 'var(--half-white)' : 'transparent';
  const defaultText = isEven ? 'var(--half-black)' : 'var(--text-main)';

  const hoverBg = isEven ? 'var(--half-black)' : 'var(--half-white)'; // 反转色
  const hoverText = isEven ? 'var(--half-white)' : 'var(--half-black)'; // 反转色

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      style={{
        width: '100%',
        position: 'relative', // 必须相对定位
        overflow: 'hidden',   // 遮住扫描层
        backgroundColor: defaultBg,
        borderBottom: isEven ? 'none' : '1px solid rgba(255,255,255,0.1)',
        padding: '30px 40px',
        display: 'grid',
        gridTemplateColumns: '100px 3fr 1fr 150px',
        alignItems: 'center',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        zIndex: 1
      }}
    >
      {/* --- 1. 扫描层 (The Sweep Layer) --- */}
      <motion.div
        variants={{
          rest: { width: '0%' },
          hover: { width: '100%' }
        }}
        transition={{ type: 'tween', ease: 'circOut', duration: 0.5 }} // 0.4s 的机械扫描感
        style={{

          borderBottom:'5px solid var(--data-color)',
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          backgroundColor: hoverBg, // 填充反转色
          zIndex: -1 // 在文字下方
        }}
      />

      {/* --- 2. 内容层 (文字变色需要极快，配合背景) --- */}

      <TextElement color={defaultText} hoverColor={hoverText}>
        <span style={{fontWeight:'bold'}}>{post.uid.split('-')[1]}</span>
      </TextElement>

      <TextElement color={defaultText} hoverColor={hoverText}>
         <span style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>
           {post.title}
         </span>
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

// 辅助小组件：控制文字颜色切换
const TextElement = ({ children, color, hoverColor }) => (
  <motion.div
    variants={{
      rest: { color: color },
      hover: { color: hoverColor }
    }}
    transition={{ duration: 0.5 }} // 文字变色稍微快一点
    style={{ zIndex: 2 }}
  >
    {children}
  </motion.div>
);

const HotProcessCard = ({ post, rank, maxViews }) => {
  // 计算负载百分比
  const loadPercent = Math.round((post.views / maxViews) * 100);
  // 生成 ASCII 进度条 [#######....]
  const barLength = 20;
  const filledLength = Math.round((barLength * loadPercent) / 100);
  const asciiBar = '[' + '#'.repeat(filledLength) + '.'.repeat(barLength - filledLength) + ']';

  // 随机生成一个“内存地址”，增加装饰感
  const memAddress = `0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`;

  return (
    <motion.div
      whileHover={{ y: -5, borderColor: 'var(--data-color)' }}
      style={{
        background: 'rgba(255, 77, 0, 0.05)', // 极淡的橙色背景
        border: '1px solid var(--accent-color)', // 橙色边框
        padding: '20px',
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '220px', // 强制增高内容
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {/* 1. 顶部状态栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--accent-color)', marginBottom: '15px', opacity: 0.8 }}>
        <span>PID: {post.uid.split('-')[1]}</span>
        <span>ADDR: {memAddress}</span>
        <span style={{ fontWeight: 'bold' }}>PRIORITY: 1</span>
      </div>

      {/* 2. 核心标题区 */}
      <div style={{ marginBottom: '20px', flex: 1 }}>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '5px' }}>
          PROCESS_NAME:
        </div>
        <h3 style={{
          fontSize: '20px', margin: 0, color: 'var(--solid-white)',
          lineHeight: 1.2, textTransform: 'uppercase', fontFamily: 'var(--font-sans)', fontWeight: '900'
        }}>
          {post.title}
        </h3>
      </div>

      {/* 3. 负载可视化 (Tech Stats) */}
      <div style={{ fontSize: '12px' }}>

        {/* 流量数据 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: 'var(--solid-white)' }}>
          <span>TRAFFIC_LOAD:</span>
          <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{post.views.toLocaleString()} OPS</span>
        </div>

        {/* ASCII 进度条 */}
        <div style={{ color: 'var(--accent-color)', letterSpacing: '1px', marginBottom: '8px', whiteSpace: 'nowrap' }}>
          {asciiBar} {loadPercent}%
        </div>

        {/* 底部警告 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,77,0,0.3)', paddingTop: '10px'
        }}>
          <AlertTriangle size={12} color="var(--accent-color)" />
          <span>WARNING: High interaction detected.</span>
        </div>

      </div>

      {/* 巨大的背景数字装饰 */}
      <div style={{
        position: 'absolute', right: 10, top: 10,
        fontSize: '64px', fontWeight: 'bold', color: 'var(--accent-color)',
        opacity: 0.05, pointerEvents: 'none', lineHeight: 0.8
      }}>
        {rank}
      </div>

    </motion.div>
  );
};

export default Blog;
