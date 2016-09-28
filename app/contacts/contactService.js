import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
    BASE: "mycontact/defaultSet/",
    SET_CONTACTS: "mycontact/contacts/set",
    TOGGLE_SELECT_CONTACT: "mycontact/contacts/select",
    TOGGLE_SELECT_ALL: "mycontact/selectedAll/toggle",
    EDIT_CONTACTS: "mycontact/contacts/edit",
    CONTACT_DETAILS_SET: "mycontact/contacts/details",
    FETCHING_PAGE: "mycontact/contacts/fetching",
    FETCHING_PAGE_STOP: "mycontact/contacts/fetchingStop",
}

const initialStore = {
    currentPage: 1,
    filters: {},
    limit: 100,
    statusName: "SHOW ALL",
    total: 0,
    contacts: [],
    selectedAll: false,
    contact: {},
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

        case Constants.FETCHING_PAGE: {
            return lodash.assign({}, store, {
                isFetching: true
            });
        }

        case Constants.CONTACT_DETAILS_SET: {
            return lodash.assign({}, store, {
                contact: action.contact,
                isEditing: true,
                isFetching: false
            });
        }

        case Constants.FETCHING_PAGE_STOP: {
            return lodash.assign({}, store, {
                contact: {},
                isFetching: false
            });
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

export function editContact(id, updateData) {
    return (dispatch, getState) => {
        const {myContacts, userLogged} = getState().app;
        const {contact} = myContacts;
        const {token} = userLogged;

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchPost('/contact/' + id, token, updateData).then((response) => {
        if(response.ok) {
            response.json().then(function({data}) {
                dispatch({
                    type: Constants.CONTACT_DETAILS_SET,
                    contact: lodash.assign({}, updateData, contact),
                });
                alert('Edit Contact Success');
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch(fetchDetails(id));
            });
        } else {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Failed to edit contact details'));
        }
        }).catch(() => { 
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Network error'));
        });
    }
}

export function fetchDetails(id) {
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
                });
                dispatch({type: modalAction.BACKDROP_HIDE});
            });
        }).catch((e) => {
            window.history.back();
            const message = (e && e.message) ? e.message : "Failed to fetch contact details";
            dispatch(ModalActions.addMessage(message));
            dispatch({type: modalAction.BACKDROP_HIDE});
        });
    }
}

export function resetManageContact() {
    return (dispatch) => {
   
        dispatch({type: Constants.FETCHING_PAGE_STOP});
    }
}

export function addContact(contactData) {
    return (dispatch, getState) => {
        const {myContacts, userLogged} = getState().app;
        const {contact} = myContacts;
        const {token} = userLogged;

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchPost('/contact', token, contactData).then((response) => {
        if(response.ok) {
            response.json().then(function({data}) {
                dispatch({
                    type: Constants.CONTACT_DETAILS_SET,
                    contact: lodash.assign({}, contactData, contact),
                });
                alert('Add Contact Success');
                dispatch({type: modalAction.BACKDROP_HIDE});
                window.location.href='/mycontacts/edit/' + data.contact.ContactID;
            });
        } else {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Failed to add contact'));
        }
        }).catch(() => { 
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Network error'));
   
        });
    }
}