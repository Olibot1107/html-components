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

    // Main component loading function
    function loadComponent(element, componentPath) {
        logger.log('Loading component:', componentPath);

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

    // CSS loading functionality
    function loadCSS(href, options = {}) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existing = document.querySelector(`link[href="${href}"]`);
            if (existing) {
                logger.success('CSS already loaded:', href);
                resolve(existing);
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
                return loadComponent(element, componentPath);
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

    // Page building function
    function buildPageFromComponents(componentList, targetElement = 'body', clearTarget = false) {
        logger.info('Building page from component list');

        const target = document.querySelector(targetElement);
        if (!target) {
            logger.error('Target element not found:', targetElement);
            return Promise.reject(new Error('Target element not found'));
        }

        // Clear target if specified or if target is essentially empty (like in index.html)
        const isEmpty = target.innerHTML.trim() === '' ||
                       target.innerHTML.trim() === '<!-- Everything will be built by JavaScript! -->' ||
                       target.innerHTML.trim() === '<!-- Everything built by JS -->';

        if (clearTarget || isEmpty) {
            target.innerHTML = '';
            logger.log('Cleared target element for fresh build');
        }

        // Build page from components
        const loadPromises = componentList.map(component => {
            if (typeof component === 'string') {
                // Simple component name - load file into target
                logger.log('Loading file component:', component);
                return loadComponent(target, component);
            } else if (typeof component === 'object') {
                // Component with props
                const { name, selector, props = {} } = component;
                let element;

                if (selector) {
                    // Use specified selector
                    element = document.querySelector(selector);
                    if (!element) {
                        logger.warn('Selector not found, using target:', selector);
                        element = target;
                    }
                } else {
                    // No selector specified, use target
                    element = target;
                }

                if (componentRegistry.has(name)) {
                    // Use registered component
                    logger.log('Building registered component:', name);
                    const html = createComponentElement(name, props);
                    element.insertAdjacentHTML('beforeend', html);
                    return Promise.resolve(html);
                } else {
                    // Load from file
                    logger.log('Loading unregistered component as file:', name);
                    return loadComponent(element, name);
                }
            }
            return Promise.resolve();
        });

        return Promise.allSettled(loadPromises).then(results => {
            logger.success('Page built successfully with', componentList.length, 'components');
            return results;
        });
    }

    // Expose functions globally for manual loading
    window.HTMLComponents = {
        // File-based component loading
        loadComponent: function(selector, componentPath) {
            const element = document.querySelector(selector);
            if (element) {
                return loadComponent(element, componentPath);
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
                    loadComponent(element, componentPath);
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
