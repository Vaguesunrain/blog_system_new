document.addEventListener('DOMContentLoaded', () => {
    // --- 元素获取  ---
    const articlesContainer = document.getElementById('articles-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const statusMessage = document.getElementById('status-message');
    const modalOverlay = document.getElementById('md-preview-overlay');
    const closeBtn = document.getElementById('md-preview-close-btn');
    const contentDiv = document.getElementById('md-preview-content');
    const loadingDiv = document.getElementById('md-preview-loading');

    let currentPage = 0;


    // --- 动态创建文章卡片的函数 ---
    function createCardHTML(article) {
        const dateIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>`;
        const viewsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
        const authorIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
        const excerpt = article.content.substring(0, 100) + (article.content.length > 100 ? '...' : '');

        return `
            <div class="stellar-log-strip">
                <div class="strip-image-wrapper">
                    <img src="${article.imageUrl}" alt="文章封面图">
                </div>
                <div class="strip-content">
                    <div class="content-top">
                        <h3 class="strip-title">${article.title}</h3>
                        <div class="strip-meta">
                            <span class="meta-item">${dateIcon} ${article.date}</span>
                            <span class="meta-item">${viewsIcon} ${article.views} Views</span>
                            <span class="meta-item">${authorIcon} ${article.author}</span>
                        </div>
                        <p class="strip-excerpt">${excerpt}</p>
                    </div>
                    <div class="content-bottom">
                        <div class="strip-actions">
                            <a href="#" class="strip-action-btn btn-secondary btn-edit" data-id="${article.id}">修改</a>

                            <!-- --- 修正 #1: 为"阅读全文"按钮添加正确的类名和data属性 --- -->
                            <a href="#" class="strip-action-btn btn-primary btn-read" data-filename="${article.id}.md">阅读全文</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // --- 加载并渲染文章的函数 ---
    async function fetchAndRenderArticles() {

        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = '正在加载...';

        try {
            const response = await fetch(`${API_BASE_URL}/get-paginated-articles?page=${currentPage}`, {
                credentials: 'include'
            });

            if (response.status === 401) {
                statusMessage.textContent = '登录已过期，请重新登录。';
                loadMoreBtn.style.display = 'none';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.articles && data.articles.length > 0) {
                let articlesHTML = '';
                data.articles.forEach(article => {
                    articlesHTML += createCardHTML(article);
                });
                articlesContainer.insertAdjacentHTML('beforeend', articlesHTML);
            } else if (currentPage === 0) {
                statusMessage.textContent = '你还没有发布任何文章。';
            }

            if (data.all_loaded) {
                loadMoreBtn.style.display = 'none';
                statusMessage.textContent = '已加载全部文章';
            } else {
                loadMoreBtn.disabled = false;
                loadMoreBtn.textContent = '加载更多';
            }

        } catch (error) {
            console.error('获取文章失败:', error);
            statusMessage.textContent = '加载失败，请稍后重试。';
            loadMoreBtn.textContent = '加载更多';
            loadMoreBtn.disabled = false;
        }
    }

    // --- 文章预览函数 ---
    async function showPreview(filename) {
        if (!filename) {
            alert('无法加载文章，缺少文件名!');
            return;
        }

        modalOverlay.classList.remove('hidden');

        loadingDiv.style.display = 'flex';
        contentDiv.style.display = 'none';
        contentDiv.innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/get-markdown/${filename}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `服务器错误: ${response.status}`);
            }

            const markdownContent = await response.text();
            const generatedHTML = marked.parse(markdownContent);
            contentDiv.innerHTML = `<div class="markdown-body">${generatedHTML}</div>`;
            if (window.PR) PR.prettyPrint();

        } catch (error) {
            console.error("加载或转换 Markdown 失败:", error);
            contentDiv.innerHTML = `<div class="markdown-body" style="padding: 40px; text-align: center; color: #ff4d4d;"><h3>加载失败</h3><p>${error.message}</p></div>`;
        } finally {
            loadingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
        }
    }

    function hidePreview() {
        modalOverlay.classList.add('hidden');
        setTimeout(() => {
            contentDiv.innerHTML = '';
            contentDiv.style.display = 'none';
            loadingDiv.style.display = 'flex';
        }, 300);
    }

    // --- 事件委托：统一处理所有按钮点击 ---
    articlesContainer.addEventListener('click', (event) => {

        const target = event.target.closest('a');
        if (!target) return; // 如果点击的不是<a>或其内部元素，则什么都不做

        if (target.classList.contains('btn-edit')) {
            event.preventDefault();
            const articleId = target.dataset.id;
            const filename = `${articleId}.md`;
            const card = target.closest('.stellar-log-strip');
            const titleElement = card.querySelector('.strip-title');
            const titleText = titleElement.textContent;
            window.location.href = `http://vagueame.top/work_space/blue_card_edit.html?file=${filename}&title=${titleText}`;
        }

        if (target.classList.contains('btn-read')) {
            event.preventDefault();
            const filename = target.dataset.filename;
            showPreview(filename);
        }
    });

    // --- 其他事件监听器 (保持不变) ---
    closeBtn.addEventListener('click', hidePreview);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hidePreview(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && !modalOverlay.classList.contains('hidden')) hidePreview(); });

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        fetchAndRenderArticles();
    });

    // --- 首次加载 ---
    fetchAndRenderArticles();
});
