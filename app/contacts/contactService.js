import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
    BASE: "mycontact/defaultSet/",
    SET_CONTACTS: "mycontact/contacts/set",
}

const initialStore = {
    currentPage: 1,
    limit: 100,
    contacts: [],
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if (parsedActionType.length > 2 && parsedActionType[0] === "mycontact" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
        case Constants.SET_CONTACTS: {
            return lodash.assign({}, store, {
                total: action.total,
                contacts: action.contacts,
            });
        }

        default: {
            return store;
        }
    }
}

export function FetchList() {
    return (dispatch, getState) => {
        const {myContacts, userLogged} = getState().app;
        const {currentPage, limit} = myContacts;
        const {token} = userLogged;
        let params = lodash.assign({}, {
            limit: limit,
            offset: (currentPage - 1) * limit
        })

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/contact', token, params).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_CONTACTS,
                    contacts: data.rows,
                    total: data.count,
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}