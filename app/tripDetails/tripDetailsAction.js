import fetchPost from '../modules/fetch/post';
import fetchDelete from '../modules/fetch/delete';
import ModalsActions from '../modules/modals/actions';

export const BROADCAST_START = 'BROADCAST_START';
export const BROADCAST_SUCCESS = 'BROADCAST_SUCCESS';
export const BROADCAST_FAILED = 'BROADCAST_FAILED';

export const CONTAINER_ACTIVE_TOGGLE_START = 'CONTAINER_ACTIVE_TOGGLE_START';
export const CONTAINER_ACTIVE_TOGGLE_SUCCESS = 'CONTAINER_ACTIVE_TOGGLE_SUCCESS';
export const CONTAINER_ACTIVE_TOGGLE_FAILED = 'CONTAINER_ACTIVE_TOGGLE_FAILED';

export const CONTAINER_CLEAR_START = 'CONTAINER_CLEAR_START';
export const CONTAINER_CLEAR_SUCCESS = 'CONTAINER_CLEAR_SUCCESS';
export const CONTAINER_CLEAR_FAILED = 'CONTAINER_CLEAR_FAILED';

export const CONTAINER_CREATE_START = 'CONTAINER_CREATE_START';
export const CONTAINER_CREATE_SUCCESS = 'CONTAINER_CREATE_SUCCESS';
export const CONTAINER_CREATE_FAILED = 'CONTAINER_CREATE_FAILED';

export const CONTAINER_DETAILS_FETCH_START = 'CONTAINER_DETAILS_FETCH_START';
export const CONTAINER_DETAILS_FETCH_SUCCESS = 'CONTAINER_DETAILS_FETCH_SUCCESS';
export const CONTAINER_DETAILS_FETCH_FAILED = 'CONTAINER_DETAILS_FETCH_FAILED';

export const CONTAINER_DISTRICT_PICK = 'CONTAINER_DISTRICT_PICK';
export const CONTAINER_DISTRICT_RESET = 'CONTAINER_DISTRICT_RESET';

export const CONTAINER_FILL_START = 'CONTAINER_FILL_START';
export const CONTAINER_FILL_SUCCESS = 'CONTAINER_FILL_SUCCESS';
export const CONTAINER_FILL_FAILED = 'CONTAINER_FILL_FAILED';

export const CONTAINERS_FETCH_START = 'CONTAINERS_FETCH_START';
export const CONTAINERS_FETCH_SUCCESS = 'CONTAINERS_FETCH_SUCCESS';
export const CONTAINERS_FETCH_FAILED = 'CONTAINERS_FETCH_FAILED';
export const CONTAINERS_SET_CURRENTPAGE = 'CONTAINERS_SET_CURRENTPAGE';
export const CONTAINERS_SET_LIMIT = 'CONTAINERS_SET_LIMIT';
export const CONTAINERS_SET_STATUS = 'CONTAINERS_SET_STATUS';

export const CONTAINERS_STATUS_FETCH = 'CONTAINERS_STATUS_FETCH';
export const CONTAINERS_STATUS_SUCCESS = 'CONTAINERS_STATUS_SUCCESS';
export const CONTAINERS_STATUS_FAILED = 'CONTAINERS_STATUS_FAILED';

export const ORDER_PREPARE_FETCH_START = 'ORDER_PREPARE_FETCH_START';
export const ORDER_PREPARE_FETCH_SUCCESS = 'ORDER_PREPARE_FETCH_SUCCESS';
export const ORDER_PREPARE_FETCH_FAILED = 'ORDER_PREPARE_FETCH_FAILED';

export const ORDER_PREPARE_SET_CURRENTPAGE = 'ORDER_PREPARE_SET_CURRENTPAGE';
export const ORDER_PREPARE_SET_IDS = 'ORDER_PREPARE_SET_IDS';
export const ORDER_PREPARE_SET_LIMIT = 'ORDER_PREPARE_SET_LIMIT';
export const ORDER_PREPARE_TOGGLE = 'ORDER_PREPARE_TOGGLE';
export const ORDER_PREPARE_TOGGLE_ALL = 'ORDER_PREPARE_TOGGLE_ALL';

export const ORDER_REMOVE_START = 'ORDER_REMOVE_START';
export const ORDER_REMOVE_SUCCESS = 'ORDER_REMOVE_SUCCESS';
export const ORDER_REMOVE_FAILED = 'ORDER_REMOVE_FAILED';

export const DistrictActions = {
  DISTRICT_SET_START: 'DISTRICT_SET_START',
  DISTRICT_SET_SUCCESS:'DISTRICT_SET_SUCCESS',
  DISTRICT_SET_FAILED: 'DISTRICT_SET_FAILED',
};

export const DriversActions = {
  DRIVERS_PICK_START: 'DRIVERS_PICK_START',
  DRIVERS_PICK_SUCCESS: 'DRIVERS_PICK_SUCCESS',
  DRIVERS_PICK_FAILED: 'DRIVERS_PICK_FAILED',
};

export const containerDistrictPick = (containerID, districtID) => ({type: CONTAINER_DISTRICT_PICK, containerID: containerID, districtID: districtID});

export const containerDistrictReset = (containerID) => ({type: CONTAINER_DISTRICT_RESET, containerID: containerID});

export function orderRemove (orderID) {
  return (dispatch, getState) => {
    const {tripDetails, userLogged} = getState().app;
    const {token} = userLogged;
    const {trip} = tripDetails;

    const body = {
      ordersID: [orderID],
    };

    dispatch({type: actionTypes.ORDER_REMOVE_START, orderID: orderID});
    fetchDelete('/trip/' + trip.TripID + '/orders', token, body).then(function(response) {
      if(response.ok) {
        response.json().then(({data}) => {
          dispatch({type: actionTypes.ORDER_REMOVE_SUCCESS, orderID: orderID});
        });
      } else {
        dispatch(ModalsActions.addError('Failed to remove order'));
        response.json().then(function(response) {
          dispatch({type: actionTypes.ORDER_REMOVE_FAILED, orderID: orderID});
        })
      }
    }).catch(() => {
      dispatch(ModalsActions.addError('Network error while removing order'));
    });
  }
}

export function orderToggleAll (active) {
  return ({type: actionTypes.ORDER_PREPARE_TOGGLE_ALL, status: !active});
}

export function orderToggle (id) {
  return ({type: actionTypes.ORDER_PREPARE_TOGGLE, id: id});
}