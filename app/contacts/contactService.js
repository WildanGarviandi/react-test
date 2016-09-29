import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
    BASE: "mycontact/defaultSet/",
    SET_CONTACTS: "mycontact/contacts/set",
    CONTACT_DETAILS_SET: "mycontact/details/set",
    FETCHING_PAGE: "mycontact/contacts/fetching",
    FETCHING_PAGE_STOP: "mycontact/contacts/fetchingStop",
}

const initialStore = {
    currentPage: 1,
    limit: 100,
    contacts: [],
    contact: {},
    shipper: {},
    pickup: {},
    dropoff: {},
    isFetching: false
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

        case Constants.FETCHING_PAGE: {
            return lodash.assign({}, store, {
                isFetching: true
            });
        }

        case Constants.FETCHING_PAGE_STOP: {
            return lodash.assign({}, store, {
                order: {},
                isFetching: false
            });
        }

        case Constants.CONTACT_DETAILS_SET: {
            switch (action.contactType) {
                case 'pickup':  {
                    return lodash.assign({}, store, {
                        pickup: action.contact
                    });
                }

                case 'dropoff':  {
                    return lodash.assign({}, store, {
                        dropoff: action.contact
                    });
                }

                case 'shipper':  {
                    return lodash.assign({}, store, {
                        shipper: action.contact
                    });
                }

                default: {
                    return lodash.assign({}, store, {
                        contact: action.contact
                    });
                }
            }
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

// contactType can be contact, shipper, pickup, dropoff or null
export function fetchDetails(id, contactType) {
    return (dispatch, getState) => {
        const {userLogged} = getState().app;
        const {token} = userLogged;

        dispatch({type: modalAction.BACKDROP_SHOW});
        dispatch({type: Constants.FETCHING_PAGE});
        FetchGet('/contact/' + id, token).then(function(response) {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                });
            }

            response.json().then(function({data}) {
                dispatch({
                    type: Constants.CONTACT_DETAILS_SET,
                    contact: data,
                    contactType: contactType
                });
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({type: Constants.FETCHING_PAGE_STOP});
            });
        }).catch((e) => {
            const message = (e && e.message) ? e.message : "Failed to fetch contact details";
            dispatch(ModalActions.addMessage(message));
            dispatch({type: modalAction.BACKDROP_HIDE});
        });
    }
}


export function addContact(contact, contactType) {
    return (dispatch, getState) => {
        const {userLogged} = getState().app;
        const {token} = userLogged;

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchPost('/contact', token, contact).then((response) => {
        if(response.ok) {
            dispatch(FetchList());
            response.json().then(function({data}) {
                dispatch(fetchDetails(data.contact.ContactID, contactType));
            });
            dispatch(ModalActions.addMessage('Add Contact Success'));
            dispatch({type: modalAction.BACKDROP_HIDE});
        } else {
            response.json().then(function({error}) {
                alert(error.message);
                dispatch({type: modalAction.BACKDROP_HIDE});
            });
        }
        }).catch(() => { 
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Network error'));
        });
    }
}