import React from 'react'; // 移除了 useState, useMemo 等不再需要的 Hook
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import gemoji from '@bytemd/plugin-gemoji';
import highlight from '@bytemd/plugin-highlight';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/vs2015.css';
// 引入你之前定义的覆盖样式
import '../../bytemd-override.css';
import { API_BASE } from '../../data/config.js';

const plugins = [
  gfm(),
  gemoji(),
  highlight(),
];

const NasaEditor = ({ value, onChange }) => {

  // 编辑器基础配置
  const editorConfig = {
    lineNumbers: false, // 既然是信纸模式，不需要行号
    lineWrapping: true, // 自动换行
  };

  // ============================================================
  // 图片上传逻辑 (保持不变)
  // ============================================================
  const handleUploadImages = async (files) => {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await fetch(`${API_BASE}/uploads/image`, {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error('Upload failed');
          const data = await response.json();
          return {
            url: data.url,
            title: file.name,
            alt: file.name,
          };
        } catch (error) {
          console.error('Upload Error:', error);
          return { url: '', title: 'UPLOAD_FAILED' };
        }
      })
    );
    return uploadedImages;
  };

  return (
    <div className="letter-editor-container" style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '600px',
        // 这里不需要写背景色，背景色交给 CSS 的 letter-editor-container 处理，或者由父级透传
    }}>
        {/* 编辑器核心 */}
        <Editor
            value={value}
            plugins={plugins}
            onChange={onChange}
            editorConfig={editorConfig}
            uploadImages={handleUploadImages}
        />
    </div>
  );
};

export default NasaEditor;
