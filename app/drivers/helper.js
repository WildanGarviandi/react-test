import { getTimeFormat } from '../helper/utility';

export default function getWorkingHourList(startLimit) {
  const list = [];

  for (let i = startLimit.hour; i < 24; i += 1) {
    const time = getTimeFormat(i);
    list.push({
      id: i,
      name: time
    });
  }

  return list;
}
