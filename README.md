# HTML Components

A lightweight, powerful JavaScript library for building dynamic web applications using reusable HTML components. No build tools, no frameworks—just clean, simple component-based development.

## Quick Start

### 1. Include the Library

```html
<script src="https://html-components.vapp.uk/html-components.js"></script>
```

### 2. Create a Component

**components/hello.html**
```html
<style>
.greeting { 
    padding: 2rem; 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
}
</style>

<div class="greeting">
    <h1>{{message}}</h1>
    <button data-click="sayHello">Click me!</button>
</div>

<script>
function sayHello(event, element) {
    alert('Hello from HTML Components!');
}
</script>
```

### 3. Load It

```html
<div id="app"></div>
<script src="html-components.js"></script>
<script>
    HTMLComponents.loadComponent('#app', 'components/hello.html', {
        message: 'Welcome!'
    });
</script>
```

### 4. Run It

```bash
# Start a local server
python -m http.server 8080

# Or use Node.js
npx http-server -p 8080
```

Visit `http://localhost:8080` - Done!

## Documentation

- **[Full Documentation](md/DOCUMENTATION.md)** - Complete API reference and advanced features
- **[Quick Start Guide](md/QUICKSTART.md)** - Step-by-step tutorial with examples

## Core Concepts

### Declarative Loading

Load components automatically with `data-component`:

```html
<div data-component="components/header.html"></div>
<div data-component="components/content.html"></div>
```

### Programmatic Loading

Load components dynamically with JavaScript:

```javascript
HTMLComponents.loadComponent('#content', 'components/user.html', {
    name: 'Alice',
    role: 'Developer'
});
```

### Template Variables

Use `{{variable}}` syntax for dynamic content:

```html
<h1>Hello {{name}}!</h1>
<p>You are a {{role}}</p>
```

### Event Binding

Bind functions to elements with `data-*` attributes:

```html
<button data-click="handleClick">Click</button>
<input data-input="handleInput">
<form data-submit="handleSubmit">
```

```javascript
function handleClick(event, element) {
    console.log('Button clicked!');
}
```

### Page Building

Build entire pages from component definitions:

```javascript
const page = {
    title: 'Dashboard',
    components: [
        'components/header.html',
        'components/sidebar.html',
        'components/content.html'
    ]
};

HTMLComponents.buildPage(page);
```

## API Overview

### Component Loading
- `loadComponent(selector, path, props)` - Load a component
- `buildPage(definition, target, clear)` - Build complete pages

### Asset Loading
- `loadCSS(href, options)` - Load CSS files
- `loadJS(src)` - Load JavaScript files
- `loadImage(src, options)` - Load images with caching
- `preloadImages(sources)` - Preload multiple images

### Visibility
- `showComponent(selector)` - Show a component
- `hideComponent(selector)` - Hide a component
- `toggleComponent(selector, show)` - Toggle visibility

### Caching
- `enableFileCache()` / `disableFileCache()` - Control file caching
- `enablePageCache()` / `disablePageCache()` - Control page caching
- `clearFileCache()` / `clearPageCache()` - Clear caches

### Debugging
- `enableDebug()` - Enable verbose logging
- `setLogLevel(level)` - Set log level (DEBUG, INFO, WARN, ERROR)
- `getLogHistory()` - Get log history

## Project Structure

```
my-app/
├── index.html              # Main HTML file
├── html-components.js      # Library file
├── components/             # Component files
│   ├── layout/
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── sidebar.html
│   ├── ui/
│   │   ├── button.html
│   │   ├── modal.html
│   │   └── card.html
│   └── pages/
│       ├── home.html
│       ├── about.html
│       └── contact.html
├── styles/                 # CSS files
│   └── main.css
└── scripts/                # JavaScript files
    └── app.js
```

## Examples

### Single Page Application

```javascript
const routes = {
    home: ['components/header.html', 'components/home.html'],
    about: ['components/header.html', 'components/about.html'],
    contact: ['components/header.html', 'components/contact.html']
};

function navigate(page) {
    HTMLComponents.buildPage(routes[page], '#app', true);
    history.pushState({ page }, '', `#${page}`);
}

window.onpopstate = (e) => navigate(e.state?.page || 'home');
navigate('home');
```

### Dynamic Form

```html
<form data-submit="handleSubmit">
    <input type="email" name="email" required>
    <button type="submit">Submit</button>
</form>

<script>
function handleSubmit(event, element) {
    event.preventDefault();
    const data = new FormData(element);
    
    fetch('/api/submit', {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(result => alert('Success!'))
    .catch(error => alert('Error!'));
}
</script>
```

### Conditional Loading

```javascript
const page = {
    components: [
        'components/header.html',
        {
            name: 'admin-panel.html',
            condition: () => user.isAdmin
        },
        {
            name: 'mobile-nav.html',
            condition: () => window.innerWidth < 768
        }
    ]
};

HTMLComponents.buildPage(page);
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Development Tips

### Enable Debug Mode

```javascript
HTMLComponents.enableDebug();
// See detailed component loading, caching, and event binding info
```

### Disable Caching During Development

```javascript
HTMLComponents.disableFileCache();
HTMLComponents.disablePageCache();
```

### Common Gotchas

1. **Always use a local server** - File protocol (`file://`) won't work due to CORS
2. **Event handlers must be global** - Or defined in component `<script>` tags
3. **Event handlers take 2 parameters** - `(event, element)`, not 3
4. **Components load asynchronously** - Use promises/async-await for sequencing

## Performance

- **File Caching**: All HTML, CSS, and JS files are cached automatically
- **Page Caching**: Built pages are cached for instant re-rendering
- **Image Caching**: Images are cached in memory after first load
- **Event Deduplication**: Events only bind once per element
- **Batched DOM Operations**: Uses DocumentFragment for efficient rendering

## Why HTML Components?

### No Build Tools Required
Unlike React, Vue, or Angular, HTML Components works directly in the browser. No webpack, no babel, no complex setup.

### Learn in Minutes
If you know HTML, CSS, and JavaScript, you already know HTML Components. No new syntax, no JSX, no virtual DOM concepts.

### Truly Reusable
Components are self-contained files. Copy a component file to another project and it just works.

### Progressive Enhancement
Start simple, add complexity only when needed. Perfect for both small projects and large applications.

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT License - Free for personal and commercial use.

## Links

- [Documentation](md/DOCUMENTATION.md)
- [Quick Start](md/QUICKSTART.md)
- [Report Issues](https://github.com/Olibot1107/html-components/issues)
- [Discussions](https://github.com/Olibot1107/html-components/discussions)

---

**Made with ❤️ for developers who love simplicity.**
