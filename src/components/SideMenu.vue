<template>
  <div class="side-menu-overlay" @click="$emit('close')">
    <div class="side-menu" @click.stop>
      <button class="close-button" @click="$emit('close')">✖</button>
      <ul>
        <li><button @click="$emit('navigate', 'openAccount')">Open a New Account</button></li>
        <li><button @click="$emit('navigate', 'paySomeone')">Pay Someone</button></li>
        <li><button @click="$emit('navigate', 'updateProfile')">Update Profile</button></li>
      </ul>
      <button class="logout-button" @click="$emit('navigate', 'logout')">Logout</button>
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.side-menu {
  width: 300px;
  height: 100%;
  background: #ffffff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

.close-button {
  border: none;
  background: none;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  align-self: flex-end;
  margin-bottom: 20px;
  transition: transform 0.2s;
}

.close-button:hover {
  transform: rotate(90deg);
  background: none;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

li {
  margin: 15px 0;
}

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s, transform 0.2s;
}

button:hover {
  background: #1e40af;
  transform: translateY(-2px);
}

.logout-button {
  margin-top: auto;
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s, transform 0.2s;
}

.logout-button:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from {
    background-color: rgba(0, 0, 0, 0);
  }
  to {
    background-color: rgba(0, 0, 0, 0.5);
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
