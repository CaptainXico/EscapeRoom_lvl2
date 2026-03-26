// audio-unlock.js
// Professional A-Frame audio unlock system
// Fixes browser autoplay restrictions

document.addEventListener("DOMContentLoaded", () => {

  let audioUnlocked = false;

  // Events that count as user interaction
  const unlockEvents = [
    "click",
    "touchstart",
    "keydown"
  ];

  unlockEvents.forEach(event => {
    document.addEventListener(event, unlockAudio, { once: true });
  });

  function unlockAudio() {

    if (audioUnlocked) return;

    const scene = document.querySelector("a-scene");

    if (!scene) {
      console.warn("Audio unlock failed: no scene found");
      return;
    }

    // Resume THREE.js AudioContext
    const audioContext = THREE.AudioContext.getContext();

    if (audioContext.state === "suspended") {

      audioContext.resume().then(() => {

        console.log("🔊 AudioContext resumed successfully");

      }).catch(err => {

        console.error("AudioContext resume failed:", err);

      });

    }

    // Resume all A-Frame sound components
    const soundEntities = scene.querySelectorAll("[sound]");

    soundEntities.forEach(entity => {

      if (entity.components.sound &&
          entity.components.sound.context &&
          entity.components.sound.context.state === "suspended") {

        entity.components.sound.context.resume();

      }

    });

    audioUnlocked = true;

    console.log("🔓 Audio unlocked");

    // Optional: emit event so other scripts can react
    scene.emit("audio-unlocked");

  }

});
