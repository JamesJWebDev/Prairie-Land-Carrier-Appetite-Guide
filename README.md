## Prairie Land Carrier's Appetite Guide

This is a small **Electron desktop application** used internally at Prairie Land Insurance.  
It does **not** connect to any external systems or rating APIs; all logic is a simple, in-memory carrier appetite and eligibility guide based on user inputs.

### Running the app

1. Make sure you have **Node.js** and **npm** installed.
2. From the project folder, install dependencies:

   ```bash
   npm install
   ```

3. Start the desktop app:

   ```bash
   npm start
   ```

An Electron window will open with a form to capture basic client and policy details, then suggest **carrier markets and eligibility** (e.g. Erie, Progressive, Travelers) and show the high-level factors that led to those suggestions.

### Creating a shareable executable (Windows)

To build a portable package you can share with others (no install required):

1. Install dependencies (if you haven’t): `npm install`
2. Run: `npm run pack`

This creates a folder:

- **`dist/Prairie Land Carrier's Appetite Guide-win32-x64/`**

Inside it you’ll find **`Prairie Land Carrier's Appetite Guide.exe`** and the rest of the app. To share:

- **Option A:** Zip the whole folder (e.g. `Prairie Land Carrier's Appetite Guide-win32-x64`) and send the zip. Recipients unzip and double‑click the `.exe`.
- **Option B:** Copy the folder to a USB drive or network share; others run the `.exe` from that folder.

Recipients do **not** need Node.js or npm; the folder is self-contained.

### Testing

A full test suite runs the app’s logic in isolation (no Electron window):

```bash
npm test
```

- **`npm test`** – run all tests once  
- **`npm run test:watch`** – run tests in watch mode (re-run on file changes)  
- **`npm run test:coverage`** – run tests and generate a coverage report (in `coverage/`)

Tests live in **`tests/`** and cover:

- **`carrierConfig.js`** – structure and contents of carrier lists (auto, home, commercial)
- **`form.js`** – `getFormValues`, `setFormValues`, `createEmptyInputs` (with a minimal DOM)
- **`suggestions.js`** – `calculateCarrierSuggestions` (eligibility, weighting, sorting)
- **`results.js`** – `renderResult`, `resetForm` (DOM output and reset)
- **`scripts/build-icon.js`** – icon build produces a valid `.ico` file

The suite uses [Vitest](https://vitest.dev/) and [jsdom](https://github.com/jsdom/jsdom) for a browser-like environment.

### Notes

- App logic lives in the `js/` folder (carrier config, form, suggestions, results); the main process is in `main.js`, UI wiring in `renderer.js`.
- You can adjust appetite rules (eligibility, weighting, questions) in the `js/` modules to match your internal guidelines.

