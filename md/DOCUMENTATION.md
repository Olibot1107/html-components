# HTML Components

Load HTML components from files and build pages dynamically.

## Table of Contents

- [Quick Start](#quick-start)
- [Component Loading](#component-loading)
- [JavaScript & CSS Loading](#javascript--css-loading)
- [Component and CSS Toggling](#component-and-css-toggling)
- [Page Building](#page-building)
- [Notifications](#notifications)
- [Logging Control](#logging-control)
- [Image Loading](#image-loading)
- [Caching](#caching)
- [Error Handling](#error-handling)
- [Component Files](#component-files)
- [Development](#development)

## For Quick Start
Quick start guide: [QUICKSTART.md](QUICKSTART.md)
## Component Loading

### loadComponent(selector, componentPath)
Load a component from a file into a DOM element.

```javascript
// Load into element with ID
HTMLComponents.loadComponent('#header', 'components/header.html');

// Load into element with class
HTMLComponents.loadComponent('.sidebar', 'sidebar.html');

// Returns a Promise
HTMLComponents.loadComponent('#content', 'content.html')
    .then(() => console.log('Component loaded'))
    .catch(err => console.error('Failed to load:', err));
```

Components can automatically load nested components and CSS files.

## JavaScript & CSS Loading

### loadJS(src, options)
Load a JavaScript file with caching and error handling.

```javascript
// Basic loading
HTMLComponents.loadJS('scripts/utils.js')
    .then(() => console.log('JS loaded'))
    .catch(err => console.error('JS failed:', err));

// With options
HTMLComponents.loadJS('scripts/analytics.js', {
    async: true,                    // Load asynchronously
    crossOrigin: 'anonymous'        // For external scripts
});
```

### loadCSS(href, options)
Load a CSS file with caching and error handling.

```javascript
// Basic loading
HTMLComponents.loadCSS('styles/main.css')
    .then(() => console.log('CSS loaded'))
    .catch(err => console.error('CSS failed:', err));

// With options
HTMLComponents.loadCSS('styles/theme.css', {
    media: 'screen and (max-width: 768px)', // Conditional loading
    crossOrigin: 'anonymous'                  // For external stylesheets
});
```

## Component and CSS Toggling

### Component Visibility Control

#### toggleComponent(selector, show)
Toggle component visibility on/off or set specific state.

```javascript
// Toggle between visible/hidden
HTMLComponents.toggleComponent('#sidebar'); // Toggles current state

// Explicitly show
HTMLComponents.toggleComponent('#modal', true);

// Explicitly hide
HTMLComponents.toggleComponent('.notification', false);

// Returns the new visibility state (true = visible, false = hidden)
const isVisible = HTMLComponents.toggleComponent('#menu');
```

#### showComponent(selector) / hideComponent(selector)
Convenience methods for showing/hiding components.

```javascript
// Show component
HTMLComponents.showComponent('#welcome-message');

// Hide component
HTMLComponents.hideComponent('.loading-spinner');

// Returns true (show) or false (hide)
const result = HTMLComponents.showComponent('.overlay');
```

#### isComponentVisible(selector)
Check if a component is currently visible.

```javascript
// Check visibility
if (HTMLComponents.isComponentVisible('#sidebar')) {
    console.log('Sidebar is visible');
} else {
    console.log('Sidebar is hidden');
}

// Conditional logic
const buttonText = HTMLComponents.isComponentVisible('.menu')
    ? 'Hide Menu'
    : 'Show Menu';
```

#### Component Path-Based Toggling
Toggle components directly by their data-component path.

```javascript
// Toggle by component path
HTMLComponents.toggleComponentByPath('components/header.html');

// Show specific component
HTMLComponents.showComponentByPath('components/sidebar.html');

// Hide specific component
HTMLComponents.hideComponentByPath('components/footer.html');

// Check visibility by path
if (HTMLComponents.isComponentVisibleByPath('components/navigation.html')) {
    console.log('Navigation is visible');
}
```

This is especially useful for toggling components loaded via `<div data-component="path/to/component.html"></div>`.

#### Component Replacement
Replace existing components with new ones dynamically.

```javascript
// Replace component in a selector
HTMLComponents.replaceComponent('#content', 'components/new-content.html')
    .then(() => console.log('Component replaced'))
    .catch(err => console.error('Replacement failed:', err));

// Replace component by path
HTMLComponents.replaceComponentByPath('components/old-sidebar.html', 'components/new-sidebar.html')
    .then(() => console.log('Sidebar updated'))
    .catch(err => console.error('Sidebar update failed:', err));

// Practical example: Dynamic page sections
function switchToContactPage() {
    HTMLComponents.replaceComponent('#main-content', 'components/contact-page.html');
}

function switchToAboutPage() {
    HTMLComponents.replaceComponent('#main-content', 'components/about-page.html');
}
```

**Note:** `replaceComponent` clears the existing content and loads the new component. This is perfect for dynamic page updates, theme switching, or content area replacements.

### CSS File Control

#### toggleCSS(href, enable)
Toggle CSS file on/off or set specific state.

```javascript
// Toggle between enabled/disabled
HTMLComponents.toggleCSS('styles/dark-theme.css'); // Toggles current state

// Explicitly enable
HTMLComponents.toggleCSS('styles/print.css', true);

// Explicitly disable
HTMLComponents.toggleCSS('styles/debug.css', false);

// Returns the new enabled state (true = enabled, false = disabled)
const isEnabled = HTMLComponents.toggleCSS('styles/theme.css');
```

#### enableCSS(href) / disableCSS(href)
Convenience methods for enabling/disabling CSS files.

```javascript
// Enable CSS file
HTMLComponents.enableCSS('styles/responsive.css');

// Disable CSS file
HTMLComponents.disableCSS('styles/print.css');

// Returns true (enable) or false (disable)
const result = HTMLComponents.enableCSS('styles/animations.css');
```

#### isCSSEnabled(href)
Check if a CSS file is currently enabled.

```javascript
// Check CSS status
if (HTMLComponents.isCSSEnabled('styles/dark-theme.css')) {
    console.log('Dark theme is active');
} else {
    console.log('Light theme is active');
}

// Theme switching
function toggleTheme() {
    const darkThemeEnabled = HTMLComponents.isCSSEnabled('styles/dark-theme.css');
    if (darkThemeEnabled) {
        HTMLComponents.disableCSS('styles/dark-theme.css');
        HTMLComponents.enableCSS('styles/light-theme.css');
    } else {
        HTMLComponents.disableCSS('styles/light-theme.css');
        HTMLComponents.enableCSS('styles/dark-theme.css');
    }
}
```

### Logging and Debugging

All toggle operations include detailed logging. Enable debug mode to see full details:

```javascript
// Enable detailed logging
HTMLComponents.enableDebug();

// Example console output:
// [HTML Components DEBUG] Attempting to toggle component: #sidebar
// [HTML Components DEBUG] Component #sidebar current visibility: false, will set to: true
// [HTML Components INFO] Component shown: #sidebar (was hidden)
// [HTML Components SUCCESS] Component toggle completed: #sidebar -> true
```

## Page Building

### buildPage(pageDefinition, targetElement, clearTarget)
Build an entire page from component definitions.

```javascript
// Simple array format
const page = ['header.html', 'content.html', 'footer.html'];
HTMLComponents.buildPage(page, 'body', true);

// Enhanced object format
const page = {
    title: 'My Website',
    description: 'Page description for SEO',
    styles: ['styles/main.css', 'styles/page.css'],
    components: [
        'components/header.html',
        {
            name: 'hero-section',
            props: { title: 'Welcome' },
            css: ['hero', 'centered']
        },
        'components/footer.html'
    ]
};
HTMLComponents.buildPage(page, 'body', true);
```

### Component Definitions

Components can have props, CSS classes, IDs, and conditional loading:

```javascript
{
    name: 'hero-section',           // Component file or registered component
    props: {                        // Data passed to component
        title: 'Welcome',
        subtitle: 'Hello World'
    },
    css: ['hero', 'centered'],      // CSS classes to add
    id: 'main-hero',                // ID to set
    condition: () => window.innerWidth > 768  // Load conditionally
}
```

### Layout Sections

Create structured layouts with automatic HTML elements:

```javascript
{
    layout: 'header',               // Creates <header> element
    children: ['nav.html', 'logo.html']
}

// Or with full control
{
    layout: {
        class: 'sidebar',
        id: 'main-sidebar',
        attrs: { 'data-theme': 'dark' }
    },
    children: ['user-profile.html', 'menu.html']
}
```

## Notifications

### enableNotifications() / disableNotifications()
Control visual notification display.

```javascript
// Disable visual notifications
HTMLComponents.disableNotifications();

// Re-enable notifications
HTMLComponents.enableNotifications();
```

Notifications appear for errors, warnings, and important events. They auto-dismiss after 10 seconds.

## Logging Control

### enableDebug() / disableDebug()
Control detailed debug logging.

```javascript
// Enable debug logging (shows all log levels)
HTMLComponents.enableDebug();

// Disable debug logging (returns to INFO level)
HTMLComponents.disableDebug();
```

Debug mode shows detailed information about component loading, caching, and performance timing.

### setLogLevel(level)
Set the minimum log level to display.

```javascript
// Available levels: 'DEBUG', 'INFO', 'SUCCESS', 'WARN', 'ERROR', 'NONE'
HTMLComponents.setLogLevel('WARN');    // Show warnings and errors only
HTMLComponents.setLogLevel('ERROR');   // Show errors only
HTMLComponents.setLogLevel('DEBUG');   // Show all messages
HTMLComponents.setLogLevel('NONE');    // Disable all logging
```

### disableLoggingExceptErrors()
Convenience method to disable all logging except errors.

```javascript
// Disable all logging except errors
HTMLComponents.disableLoggingExceptErrors();
```

This is useful for production environments where you only want to see errors.

### getLogHistory(level)
Get logged messages for debugging.

```javascript
// Get all logged messages
const allLogs = HTMLComponents.getLogHistory();

// Get only error messages
const errors = HTMLComponents.getLogHistory('ERROR');

// Get only warnings
const warnings = HTMLComponents.getLogHistory('WARN');
```

### clearLogHistory()
Clear the log history.

```javascript
// Clear all logged messages
HTMLComponents.clearLogHistory();
```

### getLogStats()
Get logging statistics.

```javascript
// Get logging statistics
const stats = HTMLComponents.getLogStats();
console.log(stats);
// Output:
// {
//   totalLogs: 45,
//   levelBreakdown: { DEBUG: 10, INFO: 15, SUCCESS: 12, WARN: 5, ERROR: 3 },
//   currentLevel: 'INFO',
//   debugMode: false,
//   maxHistorySize: 50,
//   activeTimers: 2
// }
```

### Performance Timing
Track performance with built-in timers.

```javascript
// Start timing an operation
HTMLComponents.startTimer('custom-operation');

// ... perform operation ...

// End timing and get duration
const duration = HTMLComponents.endTimer('custom-operation');
console.log(`Operation took ${duration}ms`);
```

Timers work regardless of log level and are automatically tracked for performance monitoring.

## Image Loading

### loadImage(src, options)
Load a single image with caching.

```javascript
HTMLComponents.loadImage('logo.png')
    .then(img => document.body.appendChild(img))
    .catch(err => console.error('Image failed:', err));

// With options
HTMLComponents.loadImage('hero-bg.jpg', {
    crossOrigin: 'anonymous'
});
```

### preloadImages(sources)
Preload multiple images for performance.

```javascript
HTMLComponents.preloadImages([
    'hero-bg.jpg',
    'icon1.png',
    'icon2.png'
]);
```

## Caching

### File Caching
Files are automatically cached when loaded. Manage with:

```javascript
// Enable/disable file caching
HTMLComponents.enableFileCache();
HTMLComponents.disableFileCache();

// Clear all cached files
HTMLComponents.clearFileCache();

// Get cache stats
const stats = HTMLComponents.getFileCacheStats();
console.log(stats); // { enabled: true, size: 5, keys: [...] }
```

### Page Caching
Built pages are cached for performance:

```javascript
// Enable/disable page caching
HTMLComponents.enablePageCache();
HTMLComponents.disablePageCache();

// Clear cached pages
HTMLComponents.clearPageCache();

// Get page cache stats
const stats = HTMLComponents.getPageCacheStats();
```

### Manual Cache Keys
Provide explicit cache keys for control:

```javascript
const page = {
    cacheKey: 'homepage_v1', // Explicit key
    components: [...]
};
```

## Error Handling

The library provides automatic error detection and visual notifications:

- **CORS Issues**: When opening files directly in browser
- **File Not Found**: Component files that don't exist
- **Network Errors**: Connection issues
- **JavaScript Errors**: Syntax errors in component scripts

Errors appear as slide-in notifications in the top-right corner showing the error name and message. Full error details including stack traces are logged to the browser console for debugging.

## Component Files

Components are regular HTML files that can contain scripts, styles, and nested components:

```html
<!-- components/header.html -->
<header>
    <h1>{{title}}</h1>
    <nav>
        <a href="#home">Home</a>
        <a href="#about">About</a>
    </nav>

    <!-- Load nested components -->
    <div data-component="logo.html"></div>

    <!-- Load nested CSS -->
    <div data-css="header.css"></div>
</header>

<script>
    // Component logic
    console.log('Header loaded with title:', '{{title}}');

    // Add event listeners
    document.querySelector('h1').addEventListener('click', () => {
        alert('Header clicked!');
    });
</script>
```

### Template Syntax
Use `{{propName}}` for dynamic content replacement:

```html
<div class="user-card">
    <h2>{{name}}</h2>
    <p>{{description}}</p>
    <button class="{{buttonClass}}">{{buttonText}}</button>
</div>
```

## Development

### Local Server Setup
Run a local server to avoid CORS errors:

```bash
# Using Node.js
npx http-server -p 8080 --cors

# Using Python
python -m http.server 8080
```

Then open: `http://localhost:8080/your-file.html`

### File Organization
Recommended project structure:

```
my-app/
├── html-components.js
├── index.html
├── components/
│   ├── header.html
│   ├── footer.html
│   └── sidebar.html
├── styles/
│   └── main.css
└── scripts/
    └── utils.js
```

### Utility Functions

```javascript
// Reload all components (bypasses cache)
HTMLComponents.reloadAll();

// Clear all caches
HTMLComponents.clearComponentCache();
```