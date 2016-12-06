import * as actionTypes from '../constants';

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
  editWeight: false
};

export default (state = initialUserState, action) => {
  switch(action.type) {
    case actionTypes.LOGIN_START:
      localStorage.clear();
      return _.assign({}, state, {isFetching: true, isValid: false});
    case actionTypes.LOGIN_SUCCESS:
      localStorage.token = action.user.LoginSessionKey;
      localStorage.userID = action.user.UserID;
      return _.assign({}, state, {
        isFetching: false, 
        isValid: true, 
        user: action.user,
        token: action.user.LoginSessionKey,
        userID: action.user.UserID
      });
    case actionTypes.LOGIN_FAILED:
      localStorage.clear();
      return _.assign({}, state, {isFetching: false, isValid: false, message: action.message});
    case actionTypes.AUTH_VALID:
      localStorage.hubID = action.hub && action.hub.HubID;
      localStorage.hubName = action.hub && action.hub.Name;
      localStorage.fleetName = action.user && action.user.User && action.user.User.FirstName + ' ' + action.user.User.LastName;
      return _.assign({}, state, {
        hubID: action.hub && action.hub.HubID,
        hubName: action.hub && action.hub.Name,
        fleetName: action.user && action.user.User && action.user.User.FirstName + ' ' + action.user.User.LastName,
        isCentralHub: action.hub && ("CENTRAL" === action.hub.Type),
        editCOD: action.order.edit_cod, 
        editVolume: action.order.edit_volume,
        editWeight: action.order.edit_weight
      });
    default:
      return state;
  }
};

