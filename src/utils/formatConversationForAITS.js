export default function formatConversationForAI(recordsArray) {
    const roleMap = {
        'user': '用户',
        'assistant': '助手',
        'system': '系统'
    };
    
    const allImages = [];
    let xml = "<conversation>\n";
    
    recordsArray.forEach(item => {
        const role = roleMap[item.role] || item.role;
        const stage = escapeXml(item.stage || '');
        const content = escapeXml(item.content || '');
        
        xml += `  <message role="${role}" stage="${stage}">\n`;
        xml += `    <content>${content}</content>\n`;
        
        // 处理 images 字段
        const images = item.images;
        let imageList = [];
        
        if (images) {
            if (typeof images === 'string') {
                try {
                    const decoded = JSON.parse(images);
                    if (Array.isArray(decoded)) {
                        imageList = decoded;
                    } else {
                        imageList = images.split(',');
                    }
                } catch (error) {
                    imageList = images.split(',');
                }
            } else if (Array.isArray(images)) {
                imageList = images;
            }
        }
        
        imageList.forEach(url => {
            const trimmedUrl = url.trim();
            if (/^https?:\/\/.*/i.test(trimmedUrl)) {
                xml += `    <image>${escapeXml(trimmedUrl)}</image>\n`;
                allImages.push(trimmedUrl);
            }
        });
        
        xml += "  </message>\n";
    });
    
    xml += "</conversation>";
    
    return {
        history: xml,
        images: allImages
    };
}

// XML 转义辅助函数
function escapeXml(unsafe) {
    if (!unsafe) return '';
    
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// TypeScript 版本（可选）
/**
 * 格式化对话记录为 AI 可用的 XML 格式
 * @param {Array} recordsArray - 对话记录数组
 * @returns {Object} 包含格式化后的 XML 和所有图片 URL 的对象
 */
function formatConversationForAITS(recordsArray) {
    const roleMap = {
        'user': '用户',
        'assistant': '助手',
        'system': '系统'
    };
    
    const allImages = [];
    let xml = "<conversation>\n";
    
    for (const item of recordsArray) {
        const role = roleMap[item.role] || item.role;
        const stage = escapeXml(item.stage || '');
        const content = escapeXml(item.content || '');
        
        xml += `  <message role="${role}" stage="${stage}">\n`;
        xml += `    <content>${content}</content>\n`;
        
        // 处理 images 字段
        const images = item.images;
        let imageList = [];
        
        if (images) {
            if (typeof images === 'string') {
                try {
                    const decoded = JSON.parse(images);
                    if (Array.isArray(decoded)) {
                        imageList = decoded;
                    } else {
                        imageList = images.split(',');
                    }
                } catch (error) {
                    imageList = images.split(',');
                }
            } else if (Array.isArray(images)) {
                imageList = images;
            }
        }
        
        for (const url of imageList) {
            const trimmedUrl = url.trim();
            if (/^https?:\/\/.*/i.test(trimmedUrl)) {
                xml += `    <image>${escapeXml(trimmedUrl)}</image>\n`;
                allImages.push(trimmedUrl);
            }
        }
        
        xml += "  </message>\n";
    }
    
    xml += "</conversation>";
    
    return {
        history: xml,
        images: allImages
    };
}