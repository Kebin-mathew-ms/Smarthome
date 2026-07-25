class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlSeconds = 300) {
    const expireAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expireAt });
  }

  get(key) {
    const data = this.cache.get(key);
    if (!data) return null;
    if (Date.now() > data.expireAt) {
      this.cache.delete(key);
      return null;
    }
    return data.value;
  }

  del(key) {
    this.cache.delete(key);
  }

  flush() {
    this.cache.clear();
  }
}

module.exports = new MemoryCache();
