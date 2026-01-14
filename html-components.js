// HTML Components Library - Advanced Version
// Create entire websites from JavaScript component definitions
// Supports dynamic image loading, component registries, and page building
// For local development, run a local server to avoid CORS issues

(function() {
    'use strict';

    // Notification system for visual error display - optimized with object pooling
    const notificationSystem = {
        container: null,
        notificationPool: [], // Reuse notification elements
        maxPoolSize: 5,

        init: function() {
            // Create notification container if it doesn't exist
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
                logger.log('Notification system initialized');
            }
        },

        // Get notification from pool or create new one
        getNotification: function() {
            if (this.notificationPool.length > 0) {
                return this.notificationPool.pop();
            }
            return document.createElement('div');
        },

        // Return notification to pool
        releaseNotification: function(notification) {
            if (this.notificationPool.length < this.maxPoolSize) {
                // Reset notification for reuse
                notification.style.cssText = '';
                notification.innerHTML = '';
                notification.className = '';
                this.notificationPool.push(notification);
            }
        },

        show: function(type, title, message, details = null, suggestions = []) {
            this.init();

            // Get notification from pool
            const notification = this.getNotification();
            notification.style.cssText = `
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};
                margin-bottom: 10px;
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            `;

            const headerBg = type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1';
            const headerText = type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460';

            notification.innerHTML = `
                <div style="background: ${headerBg}; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: ${headerText}; margin: 0; font-size: 14px;">${title}</strong>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: ${headerText}; padding: 0; line-height: 1;">×</button>
                </div>
                <div style="padding: 16px;">
                    <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">${message}</p>
                    ${details ? `<details style="margin-top: 10px;"><summary style="cursor: pointer; color: #666; font-size: 12px;">Technical Details</summary><pre style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 11px; margin-top: 5px; overflow-x: auto; color: #666;">${details}</pre></details>` : ''}
                    ${suggestions.length > 0 ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;"><strong style="font-size: 12px; color: #666;">Suggestions:</strong><ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 12px; color: #666;">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul></div>` : ''}
                </div>
            `;

            // Add slide-in animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);

            this.container.appendChild(notification);

            // Auto-remove after 10 seconds for non-errors
            if (type !== 'error') {
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.style.animation = 'slideOut 0.3s ease-in';
                        setTimeout(() => {
                            notification.remove();
                            this.releaseNotification(notification);
                        }, 300);
                    }
                }, 10000);
            }

            // Add slide-out animation if not already present
            setTimeout(() => {
                const slideOutStyle = document.createElement('style');
                slideOutStyle.textContent += `
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(slideOutStyle);
            }, 100);
        },

        error: function(message, error, suggestions = []) {
            const details = error ? `${error.name}: ${error.message}\n${error.stack || ''}` : null;
            this.show('error', 'Component Error', message, details, suggestions);
        },

        warning: function(message, suggestions = []) {
            this.show('warning', 'Component Warning', message, null, suggestions);
        },

        info: function(message) {
            this.show('info', 'Component Info', message);
        }
    };

    // Enhanced logging utility with structured logging, levels, and performance tracking
    const logger = {
        // Log levels
        LEVELS: {
            DEBUG: 0,
            INFO: 1,
            SUCCESS: 2,
            WARN: 3,
            ERROR: 4,
            NONE: 5
        },

        // Current log level (can be changed by user)
        currentLevel: 1, // Default to INFO

        // Debug mode flag
        debugMode: false,

        // Performance tracking - use WeakMap for better memory management
        timers: new WeakMap(),

        // Log history for debugging - limit size for memory efficiency
        logHistory: [],
        maxHistorySize: 50, // Reduced from 100

        // Cached console methods for performance
        consoleMethods: {},

        // Enable debug mode
        enableDebug: function() {
            this.debugMode = true;
            this.currentLevel = 0; // DEBUG level
            this.log('Debug mode enabled - showing all log messages', { level: 'DEBUG' });
        },

        // Disable debug mode
        disableDebug: function() {
            this.debugMode = false;
            this.currentLevel = 1; // INFO level
            this.log('Debug mode disabled', { level: 'INFO' });
        },

        // Set log level
        setLevel: function(level) {
            if (typeof level === 'string' && this.LEVELS[level.toUpperCase()] !== undefined) {
                this.currentLevel = this.LEVELS[level.toUpperCase()];
            } else if (typeof level === 'number' && level >= 0 && level <= 5) {
                this.currentLevel = level;
            }
            this.log(`Log level set to: ${Object.keys(this.LEVELS)[this.currentLevel]}`, { level: 'INFO' });
        },

        // Get current timestamp
        getTimestamp: function() {
            return new Date().toISOString();
        },

        // Format log message with structure
        formatMessage: function(level, message, data, category = 'GENERAL') {
            const timestamp = this.getTimestamp();
            const structuredLog = {
                timestamp,
                level: level.toUpperCase(),
                category,
                message,
                data: data || null
            };

            // Add to history
            this.logHistory.push(structuredLog);
            if (this.logHistory.length > this.maxHistorySize) {
                this.logHistory.shift();
            }

            // Store in localStorage if available (for debugging)
            if (this.debugMode && typeof Storage !== 'undefined') {
                try {
                    const logs = JSON.parse(localStorage.getItem('html-components-logs') || '[]');
                    logs.push(structuredLog);
                    if (logs.length > this.maxHistorySize) {
                        logs.shift();
                    }
                    localStorage.setItem('html-components-logs', JSON.stringify(logs));
                } catch (e) {
                    // Ignore localStorage errors
                }
            }

            return structuredLog;
        },

        // Check if message should be logged based on current level
        shouldLog: function(level) {
            return this.LEVELS[level.toUpperCase()] >= this.currentLevel;
        },

        // Get console method and styling for level
        getConsoleConfig: function(level) {
            const configs = {
                DEBUG: {
                    method: 'debug',
                    style: 'color: #6F42C1; font-weight: bold; background: #E7D9FF; padding: 3px 6px; border-radius: 4px; border: 1px solid #C4A9E0;'
                },
                INFO: {
                    method: 'info',
                    style: 'color: #055160; font-weight: bold; background: #CFF4FC; padding: 3px 6px; border-radius: 4px; border: 1px solid #9EEAF9;'
                },
                SUCCESS: {
                    method: 'log',
                    style: 'color: #0F5132; font-weight: bold; background: #D1E7DD; padding: 3px 6px; border-radius: 4px; border: 1px solid #A3CFBB;'
                },
                WARN: {
                    method: 'warn',
                    style: 'color: #664D03; font-weight: bold; background: #FFF3CD; padding: 3px 6px; border-radius: 4px; border: 1px solid #FFEAA7;'
                },
                ERROR: {
                    method: 'error',
                    style: 'color: #842029; font-weight: bold; background: #F8D7DA; padding: 3px 6px; border-radius: 4px; border: 1px solid #F5C2C7;'
                }
            };
            return configs[level.toUpperCase()] || configs.INFO;
        },

        // Core logging function
        log: function(message, data, category = 'GENERAL') {
            if (!this.shouldLog('DEBUG')) return;

            const structuredLog = this.formatMessage('DEBUG', message, data, category);
            const config = this.getConsoleConfig('DEBUG');

            console[config.method](
                `%c[HTML Components ${structuredLog.level}]%c ${structuredLog.timestamp} ${structuredLog.message}`,
                config.style,
                'color: #FFF; font-weight: bold;',
                structuredLog.data || ''
            );
        },

        // Info level logging
        info: function(message, data, category = 'GENERAL') {
            if (!this.shouldLog('INFO')) return;

            const structuredLog = this.formatMessage('INFO', message, data, category);
            const config = this.getConsoleConfig('INFO');

            console[config.method](
                `%c[HTML Components ${structuredLog.level}]%c ${structuredLog.message}`,
                config.style,
                'color: #FFF; font-weight: bold;',
                structuredLog.data || ''
            );

            // Show visual notification for important info
            if (message.includes('initialized') || message.includes('completed')) {
                notificationSystem.info(message);
            }
        },

        // Success logging
        success: function(message, data, category = 'GENERAL') {
            if (!this.shouldLog('SUCCESS')) return;

            const structuredLog = this.formatMessage('SUCCESS', message, data, category);
            const config = this.getConsoleConfig('SUCCESS');

            console[config.method](
                `%c[HTML Components ${structuredLog.level}]%c ${structuredLog.message}`,
                config.style,
                'color: #FFF; font-weight: bold;',
                structuredLog.data || ''
            );
        },

        // Warning logging
        warn: function(message, data, category = 'GENERAL') {
            if (!this.shouldLog('WARN')) return;

            const structuredLog = this.formatMessage('WARN', message, data, category);
            const config = this.getConsoleConfig('WARN');

            console[config.method](
                `%c[HTML Components ${structuredLog.level}]%c ${structuredLog.message}`,
                config.style,
                'color: #FFF; font-weight: bold;',
                structuredLog.data || ''
            );

            // Show visual notification for warnings
            notificationSystem.warning(message, [
                'Check the browser console for additional details',
                'This might indicate a non-critical issue'
            ]);
        },

        // Error logging with enhanced context
        error: function(message, error, category = 'GENERAL') {
            if (!this.shouldLog('ERROR')) return;

            // Enhanced error context
            const errorContext = {
                message: error?.message || 'Unknown error',
                name: error?.name || 'Error',
                stack: error?.stack || null,
                file: error?.fileName || null,
                line: error?.lineNumber || null,
                column: error?.columnNumber || null
            };

            const structuredLog = this.formatMessage('ERROR', message, errorContext, category);
            const config = this.getConsoleConfig('ERROR');

            console[config.method](
                `%c[HTML Components ${structuredLog.level}]%c ${structuredLog.message}`,
                config.style,
                'color: #FFF; font-weight: bold;'
            );

            // Log error details separately for better readability
            if (error) {
                console[config.method]('%cError Details:', 'font-weight: bold; color: #dc3545;');
                console[config.method](error);
                if (error.stack) {
                    console[config.method]('%cStack Trace:', 'font-weight: bold; color: #dc3545;');
                    console[config.method](error.stack);
                }
            }

            // Show visual notification for errors
            notificationSystem.error(message, error);
        },

        // Performance timing functions
        startTimer: function(label, category = 'PERFORMANCE') {
            if (!this.shouldLog('DEBUG')) return;

            const startTime = performance.now();
            this.timers.set(label, startTime);
            this.log(`Timer started: ${label}`, { startTime }, category);
        },

        endTimer: function(label, category = 'PERFORMANCE') {
            if (!this.shouldLog('DEBUG')) return;

            const startTime = this.timers.get(label);
            if (startTime) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                this.timers.delete(label);
                this.log(`Timer ended: ${label} (${duration.toFixed(2)}ms)`, { duration, startTime, endTime }, category);
                return duration;
            } else {
                this.warn(`Timer '${label}' not found`, null, category);
                return null;
            }
        },

        // Get log history
        getHistory: function(level = null) {
            if (level) {
                return this.logHistory.filter(log => log.level === level.toUpperCase());
            }
            return [...this.logHistory];
        },

        // Clear log history
        clearHistory: function() {
            this.logHistory = [];
            if (typeof Storage !== 'undefined') {
                try {
                    localStorage.removeItem('html-components-logs');
                } catch (e) {
                    // Ignore localStorage errors
                }
            }
            this.log('Log history cleared', { level: 'INFO' });
        },

        // Get stats
        getStats: function() {
            const levelCounts = this.logHistory.reduce((acc, log) => {
                acc[log.level] = (acc[log.level] || 0) + 1;
                return acc;
            }, {});

            return {
                totalLogs: this.logHistory.length,
                levelBreakdown: levelCounts,
                currentLevel: Object.keys(this.LEVELS)[this.currentLevel],
                debugMode: this.debugMode,
                maxHistorySize: this.maxHistorySize,
                activeTimers: this.timers.size
            };
        }
    };



    // Page cache for storing rendered page content
    const pageCache = {
        enabled: true, // Default to enabled
        cache: new Map(),

        set: function(key, content) {
            if (this.enabled) {
                this.cache.set(key, {
                    content: content,
                    timestamp: Date.now()
                });
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

        enable: function() {
            this.enabled = true;
            logger.info('Page caching enabled', null, 'CACHE');
        },

        disable: function() {
            this.enabled = false;
            logger.info('Page caching disabled', null, 'CACHE');
        },

        getStats: function() {
            return {
                enabled: this.enabled,
                size: this.cache.size,
                keys: Array.from(this.cache.keys())
            };
        }
    };

    // File cache for storing loaded file content (HTML, CSS, etc.)
    const fileCache = {
        enabled: true, // Default to enabled
        cache: new Map(),

        set: function(url, content) {
            if (this.enabled) {
                this.cache.set(url, {
                    content: content,
                    timestamp: Date.now()
                });
                logger.log('File cached:', url, 'CACHE');
            }
        },

        get: function(url) {
            if (!this.enabled) return null;

            const cached = this.cache.get(url);
            if (cached) {
                logger.success('File loaded from cache:', url, 'CACHE');
                return cached.content;
            }
            return null;
        },

        clear: function() {
            this.cache.clear();
            logger.info('File cache cleared', null, 'CACHE');
        },

        enable: function() {
            this.enabled = true;
            logger.info('File caching enabled', null, 'CACHE');
        },

        disable: function() {
            this.enabled = false;
            logger.info('File caching disabled', null, 'CACHE');
        },

        getStats: function() {
            return {
                enabled: this.enabled,
                size: this.cache.size,
                keys: Array.from(this.cache.keys())
            };
        }
    };

    // Image loading utility
    const imageLoader = {
        cache: new Map(),

        load: function(src, options = {}) {
            return new Promise((resolve, reject) => {
                if (this.cache.has(src)) {
                    logger.success('Image loaded from cache:', src);
                    resolve(this.cache.get(src));
                    return;
                }

                logger.log('Loading image:', src);
                const img = new Image();

                if (options.crossOrigin) {
                    img.crossOrigin = options.crossOrigin;
                }

                img.onload = () => {
                    logger.success('Image loaded successfully:', src);
                    this.cache.set(src, img);
                    resolve(img);
                };

                img.onerror = () => {
                    logger.error('Failed to load image:', src);
                    reject(new Error(`Failed to load image: ${src}`));
                };

                img.src = src;
            });
        },

        preload: function(sources) {
            logger.log('Preloading images:', sources.length);
            const promises = sources.map(src => this.load(src).catch(err => {
                logger.warn('Failed to preload image:', src);
                return null;
            }));

            return Promise.allSettled(promises);
        }
    };

    // Set to track currently loading components to prevent infinite loops
    const loadingComponents = new Set();

    // Internal component loading function (works with DOM elements) - now supports cascading loads
    function loadComponentIntoElement(element, componentPath) {
        // Prevent infinite loading loops
        if (loadingComponents.has(componentPath)) {
            logger.warn('Component already loading, skipping to prevent infinite loop:', componentPath, 'COMPONENT');
            return Promise.resolve();
        }

        loadingComponents.add(componentPath);
        logger.startTimer(`load-component-${componentPath}`);
        logger.log('Loading component:', componentPath, 'COMPONENT');

        // Check file cache first
        const cachedContent = fileCache.get(componentPath);
        if (cachedContent) {
            logger.success('Component loaded from file cache:', componentPath, 'COMPONENT');
            element.innerHTML = cachedContent;

            // Execute any scripts in the cached HTML
            executeScripts(element);

            // Load any nested components found in the loaded content
            return loadNestedComponents(element).then(() => {
                loadingComponents.delete(componentPath);
                logger.endTimer(`load-component-${componentPath}`);
                return cachedContent;
            });
        }

        return fetch(componentPath)
            .then(response => {
                logger.log('Fetch response received for:', componentPath, 'Status:', response.status, 'COMPONENT');

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                logger.success('Component HTML loaded successfully:', componentPath + ' (' + html.length + ' chars)', 'COMPONENT');

                // Cache the content
                fileCache.set(componentPath, html);

                element.innerHTML = html;

                // Execute any scripts in the loaded HTML
                executeScripts(element);

                // Load any nested components found in the loaded content
                return loadNestedComponents(element).then(() => {
                    loadingComponents.delete(componentPath);
                    logger.endTimer(`load-component-${componentPath}`);
                    return html;
                });
            })
            .catch(error => {
                loadingComponents.delete(componentPath);
                logger.error(`Failed to load component "${componentPath}": ${error.message}`, error, 'COMPONENT');
                element.innerHTML = `<div style="color: red; padding: 1rem; border: 1px solid red; background: #ffe6e6;">
                    <strong>Component Load Error:</strong> ${componentPath}<br>
                    <small>${error.message}</small>
                </div>`;
                logger.endTimer(`load-component-${componentPath}`);
                throw error;
            });
    }

    // Load nested components and CSS found within loaded content
    function loadNestedComponents(container) {
        // Load nested CSS files
        const nestedCSS = container.querySelectorAll('[data-css]');
        const cssPromises = Array.from(nestedCSS).map(element => {
            const cssPath = element.getAttribute('data-css');
            if (cssPath) {
                logger.log('Loading nested CSS:', cssPath, 'CSS');
                return loadCSS(cssPath).catch(err => {
                    logger.warn('Failed to load nested CSS:', cssPath, 'CSS');
                    return null;
                });
            }
            return Promise.resolve();
        });

        // Load nested components
        const nestedComponents = container.querySelectorAll('[data-component]');
        const componentPromises = Array.from(nestedComponents).map(element => {
            const nestedPath = element.getAttribute('data-component');
            if (nestedPath) {
                logger.log('Loading nested component:', nestedPath, 'COMPONENT');
                return loadComponentIntoElement(element, nestedPath);
            }
            return Promise.resolve();
        });

        const totalNested = nestedCSS.length + nestedComponents.length;
        if (totalNested === 0) {
            return Promise.resolve();
        }

        logger.log(`Found ${nestedCSS.length} nested CSS files and ${nestedComponents.length} nested components to load`, 'COMPONENT');

        return Promise.allSettled([...cssPromises, ...componentPromises]).then(results => {
            const failedCount = results.filter(result => result.status === 'rejected').length;
            if (failedCount > 0) {
                logger.warn(`${failedCount} nested resources failed to load`);
            } else if (totalNested > 0) {
                logger.success(`All ${totalNested} nested resources loaded successfully`);
            }
            return results;
        });
    }

    // JavaScript execution control
    let jsEnabled = true;

    // Execute scripts found in loaded HTML - optimized version
    function executeScripts(container) {
        if (!jsEnabled) {
            logger.warn('JavaScript execution is disabled, skipping script execution');
            return;
        }

        const scripts = container.querySelectorAll('script');
        if (scripts.length === 0) return;

        // Batch external scripts for better performance
        const externalScripts = [];
        const inlineScripts = [];

        scripts.forEach(script => {
            if (script.src) {
                externalScripts.push(script.src);
            } else if (script.textContent.trim()) {
                inlineScripts.push(script.textContent);
            }
        });

        // Load external scripts
        externalScripts.forEach(src => {
            logger.log('Executing external script:', src);
            const newScript = document.createElement('script');
            newScript.src = src;
            newScript.async = false; // Maintain execution order
            document.head.appendChild(newScript);
        });

        // Execute inline scripts safely
        inlineScripts.forEach((scriptText, index) => {
            logger.log('Executing inline script', { index });
            try {
                // Use Function constructor instead of eval for better performance and security
                const func = new Function(scriptText);
                func();
            } catch (e) {
                logger.error('Error executing inline script:', e);
            }
        });
    }



    // CSS loading functionality with caching
    function loadCSS(href, options = {}) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existing = document.querySelector(`link[href="${href}"]`);
            if (existing) {
                logger.success('CSS already loaded:', href, 'CSS');
                resolve(existing);
                return;
            }

            // Check file cache first
            const cachedCSS = fileCache.get(href);
            if (cachedCSS) {
                logger.success('CSS loaded from file cache:', href, 'CSS');

                // Inject cached CSS as style element
                const style = document.createElement('style');
                style.setAttribute('data-cached-css', href);
                style.textContent = cachedCSS;
                document.head.appendChild(style);

                resolve(style);
                return;
            }

            logger.startTimer(`load-css-${href}`);
            logger.log('Loading CSS:', href, 'CSS');
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;

            if (options.crossOrigin) {
                link.crossOrigin = options.crossOrigin;
            }

            if (options.media) {
                link.media = options.media;
            }

            link.onload = () => {
                logger.success('CSS loaded successfully:', href, 'CSS');
                logger.endTimer(`load-css-${href}`);

                // Fetch the CSS content to cache it
                fetch(href)
                    .then(response => {
                        if (response.ok) {
                            return response.text();
                        }
                        return null;
                    })
                    .then(cssContent => {
                        if (cssContent) {
                            fileCache.set(href, cssContent);
                        }
                    })
                    .catch(err => {
                        logger.warn('Could not cache CSS content:', href, 'CSS');
                    });

                resolve(link);
            };

            link.onerror = () => {
                logger.error('Failed to load CSS:', href, 'CSS');
                logger.endTimer(`load-css-${href}`);
                reject(new Error(`Failed to load CSS: ${href}`));
            };

            document.head.appendChild(link);
        });
    }

    // Load all components and CSS on page load
    document.addEventListener('DOMContentLoaded', function() {
        logger.log('Initializing HTML Components library');

        // Load CSS files
        const cssElements = document.querySelectorAll('[data-css]');
        logger.log('Found CSS files to load:', cssElements.length);

        const cssPromises = Array.from(cssElements).map(element => {
            const cssPath = element.getAttribute('data-css');
            if (cssPath) {
                return loadCSS(cssPath).catch(error => {
                    logger.error(`Failed to load CSS "${cssPath}": ${error.message}`, error);
                });
            }
            return Promise.resolve();
        });

        // Load HTML components
        const components = document.querySelectorAll('[data-component]');
        logger.log('Found components to load:', components.length);

        const componentPromises = Array.from(components).map(element => {
            const componentPath = element.getAttribute('data-component');
            if (componentPath) {
                return loadComponentIntoElement(element, componentPath);
            }
            return Promise.resolve();
        });

        Promise.allSettled([...cssPromises, ...componentPromises]).then(results => {
            logger.log('All loading attempts completed');
            const failedCount = results.filter(result => result.status === 'rejected').length;
            if (failedCount > 0) {
                logger.warn(`${failedCount} resource(s) failed to load`);
            }
        });
    });



    // Enhanced page building function with advanced features and caching
    function buildPageFromComponents(pageDefinition, targetElement = 'body', clearTarget = false, cacheOptions = {}) {
        logger.startTimer('build-page');
        logger.info('Building page from enhanced definition', null, 'PAGE');

        const target = document.querySelector(targetElement);
        if (!target) {
            logger.error('Target element not found:', targetElement);
            return Promise.reject(new Error('Target element not found'));
        }

        // Handle both legacy array format and new enhanced object format
        let componentList = pageDefinition;
        let pageMeta = {};
        let cacheKey = null;
        let useCache = pageCache.enabled;

        // Handle cache options
        if (cacheOptions.key) {
            cacheKey = cacheOptions.key;
        }
        if (cacheOptions.enabled !== undefined) {
            useCache = cacheOptions.enabled;
        }

        if (typeof pageDefinition === 'object' && !Array.isArray(pageDefinition)) {
            // Enhanced page definition format
            componentList = pageDefinition.components || [];
            pageMeta = {
                title: pageDefinition.title,
                description: pageDefinition.description,
                layout: pageDefinition.layout || 'default',
                styles: pageDefinition.styles || [],
                meta: pageDefinition.meta || {}
            };

            // Use cache key from page definition if provided
            if (pageDefinition.cacheKey) {
                cacheKey = pageDefinition.cacheKey;
            }

            // Override cache settings from page definition
            if (pageDefinition.cache !== undefined) {
                useCache = pageDefinition.cache;
            }
        }

        // Generate cache key if not provided and caching is enabled
        if (!cacheKey && useCache) {
            cacheKey = generateCacheKey(pageDefinition, targetElement);
        }

        // Check cache first if caching is enabled
        if (useCache && cacheKey) {
            const cachedContent = pageCache.get(cacheKey);
            if (cachedContent) {
                target.innerHTML = cachedContent;
                logger.success('Page loaded from cache, skipping build process');
                return Promise.resolve([{ status: 'fulfilled', value: 'loaded-from-cache' }]);
            }
        }

        // Clear target if specified or if target is essentially empty (like in index.html)
        const isEmpty = target.innerHTML.trim() === '' ||
                       target.innerHTML.trim() === '<!-- Everything will be built by JavaScript! -->' ||
                       target.innerHTML.trim() === '<!-- Everything built by JS -->';

        if (clearTarget || isEmpty) {
            target.innerHTML = '';
            logger.log('Cleared target element for fresh build');
        }

        // Apply page-level styles if specified
        if (pageMeta.styles && pageMeta.styles.length > 0) {
            pageMeta.styles.forEach(styleUrl => {
                loadCSS(styleUrl).catch(err => logger.warn('Failed to load page style:', styleUrl));
            });
        }

        // Set page title if specified
        if (pageMeta.title) {
            document.title = pageMeta.title;
        }

        // Set meta description if specified
        if (pageMeta.description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = pageMeta.description;
        }

        // Process components with enhanced features
        const loadPromises = componentList.map(component => {
            return processComponentDefinition(component, target);
        });

        return Promise.allSettled(loadPromises).then(results => {
            const buildTime = logger.endTimer('build-page');
            logger.success(`Page built successfully with ${componentList.length} components in ${buildTime?.toFixed(2) || 'unknown'}ms`, null, 'PAGE');

            // Cache the result if caching is enabled and we have a cache key
            if (useCache && cacheKey) {
                pageCache.set(cacheKey, target.innerHTML);
            }

            return results;
        });
    }

    // Generate a cache key from page definition
    function generateCacheKey(pageDefinition, targetElement) {
        try {
            // For arrays, create a simple hash
            if (Array.isArray(pageDefinition)) {
                return 'array_' + btoa(JSON.stringify(pageDefinition)).slice(0, 16) + '_' + targetElement;
            }

            // For objects, use a combination of key properties
            if (typeof pageDefinition === 'object') {
                const keyParts = [];

                // Include title, layout, and component count
                if (pageDefinition.title) keyParts.push(pageDefinition.title);
                if (pageDefinition.layout) keyParts.push(pageDefinition.layout);
                if (pageDefinition.components) keyParts.push(pageDefinition.components.length);

                // Include target element
                keyParts.push(targetElement);

                // Create a hash-like string
                const keyString = keyParts.join('|');
                return 'object_' + btoa(keyString).slice(0, 16);
            }

            // Fallback for other types
            return 'fallback_' + String(pageDefinition).slice(0, 16) + '_' + targetElement;

        } catch (e) {
            // If anything fails, disable caching for this page
            logger.warn('Could not generate cache key, disabling cache for this page');
            return null;
        }
    }

    // Process individual component definitions with enhanced features - optimized with batched DOM operations
    function processComponentDefinition(component, target) {
        // Handle different component definition formats

        if (typeof component === 'string') {
            // Simple component name - load file into target
            logger.log('Loading file component:', component);
            return loadComponentIntoElement(target, component);
        }

        if (typeof component === 'object') {
            // Check for conditional rendering
            if (component.condition !== undefined) {
                const conditionResult = typeof component.condition === 'function'
                    ? component.condition()
                    : component.condition;

                if (!conditionResult) {
                    logger.log('Skipping conditional component:', component.name || 'unnamed');
                    return Promise.resolve();
                }
            }

            const { name, selector, props = {}, layout, children, css, id } = component;
            let element = target;

            // Handle layout sections
            if (layout) {
                const layoutClass = typeof layout === 'string' ? layout : layout.class || '';
                const layoutId = typeof layout === 'string' ? '' : layout.id || '';

                element = document.createElement('section');
                element.className = layoutClass;
                if (layoutId) element.id = layoutId;

                // Add layout-specific attributes
                if (typeof layout === 'object') {
                    if (layout.attrs) {
                        Object.keys(layout.attrs).forEach(attr => {
                            element.setAttribute(attr, layout.attrs[attr]);
                        });
                    }
                }

                target.appendChild(element);
                logger.log('Created layout section:', layoutClass || layoutId);
            } else if (selector) {
                // Use specified selector
                element = document.querySelector(selector);
                if (!element) {
                    logger.warn('Selector not found, using target:', selector);
                    element = target;
                }
            }

            // Add CSS classes if specified - batch class additions
            if (css) {
                const classesToAdd = typeof css === 'string' ? css.split(' ') : css;
                element.classList.add(...classesToAdd);
            }

            // Add ID if specified
            if (id) {
                element.id = id;
            }

            // Process props (handle functions for computed values)
            const processedProps = {};
            Object.keys(props).forEach(key => {
                const value = props[key];
                processedProps[key] = typeof value === 'function' ? value() : value;
            });

            // Handle component loading - load from file
            logger.log('Loading component as file:', name);
            const componentPromise = loadComponentIntoElement(element, name);

            // Handle nested children
            if (children && Array.isArray(children)) {
                return componentPromise.then(() => {
                    const childPromises = children.map(child => processComponentDefinition(child, element));
                    return Promise.allSettled(childPromises);
                });
            }

            return componentPromise;
        }

        return Promise.resolve();
    }

    // Optimized batch DOM operations for page building
    function batchDOMOperations(target, operations) {
        if (operations.length === 0) return;

        const fragment = document.createDocumentFragment();

        operations.forEach(op => {
            if (typeof op === 'function') {
                op(fragment);
            } else if (op.element && op.method) {
                fragment[op.method](op.element);
            }
        });

        if (fragment.children.length > 0) {
            target.appendChild(fragment);
        }
    }

    // Expose functions globally for manual loading
    window.HTMLComponents = {
        // File-based component loading
        loadComponent: function(selector, componentPath) {
            const element = document.querySelector(selector);
            if (element) {
                return loadComponentIntoElement(element, componentPath);
            } else {
                logger.error('Element not found for selector:', selector);
                return Promise.reject(new Error('Element not found'));
            }
        },

        // Toggle component visibility
        toggleComponent: function(selector, show = null) {
            logger.log(`Attempting to toggle component: ${selector}`, { show }, 'TOGGLE');

            const element = document.querySelector(selector);
            if (!element) {
                logger.error(`Element not found for selector: ${selector}`, null, 'TOGGLE');
                return false;
            }

            const isVisible = element.style.display !== 'none';
            const shouldShow = show !== null ? show : !isVisible;

            logger.log(`Component ${selector} current visibility: ${isVisible}, will set to: ${shouldShow}`, {
                currentState: isVisible,
                targetState: shouldShow,
                explicitShow: show !== null
            }, 'TOGGLE');

            if (shouldShow) {
                // Remove display none to show element (restore original display)
                element.style.display = '';
                logger.info(`Component shown: ${selector} (was ${isVisible ? 'visible' : 'hidden'})`, {
                    selector,
                    previousState: isVisible,
                    newState: true
                }, 'TOGGLE');
            } else {
                element.style.display = 'none';
                logger.info(`Component hidden: ${selector} (was ${isVisible ? 'visible' : 'hidden'})`, {
                    selector,
                    previousState: isVisible,
                    newState: false
                }, 'TOGGLE');
            }

            logger.success(`Component toggle completed: ${selector} -> ${shouldShow}`, null, 'TOGGLE');
            return shouldShow;
        },

        // Show component
        showComponent: function(selector) {
            logger.log(`Explicit show request for component: ${selector}`, null, 'TOGGLE');
            return this.toggleComponent(selector, true);
        },

        // Hide component
        hideComponent: function(selector) {
            logger.log(`Explicit hide request for component: ${selector}`, null, 'TOGGLE');
            return this.toggleComponent(selector, false);
        },

        // Toggle CSS file
        toggleCSS: function(href, enable = null) {
            logger.log(`Attempting to toggle CSS: ${href}`, { enable }, 'TOGGLE');

            const link = document.querySelector(`link[href="${href}"]`);
            if (!link) {
                logger.warn(`CSS file not found: ${href}`, null, 'TOGGLE');
                return false;
            }

            const isEnabled = !link.disabled;
            const shouldEnable = enable !== null ? enable : !isEnabled;

            logger.log(`CSS ${href} current state: ${isEnabled}, will set to: ${shouldEnable}`, {
                currentState: isEnabled,
                targetState: shouldEnable,
                explicitEnable: enable !== null
            }, 'TOGGLE');

            link.disabled = !shouldEnable;

            if (shouldEnable) {
                logger.info(`CSS enabled: ${href} (was ${isEnabled ? 'enabled' : 'disabled'})`, {
                    href,
                    previousState: isEnabled,
                    newState: true
                }, 'TOGGLE');
            } else {
                logger.info(`CSS disabled: ${href} (was ${isEnabled ? 'enabled' : 'disabled'})`, {
                    href,
                    previousState: isEnabled,
                    newState: false
                }, 'TOGGLE');
            }

            logger.success(`CSS toggle completed: ${href} -> ${shouldEnable}`, null, 'TOGGLE');
            return shouldEnable;
        },

        // Enable CSS file
        enableCSS: function(href) {
            logger.log(`Explicit enable request for CSS: ${href}`, null, 'TOGGLE');
            return this.toggleCSS(href, true);
        },

        // Disable CSS file
        disableCSS: function(href) {
            logger.log(`Explicit disable request for CSS: ${href}`, null, 'TOGGLE');
            return this.toggleCSS(href, false);
        },

        // Check if component is visible
        isComponentVisible: function(selector) {
            const element = document.querySelector(selector);
            if (!element) {
                logger.warn('Element not found for selector:', selector, 'STATUS');
                return false;
            }

            const isVisible = element.style.display !== 'none';
            logger.log(`Component visibility check: ${selector} = ${isVisible}`, null, 'STATUS');
            return isVisible;
        },

        // Check if CSS file is enabled
        isCSSEnabled: function(href) {
            const link = document.querySelector(`link[href="${href}"]`);
            if (!link) {
                logger.warn('CSS file not found:', href, 'STATUS');
                return false;
            }

            const isEnabled = !link.disabled;
            logger.log(`CSS enabled check: ${href} = ${isEnabled}`, null, 'STATUS');
            return isEnabled;
        },

        // Toggle component by data-component path
        toggleComponentByPath: function(componentPath, show = null) {
            logger.log(`Attempting to toggle component by path: ${componentPath}`, { show }, 'TOGGLE');
            const selector = `[data-component="${componentPath}"]`;
            return this.toggleComponent(selector, show);
        },

        // Show component by data-component path
        showComponentByPath: function(componentPath) {
            logger.log(`Explicit show request for component by path: ${componentPath}`, null, 'TOGGLE');
            const selector = `[data-component="${componentPath}"]`;
            return this.showComponent(selector);
        },

        // Hide component by data-component path
        hideComponentByPath: function(componentPath) {
            logger.log(`Explicit hide request for component by path: ${componentPath}`, null, 'TOGGLE');
            const selector = `[data-component="${componentPath}"]`;
            return this.hideComponent(selector);
        },

        // Check if component is visible by data-component path
        isComponentVisibleByPath: function(componentPath) {
            const selector = `[data-component="${componentPath}"]`;
            return this.isComponentVisible(selector);
        },

        // Replace component in container with new component
        replaceComponent: function(selector, newComponentPath) {
            logger.log(`Replacing component in selector ${selector} with: ${newComponentPath}`, null, 'REPLACE');

            const element = document.querySelector(selector);
            if (!element) {
                logger.error(`Element not found for selector: ${selector}`, null, 'REPLACE');
                return Promise.reject(new Error('Element not found'));
            }

            // Clear existing content
            element.innerHTML = '';
            logger.log(`Cleared existing content in ${selector}`, null, 'REPLACE');

            // Load new component
            return this.loadComponent(selector, newComponentPath).then(() => {
                logger.success(`Successfully replaced component in ${selector} with ${newComponentPath}`, null, 'REPLACE');
            }).catch(error => {
                logger.error(`Failed to replace component in ${selector} with ${newComponentPath}: ${error.message}`, error, 'REPLACE');
                throw error;
            });
        },

        // Replace component by path with new component
        replaceComponentByPath: function(oldPath, newPath) {
            logger.log(`Replacing component ${oldPath} with ${newPath}`, null, 'REPLACE');
            const selector = `[data-component="${oldPath}"]`;
            return this.replaceComponent(selector, newPath);
        },



        // CSS loading
        loadCSS: function(href, options) {
            return loadCSS(href, options);
        },

        // Notification control
        enableNotifications: function() {
            // Notifications are always enabled, but we can add a flag if needed
            logger.info('Visual notifications are enabled');
        },
        disableNotifications: function() {
            // For now, just hide the container if it exists
            if (notificationSystem.container) {
                notificationSystem.container.style.display = 'none';
            }
            logger.info('Visual notifications disabled');
        },

        reloadAll: function() {
            logger.log('Manually reloading all components - disabling cache temporarily');

            // Temporarily disable caches to ensure fresh content
            const wasFileCacheEnabled = fileCache.enabled;
            const wasPageCacheEnabled = pageCache.enabled;

            fileCache.disable();
            pageCache.disable();

            const components = document.querySelectorAll('[data-component]');
            const reloadPromises = Array.from(components).map(element => {
                const componentPath = element.getAttribute('data-component');
                if (componentPath) {
                    return loadComponentIntoElement(element, componentPath);
                }
                return Promise.resolve();
            });

            // Re-enable caches after all reloads complete
            return Promise.allSettled(reloadPromises).then(results => {
                if (wasFileCacheEnabled) fileCache.enable();
                if (wasPageCacheEnabled) pageCache.enable();

                const failedCount = results.filter(result => result.status === 'rejected').length;
                if (failedCount > 0) {
                    logger.warn(`${failedCount} components failed to reload`);
                } else {
                    logger.success('All components reloaded successfully');
                }

                return results;
            });
        },

        // Image loading utilities
        loadImage: function(src, options) {
            return imageLoader.load(src, options);
        },
        preloadImages: function(sources) {
            return imageLoader.preload(sources);
        },

        // Page building
        buildPage: function(componentList, targetElement, clearTarget) {
            return buildPageFromComponents(componentList, targetElement, clearTarget);
        },

        // Page cache management
        enablePageCache: function() {
            pageCache.enable();
        },
        disablePageCache: function() {
            pageCache.disable();
        },
        clearPageCache: function() {
            pageCache.clear();
        },
        getPageCacheStats: function() {
            return pageCache.getStats();
        },

        // File cache management
        enableFileCache: function() {
            fileCache.enable();
        },
        disableFileCache: function() {
            fileCache.disable();
        },
        clearFileCache: function() {
            fileCache.clear();
        },
        getFileCacheStats: function() {
            return fileCache.getStats();
        },

        // Logging control functions
        enableDebug: function() {
            logger.enableDebug();
        },
        disableDebug: function() {
            logger.disableDebug();
        },
        setLogLevel: function(level) {
            logger.setLevel(level);
        },
        getLogHistory: function(level) {
            return logger.getHistory(level);
        },
        clearLogHistory: function() {
            logger.clearHistory();
        },
        getLogStats: function() {
            return logger.getStats();
        },
        startTimer: function(label) {
            logger.startTimer(label);
        },
        endTimer: function(label) {
            return logger.endTimer(label);
        },

        // Utility functions
        clearComponentCache: function() {
            imageLoader.cache.clear();
            logger.info('Component and image caches cleared', null, 'CACHE');
        }
    };

})();
