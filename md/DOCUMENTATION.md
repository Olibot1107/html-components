# HTML Components Documentation

A lightweight, powerful JavaScript library for building dynamic web applications using reusable HTML components. Load components from files, manage dependencies, handle events, and build complete pages programmatically.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Quick Start

Get started in 5 minutes.

### 1. Include the Library

```html
<script src="https://html-components.vapp.uk/html-components.js"></script>
```

### 2. Create a Component

**components/header.html**
```html
<style>
.header {
    background: #2c3e50;
    color: white;
    padding: 1rem;
    text-align: center;
}
</style>

<header class="header">
    <h1>{{title}}</h1>
    <nav>
        <a href="#home" data-click="navigateTo">Home</a>
        <a href="#about" data-click="navigateTo">About</a>
    </nav>
</header>

<script>
function navigateTo(event, element) {
    event.preventDefault();
    const route = element.getAttribute('href').slice(1);
    console.log('Navigating to:', route);
}
</script>
```

### 3. Load Your Component

**index.html**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
</head>
<body>
    <!-- Declarative loading -->
    <div data-component="components/header.html"></div>

    <!-- Programmatic loading -->
    <div id="content"></div>

    <script src="html-components.js"></script>
    <script>
        HTMLComponents.loadComponent('#content', 'components/content.html', {
            message: 'Hello from JavaScript!'
        });
    </script>
</body>
</html>
```

### 4. Run with a Local Server

```bash
# Python
python -m http.server 8080

# Node.js
npx http-server -p 8080

# PHP
php -S localhost:8080
```

Visit `http://localhost:8080` and see your components load!

## Installation

### CDN (Recommended)

```html
<script src="https://html-components.vapp.uk/html-components.js"></script>
```

### Local Installation

```bash
curl -O https://html-components.vapp.uk/html-components.js
```

## Core Concepts

### Component Loading

Components can be loaded **declaratively** (HTML attributes) or **programmatically** (JavaScript).

#### Declarative Loading

Use `data-component` to automatically load components on page load:

```html
<!-- Basic component -->
<div data-component="components/header.html"></div>

<!-- Nested components -->
<div data-component="components/layout.html">
    <div data-component="components/sidebar.html"></div>
    <div data-component="components/content.html"></div>
</div>
```

#### Programmatic Loading

Use JavaScript for dynamic loading:

```javascript
// Basic loading
HTMLComponents.loadComponent('#header', 'components/header.html');

// With props
HTMLComponents.loadComponent('#user', 'components/user.html', {
    name: 'Jane Smith',
    email: 'jane@example.com'
});

// With promise handling
HTMLComponents.loadComponent('#content', 'components/content.html')
    .then(() => console.log('Loaded!'))
    .catch(err => console.error('Failed:', err));
```

### Template System

HTML Components includes a powerful template system supporting variables, conditionals, loops, and expressions.

#### Basic Variables

Use `{{variable}}` syntax for dynamic content:

**user-profile.html**
```html
<div class="profile">
    <img src="{{avatar}}" alt="Avatar">
    <h2>{{user.name}}</h2>
    <p>{{user.bio}}</p>
    <span class="role">{{user.role}}</span>
</div>
```

**Usage**
```javascript
HTMLComponents.loadComponent('#profile', 'user-profile.html', {
    user: {
        name: 'Alice Johnson',
        bio: 'Frontend Developer',
        avatar: 'images/avatar.jpg',
        role: 'Developer'
    }
});
```

#### Conditional Rendering

Use `{{if condition}}...{{/if}}` for conditional content:

```html
<div class="user-status">
    {{if user.isLoggedIn}}
        <h1>Welcome back, {{user.name}}!</h1>
        <button data-click="logout">Logout</button>
    {{/if}}

    {{if !user.isLoggedIn}}
        <h1>Please log in</h1>
        <button data-click="login">Login</button>
    {{/if}}

    {{if user.posts.length > 0}}
        <p>You have {{user.posts.length}} posts</p>
    {{/if}}
</div>
```

#### Loops

Use `{{each items as item}}...{{/each}}` for iteration:

```html
<ul class="user-list">
    {{each users as user}}
        <li class="user-item">
            <span>{{user.name}} ({{user.age}} years old)</span>
            <span>Index: {{index}}</span>
        </li>
    {{/each}}
</ul>
```

**Loop Context:**
- `{{user}}` - Current item value
- `{{index}}` - Current index (0-based)
- `{{$item}}` - Same as current item

#### Template Expressions

Use expressions for complex logic:

```html
<div class="dashboard">
    {{if userCount > 10}}
        <p>Large team: {{userCount}} members</p>
    {{/if}}

    {{if user.role === 'admin'}}
        <div class="admin-panel">Admin Controls</div>
    {{/if}}
</div>
```

**Supported Expression Types:**
- Property access: `user.name`, `user.profile.settings.theme`
- Comparisons: `===`, `!==`, `<`, `>`, `<=`, `>=`
- Logical operators: `&&`, `||`, `!`
- Arithmetic: `+`, `-`, `*`, `/`
- Array/Object access: `user.roles[0]`, `config.theme.primary`

### Event Binding

Bind functions to elements using data attributes:

```html
<button data-click="handleClick">Click me</button>
<input data-input="handleInput" placeholder="Type here">
<form data-submit="handleSubmit">
    <button type="submit">Submit</button>
</form>
```

```javascript
function handleClick(event, element) {
    console.log('Clicked!', element);
}

function handleInput(event, element) {
    console.log('Value:', element.value);
}

function handleSubmit(event, element) {
    event.preventDefault();
    console.log('Form submitted');
}
```

#### Supported Events

| Event | Attribute | Description |
|-------|-----------|-------------|
| `click` | `data-click` | Mouse clicks |
| `dblclick` | `data-dblclick` | Double clicks |
| `mouseenter` | `data-mouseenter` | Mouse enters element |
| `mouseleave` | `data-mouseleave` | Mouse leaves element |
| `input` | `data-input` | Input value changes |
| `change` | `data-change` | Form element changes |
| `submit` | `data-submit` | Form submission |
| `focus` | `data-focus` | Element gains focus |
| `blur` | `data-blur` | Element loses focus |
| `keydown` | `data-keydown` | Key pressed down |
| `keyup` | `data-keyup` | Key released |

**Important:** Event handlers are bound **once per element** to prevent duplicates. The library automatically tracks which events have been bound using `data-bound-*` attributes.

### Dependency Management

Components automatically load CSS and JavaScript dependencies:

**dashboard.html**
```html
<!-- Load CSS -->
<div data-css="styles/dashboard.css"></div>

<!-- Load JavaScript -->
<div data-js="scripts/dashboard.js"></div>

<!-- Load nested components -->
<div data-component="components/chart.html"></div>
<div data-component="components/table.html"></div>

<div class="dashboard">
    <h1>Dashboard</h1>
</div>
```

Dependencies are loaded in parallel for optimal performance.

## API Reference

### Component Management

#### `loadComponent(selector, componentPath, props)`

Load a component into a DOM element.

```javascript
HTMLComponents.loadComponent('#header', 'components/header.html');
HTMLComponents.loadComponent('.sidebar', 'sidebar.html', { theme: 'dark' });
```

**Parameters:**
- `selector` (string): CSS selector for target element
- `componentPath` (string): Path to component HTML file
- `props` (object, optional): Template variables to replace

**Returns:** Promise that resolves when component is loaded

---

#### `replaceComponent(selector, componentPath, props)`

Replace the content of a DOM element with a component. This is functionally equivalent to `loadComponent` but emphasizes the replacement behavior.

```javascript
HTMLComponents.replaceComponent('#main-content', 'components/home-content.html');
HTMLComponents.replaceComponent('#user-profile', 'components/profile.html', {
    title: "Welcome to Math & Calculator",
    description: "Choose an option below to get started with mathematical operations or use the calculator."
});
```

**Parameters:**
- `selector` (string): CSS selector for target element
- `componentPath` (string): Path to component HTML file
- `props` (object, optional): Template variables to replace

**Returns:** Promise that resolves when component is loaded

**Note:** This method replaces the entire innerHTML of the target element with the component content.

---

### Asset Loading

#### `loadJS(src)`

Load JavaScript files with automatic caching.

```javascript
HTMLComponents.loadJS('scripts/utils.js');
HTMLComponents.loadJS('https://cdn.example.com/library.js');
```

**Parameters:**
- `src` (string): Path to JavaScript file

**Returns:** Promise that resolves when JS is loaded and executed

**Note:** Scripts are executed using `eval` in global scope to ensure functions are available. Already-loaded scripts are skipped.

---

#### `loadCSS(href, options)`

Load CSS files with caching.

```javascript
HTMLComponents.loadCSS('styles/main.css');
HTMLComponents.loadCSS('theme.css', { 
    media: 'screen and (max-width: 768px)' 
});
```

**Parameters:**
- `href` (string): Path to CSS file
- `options` (object, optional):
  - `media` (string): Media query
  - `crossOrigin` (string): CORS setting

**Returns:** Promise that resolves when CSS is loaded

---

#### `loadImage(src, options)`

Load images with caching.

```javascript
HTMLComponents.loadImage('logo.png');
HTMLComponents.loadImage('hero.jpg', { crossOrigin: 'anonymous' });
```

**Returns:** Promise that resolves with Image object

---

#### `preloadImages(sources)`

Preload multiple images in parallel.

```javascript
HTMLComponents.preloadImages([
    'img1.jpg', 
    'img2.png', 
    'icon.svg'
]);
```

**Returns:** Promise that resolves with all results (fulfilled or rejected)

---

### Visibility Controls

#### `toggleComponent(selector, show)`

Toggle component visibility.

```javascript
HTMLComponents.toggleComponent('#sidebar');        // Toggle
HTMLComponents.toggleComponent('#modal', true);    // Show
HTMLComponents.toggleComponent('#modal', false);   // Hide
```

**Parameters:**
- `selector` (string): CSS selector
- `show` (boolean, optional): Explicit show/hide (omit to toggle)

**Returns:** Boolean (true if now visible, false if hidden)

---

#### `showComponent(selector)` / `hideComponent(selector)`

Explicit show/hide methods.

```javascript
HTMLComponents.showComponent('#welcome');
HTMLComponents.hideComponent('#loading');
```

---

### Page Building

#### `buildPage(pageDefinition, targetElement, clearTarget)`

Build complete pages from component definitions.

**Simple Array Format:**
```javascript
const page = [
    'components/header.html',
    'components/content.html',
    'components/footer.html'
];

HTMLComponents.buildPage(page, 'body', true);
```

**Advanced Object Format:**
```javascript
const page = {
    title: 'Dashboard',
    description: 'Admin dashboard',
    styles: ['styles/dashboard.css'],
    components: [
        'components/header.html',
        {
            name: 'sidebar.html',
            props: { activeItem: 'dashboard' }
        },
        {
            name: 'content.html',
            layout: {
                tag: 'main',
                class: 'main-content',
                id: 'content-area'
            }
        }
    ],
    cacheKey: 'dashboard_v1'
};

HTMLComponents.buildPage(page, 'body', true);
```

**Parameters:**
- `pageDefinition` (array|object): Components to load
- `targetElement` (string, optional): CSS selector (default: 'body')
- `clearTarget` (boolean, optional): Clear target before building (default: false)

**Returns:** Promise that resolves with build results

---

## Enhanced Features

### Reactive State Management

HTML Components includes a built-in reactive state system for managing application data.

#### Creating State

```javascript
// Create reactive state variables
HTMLComponents.createState('userName', 'Anonymous');
HTMLComponents.createState('userCount', 0);
HTMLComponents.createState('isLoggedIn', false);
HTMLComponents.createState('userList', ['Alice', 'Bob', 'Charlie']);
```

#### Getting and Setting State

```javascript
// Get state values
const name = HTMLComponents.getState('userName');
const count = HTMLComponents.getState('userCount');

// Set state values (reactive!)
HTMLComponents.setState('userName', 'John Doe');
HTMLComponents.setState('userCount', count + 1);
```

#### Subscribing to State Changes

```javascript
// Listen for state changes
HTMLComponents.subscribeState('userName', (newValue, oldValue) => {
    console.log(`User name changed from ${oldValue} to ${newValue}`);
    updateUI();
});

// Remove listener
HTMLComponents.unsubscribeState('userName', callbackFunction);
```

#### Data Binding

Bind DOM elements directly to state variables:

```html
<div id="user-display"></div>
<span id="count-display"></span>
```

```javascript
// Bind elements to state
HTMLComponents.bindState('#user-display', 'userName', 'textContent');
HTMLComponents.bindState('#count-display', 'userCount', 'textContent');

// Now when state changes, elements update automatically!
HTMLComponents.setState('userName', 'Jane Smith');
HTMLComponents.setState('userCount', 42);
```

**Binding Properties:**
- `'textContent'` - Set element text content
- `'innerHTML'` - Set element HTML content
- `'attr:data-value'` - Set element attribute
- `'style:backgroundColor'` - Set CSS style property
- `'class'` - Set element class name

#### Computed State

Create derived state that updates automatically:

```javascript
// Create computed state
HTMLComponents.computedState('userGreeting', ['userName'], (name) => {
    return `Hello, ${name}!`;
});

HTMLComponents.computedState('totalUsers', ['userList'], (list) => {
    return list.length;
});
```

---

### Enhanced Template System

Templates now support conditionals, loops, and expressions.

#### Conditional Rendering

```html
<div class="user-info">
    {{if isLoggedIn}}
        <h1>Welcome back, {{userName}}!</h1>
        <button data-click="logout">Logout</button>
    {{/if}}

    {{if !isLoggedIn}}
        <h1>Please log in</h1>
        <button data-click="login">Login</button>
    {{/if}}
</div>
```

#### Loops

```html
<ul class="user-list">
    {{each userList as user}}
        <li class="user-item">
            <span>{{user}}</span>
            <button data-click="removeUser" data-user="{{user}}">Remove</button>
        </li>
    {{/each}}
</ul>
```

**Loop Context:**
- `{{user}}` - Current item value
- `{{index}}` - Current index (0-based)
- `{{$item}}` - Same as current item

#### Template Expressions

```html
<div class="status">
    {{if userCount > 0}}
        <p>You have {{userCount}} users</p>
    {{/if}}

    {{if userName === 'Admin'}}
        <p>You have admin privileges</p>
    {{/if}}
</div>
```

#### Loading Components with State

```javascript
// Load component with both props and state access
HTMLComponents.loadComponentWithState('#app', 'components/dashboard.html', {
    title: 'Dashboard'
}, {
    userName: 'John',
    userCount: 5,
    isLoggedIn: true
});
```

---

### Component Events System

Components can communicate through a global event system.

#### Emitting Events

```javascript
function loginUser(event, element) {
    // Perform login logic...
    const userData = { id: 123, name: 'John' };

    // Emit event to notify other components
    HTMLComponents.emitEvent('user-logged-in', userData, element);
}
```

#### Listening to Events

```javascript
// Listen for component events
HTMLComponents.onEvent('user-logged-in', (data, source) => {
    console.log('User logged in:', data.name);
    HTMLComponents.setState('currentUser', data);
    HTMLComponents.setState('isLoggedIn', true);
});

// Remove listener
HTMLComponents.offEvent('user-logged-in', callbackFunction);
```

#### Cross-Component Communication

**user-menu.html**
```html
<div class="user-menu">
    <button data-click="logout">Logout</button>
</div>

<script>
function logout(event, element) {
    HTMLComponents.emitEvent('user-logout-requested');
}
</script>
```

**app.html**
```javascript
// In your main app logic
HTMLComponents.onEvent('user-logout-requested', () => {
    // Handle logout
    HTMLComponents.setState('currentUser', null);
    HTMLComponents.setState('isLoggedIn', false);
    HTMLComponents.loadComponent('#app', 'components/login.html');
});
```

---

### Component Lifecycle Hooks

Control what happens during component loading.

#### Available Hooks

- `beforeLoad` - Called before component starts loading
- `afterLoad` - Called after component loads successfully
- `onError` - Called when component fails to load

#### Adding Lifecycle Hooks

```javascript
// Add hook for specific component
HTMLComponents.addLifecycleHook('components/user-profile.html', 'beforeLoad', (element, data) => {
    console.log('Loading user profile...');
    // Show loading spinner
    element.innerHTML = '<div class="loading">Loading...</div>';
});

HTMLComponents.addLifecycleHook('components/user-profile.html', 'afterLoad', (element, data) => {
    console.log('User profile loaded!');
    // Initialize component-specific logic
    initUserProfile();
});

HTMLComponents.addLifecycleHook('components/user-profile.html', 'onError', (element, data) => {
    console.error('Failed to load user profile:', data.error);
    // Show error message
    element.innerHTML = '<div class="error">Failed to load profile</div>';
});
```

#### Global Hooks

```javascript
// Add hooks for all components
HTMLComponents.addLifecycleHook('*', 'beforeLoad', (element, data) => {
    // Global loading indicator
    showGlobalLoader();
});

HTMLComponents.addLifecycleHook('*', 'afterLoad', (element, data) => {
    hideGlobalLoader();
});
```

---

### Animation System

Built-in CSS animation helpers.

#### Basic Animations

```javascript
// Fade in element
HTMLComponents.animate('#welcome', [
    { opacity: 0 },
    { opacity: 1 }
], {
    duration: 500,
    easing: 'ease-in-out'
});

// Slide down
HTMLComponents.animate('.dropdown', [
    { transform: 'translateY(-100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
], {
    duration: 300
});
```

#### Animation Options

```javascript
HTMLComponents.animate(selector, keyframes, {
    duration: 300,        // milliseconds
    easing: 'ease-out',   // timing function
    fill: 'forwards',     // animation fill mode
    delay: 0,            // delay before starting
    iterations: 1        // number of iterations
});
```

---

### DOM Utilities

Convenient DOM manipulation functions.

```javascript
// Class manipulation
HTMLComponents.addClass('.buttons', 'active');
HTMLComponents.removeClass('.buttons', 'disabled');
HTMLComponents.toggleClass('#menu', 'open');

// Attribute manipulation
HTMLComponents.setAttribute('input[name="email"]', 'required', 'true');
const value = HTMLComponents.getAttribute('#user-input', 'value');

// Element queries
const header = HTMLComponents.querySelector('header');
const buttons = HTMLComponents.querySelectorAll('button');
```

---

### Component Registry

Register components in memory for instant loading.

```javascript
// Register inline component
HTMLComponents.registerComponent('loading-spinner', `
    <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
    </div>
`);

// Use registered component
HTMLComponents.loadComponent('#loading', 'loading-spinner');
```

---

### Batch Operations

Load multiple components efficiently.

```javascript
// Load multiple components at once
const components = [
    { selector: '#header', path: 'components/header.html' },
    { selector: '#sidebar', path: 'components/sidebar.html', props: { active: 'home' } },
    { selector: '#footer', path: 'components/footer.html' }
];

HTMLComponents.batchLoad(components).then(results => {
    console.log('All components loaded!');
});
```

---

### Caching System

The library includes two independent caching systems:

#### File Cache

Caches loaded HTML, CSS, and JS file contents.

```javascript
HTMLComponents.enableFileCache();   // Enable (default)
HTMLComponents.disableFileCache();  // Disable
HTMLComponents.clearFileCache();    // Clear all cached files
```

**Benefits:**
- Eliminates redundant network requests
- Faster component loading
- Reduced server load

---

#### Page Cache

Caches fully-built page HTML.

```javascript
HTMLComponents.enablePageCache();   // Enable (default)
HTMLComponents.disablePageCache();  // Disable
HTMLComponents.clearPageCache();    // Clear cached pages
```

**Use Cases:**
- Single-page applications with navigation
- Pages that rebuild frequently
- Performance optimization

---

### Logging & Debugging

The library includes a streamlined logging system that's quiet by default.

#### Debug Mode

```javascript
HTMLComponents.enableDebug();    // Enable verbose logging
HTMLComponents.disableDebug();   // Return to normal mode
```

When debug mode is enabled, you'll see:
- Component loading progress
- Cache hits/misses
- Event binding details
- Performance timing

---

#### Log Levels

```javascript
HTMLComponents.setLogLevel('ERROR');  // Only errors
HTMLComponents.setLogLevel('WARN');   // Warnings and errors
HTMLComponents.setLogLevel('INFO');   // Normal logging (default)
HTMLComponents.setLogLevel('DEBUG');  // Verbose logging
```

---

#### Log History

```javascript
// Get all logs
const allLogs = HTMLComponents.getLogHistory();

// Get specific level
const errors = HTMLComponents.getLogHistory('ERROR');

// Clear history
HTMLComponents.clearLogHistory();
```

Each log entry includes:
```javascript
{
    timestamp: "2024-01-15T10:30:00.000Z",
    level: "INFO",
    message: "Component loaded successfully",
    data: { /* optional additional data */ }
}
```

---

## Advanced Features

### Conditional Loading

Load components based on runtime conditions:

```javascript
const page = {
    components: [
        'components/header.html',
        {
            name: 'admin-panel.html',
            condition: () => currentUser.isAdmin
        },
        {
            name: 'mobile-nav.html',
            condition: () => window.innerWidth < 768
        }
    ]
};

HTMLComponents.buildPage(page);
```

The `condition` can be:
- A function that returns a boolean
- A boolean value
- Any truthy/falsy value

---

### Layout System

Create structured layouts with custom containers:

```javascript
{
    name: 'sidebar.html',
    layout: {
        tag: 'aside',           // HTML tag (default: 'section')
        class: 'sidebar',       // CSS classes
        id: 'main-sidebar',     // Element ID
        attrs: {                // Additional attributes
            'aria-label': 'Navigation'
        }
    },
    children: [
        'components/nav-menu.html',
        'components/user-info.html'
    ]
}
```

**Shorthand:**
```javascript
{
    name: 'content.html',
    layout: 'container fluid'  // Just CSS classes
}
```

---

### Performance Optimization

#### Automatic Optimizations

1. **File Caching**: All loaded files are cached automatically
2. **Page Caching**: Built pages are cached by default
3. **Image Caching**: Loaded images are stored in memory
4. **Event Deduplication**: Events are only bound once per element
5. **Batched DOM Operations**: Uses DocumentFragment for efficient rendering

#### Manual Optimizations

```javascript
// Preload assets before they're needed
HTMLComponents.preloadImages(['hero.jpg', 'logo.png']);
HTMLComponents.loadCSS('styles/critical.css');

// Clear caches during development
HTMLComponents.clearFileCache();
HTMLComponents.clearPageCache();

// Disable caching for testing
HTMLComponents.disableFileCache();
HTMLComponents.disablePageCache();
```

---

## Best Practices

### Project Structure

```
my-app/
├── components/
│   ├── layout/
│   │   ├── header.html
│   │   ├── sidebar.html
│   │   └── footer.html
│   ├── ui/
│   │   ├── button.html
│   │   ├── modal.html
│   │   └── card.html
│   └── pages/
│       ├── home.html
│       ├── about.html
│       └── dashboard.html
├── styles/
│   ├── main.css
│   └── components.css
├── scripts/
│   ├── app.js
│   └── utils.js
├── html-components.js
└── index.html
```

---

### Component Design

**✅ Good Component:**
```html
<!-- self-contained, reusable -->
<style scoped>
.user-card { /* component styles */ }
</style>

<div class="user-card">
    <img src="{{avatar}}" alt="{{name}}">
    <h3>{{name}}</h3>
    <p>{{bio}}</p>
</div>

<script>
// Component-specific functions
function editUser(event, element) {
    // handle edit
}
</script>
```

**❌ Avoid:**
```html
<!-- too many global dependencies -->
<div class="card">
    <div id="global-thing">{{text}}</div>
</div>
<script src="external-dependency.js"></script>
<link rel="stylesheet" href="external-styles.css">
```

---

### Event Handlers

**✅ Good:**
```javascript
function handleUserClick(event, element) {
    const userId = element.dataset.userId;
    if (!userId) {
        console.warn('No user ID found');
        return;
    }
    loadUserProfile(userId);
}
```

**❌ Avoid:**
```javascript
function click(e, el) {
    // unclear purpose, no validation
    doSomething(el.dataset.id);
}
```

---

### Error Handling

Always handle potential failures:

```javascript
HTMLComponents.loadComponent('#content', 'components/user.html')
    .then(() => {
        console.log('Component loaded successfully');
    })
    .catch(error => {
        console.error('Failed to load component:', error);
        // Show fallback UI
        document.querySelector('#content').innerHTML = 
            '<p>Failed to load content. Please refresh.</p>';
    });
```

---

## Troubleshooting

### CORS Errors

**Problem:** `Cross-Origin Request Blocked` errors

**Solution:** Use a local development server:

```bash
# Python
python -m http.server 8080

# Node.js (requires npx)
npx http-server -p 8080

# PHP
php -S localhost:8080
```

**Why:** Browsers block `file://` protocol from loading external files for security.

---

### Components Not Loading

**Problem:** `data-component` elements stay empty

**Checklist:**
1. Is the library loaded? Check browser console for errors
2. Is the file path correct? Check network tab
3. Is a local server running? Check URL starts with `http://`
4. Are there any console errors? Enable debug mode

**Debug:**
```javascript
HTMLComponents.enableDebug();
// Reload page and check console
```

---

### Event Handlers Not Working

**Problem:** `data-click` handlers don't execute

**Common Causes:**

1. **Function not in global scope:**
```javascript
// ❌ Won't work (inside closure)
(function() {
    function myHandler() { }
})();

// ✅ Works (global)
function myHandler() { }

// ✅ Also works (explicit global)
window.myHandler = function() { }
```

2. **Function defined after page load:**
```html
<!-- ❌ Handler not defined yet -->
<div data-component="nav.html"></div>
<script>
function navHandler() { }
</script>

<!-- ✅ Define handlers first -->
<script>
function navHandler() { }
</script>
<div data-component="nav.html"></div>
```

3. **Typo in function name:**
```html
<!-- Function is 'handleClick' but attribute says 'handleClik' -->
<button data-click="handleClik">Click</button>
```

---

### Cache Issues

**Problem:** Changes to components don't appear

**Solution:**
```javascript
// Clear both caches
HTMLComponents.clearFileCache();
HTMLComponents.clearPageCache();

// Then hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

**For development:**
```javascript
// Disable caching while developing
HTMLComponents.disableFileCache();
HTMLComponents.disablePageCache();

// Re-enable for production
```

---

### Memory Issues

**Problem:** Page slows down after many component loads

**Solutions:**

1. **Clear caches periodically:**
```javascript
setInterval(() => {
    HTMLComponents.clearFileCache();
    HTMLComponents.clearPageCache();
}, 300000); // Every 5 minutes
```

2. **Limit log history:**
```javascript
HTMLComponents.clearLogHistory();
```

3. **Remove unused components:**
```javascript
const oldContent = document.querySelector('#old-content');
if (oldContent) {
    oldContent.remove();
}
```

---

## Examples

### Single Page Application

```javascript
// Define routes
const routes = {
    home: {
        title: 'Home',
        components: [
            'components/header.html',
            'components/hero.html',
            'components/features.html'
        ]
    },
    about: {
        title: 'About Us',
        components: [
            'components/header.html',
            'components/about-content.html'
        ]
    }
};

// Navigation function
function navigate(route) {
    const config = routes[route];
    if (!config) return;
    
    HTMLComponents.buildPage(config, '#app', true)
        .then(() => {
            document.title = config.title;
            history.pushState({ route }, '', `#${route}`);
        });
}

// Handle browser back/forward
window.onpopstate = (e) => {
    if (e.state?.route) navigate(e.state.route);
};

// Start
navigate('home');
```

---

### Dynamic Form with Validation

```html
<form data-submit="handleFormSubmit">
    <input type="email" name="email" data-input="validateEmail" required>
    <span class="error" id="email-error"></span>
    
    <textarea name="message" required></textarea>
    
    <button type="submit">Send</button>
</form>

<script>
function validateEmail(event, element) {
    const error = document.getElementById('email-error');
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(element.value);
    
    error.textContent = isValid ? '' : 'Invalid email';
    error.style.display = isValid ? 'none' : 'block';
}

function handleFormSubmit(event, element) {
    event.preventDefault();
    
    const formData = new FormData(element);
    const data = Object.fromEntries(formData);
    
    fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert('Message sent!');
        element.reset();
    })
    .catch(error => {
        alert('Failed to send message');
    });
}
</script>
```

---

### Modal System

```javascript
// modal.html component
const modalHTML = `
<div class="modal-overlay" data-click="closeModal" style="display: none;">
    <div class="modal-content" data-click="preventClose">
        <button class="close" data-click="closeModal">×</button>
        <div class="modal-body">{{content}}</div>
    </div>
</div>
`;

// Modal functions
function openModal(content) {
    HTMLComponents.loadComponent('#modal-container', 'components/modal.html', {
        content: content
    }).then(() => {
        HTMLComponents.showComponent('.modal-overlay');
    });
}

function closeModal(event, element) {
    HTMLComponents.hideComponent('.modal-overlay');
}

function preventClose(event) {
    event.stopPropagation();
}
```

---

### Lazy Loading

```javascript
// Load components when they enter viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const componentPath = element.dataset.lazyComponent;
            
            if (componentPath) {
                HTMLComponents.loadComponent(element, componentPath);
                observer.unobserve(element);
            }
        }
    });
});

// Observe lazy components
document.querySelectorAll('[data-lazy-component]').forEach(el => {
    observer.observe(el);
});
```

---

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions  
- Safari: ✅ 12+
- Mobile browsers: ✅ iOS Safari 12+, Chrome Android

**Required features:**
- Promises
- Fetch API
- ES6 syntax
- Template literals

---

## License

MIT License - Free for personal and commercial use.

---

## Contributing

Found a bug? Have a feature request? 

Visit: [github.com/Olibot1107/html-components](https://github.com/Olibot1107/html-components)

---

**Made with ❤️ for developers who love simple, powerful tools.**
