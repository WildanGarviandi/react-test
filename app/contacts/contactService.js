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
    RESET_FILTER: "mycontact/contacts/reset",
    TOGGLE_SELECT_CONTACT: "mycontact/contacts/select",
    TOGGLE_SELECT_ALL: "mycontact/selectedAll/toggle"
}

const initialStore = {
    currentPage: 1,
    limit: 100,
    contacts: [],
    contact: {},
    shipper: {},
    pickup: {},
    dropoff: {},
    filters: {},
    limit: 100,
    statusName: "SHOW ALL",
    total: 0,
    selectedAll: false,
    isEditing: false,
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

        case Constants.RESET_FILTER: {
            return lodash.assign({}, store, {
                filters: {}
            });
        }

        case Constants.TOGGLE_SELECT_CONTACT: {
            const newContacts = lodash.map(store.contacts, (contact) => {
                if(contact.ContactID !== action.contactID) {
                    return contact;
                }

                return lodash.assign({}, contact, {IsChecked: !contact.IsChecked});
            });

            return lodash.assign({}, store, {
                contacts: newContacts,
            });
        }

        case Constants.TOGGLE_SELECT_ALL: {
            const {contacts, selectedAll} = store;
            const newContacts = lodash.map(contacts, (contact) => {
                return lodash.assign({}, contact, {IsChecked: !selectedAll});
            });

            return lodash.assign({}, store, {
                selectedAll: !selectedAll,
                contacts: newContacts,
            })
        }

        default: {
            return store;
        }
    }
}

export function StoreSetter(keyword, value) {
    return {type: Constants.BASE + keyword, [keyword]: value};
}

export function SetFilters(filters) {
    return StoreSetter("filters", filters);
}

export function UpdateFilters(filters) {
    return (dispatch, getState) => {
        const prevFilters = getState().app.myContacts.filters;
        const nextFilter = lodash.assign({}, prevFilters, filters);
        dispatch(SetFilters(nextFilter));
    }
}

export function SetDropDownFilter(keyword) {
    const filterNames = {
        "statusName": "status"
    };

    return (selectedOption) => {
        const filterName = filterNames[keyword];

        return (dispatch, getState) => {
            dispatch(StoreSetter(keyword, selectedOption.value));
            dispatch(UpdateFilters({[filterName]: selectedOption.key}));
            dispatch(FetchList());
        }
    }
}

export function SetCurrentPage(currentPage) {
    return (dispatch, getState) => {
        dispatch(StoreSetter("currentPage", currentPage));
        dispatch(FetchList());
    }
}

export function SetLimit(limit) {
    return (dispatch, getState) => {
        dispatch(StoreSetter("limit", limit));
        dispatch(SetCurrentPage(1));
    }
}

export function UpdateAndFetch(filters) {
    return (dispatch) => {
        dispatch(UpdateFilters(filters));
        dispatch(FetchList());
    }
}

export function ToggleChecked(contactID) {
    return {
        type: Constants.TOGGLE_SELECT_CONTACT,
        contactID: contactID
    }
}

export function ToggleCheckedAll() {
    return { type: Constants.TOGGLE_SELECT_ALL };
}

export function FetchList() {
    return (dispatch, getState) => {
        const {myContacts, userLogged} = getState().app;
        const {currentPage, limit, filters} = myContacts;
        const {token} = userLogged;
        let params = lodash.assign({}, filters, {
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

export function resetFilter() {
    return (dispatch) => {
        dispatch({type: Constants.RESET_FILTER});
        dispatch(FetchList());
    }
}