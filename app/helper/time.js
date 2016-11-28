import moment from 'moment';

function padTwoDigit(x) {
  return x > 10 ? x.toString() : "0" + x.toString();
}

function TimeToHMS(time) {
  const parts = [Math.floor(time/3600), Math.floor((time % 3600) / 60), time % 60];
  const [hour, min, sec] = _.map(parts, padTwoDigit);

  return `${hour}:${min}:${sec}`;
}

export default TimeToHMS;

export function formatDate(datetime) {
    return moment(new Date(datetime)).format('DD MMM YYYY HH:mm:ss')
}