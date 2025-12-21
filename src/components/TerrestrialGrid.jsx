import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Aperture, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../data/config';

// 🎨 样式常量
const COLORS = {
  ink: '#2C3E50',
  sub: '#7F8C8D',
  bg: '#F5F5F5', // 占位背景色
  darkBlock: '#1a1a1a', // 最后一个深色块的颜色
};

const TerrestrialGrid = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取前 9 张图片，但我们只展示前 4 张
  useEffect(() => {
    fetch(`${API_BASE}/gallery-photos?page=1`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPhotos(data.photos.slice(0, 4)); // 只取前 4 张
        }
      })
      .catch(err => console.error("Grid Load Error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ height: '300px' }} />; // 占位

  // 如果没有图片，显示一个空状态或隐藏整个组件
  if (photos.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 40px',
      marginBottom: '100px'
    }}>

      {/* Header Line */}
      <div style={{
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: COLORS.sub,
        marginBottom: '30px',
        letterSpacing: '2px',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <Aperture size={14} />
        VISUAL_FRAGMENTS // RECENT_UPLOADS
      </div>

      {/*
         Bento Grid Layout:
         - 左侧：一张大图 (2行高)
         - 中间：两张小图 (上下排列)
         - 右侧：一张中图 + 最后的入口块 (上下排列)
         这是经典的 "1 + 2 + 2" 布局，这里简化为 3列 x 2行
      */}
      <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr', // 列宽比例
          gridTemplateRows: '200px 200px',      // 行高
          gap: '20px'
      }}>

        {/* Slot 1: Big Photo (Left, Spans 2 rows) */}
        {photos[0] && (
            <PhotoCard
                photo={photos[0]}
                style={{ gridRow: 'span 2' }} // 跨两行
                onClick={() => navigate('/gallery')}
            />
        )}

        {/* Slot 2: Photo (Middle Top) */}
        {photos[1] && (
            <PhotoCard
                photo={photos[1]}
                onClick={() => navigate('/gallery')}
            />
        )}

        {/* Slot 3: Photo (Right Top) */}
        {photos[2] && (
            <PhotoCard
                photo={photos[2]}
                onClick={() => navigate('/gallery')}
            />
        )}

        {/* Slot 4: Photo (Middle Bottom) */}
        {photos[3] && (
            <PhotoCard
                photo={photos[3]}
                onClick={() => navigate('/gallery')}
            />
        )}

        {/* Slot 5: The "View All" Block (Right Bottom) */}
        {/* 这个块不论有没有第4张图，都应该存在 */}
        <ViewAllBlock onClick={() => navigate('/gallery')} count={photos.length} />

      </div>
    </div>
  );
};

// --- 子组件：图片卡片 ---
const PhotoCard = ({ photo, style, onClick }) => {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -5 }}
            style={{
                ...style,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '2px',
                cursor: 'pointer',
                backgroundColor: '#eee',
                group: true // 为了让子元素响应 hover
            }}
            className="photo-card"
        >
            {/* 图片本体：使用缩略图以提升性能 */}
            <img
                src={`${API_BASE}${photo.thumb}`}
                alt="grid"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s',objectPosition: 'center 30%' }}
            />

            {/* 遮罩层：只展示描述文字 */}
            <div className="card-overlay">
                <div style={{ flex: 1 }} /> {/* Spacer */}
                <p style={{
                    margin: 0,
                    fontFamily: '"Georgia", serif',
                    fontSize: '14px',
                    color: '#fff',
                    fontStyle: 'italic',
                    textShadow: '0 2px 5px rgba(0,0,0,0.5)',
                    // 限制行数
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                    "{photo.desc}"
                </p>
                <div style={{
                    marginTop: '10px',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'uppercase'
                }}>
                    {photo.date}
                </div>
            </div>

            <style>{`
                .photo-card:hover img { transform: scale(1.05); }
                .card-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
                    padding: 20px;
                    display: flex; flexDirection: column;
                    opacity: 0; transition: opacity 0.3s;
                }
                .photo-card:hover .card-overlay { opacity: 1; }
            `}</style>
        </motion.div>
    );
};

// --- 子组件：查看更多块 ---
const ViewAllBlock = ({ onClick, count }) => {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ backgroundColor: '#000' }} // 悬浮变更黑
            style={{
                backgroundColor: COLORS.darkBlock,
                borderRadius: '2px',
                padding: '30px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: '#fff',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <ImageIcon size={24} color="rgba(255,255,255,0.3)" />
                <ArrowUpRight size={20} />
            </div>

            <div>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>
                    FULL COLLECTION
                </div>
                <h3 style={{ fontFamily: '"Georgia", serif', fontSize: '24px', margin: 0, fontWeight: 'normal' }}>
                    Gallery.
                </h3>
            </div>
        </motion.div>
    );
};

export default TerrestrialGrid;
