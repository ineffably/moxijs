# UI Screenshot Tests

Playwright tests for capturing screenshots of UI examples for visual validation.

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run only screenshot tests
npm run test:screenshots

# Run with UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed
```

## What Gets Tested

### Example 11 - UI Basics
- Basic screenshot of colored boxes with flex layout

### Example 12 - UI Components
- Screenshot of panels, buttons, and labels
- Screenshot with button interaction

### Example 13 - Form Elements
- Initial state screenshot
- Screenshot with dropdown menu open
- Screenshot with text input focused

## Screenshots Location

All screenshots are saved to `tests/screenshots/`:
- `11-ui-basics.png`
- `12-ui-components.png`
- `12-ui-components-interaction.png`
- `13-form-elements.png`
- `13-form-elements-dropdown.png`
- `13-form-elements-focused.png`

Plus suite versions for visual regression comparison.

## Notes

- Tests automatically start the dev server if not already running
- Default timeout is 2 seconds for canvas rendering
- Click positions may need adjustment if UI layout changes
- Screenshots are in .gitignore by default
