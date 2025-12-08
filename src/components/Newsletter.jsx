import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Newsletter = () => {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState('title'); // 'title' | 'author'
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (!query.trim()) return;
    // 假设你的搜索路由是这样的，你可以根据实际情况修改
    // 例如跳转到: /search?type=title&q=keyword
    console.log(`Searching for [${searchMode}]: ${query}`);
    navigate(`/search?type=${searchMode}&q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 40px',
      boxSizing: 'border-box'
    }}>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          marginTop: '120px',
          marginBottom: '80px',

          // --- 背景：海岸 (Coast) ---
          backgroundColor: '#CFD8DC',
          border: '2px solid #546E7A', // 边框稍微深一点，增加硬度

          padding: '80px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          gap: '40px'
        }}
      >

        {/* 编号装饰 */}
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#546E7A'
        }}>
          SEC_09 // COASTLINE_TERMINAL
        </div>

        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'end'
        }}>

          {/* 左侧文字 */}
          <div>
             <h3 style={{
              fontFamily: '"Georgia", serif',
              fontSize: '32px',
              color: '#263238',
              margin: '0 0 20px 0',
              fontStyle: 'italic',
              fontWeight: 'normal',
              lineHeight: '1.2'
            }}>
              Signal found.<br/>
              Establish connection?
            </h3>
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '13px', color: '#455A64', lineHeight: '1.6', maxWidth: '400px' }}>
              We occasionally transmit logs from the archive. Filter the noise by frequency or origin.
            </p>
          </div>

          {/* 右侧：控制台 */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* 1. 切换标签 (像刻在石头上的字) */}
            <div style={{ display: 'flex', gap: '20px', paddingLeft: '4px' }}>
              <ModeToggle
                active={searchMode === 'title'}
                onClick={() => setSearchMode('title')}
                label="KEYWORD"
                icon={<FileText size={12} />}
              />
              <ModeToggle
                active={searchMode === 'author'}
                onClick={() => setSearchMode('author')}
                label="AUTHOR"
                icon={<User size={12} />}
              />
            </div>

            {/* 2. 搜索区域容器 */}
            <div style={{
              display: 'flex',
              width: '100%',
              height: '60px', // 高度统一
            }}>

              {/* 输入框：岩石 (Rock) - 低对比度，接近背景但有实体感 */}
              <div style={{
                flex: 1,
                backgroundColor: '#B0BEC5', // 比背景 #CFD8DC 稍微深一点点，像石头
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                transition: 'background-color 0.3s'
              }}>
                <Search size={18} color="#455A64" style={{ marginRight: '10px' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchMode === 'title' ? "Search log title..." : "Enter pilot name..."}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '14px',
                    color: '#263238',
                    outline: 'none',
                    fontWeight: 'bold',
                    placeholderColor: '#607D8B'
                  }}
                />
              </div>

              {/* 按钮：长凳/铁器 (Bench) - 高对比度，深色 */}
              <button
                onClick={handleSearch}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#263238'} // Hover变黑
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37474F'} // 默认深蓝灰
                style={{
                  width: '80px',
                  height: '100%',
                  backgroundColor: '#37474F', // 深色，很有分量
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s'
                }}
              >
                 <ArrowRight size={24} color="#ECEFF1" /> {/* 白色箭头 */}
              </button>

            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

// 子组件：切换按钮
const ModeToggle = ({ active, onClick, label, icon }) => (
  <div
    onClick={onClick}
    style={{
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      fontFamily: '"Courier New", monospace',
      fontWeight: 'bold',
      color: active ? '#263238' : '#78909C', // 激活是深色，未激活是淡色
      borderBottom: active ? '2px solid #263238' : '2px solid transparent',
      paddingBottom: '4px',
      transition: 'all 0.3s'
    }}
  >
    {icon}
    {label}
  </div>
);

export default Newsletter;
