// HTML Components Library - Fixed Version (with Advanced Logging)
// Create entire websites from JavaScript component definitions
// Supports dynamic image loading, component registries, and page building

(function() {
    'use strict';

    // ===== Logger =====
    const logger = {
        LEVELS: { DEBUG: 0, INFO: 1, SUCCESS: 2, WARN: 3, ERROR: 4, NONE: 5 },
        currentLevel: 1,
        debugMode: false,
        timers: new Map(),
        logHistory: [],
        maxHistorySize: 50,

        enableDebug: function() {
            this.debugMode = true;
            this.currentLevel = 0;
            this.log('Debug mode enabled - showing all log messages', { level: 'DEBUG' });
        },

        disableDebug: function() {
            this.debugMode = false;
            this.currentLevel = 1;
            this.log('Debug mode disabled', { level: 'INFO' });
        },

        setLevel: function(level) {
            if (typeof level === 'string' && this.LEVELS[level.toUpperCase()] !== undefined) {
                this.currentLevel = this.LEVELS[level.toUpperCase()];
            } else if (typeof level === 'number' && level >= 0 && level <= 5) {
                this.currentLevel = level;
            }
            this.log(`Log level set to: ${Object.keys(this.LEVELS)[this.currentLevel]}`, { level: 'INFO' });
        },

        getTimestamp: function() {
            return new Date().toISOString();
        },

        formatMessage: function(level, message, data, category = 'GENERAL') {
            const timestamp = this.getTimestamp();
            const structuredLog = { timestamp, level: level.toUpperCase(), category, message, data: data || null };
            this.logHistory.push(structuredLog);
            if (this.logHistory.length > this.maxHistorySize) this.logHistory.shift();

            if (this.debugMode && typeof Storage !== 'undefined') {
                try {
                    const logs = JSON.parse(localStorage.getItem('html-components-logs') || '[]');
                    logs.push(structuredLog);
                    if (logs.length > this.maxHistorySize) logs.shift();
                    localStorage.setItem('html-components-logs', JSON.stringify(logs));
                } catch (e) {}
            }
            return structuredLog;
        },

        shouldLog: function(level) {
            return this.LEVELS[level.toUpperCase()] >= this.currentLevel;
        },

        getConsoleConfig: function(level) {
            const configs = {
                DEBUG: { method: 'debug', style: 'color: #6F42C1; font-weight: bold; background: #E7D9FF; padding: 3px 6px; border-radius: 4px;' },
                INFO:  { method: 'info',  style: 'color: #055160; font-weight: bold; background: #CFF4FC; padding: 3px 6px; border-radius: 4px;' },
                SUCCESS: { method: 'log', style: 'color: #0F5132; font-weight: bold; background: #D1E7DD; padding: 3px 6px; border-radius: 4px;' },
                WARN:  { method: 'warn', style: 'color: #664D03; font-weight: bold; background: #FFF3CD; padding: 3px 6px; border-radius: 4px;' },
                ERROR: { method: 'error',style: 'color: #842029; font-weight: bold; background: #F8D7DA; padding: 3px 6px; border-radius: 4px;' }
            };
            return configs[level.toUpperCase()] || configs.INFO;
        },

        log: function(message, data, category = 'GENERAL') {
            if (!this.shouldLog('DEBUG')) return;
            const log = this.formatMessage('DEBUG', message, data, category);
            const cfg = this.getConsoleConfig('DEBUG');
            console[cfg.method](`%c[HTML Components ${log.level}]%c ${log.timestamp} ${log.message}`, cfg.style, 'color: #FFF; font-weight: bold;', log.data || '');
        },

        info: function(message, data, category = 'GENERAL') {
            if (!this.shouldLog('INFO')) return;
            const log = this.formatMessage('INFO', message, data, category);
            const cfg = this.getConsoleConfig('INFO');
            console[cfg.method](`%c[HTML Components ${log.level}]%c ${log.message}`, cfg.style, 'color: #FFF; font-weight: bold;', log.data || '');
            if (message.includes('initialized') || message.includes('completed')) {
                notificationSystem.info(message);
            }
        },

        success: function(message, data, category = 'GENERAL') {
            if (!this.shouldLog('SUCCESS')) return;
            const log = this.formatMessage('SUCCESS', message, data, category);
            const cfg = this.getConsoleConfig('SUCCESS');
            console[cfg.method](`%c[HTML Components ${log.level}]%c ${log.message}`, cfg.style, 'color: #FFF; font-weight: bold;', log.data || '');
        },

        warn: function(message, data, category = 'GENERAL') {
            if (!this.shouldLog('WARN')) return;
            const log = this.formatMessage('WARN', message, data, category);
            const cfg = this.getConsoleConfig('WARN');
            console[cfg.method](`%c[HTML Components ${log.level}]%c ${log.message}`, cfg.style, 'color: #FFF; font-weight: bold;', log.data || '');
        },

        error: function(message, error, category = 'GENERAL') {
            if (!this.shouldLog('ERROR')) return;
            const errorContext = error ? { message: error.message, name: error.name, stack: error.stack } : null;
            const log = this.formatMessage('ERROR', message, errorContext, category);
            const cfg = this.getConsoleConfig('ERROR');
            console[cfg.method](`%c[HTML Components ${log.level}]%c ${log.message}`, cfg.style, 'color: #FFF; font-weight: bold;');
            if (error) console[cfg.method](error);
            notificationSystem.error(message, error);
        },

        startTimer: function(label, category = 'PERFORMANCE') {
            this.timers.set(label, performance.now());
            if (this.shouldLog('DEBUG')) this.log(`Timer started: ${label}`, null, category);
        },

        endTimer: function(label, category = 'PERFORMANCE') {
            const start = this.timers.get(label);
            if (!start) return null;
            const duration = performance.now() - start;
            this.timers.delete(label);
            if (this.shouldLog('DEBUG')) this.log(`Timer ended: ${label} (${duration.toFixed(2)}ms)`, { duration }, category);
            return duration;
        },

        getHistory: function(level) {
            return level ? this.logHistory.filter(l => l.level === level.toUpperCase()) : [...this.logHistory];
        },

        clearHistory: function() {
            this.logHistory = [];
            if (typeof Storage !== 'undefined') localStorage.removeItem('html-components-logs');
        }
    };

    // ===== Notification System =====
    const notificationSystem = {
        container: null,
        notificationPool: [],
        maxPoolSize: 5,

        init: function() {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'html-components-notifications';
                this.container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;
                document.body.appendChild(this.container);
                logger.log('Notification system initialized', null, 'NOTIFICATION');
            }
        },

        getNotification: function() {
            return this.notificationPool.length > 0 ? this.notificationPool.pop() : document.createElement('div');
        },

        releaseNotification: function(notification) {
            if (this.notificationPool.length < this.maxPoolSize) {
                notification.style.cssText = '';
                notification.innerHTML = '';
                notification.className = '';
                this.notificationPool.push(notification);
            }
        },

        checkContainerRemoval: function() {
            if (this.container && this.container.children.length === 0 && this.container.parentElement) {
                this.container.remove();
                this.container = null;
                logger.log('Notification container removed - no notifications remaining', null, 'NOTIFICATION');
            }
        },

        show: function(type, title, message, details = null, suggestions = []) {
            this.init();
            const notification = this.getNotification();

            const colors = {
                error: { border: '#dc3545', bg: '#f8d7da', text: '#721c24' },
                warning: { border: '#ffc107', bg: '#fff3cd', text: '#856404' },
                info: { border: '#007bff', bg: '#d1ecf1', text: '#0c5460' }
            };
            const c = colors[type] || colors.info;

            notification.style.cssText = `
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid ${c.border};
                margin-bottom: 10px;
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            `;

            notification.innerHTML = `
                <div style="background: ${c.bg}; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: ${c.text}; margin: 0; font-size: 14px;">${title}</strong>
                    <button onclick="this.parentElement.parentElement.remove(); window.HTMLComponents._checkNotificationContainer()" 
                            style="background: none; border: none; font-size: 18px; cursor: pointer; color: ${c.text}; padding: 0; line-height: 1;">×</button>
                </div>
                <div style="padding: 16px;">
                    <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">${message}</p>
                    ${details ? `<details style="margin-top: 10px;"><summary style="cursor: pointer; color: #666; font-size: 12px;">Technical Details</summary><pre style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 11px; margin-top: 5px; overflow-x: auto; color: #666;">${details}</pre></details>` : ''}
                    ${suggestions.length > 0 ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;"><strong style="font-size: 12px; color: #666;">Suggestions:</strong><ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 12px; color: #666;">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul></div>` : ''}
                </div>
            `;

            this.container.appendChild(notification);

            if (type !== 'error') {
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.style.animation = 'slideOut 0.3s ease-in';
                        setTimeout(() => {
                            notification.remove();
                            this.releaseNotification(notification);
                            this.checkContainerRemoval();
                        }, 300);
                    }
                }, 10000);
            }
        },

        error: function(message, error, suggestions = []) {
            const details = error ? `${error.name}: ${error.message}` : null;
            this.show('error', 'Component Error', message, details, suggestions);
        },

        warning: function(message, suggestions = []) {
            this.show('warning', 'Component Warning', message, null, suggestions);
        },

        info: function(message) {
            this.show('info', 'Component Info', message);
        }
    };

    // ===== Caching System =====
    const pageCache = {
        enabled: true,
        cache: new Map(),

        set: function(key, content) {
            if (this.enabled) {
                this.cache.set(key, { content, timestamp: Date.now() });
                logger.log('Page cached:', key, 'CACHE');
            }
        },

        get: function(key) {
            if (!this.enabled) return null;
            const cached = this.cache.get(key);
            if (cached) {
                logger.success('Page loaded from cache:', key, 'CACHE');
                return cached.content;
            }
            return null;
        },

        clear: function() {
            this.cache.clear();
            logger.info('Page cache cleared', null, 'CACHE');
        },

        enable: function() { this.enabled = true; logger.info('Page caching enabled', null, 'CACHE'); },
        disable: function() { this.enabled = false; logger.info('Page caching disabled', null, 'CACHE'); }
    };

    const fileCache = {
        enabled: true,
        cache: new Map(),

        set: function(key, content) {
            if (this.enabled) {
                this.cache.set(key, { content, timestamp: Date.now() });
                logger.log('File cached:', key, 'CACHE');
            }
        },

        get: function(key) {
            if (!this.enabled) return null;
            const cached = this.cache.get(key);
            if (cached) {
                logger.success('File loaded from cache:', key, 'CACHE');
                return cached.content;
            }
            return null;
        },

        clear: function() {
            this.cache.clear();
            logger.info('File cache cleared', null, 'CACHE');
        },

        enable: function() { this.enabled = true; logger.info('File caching enabled', null, 'CACHE'); },
        disable: function() { this.enabled = false; logger.info('File caching disabled', null, 'CACHE'); }
    };

    // ===== Image Loading =====
    const imageLoader = {
        cache: new Map(),

        load: function(src, options = {}) {
            return new Promise((resolve, reject) => {
                if (this.cache.has(src)) {
                    logger.success('Image loaded from cache:', src, 'IMAGE');
                    resolve(this.cache.get(src));
                    return;
                }

                logger.log('Loading image:', src, 'IMAGE');
                const img = new Image();
                if (options.crossOrigin) img.crossOrigin = options.crossOrigin;

                img.onload = () => {
                    this.cache.set(src, img);
                    logger.success('Image loaded successfully:', src, 'IMAGE');
                    resolve(img);
                };

                img.onerror = () => {
                    const err = new Error(`Failed to load image: ${src}`);
                    logger.error('Image load failed:', err, 'IMAGE');
                    reject(err);
                };

                img.src = src;
            });
        },

        preload: function(sources) {
            logger.log('Preloading images:', sources.length, 'IMAGE');
            const promises = sources.map(src => this.load(src).catch(() => null));
            return Promise.allSettled(promises).then(results => {
                const success = results.filter(r => r.status === 'fulfilled').length;
                logger.log(`Image preloading complete: ${success}/${sources.length} successful`, null, 'IMAGE');
                return results;
            });
        }
    };

    // ===== Component Loader =====
    const loadingComponents = new Set();

    function loadComponentIntoElement(element, componentPath, props = {}) {
        if (loadingComponents.has(componentPath)) {
            logger.warn('Component already loading - skipping to prevent loop:', componentPath, 'COMPONENT');
            return Promise.resolve();
        }

        loadingComponents.add(componentPath);
        logger.startTimer(`load-${componentPath}`, 'COMPONENT');
        logger.log('Loading component:', componentPath, 'COMPONENT');

        const cachedContent = fileCache.get(componentPath);
        if (cachedContent) {
            logger.success('Component loaded from file cache:', componentPath, 'COMPONENT');
            element.innerHTML = processTemplate(cachedContent, props);
            bindEventHandlers(element);
            return loadNestedComponents(element).then(() => {
                executeScripts(element);
                loadingComponents.delete(componentPath);
                logger.endTimer(`load-${componentPath}`, 'COMPONENT');
                return cachedContent;
            });
        }

        return fetch(componentPath)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                return response.text();
            })
            .then(html => {
                html = processTemplate(html, props);
                fileCache.set(componentPath, html);
                element.innerHTML = html;
                bindEventHandlers(element);

                return loadNestedComponents(element).then(() => {
                    executeScripts(element);
                    loadingComponents.delete(componentPath);
                    const duration = logger.endTimer(`load-${componentPath}`, 'COMPONENT');
                    logger.success(`Component loaded: ${componentPath} (${duration?.toFixed(2)}ms)`, null, 'COMPONENT');
                    return html;
                });
            })
            .catch(error => {
                loadingComponents.delete(componentPath);
                logger.error(`Failed to load component "${componentPath}"`, error, 'COMPONENT');
                element.innerHTML = `<div style="color: red; padding: 1rem; border: 1px solid red; background: #ffe6e6;">
                    <strong>Component Load Error:</strong> ${componentPath}<br>
                    <small>${error.message}</small>
                </div>`;
                throw error;
            });
    }

    function loadNestedComponents(container) {
        const nestedCSS = container.querySelectorAll('[data-css]');
        const cssPromises = Array.from(nestedCSS).map(el => {
            const path = el.getAttribute('data-css');
            return path ? loadCSS(path).catch(() => null) : Promise.resolve();
        });

        const nestedJS = container.querySelectorAll('[data-js]');
        const jsPromises = Array.from(nestedJS).map(el => {
            const path = el.getAttribute('data-js');
            return path ? HTMLComponents.loadJS(path).catch(() => null) : Promise.resolve();
        });

        const nestedComponents = container.querySelectorAll('[data-component]');
        const componentPromises = Array.from(nestedComponents).map(el => {
            const path = el.getAttribute('data-component');
            return path ? loadComponentIntoElement(el, path).catch(() => null) : Promise.resolve();
        });

        return Promise.allSettled([...cssPromises, ...jsPromises, ...componentPromises]);
    }

    // ===== Event Binding =====
    const supportedEvents = {
        'click': 'data-click', 'dblclick': 'data-dblclick', 'mouseenter': 'data-mouseenter',
        'mouseleave': 'data-mouseleave', 'focus': 'data-focus', 'blur': 'data-blur',
        'change': 'data-change', 'input': 'data-input', 'submit': 'data-submit',
        'keydown': 'data-keydown', 'keyup': 'data-keyup'
    };

    function bindEventHandlers(container) {
        const selector = Object.values(supportedEvents).map(attr => `[${attr}]`).join(', ');
        const elements = container.querySelectorAll(selector);

        let boundCount = 0;
        elements.forEach(element => {
            Object.entries(supportedEvents).forEach(([eventType, dataAttr]) => {
                const methodName = element.getAttribute(dataAttr);
                if (methodName && !element.dataset[`bound_${eventType}`]) {
                    element.addEventListener(eventType, function(event) {
                        if (typeof window[methodName] === 'function') {
                            try {
                                window[methodName](event, element);
                                logger.log(`Event ${eventType} executed method: ${methodName}`, null, 'EVENTS');
                            } catch (error) {
                                logger.error(`Error executing ${methodName}`, error, 'EVENTS');
                                event.preventDefault();
                            }
                        } else {
                            logger.error(`Method ${methodName} not found`, null, 'EVENTS');
                        }
                    });
                    element.dataset[`bound_${eventType}`] = 'true';
                    boundCount++;
                }
            });
        });

        if (boundCount > 0) {
            logger.info(`Bound ${boundCount} event handler(s)`, null, 'EVENTS');
        }
    }

    // ===== Template Processing =====
    function processTemplate(template, props) {
        if (!props || Object.keys(props).length === 0) return template;

        let result = template;
        Object.entries(props).forEach(([key, value]) => {
            const stringValue = value == null ? '' : 
                typeof value === 'object' ? JSON.stringify(value) : String(value);
            result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), stringValue);
        });
        return result;
    }

    // ===== JavaScript Execution =====
    let jsEnabled = true;

    function executeScripts(container) {
        if (!jsEnabled) return;

        const scripts = container.querySelectorAll('script');
        if (scripts.length === 0) return;

        logger.log(`Starting to execute ${scripts.length} script(s) in container`, null, 'SCRIPT');

        scripts.forEach(script => {
            logger.log(`Found script: ${script.src ? 'external (' + script.src + ')' : 'inline'}`, null, 'SCRIPT');
            if (script.src) {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.async = false;
                document.head.appendChild(newScript);
                logger.log(`External script added: ${script.src}`, null, 'SCRIPT');
            } else if (script.textContent.trim()) {
                try {
                    (0, eval)(script.textContent);
                    logger.log('Inline script executed', null, 'SCRIPT');
                } catch (e) {
                    logger.error('Error executing inline script', e, 'SCRIPT');
                }
            }
        });
    }

    // ===== CSS Loading =====
    function loadCSS(href, options = {}) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`link[href="${href}"]`);
            if (existing) {
                logger.success('CSS already loaded:', href, 'CSS');
                resolve(existing);
                return;
            }

            const cachedCSS = fileCache.get(href);
            if (cachedCSS) {
                const style = document.createElement('style');
                style.setAttribute('data-cached-css', href);
                style.textContent = cachedCSS;
                document.head.appendChild(style);
                logger.success('CSS loaded from cache:', href, 'CSS');
                resolve(style);
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            if (options.crossOrigin) link.crossOrigin = options.crossOrigin;
            if (options.media) link.media = options.media;

            link.onload = () => {
                fetch(href).then(r => r.ok ? r.text() : null)
                    .then(css => { if (css) fileCache.set(href, css); })
                    .catch(() => {});
                logger.success('CSS loaded:', href, 'CSS');
                resolve(link);
            };

            link.onerror = () => {
                logger.error('Failed to load CSS:', href, 'CSS');
                reject(new Error(`Failed to load CSS: ${href}`));
            };

            document.head.appendChild(link);
        });
    }

    // ===== Initialization =====
    document.addEventListener('DOMContentLoaded', function() {
        logger.log('DOM loaded - initializing components', null, 'INIT');

        const jsElements = document.querySelectorAll('[data-js]');
        const cssElements = document.querySelectorAll('[data-css]');
        const components = document.querySelectorAll('[data-component]');

        const promises = [
            ...Array.from(jsElements).map(el => {
                const path = el.getAttribute('data-js');
                return path ? HTMLComponents.loadJS(path).catch(() => null) : Promise.resolve();
            }),
            ...Array.from(cssElements).map(el => {
                const path = el.getAttribute('data-css');
                return path ? loadCSS(path).catch(() => null) : Promise.resolve();
            }),
            ...Array.from(components).map(el => {
                const path = el.getAttribute('data-component');
                return path ? loadComponentIntoElement(el, path) : Promise.resolve();
            })
        ];

        Promise.allSettled(promises).then(() => {
            bindEventHandlers(document.body);
            logger.success('Initial component loading completed', null, 'INIT');
        });
    });

    // ===== Page Building =====
    function buildPageFromComponents(pageDef, targetElement = 'body', clearTarget = false) {
        logger.startTimer('build-page', 'PAGE');
        logger.info('Building page from definition', null, 'PAGE');

        const target = document.querySelector(targetElement);
        if (!target) return Promise.reject(new Error('Target element not found'));

        let components = Array.isArray(pageDef) ? pageDef : pageDef.components || [];
        let meta = !Array.isArray(pageDef) ? { title: pageDef.title, description: pageDef.description, styles: pageDef.styles || [] } : {};

        const cacheKey = pageDef.cacheKey || JSON.stringify(components).substring(0, 50);
        const cached = pageCache.get(cacheKey);
        if (cached) {
            target.innerHTML = cached;
            logger.success('Page loaded from cache', null, 'PAGE');
            return Promise.resolve();
        }

        if (clearTarget || target.innerHTML.trim() === '') target.innerHTML = '';

        if (meta.styles) meta.styles.forEach(url => loadCSS(url).catch(() => {}));
        if (meta.title) document.title = meta.title;
        if (meta.description) {
            let desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
            desc.name = 'description'; desc.content = meta.description;
            if (!desc.parentElement) document.head.appendChild(desc);
        }

        const promises = components.map(comp => processComponentDefinition(comp, target));

        return Promise.allSettled(promises).then(results => {
            const duration = logger.endTimer('build-page', 'PAGE');
            logger.success(`Page built in ${duration?.toFixed(2)}ms`, null, 'PAGE');
            pageCache.set(cacheKey, target.innerHTML);
            return results;
        });
    }

    function processComponentDefinition(comp, target) {
        if (typeof comp === 'string') return loadComponentIntoElement(target, comp);

        if (typeof comp !== 'object' || comp.condition !== undefined && !(typeof comp.condition === 'function' ? comp.condition() : comp.condition)) {
            return Promise.resolve();
        }

        const { name, selector, props = {}, layout, children, css, id } = comp;
        let element = target;

        if (layout) {
            const tag = typeof layout === 'object' ? layout.tag || 'section' : 'section';
            const cls = typeof layout === 'string' ? layout : layout.class || '';
            const lid = typeof layout === 'object' ? layout.id || '' : '';
            element = document.createElement(tag);
            element.className = cls;
            if (lid) element.id = lid;
            target.appendChild(element);
        } else if (selector) {
            element = document.querySelector(selector) || target;
        }

        if (css) element.classList.add(...(typeof css === 'string' ? css.split(' ') : css));
        if (id) element.id = id;

        const processedProps = Object.fromEntries(Object.entries(props).map(([k, v]) => [k, typeof v === 'function' ? v() : v]));

        const promise = loadComponentIntoElement(element, name, processedProps);

        return children?.length ? promise.then(() => Promise.allSettled(children.map(c => processComponentDefinition(c, element)))) : promise;
    }

    // ===== Global API =====
    window.HTMLComponents = {
        loadComponent: function(selector, path, props = {}) {
            const el = document.querySelector(selector);
            return el ? loadComponentIntoElement(el, path, props) : Promise.reject(new Error('Element not found'));
        },

        toggleComponent: function(selector, show = null) {
            const el = document.querySelector(selector);
            if (!el) return false;
            const shouldShow = show !== null ? show : el.style.display === 'none';
            el.style.display = shouldShow ? '' : 'none';
            logger.log(`Component ${selector} ${shouldShow ? 'shown' : 'hidden'}`, null, 'TOGGLE');
            return shouldShow;
        },

        showComponent: sel => this.toggleComponent(sel, true),
        hideComponent: sel => this.toggleComponent(sel, false),

        loadJS: function(src) {
            return new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[data-loaded-js="${src}"]`);
                if (existing) return resolve(existing);

                logger.log(`Starting to load JS: ${src}`, null, 'JS');

                fetch(src)
                    .then(r => r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`)))
                    .then(code => {
                        (0, eval)(code);
                        const marker = document.createElement('script');
                        marker.setAttribute('data-loaded-js', src);
                        marker.style.display = 'none';
                        document.head.appendChild(marker);
                        logger.success(`JS loaded: ${src}`, null, 'JS');
                        resolve(marker);
                    })
                    .catch(err => {
                        logger.error(`Failed to load JS: ${src}`, err, 'JS');
                        reject(err);
                    });
            });
        },

        loadCSS: loadCSS,
        loadImage: (src, opts) => imageLoader.load(src, opts),
        preloadImages: sources => imageLoader.preload(sources),
        buildPage: buildPageFromComponents,

        enablePageCache: () => pageCache.enable(),
        disablePageCache: () => pageCache.disable(),
        clearPageCache: () => pageCache.clear(),

        enableFileCache: () => fileCache.enable(),
        disableFileCache: () => fileCache.disable(),
        clearFileCache: () => fileCache.clear(),

        enableDebug: () => logger.enableDebug(),
        disableDebug: () => logger.disableDebug(),
        setLogLevel: level => logger.setLevel(level),

        replaceComponent: function(selector, path, props = {}) {
            const el = document.querySelector(selector);
            if (!el) return Promise.reject(new Error(`Element not found: ${selector}`));
            return loadComponentIntoElement(el, path, props);
        },

        _checkNotificationContainer: () => notificationSystem.checkContainerRemoval()
    };
    logger.log('HTMLComponents library initialized', null, 'INIT');
})();
