import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';
import config from '../../config.json';

const Constants = {
    BASE: "nearbyfleetList/defaultSet/",
    SET_FLEETS: "nearbyfleetList/fleets/set",
    RESET_DRIVER_VENDORS: "RESET_DRIVER_VENDORS",
    SET_DRIVERS_VENDORS: "SET_DRIVERS_VENDORS"
}

const initialStore = {
    currentPage: 1,
    limit: 100,
    fleets: [],
    driversVendors: []
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if (parsedActionType.length > 2 && parsedActionType[0] === "nearbyfleetList" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
        case Constants.SET_FLEETS: {
            return lodash.assign({}, store, {
                total: action.total,
                fleets: action.fleets,
            });
        }

        case Constants.SET_DRIVERS_VENDORS: {
            return lodash.assign({}, store, {
                driversVendors: action.drivers
            });
        }

        case Constants.RESET_DRIVER_VENDORS: {
            return lodash.assign({}, store, {
                driversVendors: []
            });
        }

        default: {
            return store;
        }
    }
}

export function FetchList() {
    return (dispatch, getState) => {
        const {nearbyFleets, userLogged} = getState().app;
        const {currentPage, limit} = nearbyFleets;
        const {token} = userLogged;
        
        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/fleet/nearby-fleets', token, {}, true).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_FLEETS,
                    fleets: data
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}

export function FetchDriverFleet(fleetID) {
  return (dispatch, getState) => {
    const {userLogged, nearbyFleets} = getState().app;
    const {token} = userLogged; 
    const query = {
      limit: 'all',
      offset: 0
    };
        
    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet(`/fleet/${fleetID}/drivers`, token, query).then(function(response) {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }
      return response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.SET_DRIVERS_VENDORS,
          drivers: data.rows
        })
      });
    }).catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
    });
  }
}

export function ResetVendorList() {
  return (dispatch) => {
    dispatch({type: Constants.RESET_DRIVER_VENDORS});
  }
}