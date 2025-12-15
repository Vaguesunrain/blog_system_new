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
import UserAuthSystem from './components/UserAuthSystem';
import { UserProvider } from './context/UserContext';
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation(); // 获取当前路径，用于触发动画

  const isReadPage = location.pathname.startsWith('/read/');
   const isBlogManagePage = location.pathname == '/blog-manage';
  return (
    // 3. [关键位置] UserProvider 包裹一切
    <UserProvider>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loading key="loader" onComplete={() => setIsLoading(false)} />
        ) : (
          <>
            {/*
               4. Navbar 显示逻辑
               只要路径变化，App 组件就会重绘，这里就会重新判断
            */}
            {!isReadPage && !isBlogManagePage && <Navbar key="navbar" />}

            <div style={{ paddingTop: '0px' }}>
              <AnimatePresence mode="wait">
                {/* Routes key 保持 location.pathname 确保页面切换动画 */}
                <Routes location={location} key={location.pathname}>

                  <Route path="/" element={
                    <PageWrapper><Home /></PageWrapper>
                  } />

                  <Route path="/blog" element={
                    <PageWrapper><Blog /></PageWrapper>
                  } />

                  <Route path="/write" element={
                    <PageWrapper><Write /></PageWrapper>
                  } />

                  <Route path="/profile" element={
                    <PageWrapper><Profile /></PageWrapper>
                  } />

                  <Route path="/read/:id" element={<Read />} />

                  {/* 确保这里的 path 和上面定义的 isBlogManagePage 匹配 */}
                  <Route path="/blog-manage" element={<BlogManage />} />

                </Routes>

                {/* 登录弹窗系统也放在 Provider 内部，这样登录后可以直接更新 Context */}
                <UserAuthSystem />
              </AnimatePresence>
            </div>
          </>
        )}
      </AnimatePresence>
    </UserProvider>
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
