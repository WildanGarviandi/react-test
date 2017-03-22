import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';
import config from '../../config.json';

const Constants = {
    BASE: "stateList/defaultSet/",
    SET_STATES: "stateList/states/set",
}

const initialStore = {
    states: []
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if (parsedActionType.length > 2 && parsedActionType[0] === "stateList" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
        case Constants.SET_STATES: {
            return lodash.assign({}, store, {
                states: action.states,
            });
        }

        default: {
            return store;
        }
    }
}

export function FetchList(countryID) {
    return (dispatch, getState) => {
        const {countryList, userLogged} = getState().app;
        const {token} = userLogged;

        let params = {};

        if (countryID) {
            params.CountryID = countryID;
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/state', token, params, false, true).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_STATES,
                    states: data.rows,
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}