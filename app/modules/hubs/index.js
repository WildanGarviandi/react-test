import ModalActions from '../modals/actions'; //eslint-disable-line
import fetchGet from '../fetch/get';
import fetchPost from '../fetch/post';
import { SetTrip } from '../inboundTripDetails';
import { modalAction } from '../modals/constants';

const HUB_EDIT_END = 'HUB_EDIT_END';
const HUB_EDIT_START = 'HUB_EDIT_START';
const HUB_NEXT_FETCH_END = 'HUB_NEXT_FETCH_END';
const HUB_NEXT_FETCH_START = 'HUB_NEXT_FETCH_START';
const HUB_NEXT_SET_LIST = 'HUB_NEXT_SET_LIST';
const HUB_FETCH_END = 'HUB_FETCH_END';
const HUB_FETCH_START = 'HUB_FETCH_START';
const HUB_SET_LIST = 'HUB_SET_LIST';
const HUB_PICK = 'HUB_PICK';
const HUB_UPDATE_END = 'HUB_UPDATE_END';
const HUB_UPDATE_START = 'HUB_UPDATE_START';

const initialState = {
  isEditing: false,
  isFetching: true,
  isUpdating: false,
  list: [],
  nextHub: null,
};

export default function Reducer(state = initialState, action) {
  switch (action.type) {
    case HUB_NEXT_FETCH_START: {
      return Object.assign({}, state, { isFetching: true });
    }

    case HUB_NEXT_FETCH_END: {
      return Object.assign({}, state, { isFetching: false });
    }

    case HUB_FETCH_START: {
      return Object.assign({}, state, { isFetching: true });
    }

    case HUB_FETCH_END: {
      return Object.assign({}, state, { isFetching: false });
    }

    case HUB_EDIT_START: {
      return Object.assign({}, state, { isEditing: true });
    }

    case HUB_EDIT_END: {
      return Object.assign({}, state, { isEditing: false });
    }

    case HUB_UPDATE_START: {
      return Object.assign({}, state, { isUpdating: true });
    }

    case HUB_UPDATE_END: {
      return Object.assign({}, state, { isUpdating: false });
    }

    case HUB_NEXT_SET_LIST: {
      return Object.assign({}, state, { list: action.list });
    }

    case HUB_SET_LIST: {
      return Object.assign({}, state, { list: action.list });
    }

    case HUB_PICK: {
      return Object.assign({}, state, { nextHub: action.hub });
    }

    default: return state;
  }
}

export function startEdit() {
  return (dispatch) => {
    dispatch({ type: HUB_EDIT_START });
  };
}

export function endEdit() {
  return (dispatch) => {
    dispatch({ type: HUB_EDIT_END });
  };
}

export function setHub(tripID, hubID) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    const query = {
      DestinationHubID: hubID,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });
    dispatch({ type: HUB_UPDATE_START });
    fetchPost(`/trip/${tripID}/setdestination`, token, query).then((response) => {
      if (response.ok) {
        response.json().then(({ data }) => {
          dispatch({ type: HUB_PICK, hub: hubID });
          dispatch({ type: HUB_UPDATE_END });
          dispatch({ type: HUB_EDIT_END });
          dispatch({ type: modalAction.BACKDROP_HIDE });
          dispatch(SetTrip(data, true));
        });
      } else {
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch({ type: HUB_UPDATE_END });
        dispatch(ModalActions.addMessage('Failed to set next destination'));
      }
    }).catch(() => {
      dispatch({ type: HUB_UPDATE_END });
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage('Network error while setting destination'));
    });
  };
}

export function fetchNextDestinationList() {
  return (dispatch, getState) => {
    const { hubs, userLogged } = getState().app;
    const { token } = userLogged;

    if (hubs.list.length > 0) return;

    dispatch({ type: HUB_NEXT_FETCH_START });
    fetchGet('/hub/nextDestinationOption', token).then((response) => {
      if (response.ok) {
        response.json().then(({ data }) => {
          dispatch({
            type: HUB_NEXT_SET_LIST,
            list: data,
          });
          dispatch({ type: HUB_NEXT_FETCH_END });
        });
      } else {
        dispatch({ type: HUB_NEXT_FETCH_END });
        dispatch(ModalActions.addMessage('Failed to set hub'));
      }
    }).catch(() => {
      dispatch({ type: HUB_NEXT_FETCH_END });
      dispatch(ModalActions.addMessage('Network error while setting hub'));
    });
  };
}

export function fetchList() {
  return (dispatch, getState) => {
    const { hubs, userLogged } = getState().app;
    const { token } = userLogged;

    if (hubs.list.length > 0) return;

    dispatch({ type: modalAction.BACKDROP_SHOW });
    dispatch({ type: HUB_FETCH_START });
    fetchGet('/hub', token).then((response) => {
      if (response.ok) {
        response.json().then(({ data }) => {
          dispatch({
            type: HUB_SET_LIST,
            list: data.Hubs.rows,
          });
          dispatch({ type: HUB_FETCH_END });
          dispatch({ type: modalAction.BACKDROP_HIDE });
        });
      } else {
        dispatch({ type: HUB_FETCH_END });
        dispatch(ModalActions.addMessage('Failed to set hub'));
        dispatch({ type: modalAction.BACKDROP_HIDE });
      }
    }).catch(() => {
      dispatch({ type: HUB_FETCH_END });
      dispatch(ModalActions.addMessage('Network error while fetch hubs'));
      dispatch({ type: modalAction.BACKDROP_HIDE });
    });
  };
}

