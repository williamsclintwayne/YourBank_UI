<template>
  <div class="side-menu-overlay" @click="$emit('close')">
    <div class="side-menu" @click.stop>
      <button class="close-button" @click="$emit('close')">✖</button>
      <ul class="space-y-3">
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'openAccount')">Open New Account</button></li>
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'paySomeone')">Pay Someone</button></li>
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'updateProfile')">Update Profile</button></li>
      </ul>
      <button class="btn btn-danger w-full mt-auto" @click="$emit('navigate', 'logout')">Logout</button>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed for this component
</script>

<style scoped>
.side-menu-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.side-menu {
  width: 300px;
  height: 100%;
  background: var(--yb-white);
  box-shadow: -3px 0 15px rgba(0, 0, 0, 0.15);
  padding: 20px;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

.close-button {
  border: none;
  background: none;
  font-size: 24px;
  color: var(--yb-medium-grey);
  cursor: pointer;
  align-self: flex-end;
  margin-bottom: 20px;
  transition: transform 0.2s, color 0.2s;
  padding: 5px;
  line-height: 1;
}

.close-button:hover {
  transform: rotate(90deg);
  color: var(--yb-deep-teal);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

@keyframes fadeIn {
  from {
    background-color: rgba(0, 0, 0, 0);
  }
  to {
    background-color: rgba(0, 0, 0, 0.6);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
