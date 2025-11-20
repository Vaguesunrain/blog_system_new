function showModal() {
    document.getElementById('myModal').style.display = "flex";
}

function closeModal() {
    document.getElementById('myModal').style.display = "none";
}

function showModal_icon() {
        document.getElementById('myModal_icon').style.display = 'block';
}

function closeModal_icon() {
    document.getElementById('myModal_icon').style.display = "none";
}
function redirectToHome() {
    window.location.href = "../loading.html";
}



function getusernameForInfo() {
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
    onlyGetperson_photo();
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


function onlyGetperson_photo() {//only get photo of the person logged in
  if (user!=null) {
  fetch(`${API_BASE_URL}/get-photo`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.blob())
    .then(blob => {
        const imgElement= document.getElementById('userAvatar');
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

function uploadAvatar(imageBlob) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    formData.append('avatar', imageBlob, 'avatar.png');

    fetch(`${API_BASE_URL}/push-photo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`服务器错误: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      console.error('图片上传失败:', error);
      reject(error);
    });
  });
}



//2025/6/20
const calendarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>`;
const eyeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5 5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;


function createArticleCard(articleData) {
    const stripDiv = document.createElement('div');
    stripDiv.classList.add('stellar-log-strip');
    stripDiv.dataset.articleId = articleData.id; // 将文章ID存入data属性

    // --- 左侧图片 ---
    const stripImageWrapper = document.createElement('div');
    stripImageWrapper.classList.add('strip-image-wrapper');
    const img = document.createElement('img');
    img.src = articleData.imageUrl;
    img.alt = articleData.title;
    stripImageWrapper.appendChild(img);
    stripDiv.appendChild(stripImageWrapper);

    // --- 右侧内容 ---
    const stripContent = document.createElement('div');
    stripContent.classList.add('strip-content');

    // 内容上部 (标题, 元数据, 摘要)
    const contentTop = document.createElement('div');
    contentTop.classList.add('content-top');

    const stripTitle = document.createElement('h3');
    stripTitle.classList.add('strip-title');
    stripTitle.textContent = articleData.title;
    contentTop.appendChild(stripTitle);

    const stripMeta = document.createElement('div');
    stripMeta.classList.add('strip-meta');
    stripMeta.innerHTML = `
        <span class="meta-item">${calendarSvg} ${new Date(articleData.date).toLocaleDateString()}</span>
        <span class="meta-item">${eyeSvg} ${articleData.views.toLocaleString()} Views</span>
        <span class="meta-item">${userSvg} ${articleData.author}</span>
    `;
    contentTop.appendChild(stripMeta);

    const stripcontent = document.createElement('p');
    stripcontent.classList.add('strip-content');
    stripcontent.textContent = articleData.content;
    contentTop.appendChild(stripcontent);

    stripContent.appendChild(contentTop);

    // 内容底部 (按钮)
    const contentBottom = document.createElement('div');
    contentBottom.classList.add('content-bottom');

    const readMoreLink = document.createElement('a');
    readMoreLink.href = `/articles/${articleData.id}`; // 假设有这样的链接
    readMoreLink.classList.add('strip-read-more');
    readMoreLink.textContent = 'Access Full Log';
    contentBottom.appendChild(readMoreLink);

    // --- 新增：操作按钮 ---
    const actionButtons = document.createElement('div');
    actionButtons.classList.add('action-buttons');

    const editButton = document.createElement('button');
    editButton.classList.add('action-btn', 'strip-edit-btn');
    editButton.textContent = 'Edit';
    editButton.onclick = () => {
        alert(`Request to EDIT article ID: ${articleData.id}`);
        // 在这里可以实现跳转到编辑页面等逻辑
        // window.location.href = `/edit-article/${articleData.id}`;
    };
    actionButtons.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('action-btn', 'strip-delete-btn');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
        if (confirm(`Are you sure you want to DELETE article ID: ${articleData.id}? This action cannot be undone.`)) {
            alert(`Request to DELETE article ID: ${articleData.id}`);
            // 在这里可以实现向服务器发送DELETE请求的逻辑
            // fetch(`/api/delete-article/${articleData.id}`, { method: 'DELETE' })
            //    .then(response => response.json())
            //    .then(data => { console.log(data); stripDiv.remove(); });
        }
    };
    actionButtons.appendChild(deleteButton);

    contentBottom.appendChild(actionButtons);
    stripContent.appendChild(contentBottom);
    stripDiv.appendChild(stripContent);

    return stripDiv;
}

/**
 * 从服务器获取文章数据
 * @returns {Promise<Array>} - 包含文章对象的数组
 */
async function getArticlesData() {
    // 使用相对路径，这样无论部署在哪里都能工作
    const apiUrl = API_BASE_URL + '/get-my-articles-list';
    try {
        // 在 fetch 请求中添加配置对象
        const response = await fetch(apiUrl, {
            credentials: 'include'
        });

        if (!response.ok) {

            if (response.status === 401) {
                console.error("Authentication failed. The server didn't recognize the user session.");
                alert("Your session may have expired. Please log in again.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch article data:", error);
        return [];
    }
}
async function loadMyArticles() {
    // 获取需要控制的所有DOM元素
    const container = document.getElementById('myArticlesContainer');
    const emptyState = document.getElementById('emptyStateMessage');
    const moreLink = document.getElementById('moreBlogsLink');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // 开始加载，显示加载动画
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    container.style.display = 'none';
    emptyState.style.display = 'none';
    moreLink.style.display = 'none';
    container.innerHTML = '';

    // 从服务器获取所有文章数据
    const allArticles = await getArticlesData();

    // 加载完成，隐藏加载动画
    if (loadingIndicator) loadingIndicator.style.display = 'none';

    // --- 核心逻辑：根据数据长度决定显示哪个视图 ---
    if (allArticles && allArticles.length > 0) {
        // --- 情况一：有数据 ---

        // 1. 隐藏“无数据”提示
        emptyState.style.display = 'none';

        // 2. 获取最新的文章 (假设服务器返回的是按时间升序排列)
        //    我们反转数组以得到最新的在前，然后用 slice(0, 3) 取前3个。
        const latestThreeArticles = [...allArticles].reverse().slice(0, 3);

        // 3. 遍历这3篇文章，创建并添加卡片
        latestThreeArticles.forEach(articleData => {
            const cardElement = createArticleCard(articleData);
            container.appendChild(cardElement);
        });

        // 4. 显示卡片容器
        container.style.display = 'flex'; // 使用flex来布局卡片

        // 5. 如果文章总数大于3，则显示“更多”链接
        if (allArticles.length > 3) {
            moreLink.style.display = 'block';
        }

    } else {
        // --- 情况二：无数据 ---

        // 1. 显示“无数据”提示
        emptyState.style.display = 'block';
        // 2. 确保其他部分隐藏
        container.style.display = 'none';
        moreLink.style.display = 'none';
    }
}


//动画
function triggerPageTwoAnimations() {
    // 1. 找到 page_two 里的所有文章卡片
    const cards = document.querySelectorAll('.page_two .stellar-log-strip');

    // 2. 遍历所有卡片
    cards.forEach((card, index) => {
        // 3. 使用 setTimeout 创建一个延迟
        //    - 第一个卡片延迟 150ms
        //    - 第二个卡片延迟 300ms
        //    - 第三个卡片延迟 450ms
        //    这样就形成了交错效果
        setTimeout(() => {
            card.classList.add('is-visible');
        }, 150 * (index + 1)); // 这里的 150 是延迟时间，可以调整
    });
}

/**
 * (可选但推荐) 重置第二页的动画
 * 当用户离开第二页时，移除 .is-visible 类，以便下次进入时可以重新播放动画
 */
function resetPageTwoAnimations() {
    const cards = document.querySelectorAll('.page_two .stellar-log-strip');
    cards.forEach(card => {
        card.classList.remove('is-visible');
    });
}
