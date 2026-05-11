import { supabase } from './supabase.js';

const emotionQuotes = [
    { text: '有些话，注定要留在草稿箱里', author: '—— 匿名' },
    { text: '深夜的消息，天亮了也没有发送', author: '—— 凌晨三点' },
    { text: '输入了又删除，删除了又输入', author: '—— 犹豫者' },
    { text: '这条消息，永远不会被收到', author: '—— 未发送' },
    { text: '想说的话很多，最后只发了一句晚安', author: '—— 克制' },
    { text: '在发送前的一秒，我选择了取消', author: '—— 胆小鬼' },
    { text: '那些没说出口的，都变成了心事', author: '—— 沉默者' },
    { text: '草稿箱里藏着多少遗憾', author: '—— 有心人' },
    { text: '有些情绪，只能自己消化', author: '—— 孤独患者' },
    { text: '编辑了很久，最终还是清空了输入框', author: '—— 未完成' },
    { text: '想你，但不会告诉你', author: '—— 暗恋者' },
    { text: '已撤回，但痕迹还在心里', author: '—— 后悔' },
    { text: '对话框打开又关闭，重复了无数次', author: '—— 纠结' },
    { text: '最后一条消息，停留在了去年', author: '—— 过期' },
    { text: '有些话，适合烂在肚子里', author: '—— 成年人' }
];

document.addEventListener('DOMContentLoaded', () => {
    let echos = [];
    let currentReplyId = null;

    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const postContent = document.getElementById('postContent');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitBtn');
    const echoList = document.getElementById('echoList');
    const emptyState = document.getElementById('emptyState');
    
    const replyModal = document.getElementById('replyModal');
    const closeModal = document.getElementById('closeModal');
    const originalPost = document.getElementById('originalPost');
    const replyContent = document.getElementById('replyContent');
    const replyCharCount = document.getElementById('replyCharCount');
    const replyBtn = document.getElementById('replyBtn');
    
    const reportModal = document.getElementById('reportModal');
    const closeReportModal = document.getElementById('closeReportModal');
    const reportSubmitBtn = document.getElementById('reportSubmitBtn');
    
    const toast = document.getElementById('toast');

    function showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * emotionQuotes.length);
        const quote = emotionQuotes[randomIndex];
        quoteText.textContent = quote.text;
        quoteAuthor.textContent = quote.author;
    }

    function updateCharCount(textarea, countEl, max) {
        const count = textarea.value.length;
        countEl.textContent = `${count}/${max}`;
        if (count > max * 0.9) {
            countEl.style.color = '#f472b6';
        } else {
            countEl.style.color = '';
        }
    }

    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = 'toast show';
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    async function loadEchos() {
        try {
            const { data: echosData, error } = await supabase
                .from('echos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const echosWithReplies = await Promise.all(
                echosData.map(async echo => {
                    const { data: replies, error } = await supabase
                        .from('replies')
                        .select('*')
                        .eq('echo_id', echo.id)
                        .order('created_at', { ascending: true });

                    if (error) throw error;

                    return {
                        ...echo,
                        replies: replies || []
                    };
                })
            );

            echos = echosWithReplies;
            renderEchos();
        } catch (error) {
            console.error('加载失败:', error);
            showToast('加载失败，请检查网络连接');
        }
    }

    function renderEchos() {
        if (echos.length === 0) {
            echoList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        echoList.style.display = 'flex';
        emptyState.style.display = 'none';
        
        echoList.innerHTML = echos.map(echo => `
            <div class="echo-card" data-id="${echo.id}">
                <p class="echo-content">${escapeHtml(echo.content)}</p>
                <div class="echo-meta">
                    <span class="echo-time">${formatTime(echo.created_at)}</span>
                    <div class="echo-actions">
                        <button class="action-btn reply-btn" data-id="${echo.id}">
                            <span>💝</span> 安慰
                        </button>
                        <button class="action-btn report-btn" data-id="${echo.id}">
                            <span>🚩</span> 报告
                        </button>
                    </div>
                </div>
                ${echo.replies.length > 0 ? `
                <div class="reply-section">
                    ${echo.replies.map(reply => `
                        <div class="reply-item">
                            <p class="reply-content">${escapeHtml(reply.content)}</p>
                            <span class="reply-time">${formatTime(reply.created_at)}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(dateString) {
        if (!dateString) return '刚刚';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        return date.toLocaleDateString('zh-CN');
    }

    async function submitPost() {
        const content = postContent.value.trim();
        if (!content) {
            showToast('请写下你的心事');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('echos')
                .insert([{ content }])
                .select();

            if (error) throw error;

            const newEcho = {
                ...data[0],
                replies: []
            };

            echos.unshift(newEcho);
            postContent.value = '';
            charCount.textContent = '0/200';
            renderEchos();
            showToast('已保存到草稿箱');
        } catch (error) {
            console.error('发布失败:', error);
            showToast('保存失败，请重试');
        }
    }

    function openReplyModal(echoId) {
        currentReplyId = echoId;
        const echo = echos.find(e => e.id === echoId);
        if (echo) {
            originalPost.textContent = echo.content;
            replyContent.value = '';
            replyCharCount.textContent = '0/150';
            replyModal.classList.add('active');
        }
    }

    async function submitReply() {
        const content = replyContent.value.trim();
        if (!content) {
            showToast('请写下安慰的话');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('replies')
                .insert([{ echo_id: currentReplyId, content }])
                .select();

            if (error) throw error;

            const echo = echos.find(e => e.id === currentReplyId);
            if (echo) {
                echo.replies.push(data[0]);
            }

            replyModal.classList.remove('active');
            replyContent.value = '';
            renderEchos();
            showToast('安慰已送达');
        } catch (error) {
            console.error('回复失败:', error);
            showToast('发送失败，请重试');
        }
    }

    function openReportModal(echoId) {
        currentReplyId = echoId;
        document.querySelectorAll('input[name="reportReason"]').forEach(input => {
            input.checked = false;
        });
        reportModal.classList.add('active');
    }

    function submitReport() {
        const reason = document.querySelector('input[name="reportReason"]:checked');
        if (!reason) {
            showToast('请选择原因');
            return;
        }

        showToast('感谢反馈，我们会处理');
        reportModal.classList.remove('active');
    }

    showRandomQuote();
    
    setInterval(showRandomQuote, 15000);
    
    postContent.addEventListener('input', () => {
        updateCharCount(postContent, charCount, 200);
    });
    
    submitBtn.addEventListener('click', submitPost);
    
    postContent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            submitPost();
        }
    });

    replyContent.addEventListener('input', () => {
        updateCharCount(replyContent, replyCharCount, 150);
    });

    closeModal.addEventListener('click', () => {
        replyModal.classList.remove('active');
    });

    closeReportModal.addEventListener('click', () => {
        reportModal.classList.remove('active');
    });

    replyBtn.addEventListener('click', submitReply);
    
    replyContent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            submitReply();
        }
    });

    reportSubmitBtn.addEventListener('click', submitReport);

    echoList.addEventListener('click', (e) => {
        const replyBtn = e.target.closest('.reply-btn');
        const reportBtn = e.target.closest('.report-btn');
        
        if (replyBtn) {
            const echoId = replyBtn.dataset.id;
            openReplyModal(echoId);
        } else if (reportBtn) {
            const echoId = reportBtn.dataset.id;
            openReportModal(echoId);
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target === replyModal) {
            replyModal.classList.remove('active');
        }
        if (e.target === reportModal) {
            reportModal.classList.remove('active');
        }
    });

    loadEchos();
});