/* Applies the saved theme before first paint to avoid a light-mode flash. */
(function () {
  try {
    var s = JSON.parse(localStorage.getItem('taskflow_settings') || '{}');
    if (s.theme === 'dark' || s.theme === 'light') document.documentElement.setAttribute('data-theme', s.theme);
  } catch (e) {}
})();
