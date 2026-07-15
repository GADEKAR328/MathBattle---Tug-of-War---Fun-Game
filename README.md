# MathBattle — Tug of War 🧮

A fast-paced, two-player math tug-of-war game built for the browser. Solve arithmetic problems faster than your opponent to pull the rope to your side and win!

**Designed & Developed by Yogesh Gadekar**

## Features

- Two-player local multiplayer (keypad entry for each side)
- Addition, subtraction, and multiplication questions
- Animated rope pull, sound effects, and confetti on win
- Welcome screen explaining the game's purpose: encouraging students to practice math in a fun, engaging way to build mental math speed
- Editable team names, with a "Change Teams" option mid-game
- Installable as a desktop/mobile app (PWA) via the "Install App" button

## Project structure

```
.
├── index.html        # Main page markup
├── css/
│   └── style.css      # All game styling and animations
├── js/
│   └── script.js      # Game logic, scoring, audio, PWA setup
├── assets/
│   └── rope-photo.png # Rope illustration used in the arena
├── manifest.json      # Web app manifest (for "Install App")
├── sw.js              # Minimal service worker enabling installability
└── README.md
```

## Running locally

Just open `index.html` in a browser — no build step or server required.

For full PWA install support (recommended), serve the folder with any static file server, for example:

```bash
npx serve .
```

or

```bash
python3 -m http.server
```

Then open the shown localhost URL in Chrome or Edge.

## Deploying on GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set source to the `main` branch, root folder.
4. Your game will be live at (https://gadekar328.github.io/MathBattle---Tug-of-War---Fun-Game/)

## License

Feel free to fork and adapt for educational use. Please keep the credit line intact.
