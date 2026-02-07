# Password Generator Web Demo

A premium web interface demonstrating the password generator's capabilities.

## Features

- **Modern UI** - Clean, responsive design with dark/light theme support
- **Accessibility** - WCAG 2.1 AA compliant with screen reader support
- **Presets** - Quick, Secure, and Memorable password configurations
- **Strength Indicator** - Visual entropy feedback with bits calculation
- **Keyboard Shortcuts** - Ctrl/Cmd+Enter to generate, Ctrl/Cmd+C to copy

## Running Locally

The demo uses ES modules and requires a local server:

```bash
# Using Python
python -m http.server 8080 --directory src/ui/web/demo

# Using Node.js
npx serve src/ui/web/demo

# Using PHP
php -S localhost:8080 -t src/ui/web/demo
```

Then open http://localhost:8080 in your browser.

## Architecture

```
demo/
├── index.html          # Main HTML structure
├── styles/
│   ├── tokens.css      # Design tokens (colors, spacing, typography)
│   ├── base.css        # Reset and base styles
│   ├── components.css  # UI component styles
│   └── utilities.css   # Utility classes
└── scripts/
    ├── main.js         # Application entry point
    └── theme.js        # Theme management
```

## Integration

The demo uses the thin adapter pattern:

```javascript
import { createWebUIController } from '../../controllers/WebUIController.js';
import { FormState } from '../../state/FormState.js';

// Create controller (wires browser adapters to core)
const controller = createWebUIController();

// Generate password
const formState = new FormState({ type: 'strong', length: 16, iteration: 4 });
const result = await controller.generate(formState);
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires JavaScript and Web Crypto API.
