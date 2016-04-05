import * as actionTypes from '../constants';
import containerDetails from './containerDetails';
import containerStatus from './containerStatus';

const initialState = { isFetching: false, isValid: true, containers: {}, limit: 10, currentPage: 1, total: 0, shown: [] };

export default (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.CONTAINERS_FETCH_START:
      return _.assign({}, state, {isFetching: true, isValid: false});
    case actionTypes.CONTAINERS_FETCH_SUCCESS: 
    {
      const containers = _.map(action.containers, (container) => (containerStatus(container, action)));
      return _.assign({}, state, {
        isFetching: false, 
        isValid: true,
        total: action.total,
        shown: _.map(action.containers, (container) => (container.ContainerID)),
        containers: _.reduce(containers, (containers, container) => {
          containers[container.ContainerID] = container;
          return containers;
        }, _.assign({}, state.containers))
      });
    }
    case actionTypes.CONTAINERS_FETCH_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    case actionTypes.CONTAINERS_SET_LIMIT:
      return _.assign({}, state, {limit: action.limit});
    case actionTypes.CONTAINERS_SET_CURRENTPAGE:
      return _.assign({}, state, {currentPage: action.currentPage});
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_START:
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_SUCCESS:
    case actionTypes.CONTAINER_ACTIVE_TOGGLE_FAILED:
    {
      const containers = _.map(state.containers, (container) => (containerStatus(container, action)));
      return _.assign({}, state, {
        containers: _.reduce(containers, (containers, container) => {
          containers[container.ContainerID] = container;
          return containers;
        }, _.assign({}, state.containers))
      });
    }
    case actionTypes.CONTAINER_CREATE_START:
      return _.assign({}, state, {isCreating: true, isCreateError: false});
    case actionTypes.CONTAINER_CREATE_SUCCESS:
      return _.assign({}, state, {isCreating: false, isCreateError: false});
    case actionTypes.CONTAINER_CREATE_FAILED: 
      return _.assign({}, state, {isCreating: false, isCreateError: true});

    case actionTypes.CONTAINER_DETAILS_FETCH_START:
    case actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS:
    case actionTypes.CONTAINER_DETAILS_FETCH_FAILED:
      const container = state.containers[action.ContainerID];
      return _.assign({}, state, {
        active: parseInt(action.ContainerID),
        containers: _.assign({}, state.containers, {
          [action.ContainerID]: containerDetails(container, action)
        })
      });
    case actionTypes.ORDER_REMOVE_START:
    case actionTypes.ORDER_REMOVE_SUCCESS:
    case actionTypes.ORDER_REMOVE_FAILED:
    case actionTypes.CONTAINER_DISTRICT_PICK:
    case actionTypes.CONTAINER_DISTRICT_RESET:
    {
      const containers = _.map(state.containers, (container) => (containerDetails(container, action)));
      return _.assign({}, state, {
        containers: _.reduce(containers, (containers, container) => {
          containers[container.ContainerID] = container;
          return containers;
        }, _.assign({}, state.containers))
      });
    }
    default:
      return state;
  }
}
