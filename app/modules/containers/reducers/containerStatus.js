import * as actionTypes from '../constants';

const status = (active) => {
  return (active ? 'Active' : 'NotActive');
}

export default (state = {}, action) => {
  switch(action.type) {
    case actionTypes.CONTAINERS_FETCH_SUCCESS:
      return _.assign({}, state, {status: status(state.Active)});
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_START:
      if(state.ContainerID == action.id) {
        return _.assign({}, state, {status: 'Loading'});
      } else return state;
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_SUCCESS:
      if(state.ContainerID == action.container.ContainerID) {
        return _.assign({}, state, {status: status(action.container.Active)});
      } else return state;
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_FAILED:
      if(state.ContainerID == action.id) {
        return _.assign({}, state, {status: status(state.Active)});
      } else return state;
    default: 
      return state;
  }
}
