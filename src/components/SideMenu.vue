<template>
  <div class="side-menu-overlay" @click="$emit('close')">
    <div class="side-menu" @click.stop>
      <button class="close-button" @click="$emit('close')">✖</button>
      <ul class="space-y-3">
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'openAccount')">Open New Account</button></li>
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'paySomeone')">Pay Someone</button></li>
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'transactionHistory')">Transaction History</button></li>
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'updateProfile')">Update Profile</button></li>
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'viewProfile')">View Profile</button></li>
        <li><button class="btn btn-primary w-full text-left" @click="$emit('navigate', 'notificationSettings')">Notification Settings</button></li>
      </ul>
      <button class="btn btn-danger w-full mt-auto" @click="$emit('navigate', 'logout')">Logout</button>
    </div>
  <!-- Click on backdrop (but not on panel) to close -->
  <div
    class="side-menu-overlay animate-fade-in"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    tabindex="-1"
  >
    <aside class="side-menu card-surface animate-slide-in" role="dialog" aria-label="Quick actions">
      <!-- Header -->
      <div class="menu-header">
        <div class="menu-title">
          <span class="menu-icon">⋯</span>
          <h3 class="title">Quick Actions</h3>
        </div>
        <button class="icon-button close-button" aria-label="Close menu" @click="$emit('close')">✕</button>
      </div>

      <div class="menu-body">
        <!-- Primary actions -->
        <nav class="menu-group">
          <button class="menu-item" @click="$emit('navigate', 'openAccount')">
            <span class="item-icon bg-teal-500/10 text-teal-600">＋</span>
            <div class="item-text">
              <span class="item-title">Open New Account</span>
              <span class="item-sub">Create a Savings or Fixed Savings account</span>
            </div>
          </button>

          <button class="menu-item" @click="$emit('navigate', 'paySomeone')">
            <span class="item-icon bg-indigo-500/10 text-indigo-600">⇄</span>
            <div class="item-text">
              <span class="item-title">Pay Someone</span>
              <span class="item-sub">Send money to a beneficiary</span>
            </div>
          </button>

          <button class="menu-item" @click="$emit('navigate', 'updateProfile')">
            <span class="item-icon bg-amber-500/10 text-amber-600">⚙</span>
            <div class="item-text">
              <span class="item-title">Update Profile</span>
              <span class="item-sub">Keep your details up to date</span>
            </div>
          </button>
        </nav>

        <!-- Divider -->
        <hr class="divider" />

        <!-- Danger zone -->
        <button class="logout-button" @click="$emit('navigate', 'logout')">
          <span class="item-icon bg-rose-500/10 text-rose-600">⎋</span>
          <span class="item-title">Logout</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
// No additional logic required. The overlay handles backdrop click and ESC to close.
</script>

<style scoped>
/* Overlay */
.side-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.45); /* slate-900/45 */
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  z-index: 1000;
}

/* Panel */
.side-menu {
  width: min(92vw, 380px);
  height: 100%;
  border-left: 1px solid rgba(203, 213, 225, 0.9); /* slate-300 */
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Subtle conic glow edge */
.card-surface::before {
  content: "";
  position: absolute;
  inset: -2px 0 -2px -2px;
  background: linear-gradient(180deg, rgba(13,148,136,.15), rgba(59,130,246,.15));
  filter: blur(16px);
  opacity: .35;
  pointer-events: none;
}

/* Header */
.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 12px 18px;
  position: sticky;
  top: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,.96), rgba(255,255,255,.88));
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  z-index: 1;
}

.menu-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  width: 28px;
  border-radius: 9999px;
  background: rgba(20, 184, 166, 0.12); /* teal-500/12 */
  color: #0f766e; /* teal-700 */
  font-weight: 700;
}

.title {
  font-weight: 700;
  font-size: 1.05rem;
  color: #0f766e; /* deep-teal tone */
  letter-spacing: -0.01em;
}

/* Close button */
.icon-button {
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: white;
  color: #334155; /* slate-700 */
  border-radius: 10px;
  height: 34px;
  width: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform .16s ease, background .16s ease, box-shadow .16s ease;
}
.icon-button:hover {
  background: #f8fafc; /* slate-50 */
  transform: rotate(0deg) scale(1.04);
  box-shadow: 0 6px 14px -10px rgba(2, 6, 23, 0.25);
}

/* Content */
.menu-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 14px 18px 14px;
  height: 100%;
}

/* Action list */
.menu-group {
  display: grid;
  gap: 10px;
}

/* Action item */
.menu-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  text-align: left;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  transition: transform .16s ease, box-shadow .16s ease, background .16s ease;
}
.menu-item:hover {
  background: #f8fafc; /* slate-50 */
  transform: translateY(-1px);
  box-shadow: 0 12px 22px -16px rgba(2, 6, 23, 0.3);
}
.item-icon {
  height: 34px;
  width: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.item-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.item-title {
  color: #0f172a; /* slate-900 */
  font-weight: 600;
}
.item-sub {
  color: #64748b; /* slate-500 */
  font-size: .82rem;
}

/* Divider */
.divider {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(226,232,240,.9), transparent);
  margin: 6px 6px 2px;
}

/* Logout */
.logout-button {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  background: #fff1f2; /* rose-50 */
  color: #be123c; /* rose-700 */
  border: 1px solid #fecdd3; /* rose-200 */
  font-weight: 600;
  cursor: pointer;
  transition: background .16s ease, transform .16s ease, box-shadow .16s ease;
}
.logout-button:hover {
  background: #ffe4e6; /* rose-100 */
  transform: translateY(-1px);
  box-shadow: 0 10px 20px -16px rgba(190, 18, 60, 0.35);
}

/* Animations */
@keyframes slideIn {
  from { transform: translateX(100%); }
  to   { transform: translateX(0%); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-slide-in { animation: slideIn .25s ease-out; }
.animate-fade-in { animation: fadeIn .2s ease-out; }
</style>