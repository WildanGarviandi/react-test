import * as actionTypes from '../constants';
import {DistrictActions, DriversActions} from '../constants';
import containerDetails from './containerDetails';
import containerStatus from './containerStatus';

const initialListState = {
  currentPage: 1,
  limit: 100,
  status: [0],
  statusName: "SHOW ALL",
}

function ListReducer(state, action) {
  switch(action.type) {
    case actionTypes.CONTAINERS_SET_CURRENTPAGE:
      return _.assign({}, state, {currentPage: action.currentPage});
    case actionTypes.CONTAINERS_SET_LIMIT:
      return _.assign({}, state, {limit: action.limit});
    case actionTypes.CONTAINERS_SET_STATUS:
      return _.assign({}, state, {status: action.status, statusName: action.name});

    default: return state;
  }
}

const initialContainerListState = {
  myContainer: _.assign({}, initialListState),
}

function ContainerListReducer(state = initialContainerListState, action) {
  return _.assign({}, state, {
    myContainer: ListReducer(state.myContainer, action),
  });
}

const initialState = {
  containers: {},
  groups: {},
  isFetching: false,
  isValid: true,
  shown: [],
  statusList: {},
  total: 0,
};

function ContainersReducer(state = initialState, action) {
  switch(action.type) {
    case actionTypes.CONTAINERS_FETCH_START:
      return _.assign({}, state, {isFetching: true, isValid: false});
    case actionTypes.CONTAINERS_FETCH_SUCCESS: 
    {
      const containers = _.map(action.containers, (container) => (containerStatus(container, action)));
      return _.assign({}, state, {
        containers: _.reduce(containers, (containers, container) => {
          containers[container.ContainerID] = container;
          return containers;
        }, _.assign({}, state.containers)),
        groups: action.groups,
        isFetching: false, 
        isValid: true,
        shown: _.map(action.containers, (container) => (container.ContainerID)),
        total: action.total,
      });
    }
    case actionTypes.CONTAINERS_FETCH_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    case actionTypes.CONTAINERS_STATUS_SUCCESS:
      return _.assign({}, state, {
        statusList: action.statusList,
        statusCategory: action.statusCategory
      });
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

    case DistrictActions.DISTRICT_SET_START:
    case DistrictActions.DISTRICT_SET_SUCCESS:
    case DistrictActions.DISTRICT_SET_FAILED:
    case DriversActions.DRIVERS_PICK_START:
    case DriversActions.DRIVERS_PICK_SUCCESS:
    case DriversActions.DRIVERS_PICK_FAILED:

    case actionTypes.CONTAINER_DETAILS_FETCH_START:
    case actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS:
    case actionTypes.CONTAINER_DETAILS_FETCH_FAILED:
    case actionTypes.CONTAINER_CLEAR_START:
    case actionTypes.CONTAINER_CLEAR_SUCCESS:
    case actionTypes.CONTAINER_CLEAR_FAILED:
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

export default {
  containers: ContainersReducer,
  containerList: ContainerListReducer,
}
