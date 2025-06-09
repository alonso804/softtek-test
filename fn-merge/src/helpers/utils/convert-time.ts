import { Time } from '../types';

type TimeUnit = 'hours' | 'minutes' | 'seconds' | 'milliseconds';

export const convertTime = ({ hrs = 0, min = 0, sec = 0 }: Time, unit: TimeUnit): number => {
  const timeInMilliseconds = (hrs * 3600 + min * 60 + sec) * 1000;

  if (unit === 'hours') {
    return timeInMilliseconds * Math.pow(3600 * 1000, -1);
  }

  if (unit === 'minutes') {
    return timeInMilliseconds * Math.pow(60 * 1000, -1);
  }

  if (unit === 'seconds') {
    return timeInMilliseconds * Math.pow(1000, -1);
  }

  return timeInMilliseconds;
};
