// src/components/Loading.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const steps = [
  "CONNECTING TO MAIN TERMINAL...",
  "VERIFYING ENCRYPTION KEYS...",
  "LOADING UI ASSETS...",
  "SYSTEM READY."
];

const Loading = ({ onComplete }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.5 }}
      style={{ 
        height: '100vh', display: 'flex', flexDirection: 'column', 
        justifyContent: 'center', alignItems: 'center', 
        fontFamily: 'var(--font-mono)'
      }}
    >
      <div style={{ width: '320px' }}>
        <div style={{ 
          background: 'var(--solid-white)', color: 'var(--solid-black)', 
          padding: '4px 8px', display: 'inline-block', fontWeight: 'bold', marginBottom: '20px' 
        }}>
          BOOT_SEQUENCE
        </div>
        {steps.map((step, i) => (
          <div key={i} style={{ 
            fontSize: '13px', marginBottom: '6px',
            color: i === index ? 'var(--solid-white)' : 'var(--text-dim)',
            opacity: i > index ? 0 : 1
          }}>
            <span style={{ color: 'var(--accent-color)', marginRight: '10px' }}>
              {i < index ? '[ OK ]' : i === index ? '[ .. ]' : '[    ]'}
            </span>
            {step}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Loading;