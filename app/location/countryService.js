import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';
import config from '../../config.json';

const Constants = {
    BASE: "countryList/defaultSet/",
    SET_COUNTRIES: "countryList/states/set",
}

const initialStore = {
    countries: []
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if (parsedActionType.length > 2 && parsedActionType[0] === "countryList" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
        case Constants.SET_COUNTRIES: {
            return lodash.assign({}, store, {
                countries: action.countries,
            });
        }

        default: {
            return store;
        }
    }
}

export function FetchList() {
    return (dispatch, getState) => {
        const {countryList, userLogged} = getState().app;
        const {token} = userLogged;

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/country', token, {}, false, true).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_COUNTRIES,
                    countries: data.rows,
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}