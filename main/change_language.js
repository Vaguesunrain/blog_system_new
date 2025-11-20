const buttonElement = document.getElementById('button2');
const textContainer= document.getElementById('button2');
const textContainer2= document.getElementById('button1');
const textContainer3= document.getElementById('h2part');
// === 新增：存储原始文字内容 和 状态变量 ===
let originalTextContent = ''; // 用于存储 .column_left_2 加载时的原始文本
let isOriginalTextDisplayed = true; // 状态变量，记录当前显示的是否是原始文本

// 检查元素是否存在
if (buttonElement && textContainer3) {
    // === 新增：在脚本加载时获取并存储原始文本 ===
    // 确保在 DOM 准备好后获取，或者在 window load 事件中获取
    originalTextContent = textContainer.textContent.trim();
    originalTextContent2 = textContainer2.textContent.trim();
    originalTextContent3 = textContainer3.textContent.trim();
    buttonElement.style.cursor = 'pointer'; // 添加鼠标指针样式

    // 添加点击事件监听器
    buttonElement.addEventListener('click', function() {
        const currentTextToShatter = textContainer.textContent.trim();
        if (!currentTextToShatter || buttonElement.style.pointerEvents === 'none') {
            return;
        }
        buttonElement.style.pointerEvents = 'none'

        // 根据当前状态，确定下一次要显示的文本
        let nextTextContent;
        let nextTextContent2;
        let nextTextContent3;
        if (isOriginalTextDisplayed) {
            // 当前显示的是原始文本，下次要显示 "this is a blog"
            nextTextContent = "Change to Chinese";
            nextTextContent2 = "find administrator";
            nextTextContent3 = "Eyes on the stars, relentlessly onward.";

        } else {
            nextTextContent = originalTextContent;
            nextTextContent2 = originalTextContent2;
            nextTextContent3 = originalTextContent3;
        }

        // 调用粉碎函数
        // shatterText 函数会粉碎 currentTextToShatter，并在动画结束后将内容设为 nextTextContent
        shatterText(textContainer, nextTextContent, function() {

            isOriginalTextDisplayed = !isOriginalTextDisplayed;
            buttonElement.style.pointerEvents = '';
            // console.log("SVG点击已启用"); // 调试信息
        });
        shatterText(textContainer2, nextTextContent2, function() {

        });
        shatterText(textContainer3, nextTextContent3, function() {

        });
    }); // end of svg click listener


    function shatterText(element, newText, callback) {
        const originalText = element.textContent.trim(); // 粉碎的是当前的文本

        // 如果当前文本为空或与目标新文本相同，直接设置新文本并结束（避免粉碎空内容）
        if (!originalText || originalText === newText) {
             element.textContent = newText;
             if (callback) callback();
             return;
         }
        element.textContent = ''; // 清空原始文本内容
        element.style.position = 'relative'; // 确保容器是相对定位
        const pieces = []; // 存储文字碎片元素
        const characters = originalText.split('');
        characters.forEach(char => {
            const piece = document.createElement('span');
            piece.textContent = char;
            piece.classList.add('shatter-piece'); // 应用 CSS 类
            element.appendChild(piece);
            pieces.push(piece);
        });
        const containerRect = element.getBoundingClientRect(); // 获取容器的位置和尺寸 (在添加所有碎片后获取更准确)

        // 2. 获取每个碎片在静态位置时的getBoundingClientRect，然后将其位置设为absolute并应用这个位置
        pieces.forEach(piece => {
            const rect = piece.getBoundingClientRect();
            // 计算碎片相对于容器左上角的偏移量
            const initialTop = rect.top - containerRect.top;
            const initialLeft = rect.left - containerRect.left;

            // 将位置设为 absolute，并应用刚刚计算出的原始位置
            piece.style.position = 'absolute';
            piece.style.top = initialTop + 'px';
            piece.style.left = initialLeft + 'px';
            piece.style.opacity = 1; // 初始完全不透明
        });

        // 3. 稍作延迟后触发动画，让碎片飞散出去
        const animationDuration = 1.5; // 动画持续时间 (秒)
        const maxRandomDelay = 0.4; // 最大随机延迟 (秒)
        const totalPiecesToAnimate = pieces.length; // 实际创建的碎片数量
        let finishedPiecesCount = 0; // 计数器

        if (totalPiecesToAnimate === 0) {
             // 如果没有创建碎片（比如原始文本就是空的），直接设置新文本并结束
             element.style.position = ''; // 移除相对定位
             element.textContent = newText;
             if (callback) callback();
             return;
        }

        setTimeout(() => {
            pieces.forEach(piece => {
                // 随机生成目标位置、旋转、缩放和透明度
                const randomX = (Math.random() - 0.5) * 600; // X方向移动 -300px 到 +300px
                const randomY = (Math.random() - 0.5) * 600; // Y方向移动 -300px 到 +300px
                const randomRotate = (Math.random() - 0.5) * 1440; // 旋转 -720度 到 +720度
                const randomScale = 0.2 + Math.random() * 0.8; // 缩放 0.2 到 1.0
                const randomOpacity = 0; // 最终透明度为 0 (完全消失)

                // 启用 CSS 过渡效果，并设置随机延迟和持续时间
                piece.style.transition = `all ${animationDuration}s ease-out`;
                piece.style.transitionDelay = `${Math.random() * maxRandomDelay}s`;

                // 应用动画的最终样式 (这些样式会平滑过渡)
                piece.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg) scale(${randomScale})`;
                piece.style.opacity = randomOpacity;

                // 监听每个碎片的过渡结束事件 (这里主要监听 opacity 或 transform)
                 piece.addEventListener('transitionend', function handleEnd(event) {
                     // 确保只在 opacity 或 transform 属性的过渡结束时计数
                     if (event.propertyName === 'opacity' || event.propertyName === 'transform') {
                         // 移除事件监听器
                         piece.removeEventListener('transitionend', handleEnd);

                         finishedPiecesCount++;
                         // console.log(`Piece finished. Count: ${finishedPiecesCount}/${totalPiecesToAnimate}`); // 调试信息

                         // 检查是否所有碎片都已完成动画
                         if (finishedPiecesCount === totalPiecesToAnimate) {
                            // 所有动画完成！
                            // console.log("All pieces animated!"); // 调试信息

                            // 在所有动画完成后执行清理和设置新文本
                            pieces.forEach(p => p.remove()); // 从 DOM 中移除所有碎片
                            element.style.position = ''; // 移除容器的相对定位样式
                            element.textContent = newText; // 设置新的文本内容

                            // 调用回调函数（用于在外部处理后续逻辑，如重新启用点击和切换状态）
                            if (callback) callback();
                         }
                     }
                 });
            });

        }, 50); // 延迟 50 毫秒触发动画

    } // end shatterText function

    // === 新增：在页面加载完成后，如果发现当前文本不是原始文本，则更新状态 ===
    // 这处理了用户刷新页面时，如果之前是新文本，状态要正确初始化的问题
    window.addEventListener('load', function() {
         if (textContainer.textContent.trim() !== originalTextContent) {
             isOriginalTextDisplayed = false;
             // console.log("页面加载时发现不是原始文本，状态更新为 isOriginalTextDisplayed: false"); // 调试信息
         }
    });


} else {
    console.error("SVG element with ID 'shatter-trigger' or element with class 'column_left_2' not found.");
}
