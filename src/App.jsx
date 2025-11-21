import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StarBackground from './components/StarBackground';
import Loading from './components/Loading';
import Navbar from './components/Navbar';
import Home from './components/Home_use/Home'; // 确认你的路径是否正确
import Blog from './components/blog_use/Blog'; // 确认你的路径是否正确
import Write from './components/Write';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('HOME');

  return (
    <>
      <StarBackground />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loading key="loader" onComplete={() => setIsLoading(false)} />
        ) : (
          <>
            <Navbar
              key="navbar"
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />

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

                {currentTab === 'WRITE' && (
                   <PageWrapper key="write">
                     <Write /> 
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

// 这里的 PageWrapper 也需要确保宽度是 100%
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    style={{ width: '100%' }} // 确保 Wrapper 本身也是全宽
  >
    {children}
  </motion.div>
);

export default App;