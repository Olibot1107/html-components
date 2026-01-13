# HTML Components Library - Complete Documentation

A powerful, lightweight JavaScript library for building modular web applications with dynamic component loading, image handling, and visual error notifications.

## 📦 What's Included

- **html-components.js** - The main library (7KB minified)
- **showcase/** - Example implementations and demos

## 🚀 Quick Start

### Basic Setup
```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
    <!-- Load CSS files automatically -->
    <div data-css="styles/main.css"></div>
    <div data-css="styles/components.css"></div>
</head>
<body>
    <div data-component="header.html"></div>
    <div data-component="content.html"></div>

    <script src="html-components.js"></script>
</body>
</html>
```

### Advanced Setup (Build from JavaScript)
```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
</head>
<body><!-- Everything built by JS -->
    <script src="html-components.js"></script>
    <script src="my-app-config.js"></script>
</body>
</html>
```

## 📚 API Reference

### Core Functions

#### HTMLComponents.loadComponent(selector, componentPath)
Loads a component from a file into a DOM element.

```javascript
// Load into element with ID
HTMLComponents.loadComponent('#header', 'components/header.html');

// Load into element with class
HTMLComponents.loadComponent('.sidebar', 'sidebar.html');
```

#### HTMLComponents.loadCSS(href, options)
Loads a CSS file dynamically with caching and error handling.

```javascript
// Load a single CSS file
HTMLComponents.loadCSS('styles/main.css')
    .then(() => console.log('CSS loaded'))
    .catch(err => console.error('CSS failed:', err));

// Load with options
HTMLComponents.loadCSS('styles/theme.css', {
    media: 'screen and (max-width: 768px)', // Conditional loading
    crossOrigin: 'anonymous' // For external stylesheets
});
```

#### HTMLComponents.buildPage(componentList, targetElement, clearTarget)
Builds an entire page from a list of components.

```javascript
const pageStructure = [
    'header.html',
    { name: 'hero-section', props: { title: 'Welcome' } },
    'footer.html'
];

HTMLComponents.buildPage(pageStructure, 'body');
```

### Component Registry

#### HTMLComponents.registerComponent(name, definition)
Registers a JavaScript-defined component.

```javascript
HTMLComponents.registerComponent('button', {
    template: '<button class="{{class}}">{{text}}</button>',
    props: ['text', 'class'],
    styles: 'button { padding: 10px; border-radius: 5px; }',
    logic: function(props) {
        console.log('Button created:', props.text);
    }
});
```

#### HTMLComponents.createComponent(name, props)
Creates HTML for a registered component.

```javascript
const buttonHtml = HTMLComponents.createComponent('button', {
    text: 'Click Me',
    class: 'primary'
});
```

### Image Loading

#### HTMLComponents.loadImage(src, options)
Loads a single image with caching.

```javascript
HTMLComponents.loadImage('logo.png')
    .then(img => document.body.appendChild(img))
    .catch(err => console.error('Image failed:', err));
```

#### HTMLComponents.preloadImages(sources)
Preloads multiple images for performance.

```javascript
HTMLComponents.preloadImages([
    'hero-bg.jpg',
    'icon1.png',
    'icon2.png'
]);
```

### Utility Functions

#### HTMLComponents.reloadAll()
Reloads all components with `data-component` attributes.

```javascript
HTMLComponents.reloadAll();
```

#### HTMLComponents.getRegisteredComponents()
Returns array of registered component names.

```javascript
console.log(HTMLComponents.getRegisteredComponents());
// ['button', 'hero-section', 'card']
```

#### HTMLComponents.clearComponentCache()
Clears all cached components and images.

```javascript
HTMLComponents.clearComponentCache();
```

## 🎨 Component Definition Format

Components are defined as JavaScript objects with the following structure:

```javascript
{
    template: `<div class="{{className}}">{{content}}</div>`,
    props: ['content', 'className'],
    styles: `
        .my-component {
            padding: 1rem;
            border: 1px solid #ddd;
        }
    `,
    logic: function(props) {
        // Component initialization logic
        console.log('Component loaded with:', props);

        // Add event listeners, etc.
        const element = document.querySelector('.my-component');
        element.addEventListener('click', () => {
            alert('Clicked!');
        });
    }
}
```

### Template Syntax
Use `{{propName}}` placeholders for dynamic content:

```javascript
template: `
    <div class="card">
        <h2>{{title}}</h2>
        <p>{{description}}</p>
        <button>{{buttonText}}</button>
    </div>
`
```

### Props Array
List all property names that the component accepts:

```javascript
props: ['title', 'description', 'buttonText']
```

### Styles (Optional)
CSS that gets injected once globally:

```javascript
styles: `
    .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
    }
    .card h2 {
        margin-top: 0;
    }
`
```

### Logic Function (Optional)
JavaScript that runs after the component is inserted:

```javascript
logic: function(props) {
    // Access to props
    console.log('Card title:', props.title);

    // DOM manipulation
    const card = document.querySelector('.card');
    card.addEventListener('click', () => {
        // Handle clicks
    });

    // API calls, animations, etc.
}
```

## 🎨 CSS Loading

The library supports dynamic CSS file loading with automatic caching and error handling.

### Using data-css Attributes
Load CSS files automatically when the page loads:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
    <!-- CSS files load automatically -->
    <div data-css="styles/reset.css"></div>
    <div data-css="styles/main.css"></div>
    <div data-css="styles/components.css"></div>
</head>
<body>
    <!-- Your components here -->
</body>
</html>
```

### Programmatic CSS Loading
Load CSS files dynamically in JavaScript:

```javascript
// Load a single CSS file
HTMLComponents.loadCSS('styles/theme.css')
    .then(() => {
        console.log('Theme CSS loaded successfully');
        // Apply theme-specific logic
    })
    .catch(error => {
        console.error('Failed to load theme CSS:', error);
    });

// Load with options
HTMLComponents.loadCSS('styles/print.css', {
    media: 'print',  // Only apply for printing
    crossOrigin: 'anonymous'  // For external stylesheets
});
```

### CSS Loading Features

- **Automatic Caching**: CSS files are cached to prevent duplicate loading
- **Error Handling**: Failed CSS loads show visual notifications
- **Conditional Loading**: Use media queries for responsive stylesheets
- **CORS Support**: Load external stylesheets with cross-origin settings
- **Async Loading**: Non-blocking CSS loading that doesn't affect page rendering

### Best Practices

1. **Organize CSS Files**: Keep styles modular and component-specific
2. **Use Conditional Loading**: Load print styles or theme-specific CSS as needed
3. **Cache Management**: CSS files are automatically cached; use `clearComponentCache()` to reset
4. **Error Monitoring**: Check the console and notifications for CSS loading issues

## 🔔 Error Handling & Notifications

The library provides comprehensive error handling with visual notifications.

### Automatic Error Detection
- **CORS Issues**: When opening files directly in browser
- **File Not Found**: Component files that don't exist
- **JavaScript Errors**: Syntax errors in component scripts
- **Network Errors**: Connection issues

### Visual Notifications
Errors appear as slide-in notifications in the top-right corner:
- Red notifications for errors
- Yellow for warnings
- Blue for info messages
- Click × to dismiss
- Auto-hide after 10 seconds

### Console Logging
All operations are logged with colored badges:
- 🟢 Green: Success operations
- 🔴 Red: Errors
- 🟠 Yellow: Warnings
- 🔵 Blue: Info messages

## 🌐 Local Development

### CORS Issues
When opening HTML files directly in the browser, you'll encounter CORS errors. Always use a local server:

```bash
# Using Node.js HTTP Server
npx http-server -p 8080 --cors

# Using Python
python -m http.server 8080

# Then open: http://localhost:8080/your-file.html
```

### Development Workflow
1. **Create components** in separate HTML files
2. **Register JavaScript components** with `registerComponent()`
3. **Build pages** using `buildPage()` or `data-component` attributes
4. **Test locally** with a web server
5. **Deploy** to any static hosting service

## 📁 File Organization

### Recommended Structure
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
└── js/
    ├── app.js
    └── components.js
```

### Component Files
Keep components modular and focused:

```html
<!-- components/header.html -->
<header>
    <nav>
        <a href="#home">Home</a>
        <a href="#about">About</a>
    </nav>
</header>

<script>
    // Component-specific JavaScript
    console.log('Header component loaded');
</script>
```

## 🎯 Use Cases

### 1. Static Site Builder
Build entire websites from component definitions:

```javascript
// site-config.js
const siteStructure = [
    'components/header.html',
    { name: 'hero-banner', props: { title: 'Welcome' } },
    { name: 'feature-grid', props: { columns: 3 } },
    'components/footer.html'
];

HTMLComponents.buildPage(siteStructure, 'body');
```

### 2. Dynamic Web App
Load components on demand:

```javascript
// Load different content based on user action
function loadPage(pageName) {
    const contentArea = document.querySelector('#content');

    if (pageName === 'dashboard') {
        HTMLComponents.buildPage([
            { name: 'stats-cards', props: { user: currentUser } },
            { name: 'recent-activity', props: { limit: 10 } }
        ], '#content', true);
    }
}
```

### 3. Component Library
Create reusable component libraries:

```javascript
// components.js
HTMLComponents.registerComponent('modal', {
    template: `
        <div class="modal-overlay" style="display: {{display}}">
            <div class="modal-content">
                <h2>{{title}}</h2>
                <p>{{content}}</p>
                <button onclick="closeModal()">Close</button>
            </div>
        </div>
    `,
    props: ['title', 'content', 'display'],
    styles: `
        .modal-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 500px;
        }
    `,
    logic: function(props) {
        window.closeModal = function() {
            // Hide modal logic
        };
    }
});
```

## 🔧 Advanced Configuration

### Custom Notification Styling
```javascript
// Access notification system directly
window.HTMLComponents._notificationSystem.show('info', 'Custom Message', 'Details here');
```

### Custom Logging
```javascript
// Override default logger
window.HTMLComponents._logger = {
    log: function(msg, data) {
        // Custom logging implementation
    }
};
```

### Cache Management
```javascript
// Clear everything
HTMLComponents.clearComponentCache();

// Manual cache access
const imageCache = HTMLComponents._imageLoader.cache;
```

## 🐛 Troubleshooting

### Common Issues

**Q: Components don't load, showing CORS errors**
A: Run a local server instead of opening files directly:
```bash
npx http-server -p 8080 --cors
```

**Q: JavaScript components don't render**
A: Check that components are registered before calling `buildPage()`:
```javascript
// Register first
HTMLComponents.registerComponent('hero', { ... });

// Then build
HTMLComponents.buildPage(['hero'], 'body');
```

**Q: Styles don't apply**
A: Styles are injected globally once. Check for CSS conflicts or use more specific selectors.

**Q: Scripts in components don't run**
A: Scripts are executed after component insertion. Use event delegation for dynamic elements.

**Q: Images don't load**
A: Check image paths and ensure they're accessible. Use `HTMLComponents.preloadImages()` for performance.

### Debug Mode
Enable verbose logging:
```javascript
// All operations are logged by default
// Check browser console for detailed information
```

## 📊 Performance Tips

1. **Preload Images**: Use `preloadImages()` for critical images
2. **Component Caching**: Registered components are cached automatically
3. **Lazy Loading**: Load components only when needed
4. **Minimize DOM**: Keep component structures simple
5. **Batch Updates**: Use `buildPage()` for multiple components at once

## 🌟 Examples

See the `showcase/` folder for complete working examples:

- **`showcase/basic-example.html`** - Using `data-component` attributes with file-based components
- **`showcase/js-components-example.html`** - Building entire pages from JavaScript component definitions
- **`showcase/components/`** - Sample component files (header, sidebar, footer)

### Running the Examples
```bash
# Start local server
npx http-server -p 8080 --cors

# Open examples
# http://localhost:8080/showcase/basic-example.html
# http://localhost:8080/showcase/js-components-example.html
```

## 📄 License

MIT License - Free for personal and commercial use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- Check the console for error messages and notifications
- Review the showcase examples
- Ensure you're using a local server for development
- Check component file paths and JavaScript syntax
