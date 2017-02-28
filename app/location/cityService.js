import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';
import config from '../../config.json';

const Constants = {
    BASE: "cityList/defaultSet/",
    SET_CITIES: "cityList/states/set",
}

const initialStore = {
    cities: []
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if (parsedActionType.length > 2 && parsedActionType[0] === "cityList" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
        case Constants.SET_CITIES: {
            return lodash.assign({}, store, {
                cities: action.cities,
            });
        }

        default: {
            return store;
        }
    }
}

export function FetchList(stateID) {
    return (dispatch, getState) => {
        const {cityList, userLogged} = getState().app;
        const {token} = userLogged;

        let params = {};

        if (stateID) {
            params.StateID = stateID;
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/city', token, params, false, true).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_CITIES,
                    cities: data.rows,
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}