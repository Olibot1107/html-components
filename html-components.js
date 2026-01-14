// HTML Components Library - Advanced Version
// Create entire websites from JavaScript component definitions
// Supports dynamic image loading, component registries, and page building
// For local development, run a local server to avoid CORS issues

(function() {
    'use strict';

    // ===== Notification System =====
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

        // Check if container should be removed when empty
        checkContainerRemoval: function() {
            if (this.container && this.container.children.length === 0 && this.container.parentElement) {
                this.container.remove();
                this.container = null;
                logger.log('Notification container removed - no notifications remaining');
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
                    <button onclick="this.parentElement.parentElement.remove(); window.HTMLComponents._checkNotificationContainer()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: ${headerText}; padding: 0; line-height: 1;">×</button>
                </div>
                <div style="padding: 16px;">
                    <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">${message}</p>
                    ${details ? `<details style="margin-top: 10px;"><summary style="cursor: pointer; color: #666; font-size: 12px;">Technical Details</summary><pre style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 11px; margin-top: 5px; overflow-x: auto; color: #666;">${details}</pre></details>` : ''}
                    ${suggestions.length > 0 ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;"><strong style="font-size: 12px; color: #666;">Suggestions:</strong><ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 12px; color: #666;">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul></div>` : ''}
                </div>
            `;

            this.container.appendChild(notification);

            // Auto-remove after 10 seconds for non-errors
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

            // Slide-out animation will be handled by CSS if defined externally
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

    // ===== Logger =====
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

        // Performance tracking - use Map for string keys
        timers: new Map(),

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
            }

            // Show visual notification for errors
            notificationSystem.error(message, error);
        },

        // Performance timing functions
        startTimer: function(label, category = 'PERFORMANCE') {
            const startTime = performance.now();
            this.timers.set(label, startTime);
            if (this.shouldLog('DEBUG')) {
                this.log(`Timer started: ${label}`, { startTime }, category);
            }
        },

        endTimer: function(label, category = 'PERFORMANCE') {
            const startTime = this.timers.get(label);
            if (startTime) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                this.timers.delete(label);
                if (this.shouldLog('DEBUG')) {
                    this.log(`Timer ended: ${label} (${duration.toFixed(2)}ms)`, { duration, startTime, endTime }, category);
                }
                return duration;
            } else {
                if (this.shouldLog('DEBUG')) {
                    this.warn(`Timer '${label}' not found`, null, category);
                }
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



    // ===== Caching System =====
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

    // ===== Image Loading =====
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
                    const error = new Error(`Failed to load image: ${src}`);
                    logger.error(`Image failed to load: ${src}`, error);
                    reject(error);
                };

                img.src = src;
            });
        },

        preload: function(sources) {
            logger.log('Preloading images:', sources.length, 'IMAGE');
            logger.log('Image sources to preload:', sources, 'IMAGE');

            const promises = sources.map((src, index) => {
                logger.log(`Starting preload for image ${index + 1}/${sources.length}:`, src, 'IMAGE');
                return this.load(src)
                    .then(result => {
                        logger.success(`Image ${index + 1}/${sources.length} preloaded successfully:`, src, 'IMAGE');
                        return result;
                    })
                    .catch(err => {
                        logger.warn(`Failed to preload image ${index + 1}/${sources.length}:`, src, 'IMAGE');
                        return null;
                    });
            });

            return Promise.allSettled(promises).then(results => {
                const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
                const failureCount = results.filter(r => r.status === 'rejected' || r.value === null).length;
                logger.log(`Image preloading completed: ${successCount} successful, ${failureCount} failed out of ${sources.length} total`, {
                    total: sources.length,
                    successful: successCount,
                    failed: failureCount
                }, 'IMAGE');
                return results;
            });
        }
    };

    // ===== Component Loader =====
    // Set to track currently loading components to prevent infinite loops
    const loadingComponents = new Set();

    // Internal component loading function (works with DOM elements) - now supports cascading loads
    function loadComponentIntoElement(element, componentPath, props = {}) {
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

            // Bind event handlers for data-click attributes (before nested loading)
            bindEventHandlers(element);

            // Load any nested components found in the loaded content
            return loadNestedComponents(element).then(() => {
                // Execute any scripts in the cached HTML after nested components are loaded
                executeScripts(element);

                loadingComponents.delete(componentPath);
                logger.endTimer(`load-component-${componentPath}`);
                return cachedContent;
            });
        }

        const fetchStartTime = performance.now();
        return fetch(componentPath)
            .then(response => {
                logger.log(`Fetch response received for: ${componentPath} (Status: ${response.status})`, null, 'COMPONENT');

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                const totalTime = logger.endTimer(`load-component-${componentPath}`);
                logger.success(`Component HTML loaded successfully: ${componentPath} (${html.length} chars, ${totalTime?.toFixed(2) || 'unknown'}ms total)`, null, 'COMPONENT');

                // Process props for template replacement
                if (Object.keys(props).length > 0) {
                    logger.log(`Processing ${Object.keys(props).length} props for template replacement`, { props: Object.keys(props) }, 'COMPONENT');
                    html = processTemplate(html, props);
                }

                // Cache the content
                fileCache.set(componentPath, html);

                element.innerHTML = html;

                // Bind event handlers for data-click attributes (before nested loading)
                bindEventHandlers(element);

                // Load any nested components found in the loaded content
                return loadNestedComponents(element).then(() => {
                    // Execute any scripts in the loaded HTML after nested components are loaded
                    executeScripts(element);

                    loadingComponents.delete(componentPath);
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
        // Load nested JavaScript files
        const nestedJS = container.querySelectorAll('[data-js]');
        logger.log(`Found ${nestedJS.length} nested JS elements to process`, null, 'COMPONENT');
        const jsPromises = Array.from(nestedJS).map((element, index) => {
            const jsPath = element.getAttribute('data-js');
            if (jsPath) {
                logger.log(`Loading nested JS ${index + 1}/${nestedJS.length}:`, jsPath, 'JS');
                return HTMLComponents.loadJS(jsPath)
                    .then(result => {
                        logger.success(`Nested JS loaded successfully: ${jsPath}`, null, 'JS');
                        return result;
                    })
                    .catch(err => {
                        logger.warn(`Failed to load nested JS ${index + 1}: ${jsPath}`, null, 'JS');
                        return null;
                    });
            }
            logger.log(`Skipping nested JS element ${index + 1}: no data-js attribute`, null, 'JS');
            return Promise.resolve();
        });

        // Load nested CSS files
        const nestedCSS = container.querySelectorAll('[data-css]');
        logger.log(`Found ${nestedCSS.length} nested CSS elements to process`, null, 'COMPONENT');
        const cssPromises = Array.from(nestedCSS).map((element, index) => {
            const cssPath = element.getAttribute('data-css');
            if (cssPath) {
                logger.log(`Loading nested CSS ${index + 1}/${nestedCSS.length}:`, cssPath, 'CSS');
                return loadCSS(cssPath)
                    .then(result => {
                        logger.success(`Nested CSS loaded successfully: ${cssPath}`, null, 'CSS');
                        return result;
                    })
                    .catch(err => {
                        logger.warn(`Failed to load nested CSS ${index + 1}: ${cssPath}`, null, 'CSS');
                        return null;
                    });
            }
            logger.log(`Skipping nested CSS element ${index + 1}: no data-css attribute`, null, 'CSS');
            return Promise.resolve();
        });

        // Load nested components
        const nestedComponents = container.querySelectorAll('[data-component]');
        logger.log(`Found ${nestedComponents.length} nested component elements to process`, null, 'COMPONENT');
        const componentPromises = Array.from(nestedComponents).map((element, index) => {
            const nestedPath = element.getAttribute('data-component');
            if (nestedPath) {
                logger.log(`Loading nested component ${index + 1}/${nestedComponents.length}:`, nestedPath, 'COMPONENT');
                return loadComponentIntoElement(element, nestedPath)
                    .then(result => {
                        logger.success(`Nested component loaded successfully: ${nestedPath}`, null, 'COMPONENT');
                        return result;
                    })
                    .catch(err => {
                        logger.error(`Failed to load nested component ${index + 1}: ${nestedPath}`, err, 'COMPONENT');
                        return null;
                    });
            }
            logger.log(`Skipping nested component element ${index + 1}: no data-component attribute`, null, 'COMPONENT');
            return Promise.resolve();
        });

        const totalNested = nestedJS.length + nestedCSS.length + nestedComponents.length;
        if (totalNested === 0) {
            return Promise.resolve();
        }

        logger.log(`Found ${nestedJS.length} nested JS files, ${nestedCSS.length} nested CSS files and ${nestedComponents.length} nested components to load`, 'COMPONENT');

        return Promise.allSettled([...jsPromises, ...cssPromises, ...componentPromises]).then(results => {
            const failedCount = results.filter(result => result.status === 'rejected').length;
            if (failedCount > 0) {
                logger.warn(`${failedCount} nested resources failed to load`);
            } else if (totalNested > 0) {
                logger.success(`All ${totalNested} nested resources loaded successfully`);
            }
            return results;
        });
    }

    // ===== Event Binding =====
    // Supported event types and their data attributes
    const supportedEvents = {
        'click': 'data-click',
        'dblclick': 'data-dblclick',
        'mouseenter': 'data-mouseenter',
        'mouseleave': 'data-mouseleave',
        'mouseover': 'data-mouseover',
        'mouseout': 'data-mouseout',
        'mousedown': 'data-mousedown',
        'mouseup': 'data-mouseup',
        'focus': 'data-focus',
        'blur': 'data-blur',
        'change': 'data-change',
        'input': 'data-input',
        'submit': 'data-submit',
        'keydown': 'data-keydown',
        'keyup': 'data-keyup',
        'keypress': 'data-keypress'
    };

    // Bind event handlers for all supported data attributes
    function bindEventHandlers(container) {
        let totalElements = 0;
        let totalHandlers = 0;

        // Get all elements that have any data event attributes
        const allElements = container.querySelectorAll(Object.values(supportedEvents).map(attr => `[${attr}]`).join(', '));

        // Process each element that has event attributes
        allElements.forEach((element, elementIndex) => {
            let elementHandlerCount = 0;

            // Check each supported event type for this element
            Object.entries(supportedEvents).forEach(([eventType, dataAttribute]) => {
                const methodName = element.getAttribute(dataAttribute);
                if (methodName) {
                    bindSingleEventHandler(element, eventType, dataAttribute, methodName, container, elementIndex + 1);
                    elementHandlerCount++;
                    totalHandlers++;
                }
            });

            if (elementHandlerCount > 0) {
                totalElements++;
                logger.log(`Element ${elementIndex + 1} has ${elementHandlerCount} event handler(s)`, {
                    elementTag: element.tagName,
                    elementId: element.id,
                    handlers: elementHandlerCount
                }, 'EVENTS');
            }
        });

        if (totalElements > 0) {
            logger.info(`Successfully bound ${totalHandlers} event handler(s) on ${totalElements} element(s) in container`, null, 'EVENTS');
        }
    }

    // Bind a single event handler
    function bindSingleEventHandler(element, eventType, dataAttribute, methodName, container, elementIndex) {
        logger.log(`Binding ${eventType} event for method: ${methodName} on element ${elementIndex}`, {
            elementTag: element.tagName,
            elementId: element.id,
            elementClass: element.className,
            methodName,
            eventType,
            dataAttribute
        }, 'EVENTS');

        // Find the root container (closest element with a class or the container itself)
        let root = element;
        while (root && root !== container && (!root.className || root === document.body)) {
            root = root.parentElement;
        }
        if (!root || root === document.body) {
            root = container; // Fallback to container
        }

        // Add event listener with debouncing for performance
        let timeoutId = null;
        const eventHandler = function(event) {
            // Debounce rapid events (like mouseover/mouseout) for better performance
            if (['mouseenter', 'mouseleave', 'mouseover', 'mouseout'].includes(eventType)) {
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    handleEventExecution(event, element, root, methodName, eventType, container);
                }, 10);
            } else {
                handleEventExecution(event, element, root, methodName, eventType, container);
            }
        };

        element.addEventListener(eventType, eventHandler);

        logger.success(`Successfully bound ${eventType} event for method: ${methodName}`, null, 'EVENTS');
    }

    // Handle the actual method execution
    function handleEventExecution(event, element, root, methodName, eventType, container) {
        logger.log(`${eventType.charAt(0).toUpperCase() + eventType.slice(1)} event triggered for method: ${methodName}`, {
            elementTag: element.tagName,
            elementId: element.id,
            methodName,
            eventType
        }, 'EVENTS');

        // Try to find the method in multiple scopes
        let method = findMethod(methodName, container);

        if (method && typeof method === 'function') {
            try {
                const result = method(event, element, root);
                const logData = result !== undefined ? { result } : null;
                logger.success(`Method ${methodName} executed successfully`, logData, 'EVENTS');
            } catch (error) {
                logger.error(`Error executing method ${methodName}:`, error, 'EVENTS');
                // Prevent event default behavior on errors to avoid unexpected actions
                event.preventDefault();
            }
        } else {
            logger.error(`Method ${methodName} not found`, {
                searchedScopes: ['window', 'HTMLComponents.methods', 'component scripts'],
                elementTag: element.tagName,
                elementId: element.id,
                methodName,
                eventType
            }, 'EVENTS');
            // Show visual notification for missing methods in development
            if (logger.debugMode) {
                notificationSystem.warning(`Method "${methodName}" not found. Check console for details.`);
            }
        }
    }

    // Find a method in the available scopes
    function findMethod(methodName, container) {
        // 1. Try global window scope
        if (typeof window[methodName] === 'function') {
            return window[methodName];
        }

        // 2. Try HTMLComponents.methods registry
        if (typeof window.HTMLComponents !== 'undefined' &&
            window.HTMLComponents.methods &&
            typeof window.HTMLComponents.methods[methodName] === 'function') {
            return window.HTMLComponents.methods[methodName];
        }

        // 3. Try component script scope (advanced feature)
        return findMethodInScripts(methodName, container);
    }

    // Extract method from script tags within the component
    function findMethodInScripts(methodName, container) {
        const scripts = container.querySelectorAll('script');
        for (const script of scripts) {
            if (script.textContent && script.textContent.includes('function ' + methodName)) {
                try {
                    // More robust function extraction that handles nested braces
                    const scriptContent = script.textContent;
                    const funcStart = scriptContent.indexOf('function ' + methodName);

                    if (funcStart === -1) continue;

                    // Find the opening brace after the function declaration
                    const afterFuncName = scriptContent.substring(funcStart);
                    const paramStart = afterFuncName.indexOf('(');
                    const braceStart = afterFuncName.indexOf('{', paramStart);

                    if (braceStart === -1) continue;

                    // Count braces to find the matching closing brace
                    let braceCount = 0;
                    let funcEnd = -1;
                    const searchStart = funcStart + braceStart;

                    for (let i = searchStart; i < scriptContent.length; i++) {
                        if (scriptContent[i] === '{') {
                            braceCount++;
                        } else if (scriptContent[i] === '}') {
                            braceCount--;
                            if (braceCount === 0) {
                                funcEnd = i;
                                break;
                            }
                        }
                    }

                    if (funcEnd === -1) continue;

                    // Extract the complete function
                    const funcCode = scriptContent.substring(funcStart, funcEnd + 1);

                    // Create function from string (more reliable approach)
                    return new Function('event', 'el', 'root', `
                        ${funcCode}
                        return ${methodName};
                    `)();

                } catch (e) {
                    logger.warn(`Could not extract method ${methodName} from script`, null, 'EVENTS');
                }
                break;
            }
        }
        return null;
    }

    // ===== Template Processing =====
    // Template processing for component props
    function processTemplate(template, props) {
        if (!props || Object.keys(props).length === 0) {
            return template;
        }

        let processedTemplate = template;

        // Replace {{propName}} patterns with prop values
        Object.keys(props).forEach(propName => {
            const propValue = props[propName];
            const placeholder = new RegExp(`\\{\\{\\s*${propName}\\s*\\}\\}`, 'g');

            // Convert prop value to string safely
            let stringValue;
            if (propValue === null || propValue === undefined) {
                stringValue = '';
            } else if (typeof propValue === 'object') {
                stringValue = JSON.stringify(propValue);
            } else {
                stringValue = String(propValue);
            }

            processedTemplate = processedTemplate.replace(placeholder, stringValue);
        });

        return processedTemplate;
    }

    // ===== JavaScript Execution =====
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
        externalScripts.forEach((src, index) => {
            logger.log(`Executing external script ${index + 1}/${externalScripts.length}:`, src, 'SCRIPT');
            const newScript = document.createElement('script');
            newScript.src = src;
            newScript.async = false; // Maintain execution order

            // Add load and error event listeners for better tracking
            newScript.onload = () => {
                logger.success(`External script loaded successfully: ${src}`, null, 'SCRIPT');
            };
            newScript.onerror = () => {
                logger.error(`Failed to load external script: ${src}`, null, 'SCRIPT');
            };

            document.head.appendChild(newScript);
            logger.log(`External script element added to DOM: ${src}`, null, 'SCRIPT');
        });

        // Execute inline scripts safely
        inlineScripts.forEach((scriptText, index) => {
            logger.log(`Executing inline script ${index + 1}/${inlineScripts.length}`, { scriptLength: scriptText.length }, 'SCRIPT');
            try {
                // Use Function constructor instead of eval for better performance and security
                const func = new Function(scriptText);
                func();
                logger.success(`Inline script ${index + 1} executed successfully`, null, 'SCRIPT');
            } catch (e) {
                logger.error(`Error executing inline script ${index + 1}:`, e, 'SCRIPT');
            }
        });

        logger.log(`Script execution completed: ${externalScripts.length} external, ${inlineScripts.length} inline`, null, 'SCRIPT');
    }



    // ===== CSS Loading =====
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
                const loadTime = logger.endTimer(`load-css-${href}`);
                logger.success(`CSS loaded successfully: ${href} (${loadTime?.toFixed(2) || 'unknown'}ms)`, null, 'CSS');

                // Fetch the CSS content to cache it
                fetch(href)
                    .then(response => {
                        if (response.ok) {
                            logger.log(`Cache fetch completed for ${href}`, null, 'CSS');
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

    // ===== Initialization =====
    // Load all components and CSS on page load
    document.addEventListener('DOMContentLoaded', function() {
        logger.log('Initializing HTML Components library');

        // Load JavaScript files
        const jsElements = document.querySelectorAll('[data-js]');
        logger.log('Found JS files to load:', jsElements.length);

        const jsPromises = Array.from(jsElements).map(element => {
            const jsPath = element.getAttribute('data-js');
            if (jsPath) {
                return HTMLComponents.loadJS(jsPath).catch(error => {
                    logger.error(`Failed to load JS "${jsPath}": ${error.message}`, error);
                });
            }
            return Promise.resolve();
        });

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

        Promise.allSettled([...jsPromises, ...cssPromises, ...componentPromises]).then(results => {
            logger.log('All loading attempts completed');
            const failedCount = results.filter(result => result.status === 'rejected').length;
            if (failedCount > 0) {
                logger.warn(`${failedCount} resource(s) failed to load`);
            }

            // Bind data-click events for static HTML elements (not loaded components)
            logger.log('Binding data-click events for static HTML elements');
            bindEventHandlers(document.body);
        });
    });



    // ===== Layout Engine =====
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
            logger.log(`Loading ${pageMeta.styles.length} page-level styles`, { styles: pageMeta.styles }, 'PAGE');
            pageMeta.styles.forEach((styleUrl, index) => {
                logger.log(`Loading page style ${index + 1}/${pageMeta.styles.length}: ${styleUrl}`, null, 'PAGE');
                loadCSS(styleUrl).catch(err => {
                    logger.warn(`Failed to load page style ${index + 1}: ${styleUrl}`, null, 'PAGE');
                });
            });
        }

        // Set page title if specified
        if (pageMeta.title) {
            const oldTitle = document.title;
            document.title = pageMeta.title;
            logger.log(`Page title set: "${pageMeta.title}" (was: "${oldTitle}")`, { newTitle: pageMeta.title, oldTitle }, 'PAGE');
        }

        // Set meta description if specified
        if (pageMeta.description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            const oldDescription = metaDesc ? metaDesc.content : null;

            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
                logger.log('Created new meta description element', null, 'PAGE');
            }
            metaDesc.content = pageMeta.description;
            logger.log(`Meta description set: "${pageMeta.description}" (was: "${oldDescription || 'none'}")`, {
                newDescription: pageMeta.description,
                oldDescription,
                elementCreated: !oldDescription
            }, 'PAGE');
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
            logger.log('Processing component definition:', component.name || 'unnamed', 'COMPONENT');

            // Check for conditional rendering
            if (component.condition !== undefined) {
                const conditionResult = typeof component.condition === 'function'
                    ? component.condition()
                    : component.condition;

                logger.log(`Conditional component ${component.name || 'unnamed'} evaluation: ${conditionResult}`, {
                    conditionType: typeof component.condition,
                    result: conditionResult
                }, 'COMPONENT');

                if (!conditionResult) {
                    logger.info(`Skipping conditional component: ${component.name || 'unnamed'}`, null, 'COMPONENT');
                    return Promise.resolve();
                }
            }

            const { name, selector, props = {}, layout, children, css, id } = component;
            let element = target;

            // Handle layout sections
            if (layout) {
                const layoutClass = typeof layout === 'string' ? layout : layout.class || '';
                const layoutId = typeof layout === 'string' ? '' : layout.id || '';
                const layoutTag = typeof layout === 'object' ? layout.tag || 'section' : 'section';

                logger.log(`Creating layout element: ${layoutTag} with class "${layoutClass}" and id "${layoutId}"`, null, 'COMPONENT');

                element = document.createElement(layoutTag);
                element.className = layoutClass;
                if (layoutId) element.id = layoutId;

                // Add layout-specific attributes
                if (typeof layout === 'object') {
                    if (layout.attrs) {
                        logger.log(`Adding layout attributes:`, layout.attrs, 'COMPONENT');
                        Object.keys(layout.attrs).forEach(attr => {
                            element.setAttribute(attr, layout.attrs[attr]);
                        });
                    }
                    if (layout.styles) {
                        logger.log(`Adding layout styles:`, layout.styles, 'COMPONENT');
                        Object.assign(element.style, layout.styles);
                    }
                }

                target.appendChild(element);
                logger.success(`Created layout element: ${layoutTag}.${layoutClass}#${layoutId}`, null, 'COMPONENT');
            } else if (selector) {
                // Use specified selector
                logger.log(`Using selector for component placement: ${selector}`, null, 'COMPONENT');
                element = document.querySelector(selector);
                if (!element) {
                    logger.warn(`Selector not found "${selector}", falling back to target element`, null, 'COMPONENT');
                    element = target;
                } else {
                    logger.log(`Found target element with selector: ${selector}`, null, 'COMPONENT');
                }
            }

            // Add CSS classes if specified - batch class additions
            if (css) {
                const classesToAdd = typeof css === 'string' ? css.split(' ') : css;
                logger.log(`Adding CSS classes to element:`, classesToAdd, 'COMPONENT');
                element.classList.add(...classesToAdd);
            }

            // Add ID if specified
            if (id) {
                logger.log(`Setting element ID: ${id}`, null, 'COMPONENT');
                element.id = id;
            }

            // Process props (handle functions for computed values)
            const processedProps = {};
            let computedPropsCount = 0;
            Object.keys(props).forEach(key => {
                const value = props[key];
                if (typeof value === 'function') {
                    processedProps[key] = value();
                    computedPropsCount++;
                } else {
                    processedProps[key] = value;
                }
            });

            if (Object.keys(props).length > 0) {
                logger.log(`Processed component props: ${Object.keys(props).length} total, ${computedPropsCount} computed`, {
                    totalProps: Object.keys(props).length,
                    computedProps: computedPropsCount,
                    propKeys: Object.keys(props)
                }, 'COMPONENT');
            }

            // Handle component loading - load from file
            logger.log(`Loading component "${name}" into element`, {
                componentName: name,
                targetElement: element.tagName + (element.className ? '.' + element.className : '') + (element.id ? '#' + element.id : ''),
                hasChildren: !!(children && Array.isArray(children)),
                childrenCount: children && Array.isArray(children) ? children.length : 0
            }, 'COMPONENT');

            const componentPromise = loadComponentIntoElement(element, name);

            // Handle nested children
            if (children && Array.isArray(children)) {
                logger.log(`Component has ${children.length} nested children to process`, null, 'COMPONENT');
                return componentPromise.then(() => {
                    logger.log(`Processing ${children.length} nested component children`, null, 'COMPONENT');
                    const childPromises = children.map((child, index) => {
                        logger.log(`Processing child component ${index + 1}/${children.length}`, null, 'COMPONENT');
                        return processComponentDefinition(child, element);
                    });
                    return Promise.allSettled(childPromises).then(results => {
                        const successCount = results.filter(r => r.status === 'fulfilled').length;
                        const failureCount = results.filter(r => r.status === 'rejected').length;
                        logger.log(`Child component processing completed: ${successCount} successful, ${failureCount} failed`, null, 'COMPONENT');
                        return results;
                    });
                });
            }

            return componentPromise;
        }

        return Promise.resolve();
    }

    // Optimized batch DOM operations for page building
    function batchDOMOperations(target, operations) {
        logger.startTimer('batch-dom-operations');
        logger.log(`Starting batch DOM operations: ${operations.length} operations`, {
            targetElement: target.tagName + (target.className ? '.' + target.className : '') + (target.id ? '#' + target.id : ''),
            operationCount: operations.length
        }, 'DOM');

        if (operations.length === 0) {
            logger.log('No operations to perform, exiting early', null, 'DOM');
            return;
        }

        const fragment = document.createDocumentFragment();
        logger.log('Created document fragment for batch operations', null, 'DOM');

        operations.forEach((op, index) => {
            if (typeof op === 'function') {
                logger.log(`Executing function operation ${index + 1}/${operations.length}`, null, 'DOM');
                op(fragment);
            } else if (op.element && op.method) {
                logger.log(`Executing element operation ${index + 1}/${operations.length}: ${op.method}`, {
                    elementTag: op.element.tagName,
                    method: op.method
                }, 'DOM');
                fragment[op.method](op.element);
            } else {
                logger.warn(`Unknown operation type at index ${index}:`, op, 'DOM');
            }
        });

        if (fragment.children.length > 0) {
            logger.log(`Appending ${fragment.children.length} elements to target`, null, 'DOM');
            target.appendChild(fragment);
            logger.success(`Batch DOM operations completed: ${operations.length} operations, ${fragment.children.length} elements added`, null, 'DOM');
        } else {
            logger.log('No elements to append, fragment was empty', null, 'DOM');
        }

        logger.endTimer('batch-dom-operations');
    }

    // ===== Global API =====
    // Expose functions globally for manual loading
    window.HTMLComponents = {
        // Methods registry for data-click handlers
        methods: {},

        // File-based component loading
        loadComponent: function(selector, componentPath, props = {}) {
            const element = document.querySelector(selector);
            if (element) {
                return loadComponentIntoElement(element, componentPath, props);
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
            // Remove the container from DOM completely
            if (notificationSystem.container && notificationSystem.container.parentElement) {
                notificationSystem.container.remove();
                notificationSystem.container = null; // Clear reference
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
        disableLoggingExceptErrors: function() {
            logger.setLevel('ERROR');
            logger.info('Logging disabled - only errors will be shown', null, 'GENERAL');
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
        },

        // Internal function for notification container management
        _checkNotificationContainer: function() {
            if (notificationSystem && notificationSystem.checkContainerRemoval) {
                notificationSystem.checkContainerRemoval();
            }
        }
    };

})();
