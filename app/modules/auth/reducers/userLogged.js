import * as actionTypes from '../constants'; //eslint-disable-line

const initialUserState = {
  isFetching: false,
  isValid: true,
  user: {},
  token: localStorage.token,
  userID: localStorage.userID,
  hubID: localStorage.hubID,
  hubName: localStorage.hubName,
  fleetName: localStorage.fleetName,
  isCentralHub: false,
  editCOD: false,
  editVolume: false,
  editWeight: false,
  roleName: null,
};

export default (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      localStorage.clear();
      return Object.assign({}, state, {
        isFetching: true,
        isValid: false,
      });
    case actionTypes.LOGIN_SUCCESS:
      localStorage.token = action.user.LoginSessionKey;
      localStorage.userID = action.user.UserID;
      return Object.assign({}, state, {
        isFetching: false,
        isValid: true,
        user: action.user,
        token: action.user.LoginSessionKey,
        userID: action.user.UserID,
      });
    case actionTypes.LOGIN_FAILED:
      localStorage.clear();
      return Object.assign({}, state, {
        isFetching: false,
        isValid: false,
        message: action.message,
      });
    case actionTypes.AUTH_VALID:
      localStorage.hubID = action.hub && action.hub.HubID;
      localStorage.hubName = action.hub && action.hub.Name;
      localStorage.fleetName = action.user && action.user.User && action.user.User.CompanyDetail &&
        action.user.User.CompanyDetail.CompanyName;
      return Object.assign({}, state, {
        hubID: action.hub && action.hub.HubID,
        user: action.user,
        hubName: action.hub && action.hub.Name,
        fleetName: action.user && action.user.User && action.user.User.CompanyDetail &&
        action.user.User.CompanyDetail.CompanyName,
        isCentralHub: action.hub && (action.hub.Type === 'CENTRAL'),
        editCOD: action.order && action.order.edit_cod,
        editVolume: action.order && action.order.edit_volume,
        editWeight: action.order && action.order.edit_weight,
        roleName: action.hub ? action.hub.Role.Name : null,
      });
    case actionTypes.AUTH_INVALID:
      localStorage.clear();
      return Object.assign({}, state, {
        token: null,
      });
    case actionTypes.LOGOUT_SUCCESS:
      localStorage.clear();
      return Object.assign({}, state, {
        token: null,
      });
    default:
      return state;
  }
};

