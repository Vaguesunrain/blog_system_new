import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import Gallery from './Gallery';
import { API_BASE } from '../data/config';

// 🎨 配色
const COLORS = {
  bg: '#EBF0F3',
  ink: '#2C3E50',
  paper: '#FDFBF7',
  sub: '#7F8C8D',
  line: 'rgba(44, 62, 80, 0.1)',
  accent: '#C0392B'
};

const SharePhoto = () => {
  const [isUploadMode, setIsUploadMode] = useState(true);
  const [galleryVersion, setGalleryVersion] = useState(0);

  // --- Upload States ---
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please select a photo first.");

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('description', description.trim() || "Share beauty with you.");

    try {
      const res = await fetch(`${API_BASE}/share-upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();

      if (data.status === 'success') {
        alert("Memory Shared Successfully.");
        setFile(null);
        setPreviewUrl(null);
        setDescription('');
        setGalleryVersion(v => v + 1);
        setIsUploadMode(false);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (e) {
      alert("Network Error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, position: 'relative' }}>

      {/* 顶部开关 */}
      <div style={{ position: 'fixed', top: '100px', left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <motion.div
             initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
             style={{ pointerEvents: 'auto', background: '#fff', padding: '5px', borderRadius: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '5px' }}
          >
              <ToggleButton active={isUploadMode} label="SHARE" onClick={() => setIsUploadMode(true)} />
              <ToggleButton active={!isUploadMode} label="GALLERY" onClick={() => setIsUploadMode(false)} />
          </motion.div>
      </div>

      <AnimatePresence mode="wait">

        {isUploadMode ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
            style={{ paddingTop: '180px', paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
             <div style={{ width: '100%', maxWidth: '600px', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontFamily: '"Georgia", serif', fontSize: '36px', color: COLORS.ink, fontStyle: 'italic', margin: 0 }}>Share a Moment.</h1>
                    <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: COLORS.sub, marginTop: '10px' }}>UPLOAD_SEQUENCE_INIT</div>
                </div>

                {/*
                    [修改点 1] 容器样式
                    如果 previewUrl 存在，height 设为 'auto'，让图片撑开
                    minHeight 保证没图时有高度
                */}
                <div
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        width: '100%',
                        height: previewUrl ? 'auto' : '400px', // [关键] 动态高度
                        minHeight: '400px',                    // [关键] 最小高度
                        backgroundColor: COLORS.paper,
                        border: previewUrl ? `none` : `2px dashed ${COLORS.line}`,
                        borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', overflow: 'hidden', position: 'relative',
                        boxShadow: previewUrl ? '0 20px 40px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

                    {previewUrl ? (
                        <>
                            {/* [修改点 2] 图片样式: width 100%, height auto */}
                            <img
                                src={previewUrl}
                                alt="preview"
                                style={{
                                    width: '100%',
                                    height: 'auto',  // [关键] 保持比例
                                    display: 'block'
                                }}
                            />
                            {/* 遮罩层也需要绝对定位铺满 */}
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                <div style={{ color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '12px' }}>CHANGE IMAGE</div>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: COLORS.sub }}>
                            <ImageIcon size={48} strokeWidth={1} style={{ marginBottom: '15px', opacity: 0.5 }} />
                            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px' }}>CLICK TO UPLOAD</div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '40px', position: 'relative' }}>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Share beauty with you." style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.ink}`, padding: '10px 0', fontSize: '18px', fontFamily: '"Georgia", serif', color: COLORS.ink, outline: 'none', textAlign: 'center' }} />
                    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px', fontFamily: '"Courier New", monospace', color: COLORS.sub }}>DESCRIPTION (OPTIONAL)</div>
                </div>

                <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
                    <motion.button
                        onClick={handleSubmit} disabled={uploading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ background: COLORS.ink, color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '30px', fontSize: '12px', fontFamily: '"Courier New", monospace', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', opacity: uploading ? 0.7 : 1 }}
                    >
                        {uploading ? 'TRANSMITTING...' : 'PUBLISH MEMORY'}
                        {!uploading && <UploadCloud size={16} />}
                    </motion.button>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
          >
             <Gallery isEmbedded={true} key={galleryVersion} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

const ToggleButton = ({ active, label, onClick }) => (
    <motion.button
        onClick={onClick}
        animate={{ backgroundColor: active ? COLORS.ink : 'transparent', color: active ? '#fff' : COLORS.sub }}
        style={{ border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontFamily: '"Courier New", monospace', fontWeight: 'bold', letterSpacing: '1px' }}
    >
        {label}
    </motion.button>
);

export default SharePhoto;
