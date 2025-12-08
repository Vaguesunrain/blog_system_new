import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';

const AdviceSection = () => {
  const [formData, setFormData] = useState({ contact: '', content: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = () => {
    if (!formData.content) return;
    setStatus('submitting');
    setTimeout(() => {
      setStatus('done');
      setFormData({ contact: '', content: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div style={{
      width: '100%',
      // 保持和其他组件一致的宽度设置
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 40px',
      boxSizing: 'border-box',
      marginBottom: '120px'
    }}>

      {/* --- 新增：隔离带与灰色文字 --- */}
      <div style={{
        width: '100%',
        textAlign: 'center',
        marginBottom: '60px', // 文字和信纸的距离
        marginTop: '120px',   // 这里的距离产生“下沉感”
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        {/* 一条淡淡的竖线，连接上面 */}
        <div style={{ width: '1px', height: '40px', background: '#CFD8DC' }} />

        {/* 灰色分隔文字 */}
        <span style={{
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          color: '#90A4AE',
          letterSpacing: '3px'
        }}>
          // END_OF_ARCHIVE
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          width: '100%',
          // 【关键修复】加上这个，padding 就不会把盒子撑大，右边就不会溢出了
          boxSizing: 'border-box',

          backgroundColor: '#F5F5F0',
          border: '1px dashed #90A4AE',
          padding: '60px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px'
        }}
      >
        {/* 顶部装饰钉子 */}
        <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#B0BEC5', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />

        {/* 标题部分 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #CFD8DC', paddingBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#78909C', marginBottom: '10px', letterSpacing: '2px' }}>
              SECTION_10 // FEEDBACK_LOOP
            </div>
            <h3 style={{ fontFamily: '"Georgia", serif', fontSize: '28px', color: '#37474F', margin: 0, fontStyle: 'italic' }}>
              Leave a trace.
            </h3>
          </div>
          <MessageSquare size={24} color="#B0BEC5" />
        </div>

        {/* 表单区域 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#546E7A', fontWeight: 'bold' }}>
              RETURN_ADDRESS (CONTACT):
            </label>
            <input
              type="text"
              placeholder="Email, Telegram, or Frequency..."
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #B0BEC5',
                padding: '10px 0',
                fontFamily: '"Courier New", monospace',
                fontSize: '16px',
                color: '#263238',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderBottom = '1px solid #37474F'}
              onBlur={(e) => e.target.style.borderBottom = '1px solid #B0BEC5'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#546E7A', fontWeight: 'bold' }}>
              LOG_ENTRY (ADVICE):
            </label>
            <textarea
              rows={4}
              placeholder="Write your message here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E0E0E0 31px, #E0E0E0 32px)',
                lineHeight: '32px',
                padding: '0',
                fontFamily: '"Georgia", serif',
                fontSize: '16px',
                color: '#263238',
                outline: 'none',
                resize: 'none',
                fontStyle: 'italic'
              }}
            />
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
           {status === 'done' && (
             <motion.span
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#558B2F' }}
             >
               // TRANSMISSION_SENT
             </motion.span>
           )}
           <motion.button
             onClick={handleSubmit}
             disabled={status !== 'idle'}
             whileHover={{ backgroundColor: '#263238', scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             style={{
               backgroundColor: status === 'done' ? '#558B2F' : '#37474F',
               color: '#ECEFF1',
               border: 'none',
               padding: '15px 40px',
               fontSize: '14px',
               fontFamily: '"Courier New", monospace',
               fontWeight: 'bold',
               cursor: status === 'idle' ? 'pointer' : 'default',
               display: 'flex',
               alignItems: 'center',
               gap: '10px',
               transition: 'background-color 0.3s'
             }}
           >
             {status === 'submitting' ? 'SENDING...' : status === 'done' ? 'SAVED' : 'COMMIT LOG'}
             <Send size={16} />
           </motion.button>
        </div>

      </motion.div>
    </div>
  );
};

export default AdviceSection;
