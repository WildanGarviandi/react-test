import * as _ from 'lodash';

const camelize = str => {
  const replaceResult = str.replace(/\w\S*/g, txt => {
    const result = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    return result;
  });

  return replaceResult;
};

export function UserFullName(user) {
  if (user) {
    return camelize(
      `${user.FirstName} ${user.LastName} (${user.CountryCode}${user.PhoneNumber})`
    );
  }

  return '';
}

export function FleetName(fleet) {
  return fleet && fleet.CompanyDetail ? fleet.CompanyDetail.CompanyName : '';
}

export function FleetNameWithCapacity(fleet) {
  return fleet && fleet.CompanyDetail
    ? `${fleet.CompanyDetail.CompanyName} (${fleet.OrderCapacity}/${fleet
        .CompanyDetail.OrderVolumeLimit})`
    : '';
}

export function trimString(string, length) {
  return string.substring(0, length);
}

export function capitalize(str) {
  return str.replace(/\w\S*/g, txt => {
    const result = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    return result;
  });
}

export function formatRef(...args) {
  return _.toArray(args).join('/');
}

export function pad(number, width, prefix) {
  const newPrefix = prefix || '0';
  const newNumber = number.toString();
  return newNumber.length >= width
    ? newNumber
    : new Array(width - newNumber.length + 1).join(newPrefix) + newNumber;
}

export function getTimeFormat(i, min) {
  const formattedMin = min || '00';
  return `${pad(i, 2)}:${formattedMin}`;
}
