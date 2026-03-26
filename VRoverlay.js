// VRoverlay.js - Creates VR instruction overlay as A-Frame entity

document.addEventListener('DOMContentLoaded', function() {
    let vrOverlayEntity = null;

    function createVROverlay() {
        // Don't create if already exists
        if (vrOverlayEntity) {
            return;
        }

        // Create VR overlay as A-Frame entity
        vrOverlayEntity = document.createElement('a-entity');
        vrOverlayEntity.id = 'vr-instructions-overlay';
        
        // Position relative to camera (in front and slightly down)
        vrOverlayEntity.setAttribute('position', '0 -0.3 -0.8');
        vrOverlayEntity.setAttribute('rotation', '0 0 0');
        
        // Make it follow the camera
        vrOverlayEntity.setAttribute('look-at', '[camera]');
        
        // Create background panel
        const backgroundPanel = document.createElement('a-plane');
        backgroundPanel.setAttribute('width', '0.8');
        backgroundPanel.setAttribute('height', '0.4');
        backgroundPanel.setAttribute('color', '#000000');
        backgroundPanel.setAttribute('opacity', '0.9');
        backgroundPanel.setAttribute('material', `transparent: true; opacity: 0.9;`);
        backgroundPanel.setAttribute('position', '0 0 0.01');
        
        // Create instruction text
        const titleText = document.createElement('a-text');
        titleText.setAttribute('value', 'VR Controls:');
        titleText.setAttribute('position', '0 0.15 0.02');
        titleText.setAttribute('align', 'center');
        titleText.setAttribute('color', '#00ffff');
        titleText.setAttribute('width', '0.7');
        titleText.setAttribute('font-size', '0.05');
        
        const jumpText = document.createElement('a-text');
        jumpText.setAttribute('value', 'X / A - Jump');
        jumpText.setAttribute('position', '0 0.05 0.02');
        jumpText.setAttribute('align', 'center');
        jumpText.setAttribute('color', '#ffffff');
        jumpText.setAttribute('width', '0.7');
        jumpText.setAttribute('font-size', '0.04');
        
        const moveText = document.createElement('a-text');
        moveText.setAttribute('value', 'Left Thumbstick - Move');
        moveText.setAttribute('position', '0 -0.05 0.02');
        moveText.setAttribute('align', 'center');
        moveText.setAttribute('color', '#ffffff');
        moveText.setAttribute('width', '0.7');
        moveText.setAttribute('font-size', '0.04');
        
        const rotateText = document.createElement('a-text');
        rotateText.setAttribute('value', 'Right Thumbstick - Rotate');
        rotateText.setAttribute('position', '0 -0.15 0.02');
        rotateText.setAttribute('align', 'center');
        rotateText.setAttribute('color', '#ffffff');
        rotateText.setAttribute('width', '0.7');
        rotateText.setAttribute('font-size', '0.04');
        
        // Add all elements to overlay entity
        vrOverlayEntity.appendChild(backgroundPanel);
        vrOverlayEntity.appendChild(titleText);
        vrOverlayEntity.appendChild(jumpText);
        vrOverlayEntity.appendChild(moveText);
        vrOverlayEntity.appendChild(rotateText);
        
        // Add to camera rig so it follows the player
        const cameraRig = document.querySelector('#camera-rig');
        if (cameraRig) {
            cameraRig.appendChild(vrOverlayEntity);
            console.log('VR overlay added to camera rig');
        } else {
            console.error('Camera rig not found');
        }

        // Auto-fade behavior for VR
        let fadeTimeout;
        let isVisible = true;
        
        function showOverlay() {
            if (vrOverlayEntity && isVisible) {
                vrOverlayEntity.setAttribute('opacity', '1');
                clearTimeout(fadeTimeout);
                fadeTimeout = setTimeout(() => {
                    if (vrOverlayEntity && isVisible) {
                        vrOverlayEntity.setAttribute('opacity', '0.4');
                    }
                }, 15000);
            }
        }

        // Show overlay when VR buttons are pressed
        function handleVRInput() {
            showOverlay();
        }

        // Add keyboard listeners for X/A buttons
        document.addEventListener('keydown', function(e) {
            if (['x', 'a', 'X', 'A'].includes(e.key)) {
                handleVRInput();
            }
        });

        // Listen for controller events
        const leftController = document.querySelector('#left-controller');
        const rightController = document.querySelector('#right-controller');
        
        if (leftController) {
            leftController.addEventListener('thumbstickmoved', handleVRInput);
            leftController.addEventListener('buttondown', handleVRInput);
        }
        
        if (rightController) {
            rightController.addEventListener('thumbstickmoved', handleVRInput);
            rightController.addEventListener('buttondown', handleVRInput);
        }

        // Initial display
        showOverlay();
    }

    function removeVROverlay() {
        if (vrOverlayEntity) {
            vrOverlayEntity.remove();
            vrOverlayEntity = null;
            console.log('VR overlay removed');
        }
    }

    // Wait for A-Frame scene to be ready
    function setupVRListeners() {
        const scene = document.querySelector('a-scene');
        if (!scene) {
            setTimeout(setupVRListeners, 100);
            return;
        }

        // Listen for VR mode changes
        scene.addEventListener('enter-vr', function() {
            console.log('Entered VR mode - creating VR overlay');
            setTimeout(createVROverlay, 1000); // Delay to ensure VR is fully initialized
        });
        
        scene.addEventListener('exit-vr', function() {
            console.log('Exited VR mode - removing VR overlay');
            removeVROverlay();
        });

        // Check if already in VR mode
        if (scene.is('vr-mode')) {
            setTimeout(createVROverlay, 1000);
        }
    }

    // Setup listeners after a short delay to ensure DOM is ready
    setTimeout(setupVRListeners, 500);
});
