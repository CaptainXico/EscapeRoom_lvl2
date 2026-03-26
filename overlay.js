// Overlay.js - Creates an instruction overlay in the left bottom of the screen

document.addEventListener('DOMContentLoaded', function() {
    // Detect if user is on PC/desktop (not mobile)
    function isDesktop() {
        return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                (window.innerWidth <= 768 && 'ontouchstart' in window));
    }

    // Only create overlay on desktop devices
    if (!isDesktop()) {
        return;
    }
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'instructions-overlay';
    overlay.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 1000;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        transition: opacity 0.3s ease;
    `;

    // Create instruction content
    const instructions = document.createElement('div');
    instructions.innerHTML = `
        <div style="margin-bottom: 8px; font-weight: bold; color: #00ffff;">🧩 Escape Room:</div>
        <div style="margin-bottom: 4px;">🎮 <strong>WASD</strong> - Move</div>
        <div style="margin-bottom: 4px;">⬆️ <strong>Space</strong> - Jump</div>
        <div style="margin-bottom: 4px;">👁️ <strong>Look</strong> at objects</div>
        <div style="margin-bottom: 4px;">⌨️ <strong>E</strong> - Interact</div>
        <div style="margin-bottom: 4px;">📜 <strong>Goal:</strong> Find 3 symbols & escape!</div>
    `;
    instructions.style.cssText = `
        line-height: 1.4;
    `;

    // Add instructions to overlay
    overlay.appendChild(instructions);

    // Add to body
    document.body.appendChild(overlay);

    // Optional: Add hover effect
    overlay.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
    });

    overlay.addEventListener('mouseleave', function() {
        this.style.opacity = '0.9';
    });

    // Optional: Hide overlay after 10 seconds, show on keypress
    let hideTimeout;
    
    function showOverlay() {
        overlay.style.opacity = '1';
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            overlay.style.opacity = '0.3';
        }, 10000);
    }

    // Show overlay when any control key is pressed
    document.addEventListener('keydown', function(e) {
        if (['w', 'a', 's', 'd', ' ', 'Escape'].includes(e.key.toLowerCase())) {
            showOverlay();
        }
    });

    // Initial display
    showOverlay();
});
