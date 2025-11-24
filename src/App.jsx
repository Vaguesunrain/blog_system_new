import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // 1. 引入路由组件
import { AnimatePresence, motion } from 'framer-motion';
import StarBackground from './components/StarBackground';
import Loading from './components/Loading';
import Navbar from './components/Navbar';
import Home from './components/Home_use/Home';
import Blog from './components/blog_use/Blog';
import Write from './components/Write';
import Profile from './components/profile_use/Profile';
import Read from './components/blog_use/Read';
import BlogManage from './components/BlogManage';
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation(); // 获取当前路径，用于触发动画

  return (
    <>
      <StarBackground />

      {/* Loading 逻辑保持不变：加载完才显示路由 */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loading key="loader" onComplete={() => setIsLoading(false)} />
        ) : (
          <>
            <Navbar key="navbar" /> {/* Navbar 现在自己管理高亮，不需要传 props */}

            <div style={{ paddingTop: '0px' }}>
              {/*
                  key={location.pathname} 是关键！
                  它告诉 Framer Motion：路径变了，这已经是新页面了，请执行动画。
              */}
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>

                  <Route path="/" element={
                    <PageWrapper>
                      <Home />
                    </PageWrapper>
                  } />

                  <Route path="/blog" element={
                    <PageWrapper>
                      <Blog />
                    </PageWrapper>
                  } />

                  <Route path="/write" element={
                    <PageWrapper>
                      <Write />
                    </PageWrapper>
                  } />
                  <Route path="/profile" element={
                    <PageWrapper>
                      <Profile />
                    </PageWrapper>
                  } />
                  <Route path="/read/:id" element={<Read />} />
                  <Route path="/blog-manage" element={<BlogManage />} />
                </Routes>
              </AnimatePresence>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// PageWrapper 保持不变，负责进场动画
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

export default App;
