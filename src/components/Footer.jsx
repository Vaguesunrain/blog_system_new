import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Instagram, Mail, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const links = [
    { id: 'GH', icon: <Github size={18} />, link: 'https://github.com' },
    { id: 'X', icon: <Twitter size={18} />, link: 'https://x.com' },
    { id: 'INS', icon: <Instagram size={18} />, link: 'https://instagram.com' },
    { id: 'MAIL', icon: <Mail size={18} />, link: 'mailto:your@email.com' },
  ];

  return (
    <footer style={{
      width: '100%',
      // 保持和上方组件一致的宽度约束，确保对齐
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 40px 60px 40px', // 上方不需要padding因为 AdviceSection 已经有 margin-bottom 了
      boxSizing: 'border-box',

      // 布局
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end', // 底部对齐
      flexWrap: 'wrap', // 移动端自动换行
      gap: '40px',

      // 样式：透明背景，深色文字
      background: 'transparent',
      color: '#2C3E50',
      position: 'relative',
      zIndex: 10
    }}>

      {/* --- 左侧：版权与身份 --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        {/* Logo / 名字 */}
        <div style={{
          fontFamily: '"Georgia", serif',
          fontSize: '20px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: '#17202A'
        }}>
          Blue.
        </div>

        {/* 版权信息 - 像电影片尾的小字 */}
        <div style={{
          fontFamily: '"Courier New", monospace',
          fontSize: '11px',
          color: '#566573',
          lineHeight: '1.6',
          maxWidth: '300px'
        }}>
          © 2024 INDEPENDENT ARCHIVE.<br/>
          DESIGNED & CODED BY [YOUR NAME].<br/>
          ALL RIGHTS RESERVED.
        </div>
      </div>


      {/* --- 右侧：社交图标 & 友情链接 --- */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>

        {/* 社交图标组 */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {links.map((item) => (
            <SocialLink key={item.id} item={item} />
          ))}
        </div>

        {/* 底部的一句Slogan或者状态 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontFamily: '"Courier New", monospace',
          fontSize: '11px',
          color: '#546E7A',
          opacity: 0.6
        }}>
          <div style={{ width: '6px', height: '6px', background: '#2C3E50', borderRadius: '50%' }} />
          SYSTEM_Status: QUIET
        </div>

      </div>

    </footer>
  );
};

// 子组件：极简社交图标
const SocialLink = ({ item }) => (
  <motion.a
    href={item.link}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -3, opacity: 0.7 }}
    style={{
      color: '#17202A', // 纯黑/深灰图标
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none'
    }}
  >
    {item.icon}
  </motion.a>
);

export default Footer;
