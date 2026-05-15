// ==UserScript==
// @name         Bilibili T 键触发 + 自动宽屏 + 百分比下滚
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  页面加载后自动切换宽屏，并可按 T 键手动切换（仅在 bilibili.com 有效），自动触发时按视口高度百分比下滚；输入框聚焦时忽略 T 键
// @match        *://www.bilibili.com/video/av*
// @match        *://www.bilibili.com/video/BV*
// @match        *://www.bilibili.com/bangumi/play/ep*
// @match        *://www.bilibili.com/bangumi/play/ss*
// @match        *://www.bilibili.com/cheese/play/ep*
// @match        *://www.bilibili.com/cheese/play/ss*
// @match        *://www.bilibili.com/list/*
// @match        *://www.bilibili.com/medialist/play/*
// @match        *://www.bilibili.com/watchlater/*
// @match        *://www.bilibili.com/festival/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 自动触发宽屏后下滚的距离：按当前视口高度百分比计算
    // 例如 1.2 表示下滚 window.innerHeight 的 1.2%
    const AUTO_SCROLL_PERCENT = 1.2;

    // 根据百分比计算滚动像素，至少滚动 1px
    function getScrollPixelsByPercent(percent) {
        return Math.max(1, Math.round(window.innerHeight * percent / 100));
    }

    // 判断当前焦点是否在文本输入相关元素中
    function isFocusInTextInput() {
        const el = document.activeElement;
        if (!el) return false;

        const tagName = el.tagName ? el.tagName.toLowerCase() : '';

        // textarea / select
        if (tagName === 'textarea' || tagName === 'select') return true;

        // contenteditable 或其子元素
        if (el.isContentEditable || (typeof el.closest === 'function' && el.closest('[contenteditable="true"]'))) {
            return true;
        }

        // input 中仅识别会输入文本的类型；按钮、复选框等不拦截
        if (tagName === 'input') {
            const type = (el.getAttribute('type') || 'text').toLowerCase();
            const textInputTypes = new Set([
                'text',
                'search',
                'url',
                'tel',
                'email',
                'password',
                'number',
                'date',
                'datetime-local',
                'month',
                'week',
                'time'
            ]);
            return textInputTypes.has(type);
        }

        return false;
    }

    // 封装一个触发函数
    function triggerWideMode(auto = false) {
        const el = document.querySelector('.bpx-player-ctrl-wide');
        if (el) {
            el.click();
            console.log('✅ 已切换到宽屏/窄屏');
            if (auto) {
                // 自动触发时，按视口高度百分比向下滚动，兼容不同设备/分辨率
                const scrollPixels = getScrollPixelsByPercent(AUTO_SCROLL_PERCENT);
                window.scrollBy(0, scrollPixels);
                console.log(`📜 已自动下滚 ${scrollPixels}px（视口高度的 ${AUTO_SCROLL_PERCENT}%）`);
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

    // 按 T 键手动触发；如果当前焦点在输入框/可编辑区域，则忽略
    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 't') {
            if (isFocusInTextInput()) {
                return;
            }

            if (!triggerWideMode(false)) {
                console.log('❌ 未找到 .bpx-player-ctrl-wide 元素');
            }
        }
    });
})();
