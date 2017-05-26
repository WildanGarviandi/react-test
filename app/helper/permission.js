import * as _ from 'lodash'; //eslint-disable-line

import config from '../config/configValues.json';

const checkPermission = (userLogged, permissionType) => {
  const roleName = userLogged.roleName;
  const rolePermission = _.get(config.rolePermission, roleName);
  const hasPermission = _.get(rolePermission, permissionType);
  return hasPermission;
};

exports.checkPermission = checkPermission;
