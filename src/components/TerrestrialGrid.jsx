import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, BookOpen, Mail, ArrowUpRight, Aperture } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TerrestrialGrid = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%',
      maxWidth: '1280px', // 记得之前改过这里是 1280
      margin: '0 auto',
      padding: '0 40px',
      boxSizing: 'border-box',
      marginBottom: '100px'
    }}>

      {/* 区域标题 (保持不变) */}
      <div style={{
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: '#78909C',
        marginBottom: '40px',
        letterSpacing: '2px',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <div style={{ width: '20px', height: '1px', background: '#78909C' }} />
        TERRAIN_LAYERS // VISUAL_DATA
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* 第一行 (保持不变) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
           <LandBlock
             title="The Studio" subtitle="Architecture" desc="Digital structures." icon={<Code size={20} />}
             color="#8D6E63" hoverColor="#6D4C41" height="240px" onClick={() => navigate('/projects')}
           />
           <LandBlock
             title="The Shelf" subtitle="Inputs" desc="Books & Frequencies." icon={<BookOpen size={20} />}
             color="#F9A825" hoverColor="#F57F17" textColor="#3E2723" height="240px" onClick={() => navigate('/shelf')}
           />
        </div>

        {/* --- 第二行：修复高度对齐问题 --- */}
               <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr', // 左3右1
          gap: '20px',
          height: '320px'
        }}>

          {/* 左侧：画廊 */}
          <GalleryBlock onClick={() => navigate('/gallery')} />

          {/* 右侧：联系 (直接放 LandBlock，不需要额外的 div 包裹了) */}
          <LandBlock
            title="Terminal"
            subtitle="Contact"
            desc="Open freq."
            icon={<Mail size={20} />}
            color="#37474F"
            hoverColor="#263238"
            isDark={true}
            height="100%" // 撑满 Grid 格子
            onClick={() => window.location.href = 'mailto:hi@example.com'}
          />

        </div>

      </div>
    </div>
  );
};
// ... (之前的 imports)

const GalleryBlock = ({ onClick }) => {
  const [hover, setHover] = useState(false);

  const photos = [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=600&auto=format&fit=crop"
  ];

  // 定义边框宽度，方便统一调整
  const borderSize = '12px';

  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        flex: 3,
        backgroundColor: '#558B2F', // 这里就是露出来的背景色（苔藓绿）
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        height: '100%',
        boxSizing: 'border-box',

        // 【修改点 1】增加内边距，让图片往里缩
        padding: borderSize,

        // 【修改点 2】增加图片之间的间距，让绿色也能在图片中间显示出来
        gap: borderSize
      }}
    >
      {/* 遮罩层 */}
      <div style={{
        position: 'absolute',

        // 【修改点 3】让遮罩层也往里缩，不要盖住绿色的边框
        top: borderSize,
        left: borderSize,
        right: borderSize,
        bottom: borderSize,
        // (去掉原来的 width: 100% 和 height: 100%)

        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
        zIndex: 10,
        padding: '20px', // 内部文字的边距可以稍微减小一点
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#DCEDC8', marginBottom: '5px' }}>
                THE DARKROOM // 35MM
              </div>
              <h3 style={{ fontFamily: '"Georgia", serif', fontSize: '32px', color: '#fff', margin: 0 }}>
                Visual Records.
              </h3>
            </div>
            <motion.div animate={{ x: hover ? 5 : 0 }} style={{ opacity: 0.8 }}>
              <ArrowUpRight color="#fff" size={28} />
            </motion.div>
         </div>
      </div>

      {photos.map((src, idx) => (
        <div key={idx} style={{ flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
          <motion.img
            src={src}
            alt="gallery"
            animate={{
              scale: hover ? 1.05 : 1,
              filter: hover ? 'grayscale(0%) brightness(100%)' : 'grayscale(40%) brightness(80%)'
            }}
            transition={{ duration: 0.5 }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      ))}

    </motion.div>
  );
};

const LandBlock = ({ title, subtitle, desc, icon, color, hoverColor, textColor, isDark, height, onClick }) => {
    // ... 代码不变 ...
    // 确保这里用的是 height: height || '280px'
    const [hover, setHover] = useState(false);
    const mainTextColor = textColor || (isDark ? '#ECEFF1' : '#FFFFFF');
    const subTextColor = isDark ? '#B0BEC5' : 'rgba(255,255,255,0.8)';

    return (
      <motion.div
        onClick={onClick}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          backgroundColor: hover ? hoverColor : color,
          // 确保使用了传入的 height
          height: height || '280px',
          padding: '30px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          transition: 'background-color 0.4s ease',
           boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: mainTextColor }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '50%' }}>
            {icon}
            </div>
            <motion.div animate={{ x: hover ? 3 : 0, y: hover ? -3 : 0 }} style={{ opacity: hover ? 1 : 0.5 }}>
            <ArrowUpRight size={20} />
            </motion.div>
        </div>

        <div>
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: subTextColor, marginBottom: '5px', textTransform: 'uppercase' }}>
            {subtitle}
            </div>
            <h3 style={{ fontFamily: '"Georgia", serif', fontSize: '24px', color: mainTextColor, margin: '0 0 5px 0', fontWeight: 'normal' }}>
            {title}
            </h3>
            <p style={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '12px', color: subTextColor, margin: 0, lineHeight: '1.4', opacity: 0.8 }}>
            {desc}
            </p>
        </div>

        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none' }} />
    </motion.div>
  );
};


export default TerrestrialGrid;
