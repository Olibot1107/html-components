# HTML Components

Load HTML components from files and build pages dynamically.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Component Loading](#component-loading)
- [Event Binding (data-click)](#event-binding-data-click)
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

Components can be loaded in two ways: programmatically using JavaScript functions, or declaratively using HTML attributes. The declarative approach is often easier for simple use cases.

### Declarative Component Loading (Easiest Method)

Use the `data-component` attribute on any HTML element to automatically load a component when the page loads. This is the simplest way to include components:

```html
<!-- Basic component loading -->
<div data-component="components/header.html"></div>

<!-- Component with props for dynamic content -->
<div data-component="components/user-profile.html"
     data-user-name="John Doe"
     data-user-role="Admin"
     data-avatar-url="images/avatar.jpg"></div>

<!-- Nested components -->
<div data-component="components/sidebar.html">
    <div data-component="components/menu.html"></div>
    <div data-component="components/user-info.html"></div>
</div>
```

**How it works:**
- The library automatically finds all elements with `data-component` attributes
- Loads the specified component file into each element
- Replaces `{{propName}}` placeholders with data attributes (converted to camelCase)
- Automatically loads any nested components and CSS/JS files within the component

**Props from Data Attributes:**
Data attributes like `data-user-name` become `{{userName}}` in your component HTML:

```html
<!-- user-profile.html -->
<div class="profile">
    <h2>{{userName}}</h2>
    <p>Role: {{userRole}}</p>
    <img src="{{avatarUrl}}" alt="Avatar">
</div>
```

**Advantages:**
- No JavaScript required for basic usage
- Components load automatically on page load
- Easy to read and maintain
- Perfect for static or mostly static content

### Programmatic Component Loading

For more control or dynamic loading, use JavaScript methods.

## Installation

Download `html-components.js` or use the CDN:

```html
<script src="https://html-components.vapp.uk/html-components.js"></script>
```

### loadComponent(selector, componentPath, props)
Load a component from a file into a DOM element with optional props for template replacement.

```javascript
// Load into element with ID
HTMLComponents.loadComponent('#header', 'components/header.html');

// Load into element with class
HTMLComponents.loadComponent('.sidebar', 'sidebar.html');

// Load with props for template replacement
HTMLComponents.loadComponent('#user', 'components/user.html', {
    username: 'John Doe',
    role: 'Admin',
    avatar: 'images/avatar.jpg'
});

// Returns a Promise
HTMLComponents.loadComponent('#content', 'content.html')
    .then(() => console.log('Component loaded'))
    .catch(err => console.error('Failed to load:', err));
```

Components can automatically load nested components and CSS files. Props are used for template replacement using `{{propName}}` syntax in component HTML.

## Event Binding (data-click)

### Automatic Event Binding
Bind multiple event types to JavaScript methods using data attributes. The library automatically finds and executes methods when elements are interacted with. Elements can have multiple event handlers simultaneously.

```html
<!-- components/user-card.html -->
<div class="user-card">
    <h3>User Profile</h3>

    <!-- Button with multiple events -->
    <button id="editBtn"
            data-click="editUser"
            data-mouseenter="showTooltip"
            data-mouseleave="hideTooltip">
        Edit User (hover for tooltip)
    </button>

    <!-- Input with focus/blur events -->
    <input type="text"
           data-focus="handleFocus"
           data-blur="handleBlur"
           data-input="handleInput"
           placeholder="Enter text">

    <!-- Form with submit event -->
    <form data-submit="handleSubmit">
        <button type="submit">Submit</button>
    </form>
</div>
```

```javascript
// Global methods (accessible anywhere)
function editUser(event, element, root) {
    console.log('Edit button clicked');
    console.log('Element ID:', element.id);        // "editBtn"
    console.log('Root container:', root.className); // "user-card"

    // Show edit form
    showEditForm(root);
}

function deleteUser(event, element, root) {
    if (confirm('Delete this user?')) {
        // Delete logic here
        removeUserFromDOM(root);
    }
}

// Register in HTMLComponents.methods
HTMLComponents.methods.toggleSettings = function(event, el, root) {
    const settings = root.querySelector('.settings-panel');
    settings.classList.toggle('hidden');
};
```

### Method Resolution Order
Methods are found in this order:

1. **Global window functions** - `window[methodName]`
2. **HTMLComponents.methods registry** - `HTMLComponents.methods[methodName]`
3. **Component script functions** - Functions defined in `<script>` tags within the same component

### Method Parameters
Event handler methods receive three parameters:

- **`event`** - The click event object (standard DOM Event)
- **`element`** - The clicked HTML element
- **`root`** - The closest container element with a class (or the component root)

### Event Types Support
Supports comprehensive event binding with automatic performance optimization:

| Event Type | Data Attribute | Description |
|------------|---------------|-------------|
| `click` | `data-click` | Standard click events |
| `dblclick` | `data-dblclick` | Double-click events |
| `mouseenter` | `data-mouseenter` | Mouse enter with debouncing |
| `mouseleave` | `data-mouseleave` | Mouse leave with debouncing |
| `mouseover` | `data-mouseover` | Mouse over with debouncing |
| `mouseout` | `data-mouseout` | Mouse out with debouncing |
| `mousedown` | `data-mousedown` | Mouse button press |
| `mouseup` | `data-mouseup` | Mouse button release |
| `focus` | `data-focus` | Element receives focus |
| `blur` | `data-blur` | Element loses focus |
| `change` | `data-change` | Input value changes |
| `input` | `data-input` | Real-time input changes |
| `submit` | `data-submit` | Form submission |
| `keydown` | `data-keydown` | Key press down |
| `keyup` | `data-keyup` | Key release |
| `keypress` | `data-keypress` | Character key press |

**Performance Features:**
- **Debouncing** for mouse events to prevent excessive firing
- **Error Prevention** - failed method calls prevent default event behavior
- **Development Warnings** - missing methods show notifications in debug mode

### Error Handling
Methods that throw errors are caught automatically:
- Errors are logged to console with full stack traces
- Visual notifications show error summaries
- Other components continue to work normally

```javascript
function problematicMethod(event, el, root) {
    // This will be caught and logged safely
    throw new Error('Something went wrong!');
}
```

### Working with Component Props
Access component props data in your methods:

```html
<!-- user-profile.html -->
<div class="profile" data-user-id="{{userId}}">
    <h3>{{userName}}</h3>
    <button data-click="viewProfile">View Full Profile</button>
</div>
```

```javascript
function viewProfile(event, element, root) {
    // Get user ID from data attribute (populated via props)
    const userId = root.getAttribute('data-user-id');

    // Load full profile
    loadUserProfile(userId);
}
```

### Component-Scoped Methods
Define methods within component `<script>` tags for component-specific functionality:

```html
<!-- components/shopping-cart.html -->
<div class="cart">
    <div class="items">{{itemCount}} items</div>
    <button data-click="addItem">Add Item</button>
    <button data-click="removeItem">Remove Item</button>
</div>

<script>
function addItem(event, el, root) {
    // Component-specific logic
    const currentCount = parseInt(root.querySelector('.items').textContent);
    root.querySelector('.items').textContent = (currentCount + 1) + ' items';

    // Update global cart state
    updateCartTotal(1);
}

function removeItem(event, el, root) {
    const currentCount = parseInt(root.querySelector('.items').textContent);
    if (currentCount > 0) {
        root.querySelector('.items').textContent = (currentCount - 1) + ' items';
        updateCartTotal(-1);
    }
}
</script>
```

### Best Practices

#### Method Naming
Use descriptive, camelCase method names:
```javascript
// Good
saveUserData()
deleteUserAccount()
toggleNavigationMenu()

// Avoid
clickHandler()
btnClick()
func1()
```

#### Error Prevention
Always handle potential errors:
```javascript
function safeMethod(event, el, root) {
    try {
        const userId = el.getAttribute('data-user-id');
        if (!userId) {
            console.warn('No user ID found');
            return;
        }

        // Safe operations
        updateUser(userId);
    } catch (error) {
        console.error('Error in safeMethod:', error);
        // Show user-friendly message
        showNotification('Operation failed. Please try again.');
    }
}
```

#### Performance Considerations
Methods are bound once when components load, not on every click. Keep methods lightweight and delegate heavy operations:

```javascript
function quickToggle(event, el, root) {
    // Fast UI updates
    el.classList.toggle('active');
    root.classList.toggle('expanded');
}

function heavyOperation(event, el, root) {
    // Delegate heavy work to prevent UI blocking
    setTimeout(() => {
        performExpensiveCalculation(el.getAttribute('data-id'));
    }, 0);
}
```

#### Accessibility
Ensure clickable elements are properly accessible:
```html
<!-- Good: Semantic button with proper labeling -->
<button data-click="saveForm" aria-label="Save form data">Save</button>

<!-- Good: Link with clear purpose -->
<a href="#" data-click="openModal" role="button" aria-label="Open help modal">Help</a>
```

### Integration Examples

#### Form Handling
```html
<form class="contact-form">
    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <button type="button" data-click="submitContactForm">Send Message</button>
</form>
```

```javascript
function submitContactForm(event, el, root) {
    const form = root;
    const formData = new FormData(form);

    // Validate form
    if (!form.checkValidity()) {
        showValidationErrors(form);
        return;
    }

    // Submit data
    submitToServer(formData)
        .then(() => showSuccess('Message sent!'))
        .catch(() => showError('Failed to send message'));
}
```

#### Modal Management
```html
<div class="modal-overlay" id="myModal">
    <div class="modal-content">
        <h2>Confirm Action</h2>
        <p>Are you sure you want to proceed?</p>
        <button data-click="confirmAction">Yes, Proceed</button>
        <button data-click="cancelAction">Cancel</button>
    </div>
</div>
```

```javascript
function confirmAction(event, el, root) {
    // Perform the action
    performCriticalAction();

    // Close modal
    closeModal(root.id);
}

function cancelAction(event, el, root) {
    // Just close modal without action
    closeModal(root.id);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('visible');
}
```

#### Dynamic Content Loading
```html
<div class="product-list">
    <div class="product" data-product-id="123">
        <h3>Product Name</h3>
        <button data-click="loadProductDetails">View Details</button>
    </div>
</div>
```

```javascript
function loadProductDetails(event, el, root) {
    const productId = root.getAttribute('data-product-id');

    // Load additional details
    HTMLComponents.loadComponent('.product-details', 'components/product-detail.html', {
        productId: productId
    });
}
```

### Debugging Event Binding

Enable debug logging to see event binding details:
```javascript
HTMLComponents.enableDebug();
```

This will show console messages like:
```
[HTML Components EVENTS] Found 3 elements with data-click attributes
[HTML Components EVENTS] Binding click event for method: editUser on element 1
[HTML Components EVENTS] Successfully bound click event for method: editUser
[HTML Components EVENTS] Click event triggered for method: editUser
[HTML Components SUCCESS] Method editUser executed successfully
```

### Future Enhancements
Planned improvements include:
- Event delegation for dynamic content
- Method binding validation
- Advanced performance monitoring for event handlers
- Custom event types and modifiers

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

Build complete pages dynamically using component definitions. This is perfect for SPAs, admin panels, or any application that needs dynamic page construction.

### buildPage(pageDefinition, targetElement, clearTarget, cacheOptions)
Build an entire page from component definitions with caching support.

```javascript
// Returns a Promise that resolves with results array
HTMLComponents.buildPage(pageDefinition, 'body', true)
    .then(results => {
        console.log('Page built with', results.length, 'components');
        const failed = results.filter(r => r.status === 'rejected').length;
        if (failed > 0) console.warn(`${failed} components failed to load`);
    })
    .catch(error => console.error('Page build failed:', error));
```

### Page Definition Formats

#### Simple Array Format
Just list component file paths:

```javascript
const page = [
    'components/header.html',
    'components/sidebar.html',
    'components/content.html',
    'components/footer.html'
];

HTMLComponents.buildPage(page, 'body', true);
```

#### Enhanced Object Format
Full control with metadata and advanced features:

```javascript
const page = {
    title: 'Dashboard - My App',           // Sets document.title
    description: 'Admin dashboard page',   // Sets meta description
    styles: [                              // Auto-load CSS files
        'styles/dashboard.css',
        'styles/components.css'
    ],
    components: [                          // Component definitions
        'components/header.html',
        'components/sidebar.html',
        'components/dashboard-content.html'
    ],
    cacheKey: 'dashboard_v1',              // Optional cache key
    cache: true                            // Enable/disable caching (default: true)
};

HTMLComponents.buildPage(page, 'body', true);
```

### Component Definitions

Components can be simple file paths or detailed objects with advanced features:

#### Basic Component (File Path)
```javascript
'components/header.html'
```

#### Advanced Component Object
```javascript
{
    name: 'user-profile',              // Component file path
    selector: '#profile-container',    // Target specific element (optional)
    props: {                           // Data passed to component
        userId: 123,
        showAvatar: true,
        theme: 'dark'
    },
    css: ['profile', 'rounded'],       // CSS classes to add
    id: 'main-profile',                // ID to set on container
    condition: () => isLoggedIn(),     // Conditional loading
    layout: 'section'                  // Wrap in HTML element
}
```

### Props and Data Binding

Pass data to components using props. Components can access props via template syntax:

**dashboard-content.html**
```html
<div class="dashboard">
    <h1>Welcome back, {{userName}}!</h1>
    <div class="stats">
        <div class="stat">Posts: {{postCount}}</div>
        <div class="stat">Followers: {{followerCount}}</div>
    </div>
    <div class="{{theme}}-theme">
        <!-- Component content -->
    </div>
</div>
```

**JavaScript**
```javascript
const page = {
    components: [{
        name: 'dashboard-content.html',
        props: {
            userName: 'John Doe',
            postCount: 42,
            followerCount: 1337,
            theme: 'dark'
        }
    }]
};
```

### Conditional Components

Load components based on conditions:

```javascript
const page = {
    components: [
        'components/header.html',
        {
            name: 'admin-panel.html',
            condition: () => currentUser.isAdmin
        },
        {
            name: 'user-settings.html',
            condition: () => window.innerWidth > 768 // Desktop only
        },
        'components/footer.html'
    ]
};
```

### Layout Sections

Create structured layouts with semantic HTML elements:

#### Simple Layout
```javascript
{
    layout: 'header',               // Creates <header> element
    children: ['nav.html', 'logo.html']
}
```

#### Advanced Layout with Full Control
```javascript
{
    layout: {
        tag: 'aside',               // Element type
        class: 'sidebar',           // CSS classes
        id: 'main-sidebar',         // Element ID
        attrs: {                    // Additional attributes
            'data-theme': 'dark',
            'aria-label': 'Navigation'
        },
        styles: {                   // Inline styles
            width: '250px',
            position: 'fixed'
        }
    },
    children: ['user-profile.html', 'menu.html', 'settings.html']
}
```

### Selector Targeting

Place components in specific DOM elements instead of appending to target:

```javascript
const page = {
    components: [
        {
            name: 'header.html',
            selector: '#header-container'    // Places in specific element
        },
        {
            name: 'sidebar.html',
            selector: '.sidebar'            // Uses class selector
        },
        {
            name: 'content.html',
            selector: '#main-content'       // Uses ID selector
        }
    ]
};

// Without selector, components append to the targetElement
HTMLComponents.buildPage(page, 'body', false); // Won't clear body, just append
```

### Page Building with Caching

Control caching behavior for performance:

```javascript
// Disable caching for this page
HTMLComponents.buildPage(pageDefinition, 'body', true, {
    enabled: false
});

// Use custom cache key
HTMLComponents.buildPage(pageDefinition, 'body', true, {
    key: 'homepage_v2'
});

// Check cache stats
const cacheStats = HTMLComponents.getPageCacheStats();
console.log('Cached pages:', cacheStats.size);
```

### Practical Examples

#### Blog Post Page
```javascript
const blogPostPage = {
    title: post.title + ' - My Blog',
    description: post.excerpt,
    styles: ['styles/blog.css'],
    components: [
        'components/header.html',
        {
            name: 'blog-post.html',
            props: {
                title: post.title,
                content: post.content,
                author: post.author,
                date: post.date,
                tags: post.tags
            },
            css: ['blog-post']
        },
        'components/comments.html',
        'components/footer.html'
    ],
    cacheKey: `blog-post-${post.id}`
};

HTMLComponents.buildPage(blogPostPage, 'body', true);
```

#### Admin Dashboard
```javascript
const adminDashboard = {
    title: 'Admin Dashboard',
    styles: ['styles/admin.css', 'styles/charts.css'],
    components: [
        'components/admin-header.html',
        {
            layout: {
                tag: 'div',
                class: 'admin-layout',
                id: 'admin-container'
            },
            children: [
                {
                    name: 'admin-sidebar.html',
                    css: ['admin-sidebar']
                },
                {
                    name: 'dashboard-widgets.html',
                    props: {
                        userCount: stats.users,
                        revenue: stats.revenue,
                        alerts: alerts.list
                    },
                    css: ['dashboard-main']
                }
            ]
        }
    ],
    condition: () => currentUser.role === 'admin'
};

HTMLComponents.buildPage(adminDashboard, 'body', true);
```

#### Responsive Page with Mobile/Desktop Variants
```javascript
const responsivePage = {
    components: [
        'components/header.html',
        {
            name: 'desktop-nav.html',
            condition: () => window.innerWidth > 768,
            css: ['desktop-only']
        },
        {
            name: 'mobile-nav.html',
            condition: () => window.innerWidth <= 768,
            css: ['mobile-only']
        },
        'components/content.html',
        'components/footer.html'
    ]
};
```

### Page Building Best Practices

1. **Use meaningful cache keys** for pages that change frequently
2. **Leverage conditional loading** to avoid loading unnecessary components
3. **Use layouts** for consistent page structure
4. **Pass data via props** instead of global variables
5. **Clear target when rebuilding** pages to avoid duplicates
6. **Handle build failures** with proper error checking

### Integration with Routing

Page building works great with client-side routing:

```javascript
function navigateTo(route) {
    const pageConfig = getPageConfig(route); // Your routing logic
    HTMLComponents.buildPage(pageConfig, '#app', true)
        .then(() => {
            // Update URL, scroll to top, etc.
            history.pushState(null, '', route);
            window.scrollTo(0, 0);
        })
        .catch(err => {
            // Handle navigation errors
            console.error('Navigation failed:', err);
            // Maybe show error page
            HTMLComponents.buildPage('components/404.html', '#app', true);
        });
}

// Example usage
navigateTo('/dashboard');
navigateTo('/profile');
navigateTo('/settings');
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

    <!-- Load nested JavaScript -->
    <div data-js="scripts/header.js"></div>
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
