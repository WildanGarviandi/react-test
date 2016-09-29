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
    currentPage: 1,
    limit: 100,
    states: [],
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
                total: action.total,
                states: action.states,
            });
        }

        default: {
            return store;
        }
    }
}

export function FetchList() {
    return (dispatch, getState) => {
        const {stateList, userLogged} = getState().app;
        const {currentPage, limit} = stateList;
        const {token} = userLogged;
        let params = lodash.assign({}, {
            limit: limit,
            offset: (currentPage - 1) * limit
        });

        if (config.defaultCountryID) {
            params.countryID = config.defaultCountryID;
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/state', token, params).then((response) => {
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
                    total: data.count,
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}