import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {API_BASE} from '../../data/config';

const ArchiveSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const MAX_SLOTS = 6; // 稍微增加一点数量，让列表长一点好看

  useEffect(() => {
    fetch(`${API_BASE}/my-articles-list`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setArticles(data.articles);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const emptySlots = Math.max(0, MAX_SLOTS - articles.length);
  const displayList = articles.slice(0, MAX_SLOTS);

  // 颜色定义
  const C_GREEN = '#2bff00';
  const C_ORANGE = '#ff4d00';
  const C_DIM = 'rgba(255,255,255,0.4)';

  return (
    <div style={{ 
      width: '100%',
      maxWidth: '1000px', // 宽一点更像终端
      margin: '0 auto',
      // 去掉所有背景和边框，完全融入
      background: 'transparent', 
      border: 'none',
      fontFamily: 'var(--font-mono)', // 全局等宽字体
      color: '#eee',
      padding: '20px'
    }}>
      
      {/* 1. 模拟终端命令输入行 (Command Line) */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '10px', 
        marginBottom: '20px', paddingBottom: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        fontSize: '14px'
      }}>
        <div style={{ color: C_GREEN }}>root@galaxy</div>
        <div style={{ color: '#fff' }}>:</div>
        <div style={{ color: '#3b82f6' }}>~/archives</div>
        <div style={{ color: '#fff' }}>$</div>
        <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
             ls -lat --color=auto
             {/* 闪烁的光标 */}
             <motion.div 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ width: '8px', height: '16px', background: '#fff' }}
             />
        </div>
      </div>

      {/* 2. 表头 (模拟 Linux ls 输出) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '100px 80px 1fr 100px 40px', // 定义列宽
        padding: '0 10px 10px 10px',
        fontSize: '10px', 
        color: C_DIM,
        letterSpacing: '1px'
      }}>
         <div>PERMISSIONS</div>
         <div>OWNER</div>
         <div>FILENAME / TITLE</div>
         <div>DATE</div>
         <div></div>
      </div>

      {/* 3. 列表内容 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        
        {loading ? (
           <div style={{ padding: '20px', color: C_ORANGE }}>Scanning filesystem...</div>
        ) : (
          <>
            {displayList.map((art, i) => (
              <TerminalRow 
                key={art.id} 
                art={art} 
                index={i} 
                onClick={() => navigate(`/write?id=${art.id}`)}
                accent={art.status === 'published' ? C_GREEN : C_ORANGE}
              />
            ))}

            {/* 空槽位：显示为隐藏文件或空行 */}
            {Array.from({ length: emptySlots }).map((_, i) => (
                <div key={`empty-${i}`} style={{
                    display: 'grid', 
                    gridTemplateColumns: '100px 80px 1fr 100px',
                    padding: '10px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.1)',
                    borderBottom: '1px dashed rgba(255,255,255,0.05)'
                }}>
                    <div>----------</div>
                    <div>root</div>
                    <div>// empty_sector_0{i+1}</div>
                    <div>--/--</div>
                </div>
            ))}
          </>
        )}
      </div>

      {/* 4. 底部提示 (Summary) */}
      <div style={{ 
         marginTop: '20px', paddingTop: '15px', 
         borderTop: '1px solid rgba(255,255,255,0.2)',
         display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
          <div style={{ fontSize: '11px', color: C_DIM }}>
             total {articles.length} files found.
          </div>

          <motion.button
            whileHover={{ x: 5, color: C_GREEN }}
            onClick={() => navigate('/blog-manage')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
             {'>'} ./open_full_database.sh <ArrowRight size={14} />
          </motion.button>
      </div>

    </div>
  );
};

// 子组件：单行终端显示
const TerminalRow = ({ art, index, onClick, accent }) => {
  // 模拟 Linux 权限字符串
  // rwx = read, write, execute. d = directory (nope), - = file.
  const permissions = art.status === 'published' ? '-rwxr-xr-x' : '-rw-------';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      whileHover={{ 
         backgroundColor: 'rgba(255, 255, 255, 0.1)', 
         x: 5
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: '100px 80px 1fr 100px 40px', // 与表头对齐
        alignItems: 'center',
        padding: '12px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        fontSize: '13px',
        transition: 'background 0.2s'
      }}
    >
      {/* 权限列 */}
      <div style={{ color: accent, opacity: 0.8 }}>{permissions}</div>
      
      {/* 用户列 */}
      <div style={{ color: '#aaa' }}>admin</div>
      
      {/* 标题列 (文件名) */}
      <div style={{ fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
         {art.title}
         {art.status === 'draft' && <span style={{ fontSize:'9px', background: '#ff4d00', color:'#000', padding:'0 4px', borderRadius:'2px'}}>DRAFT</span>}
      </div>
      
      {/* 日期列 */}
      <div style={{ color: '#888', fontSize: '11px' }}>{art.date.split(' ')[0]}</div>
      
      {/* 图标列 */}
      <div><Activity size={14} color="#555" /></div>
    </motion.div>
  );
};

export default ArchiveSection;