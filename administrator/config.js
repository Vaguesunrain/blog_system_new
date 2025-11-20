
 var   API_BASE_URL= "";
 var  HOME_URL= "";


 function goToHomePage() {
     window.location.href = HOME_URL+'/loading';
 }
 function goToViewPage() {
     window.location.href =HOME_URL+'/work_space/view';
 }
 function goToEditPage() {
     window.location.href = HOME_URL+'/work_space/blue_card_edit';
 }
 function goToSpecialPage() {
     window.location.href =HOME_URL+'/timed-cards-opening/index';
 }


 function downloadFileLocally(content, filename, mimeType) {

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none'; // 确保它不可见
    document.body.appendChild(a); // 附加到文档中才能被点击
    a.href = url;
    a.download = filename;


    a.click();


    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);

    console.log(`已触发下载: ${filename}`);
}

function saveToServer(mdContent, htmlContent, filenameBase, mode, id, labels) {
        const statusDiv = $('#save-status');
        const imageUrls = [];
        const regex = new RegExp("!\\[.*?\\]\\((/uploads/[^)]+)\\)", "g");
        let match;

        statusDiv.text('正在保存...');

        while ((match = regex.exec(mdContent)) !== null) {
            imageUrls.push(match[1]);
        }

        // 1. 创建一个基础数据对象
        const dataToSend = {
            md_content: mdContent,
            html_content: htmlContent,
            filename_base: filenameBase,
            images: imageUrls,
            mode: mode,
            labels: labels
        };

        // 2. 如果是 'fix' 模式，才添加 id 参数
        if (mode === 'fix' && id) {
            dataToSend.id = id;
        }

        $.ajax({
            url: API_BASE_URL + '/save', // 你的保存接口地址
            type: 'POST',
            data: dataToSend, // 使用我们刚刚构建的 dataToSend 对象
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                if (response.status === 'success') {
                    statusDiv.text('文件已成功保存: ' + response.md_filepath);
                    console.log('Server response:', response);
                } else {
                    statusDiv.text('保存失败: ' + response.message);
                    console.error('Save error:', response.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                let errMsg = `${textStatus} - ${errorThrown}`;
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    errMsg = jqXHR.responseJSON.message;
                } else if (jqXHR.responseText) {
                    try {
                        const errData = JSON.parse(jqXHR.responseText);
                        if (errData.message) errMsg = errData.message;
                    } catch (e) { /* Ignore parsing error */ }
                }
                statusDiv.text('保存时发生错误: ' + errMsg);
                console.error('AJAX error:', textStatus, errorThrown, jqXHR.responseText);
            }
        });
    }
