function handleNavbarAnimation() {
    // 获取导航栏元素
    var navbar = document.getElementById('nav');
    // 获取主要的滚动内容容器
    var mainContent = document.querySelector('.main-content'); // <--- 获取滚动容器

    // 如果找不到任一元素，则退出以防出错
    if (!navbar) {
        console.error("Navbar element with ID 'nav' not found.");
        return;
    }
    if (!mainContent) {
        console.error("Main content element with class 'main-content' not found.");
        return;
    }

    // 获取当前滚动距离 *在 main-content 元素内部*
    var scrollTop = mainContent.scrollTop; // <--- 从 mainContent 获取 scrollTop

    console.log("Main Content ScrollTop:", scrollTop); // 调试输出当前滚动距离

    // --- 定义阈值 ---
    // 这些阈值现在是相对于 .main-content 内部的滚动距离
    var hideThreshold = 500;       // 导航栏向上隐藏的阈值
    var backgroundChangeThreshold = 90; // 背景变化的阈值

    // --- 处理导航栏隐藏/显示 ---
    if (scrollTop > hideThreshold) {
        // 滚动超过隐藏阈值，添加 'navbar-hidden-above' 类使其向上滑动隐藏
        navbar.classList.add('navbar-hidden-above');
    } else {
        // 滚动未超过隐藏阈值，移除 'navbar-hidden-above' 类使其向下滑动出现
        navbar.classList.remove('navbar-hidden-above');
    }

    // --- 处理导航栏背景变化 ---
    if (scrollTop > backgroundChangeThreshold) {
        // 滚动超过背景变化阈值，添加 'navbar-solid-bg' 类改变背景
        navbar.classList.add('navbar-solid-bg');
    } else {
        // 移除类以恢复原始背景
        navbar.classList.remove('navbar-solid-bg');
    }
}

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取滚动容器元素
    var mainContentElement = document.querySelector('.main-content');

    if (mainContentElement) {
        // 将滚动事件监听器附加到 main-content 元素上
        mainContentElement.addEventListener('scroll', handleNavbarAnimation); // <--- 监听 mainContent 的滚动

        // 在页面加载时也调用一次，设置初始状态
        // (因为 mainContent 初始 scrollTop 通常为 0)
        handleNavbarAnimation();
    } else {
        console.error("Could not attach scroll listener: Main content element not found.");
    }
});


function FindAdmin() {
    window.location.href = '../about';
}

