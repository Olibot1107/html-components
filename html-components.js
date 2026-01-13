// HTML Components Library - Advanced Version
// Create entire websites from JavaScript component definitions
// Supports dynamic image loading, component registries, and page building
// For local development, run a local server to avoid CORS issues

(function() {
    'use strict';

    // Notification system for visual error display
    const notificationSystem = {
        container: null,

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

        show: function(type, title, message, details = null, suggestions = []) {
            this.init();

            const notification = document.createElement('div');
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
                        setTimeout(() => notification.remove(), 300);
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

    // Logging utility with high-contrast styled console output
    const logger = {
        log: function(message, data) {
            console.log('%c[HTML Components]%c ' + message, 'color: #0F5132; font-weight: bold; background: #D1E7DD; padding: 3px 6px; border-radius: 4px; border: 1px solid #A3CFBB;', 'color: #FFF; font-weight: bold;', data || '');
        },
        error: function(message, error) {
            console.error('%c[HTML Components ERROR]%c ' + message, 'color: #842029; font-weight: bold; background: #F8D7DA; padding: 3px 6px; border-radius: 4px; border: 1px solid #F5C2C7;', 'color: #FFF; font-weight: bold;', error || '');
            // Show visual notification for errors
            notificationSystem.error(message, error);
        },
        warn: function(message, data) {
            console.warn('%c[HTML Components WARNING]%c ' + message, 'color: #664D03; font-weight: bold; background: #FFF3CD; padding: 3px 6px; border-radius: 4px; border: 1px solid #FFEAA7;', 'color: #FFF; font-weight: bold;', data || '');
            // Show visual notification for warnings
            notificationSystem.warning(message, [
                'Check the browser console for additional details',
                'This might indicate a non-critical issue'
            ]);
        },
        success: function(message, data) {
            console.log('%c[HTML Components SUCCESS]%c ' + message, 'color: #0F5132; font-weight: bold; background: #D1E7DD; padding: 3px 6px; border-radius: 4px; border: 1px solid #A3CFBB;', 'color: #FFF; font-weight: bold;', data || '');
        },
        info: function(message, data) {
            console.info('%c[HTML Components INFO]%c ' + message, 'color: #055160; font-weight: bold; background: #CFF4FC; padding: 3px 6px; border-radius: 4px; border: 1px solid #9EEAF9;', 'color: #FFF; font-weight: bold;', data || '');
            // Show visual notification for important info
            if (message.includes('initialized') || message.includes('completed')) {
                notificationSystem.info(message);
            }
        }
    };

    // Component registry for storing component definitions
    const componentRegistry = new Map();

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
                logger.log('Page cached:', key);
            }
        },

        get: function(key) {
            if (!this.enabled) return null;

            const cached = this.cache.get(key);
            if (cached) {
                logger.success('Page loaded from cache:', key);
                return cached.content;
            }
            return null;
        },

        clear: function() {
            this.cache.clear();
            logger.info('Page cache cleared');
        },

        enable: function() {
            this.enabled = true;
            logger.info('Page caching enabled');
        },

        disable: function() {
            this.enabled = false;
            logger.info('Page caching disabled');
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
                logger.log('File cached:', url);
            }
        },

        get: function(url) {
            if (!this.enabled) return null;

            const cached = this.cache.get(url);
            if (cached) {
                logger.success('File loaded from cache:', url);
                return cached.content;
            }
            return null;
        },

        clear: function() {
            this.cache.clear();
            logger.info('File cache cleared');
        },

        enable: function() {
            this.enabled = true;
            logger.info('File caching enabled');
        },

        disable: function() {
            this.enabled = false;
            logger.info('File caching disabled');
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

    // Internal component loading function (works with DOM elements)
    function loadComponentIntoElement(element, componentPath) {
        logger.log('Loading component:', componentPath);

        // Check file cache first
        const cachedContent = fileCache.get(componentPath);
        if (cachedContent) {
            logger.success('Component loaded from file cache:', componentPath);
            element.innerHTML = cachedContent;

            // Execute any scripts in the cached HTML
            executeScripts(element);

            return Promise.resolve(cachedContent);
        }

        return fetch(componentPath)
            .then(response => {
                logger.log('Fetch response received for:', componentPath, 'Status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                logger.success('Component HTML loaded successfully:', componentPath + ' (' + html.length + ' chars)');

                // Cache the content
                fileCache.set(componentPath, html);

                element.innerHTML = html;

                // Execute any scripts in the loaded HTML
                executeScripts(element);

                return html;
            })
            .catch(error => {
                logger.error(`Failed to load component "${componentPath}": ${error.message}`, error);
                element.innerHTML = `<div style="color: red; padding: 1rem; border: 1px solid red; background: #ffe6e6;">
                    <strong>Component Load Error:</strong> ${componentPath}<br>
                    <small>${error.message}</small>
                </div>`;
                throw error;
            });
    }

    // Execute scripts found in loaded HTML
    function executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                // External script
                logger.log('Executing external script:', script.src);
                const newScript = document.createElement('script');
                newScript.src = script.src;
                document.head.appendChild(newScript);
            } else {
                // Inline script
                logger.log('Executing inline script');
                try {
                    eval(script.textContent);
                } catch (e) {
                    logger.error('Error executing inline script:', e);
                }
            }
        });
    }

    // CSS loading functionality with caching
    function loadCSS(href, options = {}) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existing = document.querySelector(`link[href="${href}"]`);
            if (existing) {
                logger.success('CSS already loaded:', href);
                resolve(existing);
                return;
            }

            // Check file cache first
            const cachedCSS = fileCache.get(href);
            if (cachedCSS) {
                logger.success('CSS loaded from file cache:', href);

                // Inject cached CSS as style element
                const style = document.createElement('style');
                style.setAttribute('data-cached-css', href);
                style.textContent = cachedCSS;
                document.head.appendChild(style);

                resolve(style);
                return;
            }

            logger.log('Loading CSS:', href);
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
                logger.success('CSS loaded successfully:', href);

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
                        logger.warn('Could not cache CSS content:', href);
                    });

                resolve(link);
            };

            link.onerror = () => {
                logger.error('Failed to load CSS:', href);
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

    // Component definition functions
    function registerComponent(name, definition) {
        logger.log('Registering component:', name);
        componentRegistry.set(name, definition);
        return definition;
    }

    function createComponentElement(name, props = {}) {
        const definition = componentRegistry.get(name);
        if (!definition) {
            logger.error('Component not registered:', name);
            return `<div style="color: red;">Component "${name}" not found</div>`;
        }

        let html = definition.template || '';

        // Replace props in template
        if (definition.props) {
            definition.props.forEach(prop => {
                const regex = new RegExp(`{{${prop}}}`, 'g');
                const value = props[prop] !== undefined ? props[prop] : '';
                html = html.replace(regex, value);
            });
        }

        // Add CSS if provided
        if (definition.styles) {
            const styleId = `component-style-${name}`;
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = definition.styles;
                document.head.appendChild(style);
                logger.log('Added styles for component:', name);
            }
        }

        // Execute component logic if provided
        if (definition.logic && typeof definition.logic === 'function') {
            logger.log('Executing component logic for:', name);
            // Logic will be executed after the component is inserted
            setTimeout(() => definition.logic(props), 0);
        }

        return html;
    }

    // Enhanced page building function with advanced features and caching
    function buildPageFromComponents(pageDefinition, targetElement = 'body', clearTarget = false, cacheOptions = {}) {
        logger.info('Building page from enhanced definition');

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
            logger.success('Page built successfully with', componentList.length, 'components');

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

    // Process individual component definitions with enhanced features
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

            // Add CSS classes if specified
            if (css) {
                if (typeof css === 'string') {
                    element.classList.add(...css.split(' '));
                } else if (Array.isArray(css)) {
                    element.classList.add(...css);
                }
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

            // Handle component loading
            let componentPromise;
            if (componentRegistry.has(name)) {
                // Use registered component
                logger.log('Building registered component:', name);
                const html = createComponentElement(name, processedProps);
                element.insertAdjacentHTML('beforeend', html);
                componentPromise = Promise.resolve(html);
            } else {
                // Load from file
                logger.log('Loading unregistered component as file:', name);
                componentPromise = loadComponentIntoElement(element, name);
            }

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

        // CSS loading
        loadCSS: function(href, options) {
            return loadCSS(href, options);
        },

        reloadAll: function() {
            logger.log('Manually reloading all components');
            const components = document.querySelectorAll('[data-component]');
            components.forEach(element => {
                const componentPath = element.getAttribute('data-component');
                if (componentPath) {
                    loadComponentIntoElement(element, componentPath);
                }
            });
        },

        // Image loading utilities
        loadImage: function(src, options) {
            return imageLoader.load(src, options);
        },
        preloadImages: function(sources) {
            return imageLoader.preload(sources);
        },

        // Component registry functions
        registerComponent: registerComponent,
        createComponent: createComponentElement,

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

        // Utility functions
        getRegisteredComponents: function() {
            return Array.from(componentRegistry.keys());
        },
        clearComponentCache: function() {
            componentRegistry.clear();
            imageLoader.cache.clear();
            logger.info('Component and image caches cleared');
        }
    };

})();
