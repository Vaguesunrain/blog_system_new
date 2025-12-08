import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import gemoji from '@bytemd/plugin-gemoji';
import highlight from '@bytemd/plugin-highlight';
import { ArrowLeft, AlignLeft, User } from 'lucide-react';
import Footer from '../Footer';
import { API_BASE } from '../../data/config';
import 'bytemd/dist/index.css';
import '../../bytemd-override.css';

import bgImage from '../../assets/read-bg.jpg';

const plugins = [gfm(), gemoji(), highlight()];

const Read = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toc, setToc] = useState([]);

    const VIEWER_CLASS = 'markdown-viewer-content';

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/read-article/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setArticle(data.article);
                } else {
                    setError(data.message);
                }
            })
            .catch(() => setError("Connection lost."))
            .finally(() => setLoading(false));
    }, [id]);


    useEffect(() => {
        if (article && !loading) {
            setTimeout(() => {
                const viewerElement = document.querySelector(`.${VIEWER_CLASS}`);
                if (!viewerElement) return;
                const headings = viewerElement.querySelectorAll('h1, h2, h3');
                if (headings.length === 0) return;
                const tocData = Array.from(headings).map((head, index) => ({
                    index: index, text: head.innerText, level: parseInt(head.tagName.replace('H', '')),
                }));
                setToc(tocData);
            }, 800);
        }
    }, [article, loading]);

    const scrollToHeading = (index) => {
        const viewerElement = document.querySelector(`.${VIEWER_CLASS}`);
        if (!viewerElement) return;
        const headings = viewerElement.querySelectorAll('h1, h2, h3');
        const targetElement = headings[index];
        if (targetElement) {
            const y = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen msg={error} />;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed', // 视差效果：背景固定，内容滚动
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowX: 'hidden'
        }}>


            <div style={{
                position: 'absolute', inset: 0,
                backgroundColor: 'rgba(235, 240, 243, 0.85)',
                // 模糊滤镜：让背景图看起来像焦外散景
                backdropFilter: 'blur(3px)',
                zIndex: 0
            }} />

            {/* 内容层需要 zIndex > 0 */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* 顶部导航 */}
                <div style={{
                    position: 'fixed', top: 0, left: 0, padding: '30px 40px', zIndex: 50,
                    display: 'flex', alignItems: 'center'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-sub)',
                            opacity: 0.8, transition: 'opacity 0.2s',
                            textShadow: '0 0 10px rgba(255,255,255,0.8)' // 防止背景太花看不清
                        }}
                    >
                        <ArrowLeft size={16} /> BACK_TO_LAST_PAGE
                    </button>
                </div>

                {/* 左侧目录 */}
                {toc.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="desktop-only"
                        style={{
                            position: 'fixed', left: '40px', top: '150px', width: '220px',
                            maxHeight: '60vh', overflowY: 'auto', zIndex: 40
                        }}
                    >
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-blue)',
                            marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                            <AlignLeft size={12} /> CONTENTS
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '15px' }}>
                            {toc.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => scrollToHeading(item.index)}
                                    style={{
                                        fontSize: '11px', fontFamily: 'var(--font-sans)', cursor: 'pointer',
                                        color: 'var(--text-sub)', paddingLeft: `${(item.level - 1) * 8}px`,
                                        lineHeight: '1.4', transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
                                    onMouseLeave={(e) => e.target.style.color = 'var(--text-sub)'}
                                >
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* --- 核心：信纸容器 --- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        width: '100%',
                        maxWidth: '1100px',

                        // 信纸背景：稍微透一点点，更有层次感
                        background: `
                        radial-gradient(circle at center, var(--paper-color) 50%, #F5F0E6 100%),
                        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")
                    `,
                    backgroundColor: 'var(--paper-color)', // 降级回退

                        marginTop: '80px', marginBottom: '80px',
                        padding: '100px 100px', // 内边距也相应加大，保持呼吸感
                        boxShadow: '0 15px 50px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)', // 加一个极细的边框线增加质感
                        position: 'relative',
                        boxSizing: 'border-box',
                         overflow: 'hidden' // 确保花纹不溢出
                    }}
                >
                     <div style={{ color: 'var(--text-main)' }}>
                    <CornerOrnament position="tl" />
                    <CornerOrnament position="tr" />
                    <CornerOrnament position="bl" />
                    <CornerOrnament position="br" />
                </div>
                    {/* Header: 日期与元数据 */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        marginBottom: '60px', borderBottom: '1px solid #eee', paddingBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                             <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-sub)' }}>
                                 REF: {article.id.toString().padStart(4, '0')}
                             </span>
                             <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-red)' }}>
                                 {article.date}
                             </span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {article.tags.map(tag => (
                                <span key={tag} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                                    border: '1px solid #ddd', padding: '2px 8px', color: '#999', borderRadius: '10px'
                                }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 标题 */}
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '48px', // 标题字号加大
                        fontWeight: 'normal',
                        color: '#1a1a1a',
                        lineHeight: '1.2',
                        margin: '0 0 40px 0',
                        textAlign: 'left'
                    }}>
                        {article.title}
                    </h1>

                    {/* 摘要 */}
                    {article.excerpt && (
                        <div style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '20px',
                            fontStyle: 'italic',
                            color: 'var(--text-sub)',
                            lineHeight: '1.6',
                            marginBottom: '70px',
                            paddingLeft: '30px',
                            borderLeft: '2px solid var(--accent-blue)'
                        }}>
                            "{article.excerpt}"
                        </div>
                    )}

                    {/* 作者 */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px',
                        fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-main)'
                    }}>
                        <User size={14} />
                        <span>FROM: {article.author_nickname || article.author}</span>
                    </div>

                    {/* 文章正文 */}
                    <div className={VIEWER_CLASS}>
                        <Viewer value={article.content} plugins={plugins} />
                    </div>
 <div style={{
                    marginTop: '100px', textAlign: 'center',
                    fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: '#aaa',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                }}>
                    <div style={{ width: '40px', height: '1px', background: '#ccc' }} />
                    Fin.
                </div>


                </motion.div>

                <Footer />
            </div>
        </div>
    );
};

// Loading 和 Error 组件保持不变，但记得把背景设为 transparent 以显示背景图
const LoadingScreen = () => (
    <div style={{ height: '100vh', width:'100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '15px' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: '#555' }}>Opening the envelope...</div>
    </div>
);
const ErrorScreen = ({ msg }) => (
    <div style={{ height: '100vh', width:'100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-red)' }}>ERROR: {msg}</div>
        <a href="/blog" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', textDecoration: 'underline' }}>Return Home</a>
    </div>
);


// --- 装饰组件 1: 复古角落花纹 ---
const CornerOrnament = ({ position }) => {
    // position: 'tl' (top-left), 'tr', 'bl', 'br'
    const style = {
        position: 'absolute',
        width: '80px',
        height: '80px',
        opacity: 0.15, // 极淡，像水印
        pointerEvents: 'none', // 不影响点击
        zIndex: 0,
        // 根据位置旋转
        top: position.startsWith('t') ? '15px' : 'auto',
        bottom: position.startsWith('b') ? '15px' : 'auto',
        left: position.startsWith('l') ? '15px' : 'auto',
        right: position.startsWith('r') ? '15px' : 'auto',
        transform: `rotate(${
            position === 'tr' ? 90 :
            position === 'br' ? 180 :
            position === 'bl' ? 270 : 0
        }deg)`
    };

    return (
        <svg style={style} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M10,10 L30,10 M10,10 L10,30" strokeWidth="3" />
            <path d="M10,10 Q40,10 50,40 T90,90" strokeDasharray="2 2" />
            <path d="M10,10 Q10,40 40,50" />
            <circle cx="10" cy="10" r="3" fill="currentColor" />
            <path d="M90,90 L95,95" />
            {/* 欧式卷草纹简化版 */}
            <path d="M20,20 C40,20 40,5 60,5 C80,5 80,20 90,30" />
            <path d="M20,20 C20,40 5,40 5,60 C5,80 20,80 30,90" />
        </svg>
    );
};

// --- 装饰组件 2: 顶部复古分割线 ---
const VintageDivider = () => (
    <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        margin: '40px 0',
        opacity: 0.3,
        color: 'var(--text-main)'
    }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, currentColor, transparent)' }} />
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px' }}>✦</div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, currentColor, transparent)' }} />
    </div>
);



export default Read;
