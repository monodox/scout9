from typing import Any, Optional
import json
import time
from pathlib import Path
from app.core.config import settings


class SimpleCache:
    """Simple in-memory and file-based cache"""

    def __init__(self):
        self.memory_cache = {}
        self.cache_dir = Path("./cache")
        self.cache_dir.mkdir(exist_ok=True)
        self.ttl = settings.CACHE_TTL

    def _get_cache_file(self, key: str) -> Path:
        """Get cache file path for a key"""
        return self.cache_dir / f"{key}.json"

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not settings.CACHE_ENABLED:
            return None

        # Check memory cache first
        if key in self.memory_cache:
            data, timestamp = self.memory_cache[key]
            if time.time() - timestamp < self.ttl:
                return data
            else:
                del self.memory_cache[key]

        # Check file cache
        cache_file = self._get_cache_file(key)
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    cached = json.load(f)
                    if time.time() - cached['timestamp'] < self.ttl:
                        data = cached['data']
                        self.memory_cache[key] = (data, cached['timestamp'])
                        return data
                    else:
                        cache_file.unlink()
            except Exception:
                pass

        return None

    def set(self, key: str, value: Any) -> None:
        """Set value in cache"""
        if not settings.CACHE_ENABLED:
            return

        timestamp = time.time()
        self.memory_cache[key] = (value, timestamp)

        # Also save to file
        cache_file = self._get_cache_file(key)
        try:
            with open(cache_file, 'w') as f:
                json.dump({
                    'data': value,
                    'timestamp': timestamp
                }, f)
        except Exception:
            pass

    def delete(self, key: str) -> None:
        """Delete value from cache"""
        if key in self.memory_cache:
            del self.memory_cache[key]

        cache_file = self._get_cache_file(key)
        if cache_file.exists():
            cache_file.unlink()

    def clear(self) -> None:
        """Clear all cache"""
        self.memory_cache.clear()
        for cache_file in self.cache_dir.glob("*.json"):
            cache_file.unlink()


cache = SimpleCache()
