import lodash from 'lodash';
import Constants from '../constants';

const initialState = {
  isEditing: false,
  isFetching: true,
  isUpdating: false,
  list: [],
  nextHub: null,
}

export default (state = initialState, action) => {
  switch(action.type) {
    case Constants.HUB_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.HUB_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.HUB_EDIT_START: {
      return lodash.assign({}, state, {isEditing: true});
    }

    case Constants.HUB_EDIT_END: {
      return lodash.assign({}, state, {isEditing: false});
    }

    case Constants.HUB_UPDATE_START: {
      return lodash.assign({}, state, {isUpdating: true});
    }

    case Constants.HUB_UPDATE_END: {
      return lodash.assign({}, state, {isUpdating: false});
    }

    case Constants.HUB_SET_LIST: {
      return lodash.assign({}, state, {list: action.list});
    }

    case Constants.HUB_PICK: {
      return lodash.assign({}, state, {nextHub: action.hub});
    }

    default: return state;
  }
}
