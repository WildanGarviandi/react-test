import * as actionTypes from '../constants';

const initialUserState = {
  isFetching: false,
  isValid: true, 
  user: {},
  token: localStorage.token,
  userID: localStorage.userID,
  hubID: localStorage.hubID
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
      localStorage.hubID = action.hub.HubID;
      return _.assign({}, state, {hubID: action.hub.HubID});
    default:
      return state;
  }
};

