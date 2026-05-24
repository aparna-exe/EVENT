// EventPass Toast Utility — replaces alert() with styled toasts
(function () {
  const div = document.createElement('div');
  div.id = 'ep-toast';
  document.body.appendChild(div);

  let hideTimer;

  window.showToast = function (message, type = 'info', duration = 3000) {
    div.textContent = message;
    div.className = 'show ' + type;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { div.className = ''; }, duration);
  };

  // Override native alert globally
  window.alert = function (msg) {
    showToast(String(msg), 'info', 3500);
  };
})();
