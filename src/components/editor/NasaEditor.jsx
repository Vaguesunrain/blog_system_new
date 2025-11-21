import React, { useState, useMemo } from 'react';
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import gemoji from '@bytemd/plugin-gemoji';
import highlight from '@bytemd/plugin-highlight';
import { Palette, RotateCcw, X, Settings2, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/vs2015.css';
import '../../bytemd-override.css';

const plugins = [
  gfm(),
  gemoji(),
  highlight(),
];

const DEFAULT_CONFIG = {
  color: '#000000',
  opacity: 0.5
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const NasaEditor = ({ value, onChange }) => {
  const editorConfig = {
    lineNumbers: false,
  };

  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const bgStyle = useMemo(() => {
    const { r, g, b } = hexToRgb(config.color);
    return `rgba(${r}, ${g}, ${b}, ${config.opacity})`;
  }, [config]);

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // ============================================================
  // NEW: 图片上传处理逻辑
  // ============================================================
  const handleUploadImages = async (files) => {
    // 这里的 files 是一个数组（支持多图上传）
    // 我们使用 Promise.all 并行上传
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
          // 发送到你的 Flask 服务器
          const response = await fetch('http://vagueame.top:7777/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();

          // ByteMD 期望返回的格式: { url: string, title?: string, alt?: string }
          return {
            url: data.url,
            title: file.name,
            alt: file.name,
          };
        } catch (error) {
          console.error('Upload Error:', error);
          // 可以在这里加个 Toast 提示用户上传失败
          return {
              url: '',
              title: 'UPLOAD_FAILED'
          }
        }
      })
    );
    return uploadedImages;
  };
  // ============================================================

  return (
    <div style={{
        minHeight: '640px',
        position: 'relative',
        border: '1px solid var(--border-color)',
        background: bgStyle,
        '--editor-bg': bgStyle,
        transition: 'background 0.3s ease'
    }}>
        {/* 装饰角标 */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: '2px solid var(--accent-color)', borderLeft: '2px solid var(--accent-color)', zIndex: 10, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: '2px solid var(--accent-color)', borderRight: '2px solid var(--accent-color)', zIndex: 10, pointerEvents: 'none' }} />

        {/* 设置按钮区域 (代码保持不变，为了简洁省略部分内容...) */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 50 }}>
            <button onClick={() => setShowSettings(!showSettings)} style={{ background: showSettings ? '#fff' : 'rgba(0,0,0,0.6)', color: showSettings ? '#000' : '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                 {showSettings ? <X size={16} /> : <Settings2 size={16} />}
            </button>
            <AnimatePresence>
            {showSettings && (
                <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', top: '45px', right: '0', width: '240px', background: 'rgba(10, 10, 15, 0.95)', border: '1px solid #333', padding: '20px', boxShadow: '-10px 10px 30px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10% 100%, 0 90%)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#666', letterSpacing: '1px', borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>:: DISP_CONFIG ::</span><Sliders size={12} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px' }}><Palette size={12} /> TINT_COLOR</label><div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><input type="color" value={config.color} onChange={(e) => setConfig({ ...config, color: e.target.value })} style={{ background: 'transparent', border: 'none', width: '30px', height: '30px', cursor: 'pointer' }} /><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#fff' }}>{config.color}</span></div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}><span>OPACITY</span><span>{Math.round(config.opacity * 100)}%</span></label><input type="range" min="0" max="1" step="0.05" value={config.opacity} onChange={(e) => setConfig({ ...config, opacity: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer', height: '4px' }} /></div>
                    <button onClick={handleReset} style={{ marginTop: '10px', background: 'transparent', border: '1px solid #333', color: '#ff4d00', padding: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = '#ff4d00'; e.target.style.color = '#fff'; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff4d00'; }}><RotateCcw size={12} /> FACTORY_RESET</button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* 编辑器核心 */}
        <Editor
            value={value}
            plugins={plugins}
            onChange={onChange}
            editorConfig={editorConfig}
            // 关键：绑定上传函数
            uploadImages={handleUploadImages}
        />
    </div>
  );
};

export default NasaEditor;
