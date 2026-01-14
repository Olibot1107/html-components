# HTML Components - Quick Start Guide

Get up and running with HTML Components in 5 minutes! 🚀

## Step 1: Download HTML Components

Download `html-components.js` and place it in your project:

```bash
# Download the latest version
curl -O https://html-components.voidium.uk/html-components.js

# Or use the CDN (recommended for quick prototyping)
```

## Step 2: Create Your First Component

Create a simple HTML file for your component:

**components/header.html**
```html
<style>
.header {
    background: #333;
    color: white;
    padding: 1rem;
    text-align: center;
}
</style>

<header class="header">
    <h1>Welcome to My Site</h1>
    <nav>
        <a href="#home">Home</a>
        <a href="#about">About</a>
    </nav>
</header>
```

## Step 3: Create Your Main Page

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Site</title>
</head>
<body>
    <!-- Load your component -->
    <div data-component="components/header.html"></div>

    <!-- Main content -->
    <main>
        <h2>Hello World!</h2>
        <p>This is my first HTML Components page.</p>
    </main>

    <!-- Include HTML Components -->
    <script src="html-components.js"></script>
</body>
</html>
```

## Step 4: Run It!

Start a local server to avoid CORS issues:

```bash
# Using Node.js
npx http-server -p 8080 --cors

# Or using Python
python -m http.server 8080

# Or using PHP
php -S localhost:8080
```

Open `http://localhost:8080/index.html` in your browser!

## Advanced Quick Start

### Toggle Components (New!)

Add interactive functionality:

**index.html**
```html
<!DOCTYPE html>
<html>
<body>
    <div data-component="components/header.html"></div>

    <button onclick="HTMLComponents.toggleComponent('#sidebar')">Toggle Sidebar</button>
    <div id="sidebar" style="display: none;">
        <p>This sidebar can be toggled!</p>
    </div>

    <script src="html-components.js"></script>
</body>
</html>
```

### Toggle CSS Files

Switch themes dynamically:

```javascript
// Enable dark theme
HTMLComponents.enableCSS('styles/dark-theme.css');

// Disable light theme
HTMLComponents.disableCSS('styles/light-theme.css');

// Check current state
if (HTMLComponents.isCSSEnabled('styles/dark-theme.css')) {
    console.log('Dark theme is active');
}
```

### Replace Components

Swap out components dynamically:

```javascript
// Replace component in container
HTMLComponents.replaceComponent('#content-area', 'components/new-content.html')
    .then(() => console.log('Content updated!'))
    .catch(err => console.error('Failed to update content:', err));

// Replace by component path
HTMLComponents.replaceComponentByPath('components/old-header.html', 'components/new-header.html')
    .then(() => console.log('Header updated!'));
```

## Project Structure

Here's a recommended setup:

```
my-project/
├── html-components.js
├── index.html
├── components/
│   ├── header.html
│   ├── footer.html
│   └── sidebar.html
└── styles/
    ├── main.css
    ├── light-theme.css
    └── dark-theme.css
```

## Next Steps

🎉 **Congratulations!** You now have a working HTML Components setup.

### What to Try Next:

1. **Create more components** - Break your page into reusable pieces
2. **Add interactivity** - Use the toggle functions for dynamic content
3. **Build complex pages** - Use `HTMLComponents.buildPage()` for full page construction
4. **Explore the full docs** - Check [DOCUMENTATION.md](DOCUMENTATION.md) for advanced features

### Common Issues:

- **CORS errors?** Always use a local server
- **Components not loading?** Check file paths and ensure files exist
- **Scripts not working?** Make sure your server serves the correct MIME types

---

Need help? Check the [full documentation](DOCUMENTATION.md) or open an issue on GitHub!
