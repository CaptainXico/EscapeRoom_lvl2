// mobile.js - Mobile-specific UI overlay

document.addEventListener('DOMContentLoaded', function() {
    // Detect if user is on mobile device
    function isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                (window.innerWidth <= 768 && 'ontouchstart' in window));
    }

    // Only initialize mobile features on mobile devices
    if (!isMobile()) {
        return;
    }

    console.log('Mobile device detected - showing mobile controls');

    // Create mobile-specific overlay
    function createMobileOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'mobile-overlay';
        overlay.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            max-width: 300px;
        `;

        overlay.innerHTML = `
            <div style="margin-bottom: 8px; font-weight: bold; color: #00ffff;">🧩 Escape Room:</div>
            <div style="margin-bottom: 4px;">👆 <strong>Tap</strong> to interact</div>
            <div style="margin-bottom: 4px;">📜 <strong>Goal:</strong> Find 3 symbols & escape!</div>
            <div style="margin-bottom: 4px; font-size: 12px; opacity: 0.8;">Look at objects and tap screen</div>
        `;

        document.body.appendChild(overlay);
        return overlay;
    }

    // Initialize mobile features
    function initMobile() {
        createMobileOverlay();
        console.log('Mobile UI initialized');
    }

    // Wait for the game to load before initializing mobile features
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobile);
    } else {
        initMobile();
    }
});
