import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, User, Mail, Fingerprint, Loader2, ArrowDown } from 'lucide-react';
import { API_BASE } from '../data/config';
import Footer from '../components/Footer';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type') || 'title';
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // 加载数据
  const fetchResults = (isLoadMore = false) => {
    setLoading(true);
    const currentOffset = isLoadMore ? offset : 0;

    fetch(`${API_BASE}/search?type=${type}&q=${encodeURIComponent(query)}&offset=${currentOffset}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          if (isLoadMore) {
            setResults(prev => [...prev, ...data.results]);
          } else {
            setResults(data.results);
          }
          setHasMore(data.has_more);
          setOffset(prev => prev + 10);
        }
      })
      .finally(() => setLoading(false));
  };

  // 监听 URL 变化重新搜索
  useEffect(() => {
    setOffset(0);
    fetchResults(false);
  }, [type, query]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EBF0F3', paddingTop: '120px' }}>

      {/* Header */}
      <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 40px' }}>
        <div style={{ fontFamily: '"Courier New", monospace', color: '#7F8C8D', fontSize: '12px', marginBottom: '10px' }}>
           SEARCH_PROTOCOL // {type.toUpperCase()}
        </div>
        <h1 style={{ fontFamily: '"Georgia", serif', fontSize: '48px', color: '#2C3E50', margin: '0 0 60px 0' }}>
           Results for "{query}"
        </h1>

        {/* 结果列表 */}
        <div style={{ minHeight: '400px' }}>
            {results.length === 0 && !loading ? (
                <div style={{ padding: '40px', borderTop: '1px solid rgba(0,0,0,0.1)', color: '#999', fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
                    Nothing found in the archives.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* --- 模式 A: 文章列表 --- */}
                    {type === 'title' && results.map(art => (
                        <motion.div
                            key={art.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate(`/read/${art.id}`)}
                            whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.5)' }}
                            style={{
                                cursor: 'pointer', padding: '30px', borderBottom: '1px solid rgba(44,62,80,0.1)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: '24px', margin: '0 0 10px 0', fontFamily: '"Georgia", serif', color: '#2C3E50' }}>{art.title}</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#7F8C8D', fontFamily: '"Inter", sans-serif', maxWidth: '600px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                    {art.preview}
                                </p>
                            </div>
                            <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#95A5A6' }}>
                                {art.date.split(' ')[0]}
                            </div>
                        </motion.div>
                    ))}

                    {/* --- 模式 B: 作者卡片 --- */}
                    {type === 'author' && results.map(user => (
                <AuthorCard
                    key={user.username}
                    user={user}
                    onClick={() => navigate(`/author/${user.username}`)}
                />
            ))}

                </div>
            )}

            {/* Load More */}
            {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <button
                       onClick={() => fetchResults(true)} disabled={loading}
                       style={{ background: 'transparent', border: '1px solid #2C3E50', padding: '10px 30px', borderRadius: '30px', cursor: 'pointer', fontFamily: '"Courier New", monospace', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                    >
                       {loading ? <Loader2 className="spin" size={14} /> : 'LOAD MORE DATA'}
                       {!loading && <ArrowDown size={14} />}
                    </button>
                </div>
            )}
        </div>
      </div>

      <div style={{ marginTop: '100px' }}><Footer /></div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
const AuthorCard = ({ user, onClick }) => {
    // 动态生成遮罩：使用作者的主题色，如果没有则用默认深色
    const getMaskStyle = () => {
        const t = user.themeConfig || { color: '#2C3E50', opacity: 80, gradientStop: 40 };
        // 核心逻辑：从左侧纯色 -> 过渡到右侧半透明，展示背景图
        // 这样文字在左侧能看清，背景在右侧能展示
        let r=0, g=0, b=0;
        // ... (Hex to RGB 转换逻辑复用之前的，或者简单处理) ...
        // 为了演示方便，这里直接用 rgba 拼凑一个深色遮罩，实际项目建议复用 hexToRgb 函数
        const baseColor = t.color.startsWith('#') ? t.color : '#2C3E50';

        return `linear-gradient(105deg, ${baseColor} 0%, ${baseColor} 40%, rgba(0,0,0,0.2) 100%)`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}
            onClick={onClick}
            style={{
                width: '100%',
                height: '500px', // [修改] 高度加大
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#000', // 默认底色
                cursor: 'pointer',
                boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                marginBottom: '40px'
            }}
        >
            {/* 1. 背景图层 */}
            <div style={{ position: 'absolute', inset: 0 }}>
                <img
                    src={`${API_BASE}/author-background/${user.username}`}
                    alt="bg"
                    onError={(e) => e.target.style.display = 'none'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
            </div>

            {/* 2. 遮罩层 (关键：保证文字可读性) */}
            <div style={{
                position: 'absolute', inset: 0,
                background: getMaskStyle(), // 动态遮罩
                backdropFilter: 'blur(2px)' // 轻微模糊背景
            }} />

            {/* 3. 内容层 */}
            <div style={{
                position: 'relative', zIndex: 1,
                height: '100%',
                padding: '60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: '#fff' // 无论背景什么色，文字统一白色（因为有深色遮罩）
            }}>

                {/* 头像与角色 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.3)',
                        overflow: 'hidden',
                        background: '#000'
                    }}>
                        {/* 这里的头像 URL 如果后端没返回，可以用 username 拼一个默认头像接口 */}
                        <img
                            src={`${API_BASE}/get-author-avatar/${user.username}`}
                            alt="avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                        />
                    </div>
                    <div>
                        <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', opacity: 0.7, letterSpacing: '2px', marginBottom: '5px' }}>
                            {user.role.toUpperCase()}
                        </div>
                        <h2 style={{ margin: 0, fontFamily: '"Georgia", serif', fontSize: '48px', lineHeight: 1 }}>
                            {user.name}
                        </h2>
                    </div>
                </div>

                {/* Motto */}
                <div style={{ paddingLeft: '100px', maxWidth: '600px' }}>
                    <p style={{
                        fontFamily: '"Georgia", serif',
                        fontStyle: 'italic',
                        fontSize: '20px',
                        lineHeight: '1.6',
                        opacity: 0.9,
                        margin: '0 0 40px 0',
                        borderLeft: '2px solid rgba(255,255,255,0.3)',
                        paddingLeft: '20px'
                    }}>
                        "{user.motto}"
                    </p>

                    {/* Email / Meta Info */}
                    <div style={{ display: 'flex', gap: '30px', fontSize: '12px', opacity: 0.6, fontFamily: '"Courier New", monospace', marginBottom: '40px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={14}/> {user.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Fingerprint size={14}/> ID: {user.username}
                        </span>
                    </div>

                    {/* Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(); }} // 防止冒泡
                        style={{
                            background: '#fff', color: '#2C3E50', border: 'none',
                            padding: '12px 30px', borderRadius: '30px',
                            cursor: 'pointer',
                            fontFamily: '"Inter", sans-serif', fontSize: '12px', fontWeight: 'bold',
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                        }}
                    >
                        ENTER SPACE <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
export default SearchResult;
