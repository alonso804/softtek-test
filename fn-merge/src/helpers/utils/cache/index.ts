import { Time } from 'src/helpers/types';

export type SetProps<T> = {
  key: string;
  value: T;
  ttl: Time;
};

export abstract class CacheUtils {
  abstract find<Output>(key: string): Promise<Output | null>;

  abstract set<Input>(data: SetProps<Input>): Promise<void>;

  abstract remove(key: string): Promise<void>;

  async findOrSet<Fn extends (...args: unknown[]) => Promise<Return>, Input, Return>(
    props: Omit<SetProps<Input>, 'value'>,
    fn: Fn,
  ): Promise<Return> {
    const data = await this.find<Input>(props.key);

    if (data) {
      return data as Return;
    }

    const value = await fn();

    await this.set({ ...props, value });

    return value;
  }
}
