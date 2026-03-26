// escape-room-game.js - Core escape room game logic

document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const gameState = {
        foundSymbols: [],
        correctSequence: ['🌙', '⭐', '🔥'],
        currentInput: [],
        doorUnlocked: false,
        noteRead: false,
        cursorMode: 'vr', // Track current cursor mode
        firstClickAfterUI: false, // Track if first click after UI should be for pointer lock
        hoveredObject: null // Track what object is being looked at
    };

    // UI Elements
    const gravestoneDisplay = document.getElementById('gravestone-display');
    const exitDoor = document.getElementById('exit-door');
    const camera = document.getElementById('camera');
    const desktopCursor = document.getElementById('desktop-cursor');

    // Cursor management functions - simplified to work with A-Frame's built-in behavior
    function enableDesktopCursor() {
        if (camera && desktopCursor) {
            console.log('Requesting pointer lock release');
            
            // Exit pointer lock - A-Frame will handle cursor visibility
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
            
            // Make sure cursor can interact with UI
            desktopCursor.setAttribute('raycaster', 'objects: .interactive, button, [class*="close-btn"]');
            
            gameState.cursorMode = 'desktop';
        }
    }

    function enableVRCursor() {
        if (camera && desktopCursor) {
            console.log('Requesting pointer lock');
            
            // Re-enable pointer lock - user needs to click scene
            desktopCursor.setAttribute('raycaster', 'objects: .interactive');
            
            // Set flag that next click should be for pointer lock
            gameState.firstClickAfterUI = true;
            
            gameState.cursorMode = 'vr';
        }
    }

    function enableVRCursorImmediate() {
        if (camera && desktopCursor) {
            console.log('Immediately requesting pointer lock');
            
            // Enable pointer lock immediately
            const scene = document.querySelector('a-scene');
            if (scene) {
                scene.requestPointerLock();
            }
            
            // Update raycaster
            desktopCursor.setAttribute('raycaster', 'objects: .interactive');
            
            gameState.cursorMode = 'vr';
            gameState.firstClickAfterUI = false;
        }
    }

    function showUIWithCursor(uiElement, closeCallback) {
        console.log('Showing UI with cursor');
        
        // Make sure UI is on top and interactive
        uiElement.style.zIndex = '9999';
        uiElement.style.pointerEvents = 'auto';
        document.body.appendChild(uiElement);
        
        // Exit pointer lock to show cursor
        enableDesktopCursor();
        
        // Add close button handler
        const closeButtons = uiElement.querySelectorAll('button');
        closeButtons.forEach(button => {
            if (button.textContent.toLowerCase().includes('close') || 
                button.textContent.toLowerCase().includes('cancel')) {
                button.addEventListener('click', (e) => {
                    console.log('Close button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    uiElement.remove();
                    enableVRCursorImmediate(); // Use immediate pointer lock
                    if (closeCallback) closeCallback();
                });
            }
        });
        
        // Also close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                console.log('Escape key pressed');
                uiElement.remove();
                enableVRCursorImmediate(); // Use immediate pointer lock
                document.removeEventListener('keydown', escapeHandler);
                if (closeCallback) closeCallback();
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    // Register puzzle piece component
    AFRAME.registerComponent('puzzle-piece', {
        init() {
            // Add hover detection
            this.el.addEventListener('mouseenter', () => this.onHover());
            this.el.addEventListener('mouseleave', () => this.onUnhover());
        },

        onHover() {
            gameState.hoveredObject = this.el;
            // Don't show hint for puzzle pieces - only for obelisk and note
        },

        onUnhover() {
            if (gameState.hoveredObject === this.el) {
                gameState.hoveredObject = null;
            }
        },

        interact() {
            const symbol = this.el.dataset.symbol;
            const found = this.el.dataset.found === 'true';

            if (!found && !gameState.foundSymbols.includes(symbol)) {
                gameState.foundSymbols.push(symbol);
                this.el.dataset.found = 'true';
                
                // Get current scale
                const currentScale = this.el.getAttribute('scale');
                const scaleUp = {
                    x: currentScale.x * 1.1,
                    y: currentScale.y * 1.1, 
                    z: currentScale.z * 1.1
                };
                
                // Visual feedback - scale up relative to current size
                this.el.setAttribute('animation', `property: scale; to: ${scaleUp.x} ${scaleUp.y} ${scaleUp.z}; dur: 200; easing: easeInOutQuad`);
                setTimeout(() => {
                    this.el.setAttribute('animation', `property: scale; to: ${currentScale.x} ${currentScale.y} ${currentScale.z}; dur: 200; easing: easeInOutQuad`);
                }, 200);

                // Show symbol notification
                this.showNotification(`Symbol found: ${symbol}`);
                console.log(`Found symbol: ${symbol}`);
                console.log('All found symbols:', gameState.foundSymbols);
            }
        },

        showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 255, 0, 0.9);
                color: black;
                padding: 20px;
                border-radius: 10px;
                font-size: 24px;
                font-weight: bold;
                z-index: 2000;
                animation: fadeInOut 2s ease-in-out;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 2000);
        }
    });

    // Register note puzzle component
    AFRAME.registerComponent('note-puzzle', {
        init() {
            // Add hover detection
            this.el.addEventListener('mouseenter', () => this.onHover());
            this.el.addEventListener('mouseleave', () => this.onUnhover());
        },

        onHover() {
            gameState.hoveredObject = this.el;
            this.showHoverHint();
        },

        onUnhover() {
            if (gameState.hoveredObject === this.el) {
                gameState.hoveredObject = null;
            }
            this.hideHoverHint();
        },

        showHoverHint() {
            // Show "Press E" hint
            const hint = document.createElement('div');
            hint.id = 'hover-hint';
            hint.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 255, 0, 0.9);
                color: black;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                z-index: 1500;
                pointer-events: none;
            `;
            hint.textContent = 'Press E to read note';
            document.body.appendChild(hint);
        },

        hideHoverHint() {
            const hint = document.getElementById('hover-hint');
            if (hint) hint.remove();
        },

        interact() {
            if (!gameState.noteRead) {
                gameState.noteRead = true;
                this.showRiddle();
            }
        },

        showRiddle() {
            const riddleText = `When night meets day and stars burn bright,
Three symbols hold the key to light.
Find them all and speak their truth,
To escape the darkness of this roof.`;

            const riddleBox = document.createElement('div');
            riddleBox.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(139, 69, 19, 0.95);
                color: #f4e4c1;
                padding: 30px;
                border-radius: 15px;
                font-size: 18px;
                font-family: 'Georgia', serif;
                max-width: 400px;
                text-align: center;
                z-index: 2000;
                border: 3px solid #8B4513;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
            `;
            riddleBox.innerHTML = `
                <h3 style="margin-top: 0; color: #ffd700;">Ancient Note</h3>
                <p style="margin: 20px 0; line-height: 1.6;">${riddleText}</p>
                <button class="close-btn" style="
                    background: #ffd700;
                    color: black;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">Close</button>
            `;

            showUIWithCursor(riddleBox);
        }
    });

    // Register gravestone puzzle component
    AFRAME.registerComponent('gravestone-puzzle', {
        init() {
            // Add hover detection
            this.el.addEventListener('mouseenter', () => this.onHover());
            this.el.addEventListener('mouseleave', () => this.onUnhover());
        },

        onHover() {
            gameState.hoveredObject = this.el;
            this.showHoverHint();
        },

        onUnhover() {
            if (gameState.hoveredObject === this.el) {
                gameState.hoveredObject = null;
            }
            this.hideHoverHint();
        },

        showHoverHint() {
            // Show "Press E" hint
            const hint = document.createElement('div');
            hint.id = 'hover-hint';
            hint.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 255, 0, 0.9);
                color: black;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                z-index: 1500;
                pointer-events: none;
            `;
            hint.textContent = 'Press E to input symbols';
            document.body.appendChild(hint);
        },

        hideHoverHint() {
            const hint = document.getElementById('hover-hint');
            if (hint) hint.remove();
        },

        interact() {
            this.inputSymbol();
        },

        inputSymbol() {
            if (gameState.foundSymbols.length === 0) {
                this.showMessage('Find symbols first!');
                return;
            }

            // Show symbol selection interface
            this.showSymbolSelector();
        },

        showSymbolSelector() {
            // Remove existing selector if present
            const existing = document.getElementById('symbol-selector');
            if (existing) existing.remove();

            const selector = document.createElement('div');
            selector.id = 'symbol-selector';
            selector.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 30px;
                border-radius: 15px;
                z-index: 2000;
                border: 2px solid #00ff00;
            `;

            const symbols = gameState.foundSymbols;
            const currentDisplay = gameState.currentInput.map(s => s || '_').join(' ');
            
            selector.innerHTML = `
                <h3 style="margin-top: 0; color: #00ff00;">Choose Symbol</h3>
                <p style="margin-bottom: 20px;">Current: ${currentDisplay}</p>
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    ${symbols.map(symbol => `
                        <button onclick="selectSymbol('${symbol}')" style="
                            background: #333;
                            color: white;
                            border: 2px solid #00ff00;
                            padding: 15px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-size: 24px;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='#00ff00'; this.style.color='black'" 
                           onmouseout="this.style.background='#333'; this.style.color='white'">${symbol}</button>
                    `).join('')}
                </div>
                <button onclick="clearSymbols()" style="
                    background: #ff0000;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Clear</button>
                <button class="close-btn" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Close</button>
            `;

            showUIWithCursor(selector);
        },

        updateDisplay() {
            const display = gameState.currentInput.map(s => s || '_').join(' ');
            gravestoneDisplay.setAttribute('value', display);
        },

        checkSolution() {
            const isCorrect = gameState.currentInput.every((symbol, index) => 
                symbol === gameState.correctSequence[index]
            );

            if (isCorrect) {
                gameState.doorUnlocked = true;
                this.unlockDoor();
                enableVRCursorImmediate(); // Restore VR cursor immediately after solving
            } else {
                this.showMessage('Wrong sequence! Try again.');
                gameState.currentInput = [];
                setTimeout(() => {
                    this.updateDisplay();
                    enableVRCursorImmediate(); // Restore VR cursor immediately after showing message
                }, 1000);
            }
        },

        unlockDoor() {
            exitDoor.setAttribute('color', '#00ff00');
            exitDoor.querySelector('a-text').setAttribute('value', 'UNLOCKED');
            exitDoor.querySelector('a-text').setAttribute('color', '#00ff00');
            
            this.showMessage('Door Unlocked! You escaped!');
            
            // Add celebration effect
            exitDoor.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 1000; easing: easeInOutQuad');
        },

        showMessage(message) {
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-size: 20px;
                z-index: 2000;
                border: 2px solid #ff0000;
            `;
            messageBox.textContent = message;
            document.body.appendChild(messageBox);

            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 2000);
        }
    });

    // Register escape door component
    AFRAME.registerComponent('escape-door', {
        init() {
            // Add hover detection
            this.el.addEventListener('mouseenter', () => this.onHover());
            this.el.addEventListener('mouseleave', () => this.onUnhover());
        },

        onHover() {
            gameState.hoveredObject = this.el;
            this.showHoverHint();
        },

        onUnhover() {
            if (gameState.hoveredObject === this.el) {
                gameState.hoveredObject = null;
            }
            this.hideHoverHint();
        },

        showHoverHint() {
            const message = gameState.doorUnlocked ? 'Press E to escape!' : 'Press E to try door';
            const hint = document.createElement('div');
            hint.id = 'hover-hint';
            hint.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: ${gameState.doorUnlocked ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)'};
                color: ${gameState.doorUnlocked ? 'black' : 'white'};
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                z-index: 1500;
                pointer-events: none;
            `;
            hint.textContent = message;
            document.body.appendChild(hint);
        },

        hideHoverHint() {
            const hint = document.getElementById('hover-hint');
            if (hint) hint.remove();
        },

        interact() {
            this.tryExit();
        },

        tryExit() {
            if (gameState.doorUnlocked) {
                this.showVictoryScreen();
            } else {
                this.showMessage('The door is locked. Solve the puzzle first!');
            }
        },

        showVictoryScreen() {
            // Enable desktop cursor for victory screen interaction
            enableDesktopCursor();
            
            const victoryScreen = document.createElement('div');
            victoryScreen.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #00ff00, #0000ff);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 3000;
                font-family: Arial, sans-serif;
            `;
            victoryScreen.innerHTML = `
                <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🎉 ESCAPE ROOM COMPLETE! 🎉</h1>
                <p style="font-size: 24px; margin-bottom: 30px;">You solved the mystery and escaped!</p>
                <button onclick="location.reload()" style="
                    background: white;
                    color: black;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: bold;
                ">Play Again</button>
            `;
            document.body.appendChild(victoryScreen);
        },

        showMessage(message) {
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(139, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-size: 20px;
                z-index: 2000;
            `;
            messageBox.textContent = message;
            document.body.appendChild(messageBox);

            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 2000);
        }
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
    `;
    document.head.appendChild(style);

    // Global functions for symbol selector
    window.selectSymbol = function(symbol) {
        if (gameState.currentInput.length < 3) {
            gameState.currentInput.push(symbol);
            
            // Update gravestone display
            const display = gameState.currentInput.map(s => s || '_').join(' ');
            gravestoneDisplay.setAttribute('value', display);
            
            // Update selector display
            const selector = document.getElementById('symbol-selector');
            if (selector) {
                const currentDisplay = gameState.currentInput.map(s => s || '_').join(' ');
                selector.querySelector('p').textContent = `Current: ${currentDisplay}`;
            }
            
            // Check if puzzle is solved
            if (gameState.currentInput.length === 3) {
                setTimeout(() => {
                    const gravestoneComponent = document.querySelector('[gravestone-puzzle]').components['gravestone-puzzle'];
                    gravestoneComponent.checkSolution();
                    closeSymbolSelector();
                }, 500);
            }
        }
    };

    window.clearSymbols = function() {
        gameState.currentInput = [];
        const display = gameState.currentInput.map(s => s || '_').join(' ');
        gravestoneDisplay.setAttribute('value', display);
        
        const selector = document.getElementById('symbol-selector');
        if (selector) {
            selector.querySelector('p').textContent = `Current: ${display}`;
        }
    };

    window.closeSymbolSelector = function() {
        const selector = document.getElementById('symbol-selector');
        if (selector) selector.remove();
        enableVRCursorImmediate(); // Use immediate pointer lock
    };

    // Game initialization
    console.log('Escape Room Game Initialized');
    console.log('Find 3 symbols and solve the gravestone puzzle to escape!');
    
    // Global E key handler for interactions
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'e' && gameState.hoveredObject) {
            e.preventDefault();
            console.log('E key pressed on object:', gameState.hoveredObject);
            
            // Call the interact method if it exists
            const component = gameState.hoveredObject.components;
            if (component && component['puzzle-piece']) {
                component['puzzle-piece'].interact();
            } else if (component && component['note-puzzle']) {
                component['note-puzzle'].interact();
            } else if (component && component['gravestone-puzzle']) {
                component['gravestone-puzzle'].interact();
            } else if (component && component['escape-door']) {
                component['escape-door'].interact();
            }
        }
    });
    
    // Global click handler to manage first click after UI
    document.addEventListener('click', (e) => {
        if (gameState.firstClickAfterUI && !e.target.closest('[class*="close-btn"]') && !e.target.closest('button')) {
            console.log('First click after UI - should be for pointer lock');
            gameState.firstClickAfterUI = false;
            
            // Don't prevent the click - let A-Frame handle pointer lock
            // Just clear the flag so subsequent clicks work normally
        }
    });
    
    // Start in VR mode
    enableVRCursor();
});
