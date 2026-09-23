/* LAAU DEL private browser state. Server session and course grants remain authoritative. */
(function () {
  "use strict";
  const scope = window.__LAAU_DEL_SCOPE__;
  if (typeof scope !== "string" || !/^[a-f0-9]{64}$/.test(scope)) throw new Error("Lab session context unavailable");
  function scoped(storeName) {
    const fallback = new Map();
    const key = name => "laau.del." + scope + "." + String(name);
    return Object.freeze({
      getItem(name) { try { return window[storeName].getItem(key(name)); } catch { return fallback.get(key(name)) ?? null; } },
      setItem(name, value) { fallback.set(key(name), String(value)); try { window[storeName].setItem(key(name), String(value)); } catch {} },
      removeItem(name) { fallback.delete(key(name)); try { window[storeName].removeItem(key(name)); } catch {} }
    });
  }
  window.LAAUDelStorage = Object.freeze({local: scoped("localStorage"), session: scoped("sessionStorage")});
})();
