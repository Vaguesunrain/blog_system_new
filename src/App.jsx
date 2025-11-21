import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StarBackground from './components/StarBackground';
import Loading from './components/Loading';
import Navbar from './components/Navbar';
import Home from './components/Home_use/Home';
import Blog from './components/blog_use/Blog'; // 引入 Blog

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('HOME'); // 增加页面状态

  return (
    <>
      <StarBackground />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loading key="loader" onComplete={() => setIsLoading(false)} />
        ) : (
          <>
            {/* 将状态传给 Navbar */}
            <Navbar
              key="navbar"
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />

            {/* 内容区域切换动画 */}
            {/* 我们加一个简单的 motion.div 做淡入淡出 */}
            <div style={{ paddingTop: '0px' }}>
              <AnimatePresence mode="wait">
                {currentTab === 'HOME' && (
                  <PageWrapper key="home">
                    <Home />
                  </PageWrapper>
                )}

                {currentTab === 'BLOG' && (
                  <PageWrapper key="blog">
                    <Blog />
                  </PageWrapper>
                )}

                {/* 暂时没有 WRITE 页面，可以用 Blog 代替或者显示建设中 */}
                {currentTab === 'WRITE' && (
                   <PageWrapper key="write">
                     <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                       ACCESS DENIED // MODULE UNDER CONSTRUCTION
                     </div>
                   </PageWrapper>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// 小小的包装组件，处理页面切换动画
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export default App;
