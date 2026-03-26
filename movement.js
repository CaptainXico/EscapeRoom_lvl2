// movement.js

const speed = 0.05;

window.addEventListener('load', () => {
  const cameraRig = document.getElementById('camera-rig');
  const camera = document.getElementById('camera');
  const leftController = document.getElementById('left-controller');

  if (!cameraRig || !leftController) {
    console.error("Camera rig or left controller not found!");
    return;
  }

  // LEFT CONTROLLER MOVEMENT (uses rig rotation)
const speed = 1.6; // meters per second

AFRAME.registerComponent('smooth-locomotion', {
  init() {
    this.rig = document.querySelector('#camera-rig');
    this.axisX = 0;
    this.axisY = 0;
    this.deadzone = 0.15;
  },

  tick(time, delta) {
    if (!this.rig) return;

    const dt = delta / 1000;

    let x = this.axisX;
    let y = this.axisY;

    // Deadzone
    if (Math.abs(x) < this.deadzone) x = 0;
    if (Math.abs(y) < this.deadzone) y = 0;

    if (x === 0 && y === 0) return;

    const yaw = this.rig.object3D.rotation.y;

    const forward = new THREE.Vector3(
      -Math.sin(yaw),
      0,
      -Math.cos(yaw)
    );

    const right = new THREE.Vector3(
      Math.cos(yaw),
      0,
      -Math.sin(yaw)
    );

    forward.multiplyScalar(-y * speed * dt);
    right.multiplyScalar(x * speed * dt);

    this.rig.object3D.position.add(forward);
    this.rig.object3D.position.add(right);
  },

  events: {
    thumbstickmoved(evt) {
      this.axisX = evt.detail.x;
      this.axisY = evt.detail.y;
    }
  }
});


});

  
// Turn the camera left and right in the right controller
AFRAME.registerComponent('vr-smooth-turn', {
  schema: {
    speed: { type: 'number', default: 90 } // degrees per second
  },

  init() {
    this.rig = document.querySelector('#camera-rig');
    this.axisX = 0;
  },

  tick(time, delta) {
    if (!this.rig) return;

    // delta in seconds
    const dt = delta / 1000;

    if (Math.abs(this.axisX) > 0.2) {
      const rotation = this.rig.getAttribute('rotation');
      rotation.y -= this.axisX * this.data.speed * dt;
      this.rig.setAttribute('rotation', rotation);
    }
  },

  events: {
    thumbstickmoved(evt) {
      // Horizontal axis only
      this.axisX = evt.detail.x;
    }
  }
});

  // Jumping
    AFRAME.registerComponent('player-jump', {
  schema: {
    height: { type: 'number', default: 1.2 },
    gravity: { type: 'number', default: -9.8 }
  },

  init() {
    this.rig = document.querySelector('#camera-rig');
    this.velocityY = 0;
    this.isGrounded = true;

    // Desktop: SPACE
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.jump();
      }
    });

    // VR buttons
    this.el.addEventListener('abuttondown', () => this.jump()); // Right controller (A)
    this.el.addEventListener('xbuttondown', () => this.jump()); // Left controller (X)
  },

  jump() {
    if (!this.isGrounded || !this.rig) return;

    this.velocityY = Math.sqrt(-2 * this.data.gravity * this.data.height);
    this.isGrounded = false;
  },

  tick(time, delta) {
    if (!this.rig || this.isGrounded) return;

    const dt = delta / 1000;
    this.velocityY += this.data.gravity * dt;

    const pos = this.rig.getAttribute('position');
    pos.y += this.velocityY * dt;

    // Ground collision
    if (pos.y <= 0) {
      pos.y = 0;
      this.velocityY = 0;
      this.isGrounded = true;
    }

    this.rig.setAttribute('position', pos);
  }
});
