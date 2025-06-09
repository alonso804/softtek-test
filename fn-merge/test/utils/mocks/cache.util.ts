import { CacheUtils, SetProps } from 'src/helpers/utils/cache';
import { convertTime } from 'src/helpers/utils/convert-time';

export class MockedCacheUtils extends CacheUtils {
  #cache: Map<string, { value: unknown; ttl: number }> = new Map();

  constructor() {
    super();
  }

  find<Output>(key: string): Promise<Output | null> {
    console.log(`[Cache] Find: ${key}`);

    const response = this.#cache.get(key) ?? null;

    if (!response) {
      return Promise.resolve(response);
    }

    const { value, ttl } = response;

    if (ttl < Date.now()) {
      this.#cache.delete(key);
      return Promise.resolve(null);
    }

    return Promise.resolve(value as Output);
  }

  set<Input>({ key, value, ttl }: SetProps<Input>): Promise<void> {
    console.log(`[Cache] Set: ${key}`);

    if (!key) {
      throw new Error('Key is required to set cache.');
    }

    const expirationTime = Date.now() + convertTime(ttl, 'milliseconds');

    this.#cache.set(key, { value, ttl: expirationTime });

    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    console.log(`[Cache] Remove: ${key}`);

    this.#cache.delete(key);

    return Promise.resolve();
  }
}
