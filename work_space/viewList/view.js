function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('stellar-log-card');

    // ... (其他元素创建代码保持不变)
    const cardImageDiv = document.createElement('div');
    cardImageDiv.classList.add('card-image');
    const imgElement = document.createElement('img');
    imgElement.src = card.imageSrc;
    imgElement.alt = card.imageAlt;
    cardImageDiv.appendChild(imgElement);
    cardDiv.appendChild(cardImageDiv);

    const cardContentDiv = document.createElement('div');
    cardContentDiv.classList.add('card-content');

    const userSpan = document.createElement('span');
    userSpan.classList.add('card-user');
    userSpan.textContent = card.user;
    cardContentDiv.appendChild(userSpan);

    const titleH3 = document.createElement('h3');
    titleH3.classList.add('card-title');
    titleH3.textContent = card.title;
    cardContentDiv.appendChild(titleH3);

    const metaP = document.createElement('p');
    metaP.classList.add('card-meta');
    metaP.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5h16v9zM1 6v2h14V6H1z"/></svg> ${card.date}`;
    cardContentDiv.appendChild(metaP);

    const excerptP = document.createElement('p');
    excerptP.classList.add('card-excerpt');
    excerptP.textContent = card.excerpt;
    cardContentDiv.appendChild(excerptP);


    const readMoreLink = document.createElement('a');
    readMoreLink.href = 'javascript:void(0);'; // 防止页面跳转
    readMoreLink.classList.add('card-read-more');
    // 添加 data-filename 属性，用于触发预览
    readMoreLink.setAttribute('data-index', card.index);
      readMoreLink.setAttribute('data-user', card.user);
    readMoreLink.textContent = '读取完整日志 >';
    cardContentDiv.appendChild(readMoreLink);


    cardDiv.appendChild(cardContentDiv);
    return cardDiv;
}


async function getCardData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverData = await response.json();

        // 确保 serverData.title 是一个数组，以防 API 返回空数据
        if (!Array.isArray(serverData.title)) {
             console.warn("API did not return a valid 'title' array.");
             return [];
        }

        return serverData.title.map((title, i) => ({
            imageSrc: serverData.image_urls?.[i] ?? 'default-image.jpg', // 如果 image_urls 不存在或元素为空，使用默认图片
            title: title,
            user: serverData.user?.[i] ?? '未知作者',
            date: serverData.date?.[i] ?? '未知日期',
            excerpt: serverData.content?.[i] ?? '无摘要',
            imageAlt: title,
            index: serverData.index?.[i] ?? null
        }));
    } catch (error) {
        console.error("获取或处理数据失败:", error);
        return [];
    }
}

async function main() {
    const showCardsBox = document.getElementById('showCardsBox');
    const loadingIndicator = document.getElementById('loading-indicator');
    const apiUrl = API_BASE_URL + '/api/recently';

    loadingIndicator.style.display = 'block';
    showCardsBox.innerHTML = '';
    const cardData = await getCardData(apiUrl);
    loadingIndicator.style.display = 'none';

    if (cardData && cardData.length > 0) {
        cardData.forEach(card => {
            const cardElement = createCardElement(card);
            showCardsBox.appendChild(cardElement);
        });
    } else {
        showCardsBox.textContent = '未能加载日志，请稍后重试。';
    }
}


const calendarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>`;
const eyeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

function createStripElement(data) {
    const stripDiv = document.createElement('div');
    stripDiv.classList.add('stellar-log-strip');


    const stripImageWrapper = document.createElement('div');
    stripImageWrapper.classList.add('strip-image-wrapper');
    const img = document.createElement('img');
    img.src = data.imageSrc;
    img.alt = data.imageAlt;
    stripImageWrapper.appendChild(img);
    stripDiv.appendChild(stripImageWrapper);
    const stripContent = document.createElement('div');
    stripContent.classList.add('strip-content');
    const contentTop = document.createElement('div');
    contentTop.classList.add('content-top');
    const stripTitle = document.createElement('h3');
    stripTitle.classList.add('strip-title');
    stripTitle.textContent = data.title;
    contentTop.appendChild(stripTitle);
    const stripMeta = document.createElement('div');
    stripMeta.classList.add('strip-meta');
    const stardateMeta = document.createElement('span');
    stardateMeta.classList.add('meta-item');
    stardateMeta.innerHTML = `${calendarSvg} ${data.stardate}`;
    stripMeta.appendChild(stardateMeta);
    const viewsMeta = document.createElement('span');
    viewsMeta.classList.add('meta-item');
    viewsMeta.innerHTML = `${eyeSvg} ${data.views}`;
    stripMeta.appendChild(viewsMeta);
    const authorMeta = document.createElement('span');
    authorMeta.classList.add('meta-item');
    authorMeta.innerHTML = `${userSvg} ${data.author}`;
    stripMeta.appendChild(authorMeta);
    contentTop.appendChild(stripMeta);
    const stripExcerpt = document.createElement('p');
    stripExcerpt.classList.add('strip-excerpt');
    stripExcerpt.textContent = data.excerpt;
    contentTop.appendChild(stripExcerpt);
    stripContent.appendChild(contentTop);
    const contentBottom = document.createElement('div');
    contentBottom.classList.add('content-bottom');


    const readMoreLink = document.createElement('a');
    readMoreLink.href = 'javascript:void(0);'; // 防止页面跳转
    readMoreLink.classList.add('strip-read-more');
    readMoreLink.setAttribute('data-index', data.index);
    readMoreLink.setAttribute('data-user', data.author);
    readMoreLink.textContent = 'Access Full Log';
    contentBottom.appendChild(readMoreLink);


    stripContent.appendChild(contentBottom);
    stripDiv.appendChild(stripContent);
    return stripDiv;
}

async function getStripData() {
    const apiUrl = API_BASE_URL + '/api/hottest';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const serverData = await response.json();

        if (!Array.isArray(serverData.title)) {
             console.warn("Hottest API did not return a valid 'title' array.");
             return [];
        }

        return serverData.title.map((title, i) => ({
            imageSrc: serverData.image_urls?.[i] ?? 'default-image.jpg',
            imageAlt: title,
            title: title,
            stardate: serverData.date?.[i] ?? '未知日期',
            views: `${(serverData.views?.[i] ?? 0).toLocaleString()} Views`,
            author: serverData.user?.[i] ?? '未知作者',
            excerpt: serverData.content?.[i] ?? '无摘要',
            index: serverData.index?.[i] ?? null
        }));
    } catch (error) {
        console.error("获取条带数据失败:", error);
        return [];
    }
}

async function mainStrips() {
    const logStripsContainer = document.getElementById('logStripsContainer');
    const loadingIndicator = document.getElementById('strips-loading-indicator');

    loadingIndicator.style.display = 'block';
    logStripsContainer.innerHTML = '';
    const stripData = await getStripData();
    loadingIndicator.style.display = 'none';

    if (stripData && stripData.length > 0) {
        stripData.forEach(data => {
            const stripElement = createStripElement(data);
            logStripsContainer.appendChild(stripElement);
        });
    } else {
        logStripsContainer.textContent = '未能加载最热日志。';
    }
}


// --- 初始执行 ---
// main();
// mainStrips();


window.onload = function() {

    // --- Markdown Preview Logic using marked.js + prettify.js ---
    const modalOverlay = $('#md-preview-overlay');
    const closeBtn = $('#md-preview-close-btn');
    const contentDiv = $('#md-preview-content');
    const loadingDiv = $('#md-preview-loading');

    // --- Show Preview Function (New, simpler version) ---
    async function showPreview(index, user) {
        if (index === null || index === undefined || !user) {
            alert('无法加载文章，缺少索引或作者信息!');
            return;
        }

        modalOverlay.removeClass('hidden');
        loadingDiv.addClass('visible');
        contentDiv.html('');

        const apiUrl = API_BASE_URL + '/get-html';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: user, index: index })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const markdownContent = await response.text();
            const generatedHTML = marked(markdownContent);
            contentDiv.html('<div class="markdown-body">' + generatedHTML + '</div>');
            prettyPrint();
            loadingDiv.removeClass('visible');

        } catch (error) {
            console.error("加载或转换Markdown失败:", error);
            contentDiv.html(`<div class="markdown-body" style="padding: 40px; text-align: center; color: #ff4d4d;"><h3>加载失败</h3><p>${error.message}</p></div>`);
            loadingDiv.removeClass('visible');
        }
    }

    function hidePreview() {
        modalOverlay.addClass('hidden');
        setTimeout(() => contentDiv.html(''), 300);
    }

    $(document).on('click', '.card-read-more, .strip-read-more', function(e) {
        e.preventDefault();
        const $button = $(this);
        const index = $button.data('index');
        const user = $button.data('user');
        showPreview(index, user);
    });

    closeBtn.on('click', hidePreview);
    modalOverlay.on('click', function(e) { if (e.target === this) hidePreview(); });
    $(document).on('keydown', function(e) { if (e.key === "Escape" && !modalOverlay.hasClass('hidden')) hidePreview(); });

    main();
    mainStrips();
};
