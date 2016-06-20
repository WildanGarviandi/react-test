function camelize(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export function UserFullName(user) {
  if(user) {
    return camelize(`${user.FirstName} ${user.LastName} (${user.CountryCode}${user.PhoneNumber})`);
  }

  return '';
};

export function FleetName(fleet) {
  return fleet && fleet.CompanyDetail ? fleet.CompanyDetail.CompanyName : '';
};