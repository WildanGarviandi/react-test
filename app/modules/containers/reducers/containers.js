import * as actionTypes from '../constants';
import containerDetails from './containerDetails';
import containerStatus from './containerStatus';

const initialState = { isFetching: false, isValid: true, containers: [] };

export default (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.CONTAINERS_FETCH_START:
      return _.assign({}, state, {isFetching: true, isValid: false});
    case actionTypes.CONTAINERS_FETCH_SUCCESS:
      return _.assign({}, state, {
        isFetching: false, 
        isValid: true, 
        containers: _.map(action.containers, (container) => (containerStatus(container, action)))
      });
    case actionTypes.CONTAINERS_FETCH_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_START:
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_SUCCESS:
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_FAILED:
      return _.assign({}, state, {
        containers: _.map(state.containers, (container) => containerStatus(container, action))});
    case actionTypes.CONTAINER_CREATE_START:
      return _.assign({}, state, {isCreating: true, isCreateError: false});
    case actionTypes.CONTAINER_CREATE_SUCCESS:
      return _.assign({}, state, {isCreating: false, isCreateError: false});
    case actionTypes.CONTAINER_CREATE_FAILED: 
      return _.assign({}, state, {isCreating: false, isCreateError: true});
    case actionTypes.CONTAINER_DETAILS_FETCH_START:
      return _.assign({}, state, {
        active: parseInt(action.ContainerID),
        containers: _.map(state.containers, (container) => containerDetails(container, action))
      });
    case actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS:
    case actionTypes.CONTAINER_DETAILS_FETCH_FAILED:
    case actionTypes.ORDER_REMOVE_START:
    case actionTypes.ORDER_REMOVE_SUCCESS:
    case actionTypes.ORDER_REMOVE_FAILED:
    case actionTypes.CONTAINER_DISTRICT_PICK:
    case actionTypes.CONTAINER_DISTRICT_RESET:
      return _.assign({}, state, {
        containers: _.map(state.containers, (container) => containerDetails(container, action))
      });
    default:
      return state;
  }
}
