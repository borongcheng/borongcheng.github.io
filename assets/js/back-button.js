// 返回按钮功能实现
(function() {
    'use strict';
    
    // 页面历史记录管理
    const PageHistory = {
        // 存储页面状态
        savePageState: function() {
            const state = {
                url: window.location.href,
                scrollY: window.scrollY,
                timestamp: Date.now()
            };
            
            // 使用sessionStorage保存当前页面状态
            sessionStorage.setItem('currentPageState', JSON.stringify(state));
        },
        
        // 恢复页面状态
        restorePageState: function() {
            const savedState = sessionStorage.getItem('currentPageState');
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    // 恢复滚动位置
                    if (state.scrollY) {
                        window.scrollTo(0, state.scrollY);
                    }
                } catch (e) {
                    console.warn('Failed to restore page state:', e);
                }
            }
        },
        
        // 检查是否有历史记录
        hasHistory: function() {
            return window.history.length > 1 || document.referrer !== '';
        }
    };
    
    // 返回按钮组件
    const BackButton = {
        button: null,
        
        // 创建返回按钮
        create: function() {
            this.button = document.createElement('button');
            this.button.className = 'back-button';
            this.button.innerHTML = '<span>返回</span>';
            this.button.setAttribute('aria-label', '返回上一页');
            this.button.setAttribute('title', '返回上一页');
            
            // 绑定点击事件
            this.button.addEventListener('click', this.handleClick.bind(this));
            
            return this.button;
        },
        
        // 处理点击事件
        handleClick: function(e) {
            e.preventDefault();
            
            // 保存当前页面状态
            PageHistory.savePageState();
            
            // 尝试使用浏览器历史记录返回
            if (PageHistory.hasHistory()) {
                window.history.back();
            } else {
                // 如果没有历史记录，返回首页
                window.location.href = '/';
            }
        },
        
        // 显示按钮
        show: function() {
            if (this.button) {
                this.button.style.display = 'flex';
            }
        },
        
        // 隐藏按钮
        hide: function() {
            if (this.button) {
                this.button.style.display = 'none';
            }
        },
        
        // 检查是否应该显示按钮
        shouldShow: function() {
            // 在首页不显示返回按钮
            const isHomePage = window.location.pathname === '/' || 
                              window.location.pathname === '/index.html';
            return !isHomePage;
        }
    };
    
    // 初始化函数
    function init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        // 创建并添加返回按钮
        const backButton = BackButton.create();
        document.body.appendChild(backButton);
        
        // 根据页面类型决定是否显示按钮
        if (BackButton.shouldShow()) {
            BackButton.show();
        } else {
            BackButton.hide();
        }
        
        // 监听页面滚动，保存滚动位置
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                PageHistory.savePageState();
            }, 100);
        });
        
        // 监听页面卸载，保存状态
        window.addEventListener('beforeunload', function() {
            PageHistory.savePageState();
        });
        
        // 监听popstate事件，恢复页面状态
        window.addEventListener('popstate', function() {
            setTimeout(function() {
                PageHistory.restorePageState();
            }, 100);
        });
        
        // 页面加载完成后尝试恢复状态
        setTimeout(function() {
            PageHistory.restorePageState();
        }, 100);
    }
    
    // 启动初始化
    init();
})();