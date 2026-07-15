// Client-side auth shim that delegates to serverless endpoints.
(function(global){
  function generateDeviceId() {
    const randomPart = `${Date.now()}-${Date.now().toString(36)}`;
    return `d-${randomPart}-${Date.now()}`;
  }

  function getStoredDeviceId() {
    try {
      return localStorage.getItem('worm_device_id');
    } catch (error) {
      console.warn('Unable to read device id from storage.', error);
      return null;
    }
  }

  function setStoredDeviceId(deviceId) {
    try {
      localStorage.setItem('worm_device_id', deviceId);
    } catch (error) {
      console.warn('Unable to store device id.', error);
    }
  }

  async function login(username, password) {
    let deviceId = getStoredDeviceId();
    if (!deviceId) {
      deviceId = generateDeviceId();
      setStoredDeviceId(deviceId);
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, deviceId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Login failed' }));
        return { ok: false, message: err.message || 'Invalid credentials' };
      }
      const data = await res.json();
      return { ok: true, role: data.role };
    } catch (error) {
      console.error('Login failed:', error);
      return { ok: false, message: 'Network error' };
    }
  }

  async function logout() {
    try {
      const deviceId = getStoredDeviceId();
      await fetch('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId }) });
    } catch (error) {
      console.warn('Logout request failed.', error);
    }

    try {
      window.location.href = '/login.html';
    } catch (error) {
      console.warn('Unable to redirect after logout.', error);
    }
  }

  async function isAuthenticated() {
    try {
      const res = await fetch('/api/session');
      if (!res.ok) return false;
      const d = await res.json();
      return !!d.authenticated;
    } catch (error) {
      console.warn('Session check failed.', error);
      return false;
    }
  }

  async function getUser() {
    try {
      const res = await fetch('/api/session');
      if (!res.ok) return null;
      const d = await res.json();
      return d.user || null;
    } catch (error) {
      console.warn('User lookup failed.', error);
      return null;
    }
  }

  global.auth = { login, logout, isAuthenticated, getUser };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.addEventListener('click', () => { logout(); });
    }
  });
})(window);
