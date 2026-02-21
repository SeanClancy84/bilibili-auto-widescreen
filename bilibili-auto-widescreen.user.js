// ==UserScript==
// @name         Bilibili T 键触发 + 自动宽屏 + 下滚12px
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  页面加载后自动切换宽屏，并可按 T 键手动切换（仅在 bilibili.com 有效），自动触发时下滚12px
// @match *://www.bilibili.com/video/av*
// @match *://www.bilibili.com/video/BV*
// @match *://www.bilibili.com/bangumi/play/ep*
// @match *://www.bilibili.com/bangumi/play/ss*
// @match *://www.bilibili.com/cheese/play/ep*
// @match *://www.bilibili.com/cheese/play/ss*
// @match *://www.bilibili.com/list/*
// @match *://www.bilibili.com/medialist/play/*
// @match *://www.bilibili.com/watchlater/*
// @match *://www.bilibili.com/festival/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 封装一个触发函数
    function triggerWideMode(auto = false) {
        const el = document.querySelector('.bpx-player-ctrl-wide');
        if (el) {
            el.click();
            console.log('✅ 已切换到宽屏');
            if (auto) {
                // 自动触发时，往下滚动 12px
                window.scrollBy(0, 12);
                console.log('📜 已自动下滚 12px');
            }
            return true;
        }
        return false;
    }

    // 页面加载后，尝试自动切换
    const observer = new MutationObserver(() => {
        if (triggerWideMode(true)) { // 这里传 true 表示是自动触发
            observer.disconnect(); // 找到并点击后就停止观察
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 按 T 键手动触发
    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 't') {
            if (!triggerWideMode(false)) {
                console.log('❌ 未找到 .bpx-player-ctrl-wide 元素');
            }
        }
    });
})();
