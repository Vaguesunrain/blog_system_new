import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Tag, X, Save, ChevronLeft, Activity, Database, Clock, AlignLeft, Wifi } from 'lucide-react';
import Footer from './Footer';
import NasaEditor from './editor/NasaEditor';

const Write = () => {
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('# LOG ENTRY: 001\n\nStart typing...');
  const [categoryInput, setCategoryInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  // 实时数据计算
  const wordCount = markdown.split(/\s+/).filter(w => w.length > 0).length;
  const readTime = Math.ceil(wordCount / 200);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // 颜色变量
  const C_ORANGE = '#ff4d00';
  const C_BLUE = '#38bdf8';
  const C_GREEN = '#2bff00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* ======================= SIDEBAR (保持不变，略去重复代码以节省篇幅，逻辑同上) ======================= */}
      {/* 侧边栏代码逻辑与上一版保持一致，此处省略，重点看下面主界面的改动 */}
      <motion.div
        initial={{ x: 'calc(100% - 60px)' }}
        whileHover={{ x: 0 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        style={{
          position: 'fixed', right: 0, top: '20%', zIndex: 999, display: 'flex', alignItems: 'stretch', height: '380px',
          filter: 'drop-shadow(-10px 10px 20px rgba(0,0,0,0.5))',
        }}
      >
        {/* Reminder Hint */}
        <AnimatePresence>
          {!isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              style={{ position: 'absolute', left: '-160px', top: '45px', display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold', color: '#000', background: '#fff',
                padding: '4px 8px', clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)'
              }}>
                ::: OPEN_OPS :::
              </div>
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronLeft size={24} color="#fff" /></motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Handle */}
        <motion.div
          animate={{ backgroundColor: isHovered ? '#000000' : '#ffffff', color: isHovered ? '#ffffff' : '#000000', borderLeftColor: isHovered ? '#333' : '#fff' }}
          style={{ width: '60px', borderLeft: '1px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 88%)', paddingBottom: '40px' }}
        >
          <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '900', letterSpacing: '4px', gap: '20px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', opacity: 0.6 }}>SYSTEM</span><span>MENU</span>
          </div>
          <div style={{ marginTop: '20px' }}><Activity size={16} /></div>
        </motion.div>
        {/* Panel */}
        <div style={{ width: '300px', backgroundColor: '#ffffff', color: '#000000', padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', clipPath: 'polygon(0 0, 100% 0, 100% 95%, 0 100%)' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#666', letterSpacing: '1px', marginBottom: '10px' }}>// READY_TO_PUBLISH?</div>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-sans)', fontWeight: '900', lineHeight: '1', marginBottom: '5px' }}>AWAITING<br />INPUT</div>
            <div style={{ width: '100%', height: '4px', background: '#eee', marginTop: '20px' }}><div style={{ width: '40%', height: '100%', background: '#000' }}></div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{ background: 'transparent', border: '1px solid #000', color: '#000', padding: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>SAVE_DRAFT</span> <Save size={14} /></button>
            <button style={{ background: '#000', border: 'none', color: '#fff', padding: '14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}><span>PUBLISH_NOW</span> <UploadCloud size={16} /></button>
          </div>
          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#999', borderTop: '1px solid #eee', paddingTop: '10px' }}>SECURE CHANNEL: #88-X2</div>
        </div>
      </motion.div>
      {/* ======================= END SIDEBAR ======================= */}


      <div style={{ flex: 1, width: '100%', paddingTop: '100px', paddingBottom: '60px', position: 'relative' }}>

        {/*
            NEW: 左侧功能性数据轨 (Data Rail)
            使用蓝色作为点缀，表示数据流
        */}
        <div style={{
          position: 'absolute', left: '40px', top: '150px', bottom: '100px', width: '2px',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          {/* 顶部的蓝色指示点 */}
          <div style={{ width: '6px', height: '6px', background: C_BLUE, borderRadius: '50%', marginBottom: '10px' }}></div>

          {/* 随意的刻度线 */}
          <div style={{ width: '10px', height: '1px', background: '#fff', margin: '20px 0', opacity: 0.5 }}></div>
          <div style={{ width: '6px', height: '1px', background: '#fff', margin: '5px 0', opacity: 0.3 }}></div>
          <div style={{ width: '6px', height: '1px', background: '#fff', margin: '5px 0', opacity: 0.3 }}></div>

          {/* 中间的长条装饰 */}
          <div style={{ flex: 1, width: '1px', background: `linear-gradient(to bottom, transparent, ${C_BLUE}, transparent)` }}></div>

          {/* 底部装饰 */}
          <div style={{ writingMode: 'vertical-rl', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '20px' }}>
            COORD: 44.2N
          </div>
        </div>


        <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>

          {/*
                NEW: 顶部 HUD 状态栏 (The Bold White Block)
                大胆的白底黑字，带有橙色点缀
            */}
          <div style={{
            background: '#fff',
            color: '#000',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            marginBottom: '40px',
            clipPath: 'polygon(0 0, 100% 0, 100% 80%, 98% 100%, 0 100%)' // 右下角切角
          }}>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <span style={{ fontWeight: '900', letterSpacing: '1px' }}>EDITOR_PROTOCOL_V2</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                <Clock size={12} /> {time} UTC
              </span>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {/* 橙色警告/状态块 - 视觉焦点 */}
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  background: C_ORANGE,
                  color: '#fff',
                  padding: '2px 8px',
                  fontWeight: 'bold',
                  fontSize: '10px',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></div>
                REC
              </motion.div>

              <span style={{ fontWeight: 'bold' }}>USER: ADMIN</span>
            </div>
          </div>


          {/* Title Section */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
              <input
                type="text"
                placeholder="ENTER_SUBJECT_TITLE..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  fontSize: 'clamp(32px, 4vw, 56px)', fontFamily: 'var(--font-sans)',
                  fontWeight: '900', color: 'var(--solid-white)', outline: 'none',
                  textTransform: 'uppercase', lineHeight: 1
                }}
              />
            </div>

            {/* Tags */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Tag size={16} /> TAGS:
                  </div>
                  {tags.map(tag => (
                    <div key={tag} style={{ background: '#fff', color: '#000', padding: '2px 8px', fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {tag} <X size={10} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                    </div>
                  ))}
                  <input
                    type="text" placeholder="ADD +"
                    value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} onKeyDown={handleTagInput}
                    style={{
                      background: 'transparent', borderBottom: `1px solid ${C_BLUE}`, // 蓝色强调输入框
                      color: C_BLUE, padding: '2px 8px',
                      fontFamily: 'var(--font-mono)', fontSize: '12px', outline: 'none', width: '100px'
                    }}
                  />
                </div>
                {/* 终端提示语 */}
                <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }}>
                  <span style={{ color: C_GREEN }}>root@galaxy:</span>
                  <span style={{ marginLeft: '8px', color: '#ccc' }}>Waiting for tag input...And press [enter] for adding</span>
                </div>
              </div>

              {/* 右侧装饰数据 - 蓝色 */}
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: C_BLUE, opacity: 0.8 }}>
                MEM_ALLOC: 4096KB <br />
                ENCRYPTION: ON
              </div>
            </div>
          </div>

          {/* --- Editor Area --- */}
          <div style={{ minHeight: '500px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px', maxWidth: '100%' }}>
            <NasaEditor value={markdown} onChange={(v) => setMarkdown(v)} />
          </div>

          {/*
                NEW: 底部信息底座 (Bottom Info Block)
                不仅是白条，提供字数统计，并用绿色显示在线状态
            */}
          <div style={{
            marginTop: '20px',
            background: '#fff',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            color: '#000',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 'bold',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 2% 100%, 0 70%)' // 左下角切角
          }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlignLeft size={14} /> WORDS: {wordCount}
              </span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> READ: {readTime} MIN
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#666', fontSize: '10px' }}>AUTO-SYNC ENABLED</span>
              {/* 绿色信号灯 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C_GREEN, background: '#000', padding: '4px 8px', borderRadius: '2px' }}>
                <Wifi size={10} />
                <span style={{ fontSize: '10px' }}>ONLINE</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Write;
