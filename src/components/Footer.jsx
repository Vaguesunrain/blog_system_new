import React from 'react';
import { motion } from 'framer-motion';
import { Github, Mail, Twitter, Instagram, Cpu, Wifi, AlertTriangle, QrCode } from 'lucide-react';

const Footer = () => {
  const links = [
    { id: 'WX', icon: <WeChatIcon />, link: '#' },
    { id: 'X', icon: <Twitter size={16} />, link: 'https://x.com' },
    { id: 'GH', icon: <Github size={16} />, link: 'https://github.com' },
    { id: 'INS', icon: <Instagram size={16} />, link: 'https://instagram.com' },
    { id: 'MAIL', icon: <Mail size={16} />, link: 'mailto:your@email.com' },
  ];

  return (
    // 使用 layout-grid 类，确保左右宽度与上方内容完美对齐
    <footer className="layout-grid" style={{
      width: '100%',
      borderTop: '1px solid var(--border-color)',
      position: 'relative',
      zIndex: 10
    }}>

      {/* --- 左侧：深色玻璃控制台 (对应左侧内容区) --- */}
      <div style={{
        background: 'rgba(2, 2, 3, 1)',
        backdropFilter: 'blur(10px)',
        padding: '40px 60px', // 保持与上方各齐的内边距
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '30px'
      }}>

        {/* 上半部分：主要信息 & 社交 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '19px', fontWeight: 'bold', color: 'var(--solid-white)', letterSpacing: '1px' }}>
              GALAXY.LOG
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
              © 2025 PILOT USER // VER 5.4.11
            </div>
          </div>

          <div style={{ display: 'flex', gap: '13px' }}>
            {links.map((item) => (
              <SocialButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* 下半部分：状态栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
           <StatusItem label="SYS" value="ONLINE" icon={<Wifi size={12} />} />
           <StatusItem label="CPU" value="12%" icon={<Cpu size={12} />} />
           <div style={{ flex: 1 }} />
           <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
             END OF LINE
           </div>
        </div>

      </div>


      {/* --- 右侧：纯白实心块 (对应右侧图片区) --- */}
      {/* desktop-only 类确保在手机端隐藏，或者你可以去掉这个类让它在手机端显示在最底部 */}
      <div className="desktop-only" style={{
        background: 'var(--solid-white)',
        color: 'var(--solid-black)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px', // 只要200px就够了，或者 auto
        height: 'auto'      // 确保它不被强制拉伸
      }}>

        {/* 顶部：警示图标 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <AlertTriangle size={24} color="var(--accent-color)" strokeWidth={2.5} />
          <QrCode size={32} color="#000" style={{ opacity: 0.8 }} />
        </div>

        {/* 中部：彩蛋文字 - 模仿工业标签 */}
        <div style={{ fontFamily: 'var(--font-mono)', zIndex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', opacity: 0.6, marginBottom: '5px' }}>
            RESTRICTED AREA
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', lineHeight: '1', letterSpacing: '-1px' }}>
            FLIGHT<br/>RECORDER
          </div>
          <div style={{ fontSize: '13px', marginTop: '10px', padding: '4px 8px', background: '#000', color: '#fff', display: 'inline-block' }}>
            DO NOT OPEN
          </div>
        </div>

        {/* 装饰背景：巨大的浅灰色数字 */}
        <div style={{
          position: 'absolute', bottom: '-20px', right: '-20px',
          fontSize: '120px', fontWeight: '900', color: '#000', opacity: 0.05,
          pointerEvents: 'none', lineHeight: 1
        }}>
          01
        </div>

      </div>

    </footer>
  );
};

// ... SocialButton, StatusItem, WeChatIcon 保持不变 ...
const SocialButton = ({ item }) => (
  <motion.a
    href={item.link}
    target="_blank"
    whileHover={{ y: -3, backgroundColor: 'var(--accent-color)', color: '#fff', borderColor: 'var(--accent-color)' }}
    style={{
      width: '40px', height: '40px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid var(--border-color)',
      color: 'var(--text-dim)',
      background: 'rgba(255,255,255,0.02)',
      cursor: 'pointer'
    }}
  >
    {item.icon}
  </motion.a>
);

const StatusItem = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
    {icon}
    <div style={{ fontSize: '12px' }}>
      <span style={{ opacity: 0.7 }}>{label}:</span> <span style={{ color: 'var(--data-color)' }}>{value}</span>
    </div>
  </div>
);

const WeChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /><path d="M17 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /><path d="M12 19c-4.4 0-8-3.1-8-7s3.6-7 8-7c4.4 0 8 3.1 8 7s-3.6 7-8 7z" /><path d="M19 19c.9 1.8 3 2 3 2s-1.2-.6-1.7-1.2" /></svg>
);

export default Footer;
