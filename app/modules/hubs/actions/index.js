import Constants from '../constants';
import ModalActions from '../../modals/actions';
import fetchGet from '../../fetch/get';
import fetchPost from '../../fetch/post';
import {SetTrip} from '../../inboundTripDetails';
import {modalAction} from '../../modals/constants';
export function startEdit() {
  return (dispatch) => {
    dispatch({type: Constants.HUB_EDIT_START});
  }
}

export function endEdit() {
  return (dispatch) => {
    dispatch({type: Constants.HUB_EDIT_END});
  }
}

export function setHub(tripID, hubID) {
  return (dispatch, getState) => {
    const {hubs, userLogged} = getState().app;
    const {token} = userLogged;

    const query = {
      DestinationHubID: hubID,
    }

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({type: Constants.HUB_UPDATE_START});
    fetchPost(`/trip/${tripID}/setdestination`, token, query).then((response) => {
      if(response.ok) {
        response.json().then(({data}) => {
          dispatch({type: Constants.HUB_PICK, hub: hubID});
          dispatch({type: Constants.HUB_UPDATE_END});
          dispatch({type: modalAction.BACKDROP_HIDE});
          dispatch(SetTrip(data, true));
        });
      } else {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({type: Constants.HUB_UPDATE_END});
        dispatch(ModalActions.addMessage(`Failed to set next destination`));
      }
    }).catch(() => {
      dispatch({type: Constants.HUB_UPDATE_END});
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(`Network error while setting destination`));
    });
  }
}

export function fetchList() {
  return (dispatch, getState) => {
    const {hubs, userLogged} = getState().app;
    const {token} = userLogged;

    if(hubs.list.length > 0) return;

    dispatch({ type: Constants.HUB_FETCH_START});
    fetchGet('/hub/', token).then(function(response) {
      if(response.ok) {
        response.json().then(function({data}) {
          dispatch({
            type: Constants.HUB_SET_LIST,
            list: data.Hubs.rows
          });
          dispatch({ type: Constants.HUB_FETCH_END});
        });
      } else {
        dispatch({ type: Constants.HUB_FETCH_END});
        dispatch(ModalActions.addMessage(`Failed to set hub`));
      }
    }).catch(() => {
      dispatch({ type: Constants.HUB_FETCH_END});
      dispatch(ModalActions.addMessage(`Network error while setting hub`));
    });
  }
}
