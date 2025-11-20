const iconContainer = document.getElementById('myIconContainer');
const planets = document.querySelectorAll('.planet');
const focusContainer = document.getElementById('focus-container');
const focusElement = document.getElementById('focus-element');
const focusIframe = document.getElementById('focus-iframe');
const closeFocusBtn = document.getElementById('close-focus-btn');
var parameter = false;
var user=null;
var tempuser = null; // 用于存储临时用户数据
let originalPlanetRect = null; // 存储原始行星位置用于关闭动画
let countidex = false; // 用于判断是否已经点击过行星
// --- 初始展开/收起逻辑 ---
iconContainer.addEventListener('click', () => {
    iconContainer.classList.toggle('expanded');

    if (countidex) {
        if (tempuser != user ||user == null) {
            getusername();  //避免重复获取用户信息
            tempuser = user; // 更新临时用户数据
        }

    }
     countidex = !countidex; // 切换状态
});

// --- 行星点击逻辑 ---
planets.forEach(planet => {
    planet.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止触发其他事件

        const clickedPlanet = e.target;
        const planetRect = clickedPlanet.getBoundingClientRect();
        const planetStyle = getComputedStyle(clickedPlanet);
        const iframeSrc = clickedPlanet.dataset.iframeSrc;
iframeSrc
        if (!iframeSrc) {
            console.warn('Planet does not have data-iframe-src');
            return;
        }

        originalPlanetRect = planetRect; // 存储位置

        // 1. 设置 focus-element 初始状态 (匹配行星)
        focusElement.style.top = `${planetRect.top}px`;
        focusElement.style.left = `${planetRect.left}px`;
        focusElement.style.width = `${planetRect.width}px`;
        focusElement.style.height = `${planetRect.height}px`;
        focusElement.style.backgroundColor = planetStyle.backgroundColor;
        focusElement.style.borderRadius = '50%';
        focusElement.style.transform = 'translate(0, 0)'; // 清除之前的 transform
        focusElement.style.opacity = '1'; // 显示元素本身
         focusIframe.classList.remove('iframe-visible'); // 确保 iframe 隐藏
         focusIframe.src = ''; // 清空之前的 src

        // 2. 显示聚焦容器
        focusContainer.classList.add('focus-active');

        // --- 开始动画序列 ---
        // 使用 setTimeout 确保初始样式渲染完成
        setTimeout(() => {
            // 3. 移动到中心
            focusElement.classList.add('focus-element-moving');

            // 4. 监听移动结束事件
            focusElement.addEventListener('transitionend', function handleMoveEnd(event) {
                // 确保是 top 或 left 动画结束
                if (event.propertyName === 'top' || event.propertyName === 'left') {
                    focusElement.removeEventListener('transitionend', handleMoveEnd); // 清理监听器

                    // 5. 展开成矩形
                    focusElement.classList.add('focus-element-expanding');

                    // 6. 监听展开结束事件
                    focusElement.addEventListener('transitionend', function handleExpandEnd(event) {
                       // 确保是 width 或 height 动画结束
                       if (event.propertyName === 'width' || event.propertyName === 'height') {
                            focusElement.removeEventListener('transitionend', handleExpandEnd); // 清理监听器

                            // 7. 加载并显示 iframe
                            focusIframe.src = iframeSrc;
                            focusIframe.classList.add('iframe-visible');
                        }
                    });
                }
            });
        }, 50); // 短暂延迟
    });
});

// --- 关闭按钮逻辑 ---
closeFocusBtn.addEventListener('click', closeFocusView);
focusContainer.addEventListener('click', (e) => {
    // 点击容器背景关闭 (如果点击的不是 focus-element 或其子元素)
    if (e.target === focusContainer) {
        closeFocusView();
    }
});

function closeFocusView() {
     if (!focusContainer.classList.contains('focus-active')) return; // 防止重复关闭
    console.log('Closing focus view...');

    // 1. 隐藏 Iframe
    focusIframe.classList.remove('iframe-visible');
    focusIframe.src = ''; // 停止加载

    // 2. 收缩回圆形 (移除 expanding 类)
    focusElement.classList.remove('focus-element-expanding');

    // 3. 监听收缩结束事件
    focusElement.addEventListener('transitionend', function handleShrinkEnd(event) {
         if (event.propertyName === 'width' || event.propertyName === 'height') {
            focusElement.removeEventListener('transitionend', handleShrinkEnd);

             // 4. 移动回初始位置 (移除 moving 类)
             // 注意: 直接移除类会让它跳回 JS 设置的 inline style (即原始行星位置)
             focusElement.classList.remove('focus-element-moving');

             // (可选) 如果想让它平滑移回，需要重新设置 top/left 为原始值，并监听动画结束
             // 如果不需要移回动画，可以直接隐藏
             // focusElement.style.top = `${originalPlanetRect.top}px`;
             // focusElement.style.left = `${originalPlanetRect.left}px`;
             // focusElement.style.width = `${originalPlanetRect.width}px`;
             // focusElement.style.height = `${originalPlanetRect.height}px`;
             // focusElement.style.borderRadius = '50%';
             // focusElement.style.transform = 'translate(0, 0)';

             // 5. 监听移动结束/或直接隐藏
             focusElement.addEventListener('transitionend', function handleMoveBackEnd(event) {
                if (event.propertyName === 'top' || event.propertyName === 'left') {
                   focusElement.removeEventListener('transitionend', handleMoveBackEnd);
                   // 6. 隐藏聚焦容器
                   focusContainer.classList.remove('focus-active');
                   focusElement.style.opacity = '0'; // 隐藏元素
                   originalPlanetRect = null; // 清理
                }
             });
             // 如果不想要返回动画，直接在这里隐藏
             // focusContainer.classList.remove('focus-active');
             // focusElement.style.opacity = '0';
             // originalPlanetRect = null;

        }


    });
     // 如果收缩没有触发 (例如 display:none 导致)，直接隐藏
     setTimeout(() => {
         if (focusContainer.classList.contains('focus-active') && !focusElement.classList.contains('focus-element-expanding')) {
             focusContainer.classList.remove('focus-active');
             focusElement.style.opacity = '0';
             originalPlanetRect = null;
         }
     }, parseFloat(getComputedStyle(focusElement).transitionDuration) * 1000 * 2 + 100); // 略长于两次动画时间


}







function getusername() {
     fetch(API_BASE_URL + '/user', {
  method: 'GET',
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  if (data.loggedIn) {
    parameter =true;
    user=data.username;
    console.log(user);
    getperson_photo();
  } else {
    console.log('Not logged in');
    // 处理未登录用户的情况，例如显示登录按钮等
  }
})
.catch(error => {
  console.error('Error fetching user data:', error);
  // 处理请求错误的情况
});
}


function getperson_photo() {
  if (user!=null) {

  console.log("getget");
  fetch(API_BASE_URL + '/get-photo', {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.blob())
    .then(blob => {
        const imgElement= document.querySelector('.icon-img');
        const buttonElement= document.getElementById('Login-button');
        buttonElement.textContent = '我的主页';
        buttonElement.setAttribute('onclick', 'window.location.href="../Login/personal.html"');
         buttonElement.removeAttribute('data-iframe-src', '../Login/loading.html');//移除iframe,采用跳转
            if (imgElement) {
                    imgElement.src = URL.createObjectURL(blob);
                } else {
                    console.error('Image element not found');
                }
    })
    .catch(error => console.error('Error fetching photo:', error));
}
else{
  console.log("nonono");

}
}
