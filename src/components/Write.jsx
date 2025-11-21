import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import gemoji from '@bytemd/plugin-gemoji';
import highlight from '@bytemd/plugin-highlight';
import 'bytemd/dist/index.css'; // 引入基础样式
import 'highlight.js/styles/vs2015.css'; // 代码高亮主题
import '../bytemd-override.css'; 

import { Save, UploadCloud, Tag, X } from 'lucide-react';
import Footer from './Footer';

// 定义插件列表
const plugins = [
  gfm(), // 支持表格、任务列表、删除线
  gemoji(), // 支持 emoji :smile:
  highlight(), // 代码高亮
];

const Write = () => {
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('# LOG ENTRY: 001\n\nStart typing...');
  const [categoryInput, setCategoryInput] = useState('');
  const [tags, setTags] = useState([]);


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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <div style={{ flex: 1, width: '100%', paddingTop: '120px', paddingBottom: '60px' }}>
        <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>

          
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-color)', fontSize: '12px', marginBottom: '20px' }}>
              TRANSMISSION_CONSOLE // EDITOR_V2
            </div>

            <input 
              type="text" placeholder="ENTER_SUBJECT_TITLE..." 
              value={title} onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: '2px solid var(--border-color)',
                fontSize: 'clamp(32px, 4vw, 48px)', fontFamily: 'var(--font-sans)', fontWeight: '900',
                color: 'var(--solid-white)', paddingBottom: '20px', outline: 'none', textTransform: 'uppercase'
              }}
            />
             
             <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                <Tag size={16} /> <span>TAGS:</span>
              </div>
              {tags.map(tag => (
                <motion.div
                  key={tag} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{
                    background: 'var(--solid-white)', color: 'var(--solid-black)',
                    padding: '4px 12px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 0 rgba(255,255,255,0.3)'
                  }}
                >
                  {tag}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                </motion.div>
              ))}
              <input 
                type="text" placeholder="TYPE_&_ENTER" 
                value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} onKeyDown={handleTagInput}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--text-dim)',
                  color: 'var(--solid-white)', padding: '6px 12px',
                  fontFamily: 'var(--font-mono)', fontSize: '12px', outline: 'none', width: '150px'
                }}
              />
            </div>
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <span style={{ color: '#2bff00' }}>root@galaxy:</span>
            <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>
              Input tag, and press [Enter] to add tag...
            </span>
          </div>
          </div>

          {/* --- ByteMD Editor --- */}
          <div style={{ 
            minHeight: '80vh',
            overflow: 'hidden', 
            position: 'relative',
            border: '1px solid var(--border-color)', 
            background: 'rgba(0,0,0,0.5)'
            }}>
        
        <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: '2px solid var(--accent-color)', borderLeft: '2px solid var(--accent-color)', zIndex: 10 }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: '2px solid var(--accent-color)', borderRight: '2px solid var(--accent-color)', zIndex: 10 }} />

        <Editor
        value={markdown}
        plugins={plugins}
        onChange={(v) => setMarkdown(v)}
        editorConfig={{}}
        />
    </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '40px' }}>
             <ActionButton icon={<Save size={16} />} label="SAVE_DRAFT" secondary />
             <ActionButton icon={<UploadCloud size={16} />} label="PUBLISH_LOG" />
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

const ActionButton = ({ icon, label, secondary }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
    style={{
      background: secondary ? 'transparent' : 'var(--accent-color)',
      color: secondary ? 'var(--text-dim)' : '#fff',
      border: secondary ? '1px solid var(--border-color)' : 'none',
      padding: '12px 30px', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase'
    }}
  >
    {icon} {label}
  </motion.button>
);

export default Write;