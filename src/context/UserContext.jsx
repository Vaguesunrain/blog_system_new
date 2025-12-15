// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE } from '../data/config';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 核心数据缓存
  const [userInfo, setUserInfo] = useState(null);
  const [themeConfig, setThemeConfig] = useState(null); // 存颜色配置
  const [bgUrl, setBgUrl] = useState(null);             // 存背景图 Blob URL
  const [avatarUrl, setAvatarUrl] = useState(null);     // 存头像 Blob URL

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 核心加载函数 (只调用一次)
  const fetchUserData = async (forceUpdate = false) => {
    // 如果已有数据且不是强制更新，直接返回，不再请求后端
    if (bgUrl && !forceUpdate) return;

    setLoading(true);
    try {
      // 1. 获取文字信息 (Info + Theme)
      const infoRes = await fetch(`${API_BASE}/user-info`, { credentials: 'include' });
      if (infoRes.status === 401) throw new Error("Unauthorized");
      const infoData = await infoRes.json();

      if (infoData.success) {
        setUserInfo({
          name: infoData.data.nickname,
          role: infoData.data.role,
          motto: infoData.data.motto,
          email: infoData.data.email
        });
        setThemeConfig(infoData.data.themeConfig || {
            color: '#EBF0F3', opacity: 90, gradientStop: 60
        });
      }

      // 2. 获取图片 (并行请求)
      // 注意：加上 t=Date.now() 是为了在 update 强制刷新时避开浏览器强缓存
      const [bgRes, avatarRes] = await Promise.all([
        fetch(`${API_BASE}/get-background?t=${Date.now()}`, { credentials: 'include' }),
        fetch(`${API_BASE}/get-photo?t=${Date.now()}`, { credentials: 'include' })
      ]);

      if (bgRes.ok) {
        const blob = await bgRes.blob();
        // 释放旧的 URL 内存
        if (bgUrl) URL.revokeObjectURL(bgUrl);
        setBgUrl(URL.createObjectURL(blob));
      }

      if (avatarRes.ok) {
        const blob = await avatarRes.blob();
        if (avatarUrl) URL.revokeObjectURL(avatarUrl);
        setAvatarUrl(URL.createObjectURL(blob));
      }

    } catch (err) {
      console.error("Context Load Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 供组件调用的更新方法 (比如上传了新图后)
  const refreshData = () => fetchUserData(true);

  // 初始化加载
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{
        userInfo, setUserInfo,
        themeConfig, setThemeConfig,
        bgUrl, setBgUrl,
        avatarUrl, setAvatarUrl,
        loading, error, refreshData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
