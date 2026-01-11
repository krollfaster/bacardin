// script.js - Adaptive Precision Meeting Scheduler Widget

const eventEl = document.getElementById('event');
const timeBar = document.querySelector('.time-bar');
const toggleBtn = document.getElementById('toggle-slow');

let isDragging = false;
let startX = 0;
let startLeft = 0;
let startWidth = 0;
let lastMoveTime = 0;
let lastMoveX = 0;
let slowMotion = false;

// Helper to get percentage position relative to timeBar width
function pxToPercent(px) {
  return (px / timeBar.clientWidth) * 100;
}

function percentToPx(percent) {
  return (percent / 100) * timeBar.clientWidth;
}

function onMouseDown(e) {
  if (e.target !== eventEl) return;
  isDragging = true;
  startX = e.clientX;
  const rect = eventEl.getBoundingClientRect();
  const barRect = timeBar.getBoundingClientRect();
  startLeft = ((rect.left - barRect.left) / barRect.width) * 100; // percent
  startWidth = (rect.width / barRect.width) * 100; // percent
  eventEl.classList.add('dragging');
  lastMoveTime = Date.now();
  lastMoveX = e.clientX;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
  if (!isDragging) return;
  const deltaX = e.clientX - startX;
  const deltaPercent = pxToPercent(deltaX);

  // Determine new left and width (simple resize from right edge)
  let newLeft = startLeft;
  let newWidth = startWidth + deltaPercent;

  // Clamp values
  if (newWidth < 5) newWidth = 5; // minimum 5% width
  if (newLeft + newWidth > 100) newWidth = 100 - newLeft;

  // Adaptive precision: if drag speed is slow, snap to 5% increments (≈ 5‑minute steps)
  const now = Date.now();
  const elapsed = now - lastMoveTime; // ms
  const distance = Math.abs(e.clientX - lastMoveX);
  const speed = distance / elapsed; // px per ms
  if (speed < 0.2) { // slow drag
    newWidth = Math.round(newWidth / 5) * 5; // snap to 5% steps
  }

  eventEl.style.left = `${newLeft}%`;
  eventEl.style.width = `${newWidth}%`;

  // Update last move for next speed calculation
  lastMoveTime = now;
  lastMoveX = e.clientX;
}

function onMouseUp() {
  if (!isDragging) return;
  isDragging = false;
  eventEl.classList.remove('dragging');
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

function toggleSlowMotion() {
  slowMotion = !slowMotion;
  if (slowMotion) {
    timeBar.style.transition = 'all 0.5s ease';
    eventEl.style.transition = 'all 0.5s ease';
  } else {
    timeBar.style.transition = '';
    eventEl.style.transition = '';
  }
}

// Initial placement (20% left, 30% width) – matches CSS default
eventEl.style.left = '20%';
eventEl.style.width = '30%';

// Event listeners
eventEl.addEventListener('mousedown', onMouseDown);
if (toggleBtn) toggleBtn.addEventListener('click', toggleSlowMotion);

// Export for testing (optional)
export { onMouseDown, onMouseMove, onMouseUp, toggleSlowMotion };
