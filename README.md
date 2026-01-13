# HTML Components Library - Advanced

A powerful JavaScript library for creating entire websites from modular components, featuring dynamic image loading, component registries, and complete page building from JavaScript definitions.

## ✨ Advanced Features

- **File-based Components**: Load HTML components from separate files
- **CSS File Loading**: Dynamically load stylesheets with caching and error handling
- **JavaScript Component Registry**: Define components entirely in JavaScript with templates, props, and logic
- **Dynamic Image Loading**: Built-in image loading with caching and preloading
- **Enhanced Page Building**: Advanced page definitions with metadata, conditional loading, nested components, and layout sections
- **Intelligent Page Caching**: Automatic caching of rendered pages with toggle controls for performance optimization
- **Smart File Caching**: Automatic caching of loaded HTML components and CSS files with toggle controls
- **Automatic Script Execution**: Components can include their own JavaScript
- **Visual Error Notifications**: On-screen notifications for debugging with suggestions
- **Extensive Logging**: Beautiful colored console output for debugging
- **No Backend Required**: Works entirely client-side

## 🚀 Quick Start

### Method 1: Hybrid HTML + Components (Recommended)
```html
<!DOCTYPE html>
<html>
<body>
    <!-- Static HTML structure -->
    <header>Static Header</header>

    <!-- Dynamic components loaded from files -->
    <div data-component="sidebar.html"></div>

    <!-- Dynamic components loaded from JavaScript -->
    <div id="hero-section"></div>

    <script src="html-components.js"></script>
    <script>
        // Register and load JavaScript components
        HTMLComponents.registerComponent('hero', {
            template: '<h1>{{title}}</h1>',
            props: ['title'],
            styles: 'h1 { color: blue; }'
        });

        document.getElementById('hero-section').innerHTML =
            HTMLComponents.createComponent('hero', { title: 'Welcome' });
    </script>
</body>
</html>
```

### Method 2: File-based Components Only
```html
<script src="html-components.js"></script>

<div data-component="header.html"></div>
<div data-component="sidebar.html"></div>
<div data-component="footer.html"></div>
```

### Method 3: Entire Website from JavaScript
```html
<!DOCTYPE html>
<html><head><title>My Site</title></head>
<body><!-- Everything built by JS -->
<script src="html-components.js"></script>
<script src="my-site-config.js"></script>
</body></html>
```

## 🖥️ Local Development

Run a local server to avoid CORS issues:
```bash
npx http-server -p 8080 --cors
# Then open http://localhost:8080/index.html
```

## 📚 API Reference

### Component Loading
```javascript
// Load from file
HTMLComponents.loadComponent('#my-div', 'component.html');

// Reload all components
HTMLComponents.reloadAll();
```

### CSS Loading
```javascript
// Load CSS file
HTMLComponents.loadCSS('styles/theme.css')
    .then(() => console.log('CSS loaded'))
    .catch(err => console.error('CSS failed:', err));

// Load with options
HTMLComponents.loadCSS('styles/print.css', {
    media: 'print',
    crossOrigin: 'anonymous'
});
```

### Image Loading
```javascript
// Load single image
HTMLComponents.loadImage('image.jpg').then(img => {
    document.body.appendChild(img);
});

// Preload multiple images
HTMLComponents.preloadImages(['img1.jpg', 'img2.jpg', 'img3.jpg']);
```

### Component Registry
```javascript
// Register a component
HTMLComponents.registerComponent('my-component', {
    template: '<div class="my-comp">{{content}}</div>',
    props: ['content'],
    styles: '.my-comp { color: red; }',
    logic: (props) => console.log('Component logic:', props)
});

// Create component HTML
const html = HTMLComponents.createComponent('my-component', { content: 'Hello' });
```

### Page Building
```javascript
// Build entire page from component list
const pageStructure = [
    'header.html',
    { name: 'hero-section', props: { title: 'Welcome' } },
    { name: 'feature-grid', props: { columns: 3 } },
    'footer.html'
];

HTMLComponents.buildPage(pageStructure, 'body');
```

## 🎨 Component Definition Format

```javascript
{
    template: `<div>{{title}}</div>`,           // HTML template with {{prop}} placeholders
    props: ['title', 'subtitle'],               // Array of prop names
    styles: `.my-class { color: blue; }`,       // CSS styles (added once globally)
    logic: function(props) {                    // Component logic function
        console.log('Component loaded with:', props);
        // Add event listeners, etc.
    }
}
```

## 📁 Project Structure

```
html-components/
├── html-components.js          # Main library
├── DOCUMENTATION.md           # Complete documentation
├── README.md                  # Quick start guide
└── showcase/                  # Example implementations
    ├── basic-example.html     # HTML component attributes
    ├── js-components-example.html  # JavaScript components
    └── components/            # Sample component files
        ├── header.html
        ├── sidebar.html
        └── footer.html
```

## 🔔 Visual Error Notifications

**On-screen notifications** appear automatically when errors occur, providing immediate debugging help:

### Features:
- **Visual Alerts**: Red error notifications slide in from the right
- **Technical Details**: Expandable sections with full error information
- **Helpful Suggestions**: Actionable advice for fixing common issues
- **Dismissible**: Click × to close, auto-hide after 10 seconds
- **Smooth Animations**: Slide-in/slide-out effects

### Common Error Solutions:
- **CORS Issues**: "Ensure you're running a local server (not opening files directly)"
- **File Not Found**: "Verify the component file path is correct"
- **JavaScript Errors**: "Check for syntax errors in component JavaScript"

## 🎨 Console Logging

Beautiful colored logging for easy debugging:
- 🟢 **Green**: General operations and success
- 🔴 **Red**: Errors and failures
- 🟠 **Orange**: Warnings
- 🔵 **Blue**: Info messages

## 🌟 Advanced Example

See `site-config.js` for a complete example of:
- Registering custom components with templates, props, and logic
- Dynamic image galleries with preloading
- Building entire page layouts from JavaScript arrays
- Interactive components with event handlers

## 🔧 Browser Support

Modern browsers with ES6 support:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📄 License

MIT License - Free for personal and commercial use.
