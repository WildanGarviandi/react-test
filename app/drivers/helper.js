import { getTimeFormat } from '../helper/utility';

export default function getWorkingHourList() {
  const list = [];

  for (let i = 0; i < 24; i += 1) {
    const time = getTimeFormat(i);
    list.push({
      id: i,
      name: time
    });
  }

  return list;
}
