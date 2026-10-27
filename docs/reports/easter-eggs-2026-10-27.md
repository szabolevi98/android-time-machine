# Easter egg regressions — 2026-10-27

- ICS: the PlatLogo window is transparent over the selected wallpaper. Live wallpapers remain visible there; Nyandroid keeps its own blue sky.
- Jelly Bean: live wallpaper remains visible behind both the logo and BeanBag. KitKat also keeps its wallpaper behind the initial K window.
- ICS: the touch release that launches Nyandroid is consumed, so its synthesized click cannot immediately close the new scene. Its 20 stars use the scene clock for their six frames; reduced motion keeps the visible middle frame rather than transparent star0.
- KitKat: tile placement moves and turns for 500 ms, including automatic shuffling after the native five-second delay. Reduced motion uses a plain decelerating movement without overshoot, keeping the game's essential motion.
- Gingerbread through Nougat: easter egg surfaces and their children suppress selection, native image dragging and WebKit image callouts. The interactive KitKat logo keeps its pointer target.

Validation: `node tests/browser/easter-eggs.mjs` passed all three affected releases at 1280/390 px with both motion preferences, using actual CDP touch holds/releases. It checks moving particle frames, retained visible stars, intermediate tile transforms, automatic shuffling, wallpaper visibility and context-menu suppression. Additional mobile selection/wallpaper checks cover 2.3.6, 5.1.1, 6.0.1 and 7.1.2. Screenshots were inspected. `npm test`: 272/272 passed.
