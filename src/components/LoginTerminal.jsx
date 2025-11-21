import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

const API_BASE = 'http://vagueame.top:5000';

const LoginTerminal = ({ initialMode = 'login', onClose, onSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [phase, setPhase] = useState('terminal');
  const [logs, setLogs] = useState([`> Initializing connection to ${API_BASE}...`, `> Protocol: ${initialMode.toUpperCase()}`]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const addLog = (text) => setLogs(prev => [...prev, `> ${text}`]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    addLog(`Sending packets to core...`);

    const endpoint = mode === 'login' ? '/login' : '/signup';

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        addLog(`ACCESS GRANTED.`);
        addLog(`Initiating Warp Drive...`);

        setTimeout(() => {
          setPhase('warp'); // 进入 Canvas 飞跃阶段
        }, 800);

        window.finishAuthSequence = () => {
           onSuccess(data.username || formData.name);
           onClose();
        };

      } else {
        addLog(`ERROR: ${data.message}`);
        if(data.conflict_field) addLog(`Conflict: ${data.conflict_field}`);
        setLoading(false);
      }
    } catch (error) {
      addLog(`CONNECTION FAILED: ${error.message}`);
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 99999,
      background: phase === 'terminal' ? 'rgba(0,0,0,0.8)' : 'black',
      backdropFilter: 'blur(10px)',
    }}>
      <AnimatePresence mode='wait'>

        {/* --- 阶段一：Linux 终端 --- */}
        {phase === 'terminal' && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
            <div style={{
                width: '600px', height: '450px', background: '#0c0c0c',
                border: '1px solid #333', boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                fontFamily: "'Courier New', monospace", borderRadius: '8px',
                overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 10000
              }}
            >
              {/* Terminal Header */}
              <div style={{ background: '#222', padding: '10px 15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div onClick={onClose} style={{ width:12, height:12, borderRadius:'50%', background:'#ff5f56', cursor:'pointer' }}/>
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#ffbd2e' }}/>
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#27c93f' }}/>
                <div style={{ marginLeft:'auto', color:'#888', fontSize:12 }}>root@galaxy:~/{mode}</div>
              </div>

              {/* Terminal Body */}
              <div style={{ padding: '30px', color: '#0f0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 20, borderBottom:'1px dashed #333', paddingBottom:10 }}>
                  {['login', 'register'].map(m => (
                     <span key={m} onClick={() => setMode(m)} style={{
                          marginRight: 25, cursor:'pointer', textTransform:'uppercase', fontWeight: 'bold',
                          color: mode === m ? '#0f0' : '#444', textShadow: mode === m ? '0 0 5px #0f0' : 'none'
                        }}>./{m}.sh</span>
                  ))}
                </div>
                <div style={{ flex: 1, marginBottom: 20, fontSize: 13, opacity: 0.8, overflowY: 'auto', fontFamily: 'monospace', borderLeft: '2px solid #111', paddingLeft: '10px' }}>
                  {logs.map((l, i) => <div key={i} style={{marginBottom: 4}}>{l}</div>)}
                  <div ref={el => el && el.scrollIntoView()} />
                </div>
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
                  {mode === 'register' && <InputLine label="USER" value={formData.name} onChange={v => setFormData({...formData, name:v})} autoFocus />}
                  <InputLine label="MAIL" type="email" value={formData.email} onChange={v => setFormData({...formData, email:v})} />
                  <InputLine label="PASS" type="password" value={formData.password} onChange={v => setFormData({...formData, password:v})} />
                  <motion.button type="submit" disabled={loading} whileHover={{ backgroundColor: '#0f0', color: '#000' }} whileTap={{ scale: 0.98 }} style={{ background:'transparent', border:'1px solid #0f0', color:'#0f0', padding:'12px', marginTop:10, fontFamily:'inherit', fontWeight: 'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    {loading ? 'PROCESSING...' : 'EXECUTE SEQUENCE'} <Terminal size={16}/>
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- 阶段二：Canvas 超光速飞跃 --- */}
        {phase === 'warp' && (
          <HyperspaceCanvas onComplete={() => window.finishAuthSequence && window.finishAuthSequence()} />
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

const InputLine = ({ label, type='text', value, onChange, autoFocus }) => (
  <div style={{ display:'flex', alignItems:'center', borderBottom: '1px solid #222', paddingBottom: '5px' }}>
    <span style={{ color:'#fff', marginRight:15, fontWeight: 'bold', minWidth: '50px' }}>$ {label}:</span>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} autoFocus={autoFocus} spellCheck={false} style={{ background:'transparent', border:'none', color:'#0f0', outline:'none', flex:1, fontFamily:'inherit', fontSize:16, textShadow: '0 0 5px rgba(0, 255, 0, 0.3)' }} />
  </div>
);

// --- 核心：基于 Canvas 的高性能飞跃动画组件 ---
const HyperspaceCanvas = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const speedRef = useRef(0.2);
  const [flash, setFlash] = useState(false); // 控制闪白

  useEffect(() => {
    const canvas = canvasRef.current;
    const c = canvas.getContext('2d', { alpha: false });
    let width = window.innerWidth;
    let height = window.innerHeight;
    let cx = width / 2;
    let cy = height / 2;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      cx = width / 2;
      cy = height / 2;
    };
    window.addEventListener('resize', resize);
    resize();

    // 初始化星星
    const starCount = 3000;
    const spread = 800;
    const starsX = new Float32Array(starCount);
    const starsY = new Float32Array(starCount);
    const starsZ = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      starsX[i] = (Math.random() - 0.5) * spread * 2;
      starsY[i] = (Math.random() - 0.5) * spread * 2;
      starsZ[i] = Math.random() * spread;
    }

    const animate = () => {
      // 拖尾效果
      c.fillStyle = "rgba(0, 0, 0, 0.25)";
      c.fillRect(0, 0, width, height);
      c.fillStyle = "#FFFFFF";

      // 加速逻辑：速度指数级增长，模拟冲刺
      if (speedRef.current < 50) {
        speedRef.current *= 1.05; // 乘法加速比加法更有冲刺感
        if(speedRef.current < 2) speedRef.current = 2; // 最小初速度
      }
      const currentSpeed = speedRef.current;

      for (let i = 0; i < starCount; i++) {
        starsZ[i] -= currentSpeed;

        if (starsZ[i] <= 0) {
          starsX[i] = (Math.random() - 0.5) * spread * 2;
          starsY[i] = (Math.random() - 0.5) * spread * 2;
          starsZ[i] = spread;
        }

        const z = starsZ[i];
        if (z < spread) {
          const scale = spread / z;
          const screenX = cx + starsX[i] * scale;
          const screenY = cy + starsY[i] * scale;

          if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
            // 拉伸效果：速度越快，星星在Z轴视觉上越长（这里用方块模拟，如果要线状需要画线）
            const size = (1 - z / spread) * 4;
            if (size > 0.5) {
              c.fillRect(screenX, screenY, size, size);
            }
          }
        }
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // --- 时间轴控制 ---

    // 2.2秒时：触发闪白 (Flash)
    const flashTimer = setTimeout(() => {
        setFlash(true);
    }, 2200);

    // 2.5秒时：完全销毁组件 (Cut)
    const endTimer = setTimeout(onComplete, 2500);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId.current);
      clearTimeout(flashTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      // 这样组件卸载时不会变透明，而是直接消失
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'black' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* 文字层 */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <motion.h1
            initial={{ scale: 0.5, opacity: 0, letterSpacing: '20px' }}
            animate={{ scale: 1.5, opacity: 1, letterSpacing: '5px' }}
            transition={{ duration: 2, ease: "easeIn" }}
            style={{
                color: '#fff', fontSize: '3rem', fontFamily: 'monospace', fontWeight: 'bold',
                textShadow: '0 0 20px #00ff41, 0 0 40px #00ff41'
            }}
          >
            HYPERSPACE LINK
          </motion.h1>
      </div>

      {/*
         --- 闪白遮罩层 (Flash Layer) ---
         当 flash 为 true 时，迅速变为纯白
      */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: flash ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeIn" }} // 0.3秒内变白
        style={{
            position: 'absolute', inset: 0,
            background: 'white',
            zIndex: 10002,
            pointerEvents: 'none'
        }}
      />
    </motion.div>
  );
};
export default LoginTerminal;
