import {push} from 'react-router-redux';
import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import fetchGet from '../../fetch/get';
import lodash from 'lodash';
import fetch from 'isomorphic-fetch';
import {modalAction} from '../../modals/constants';

const Constants = {
    BASE: "register/defaultSet/",
    REGISTER_START: "register/registerStart",
    REGISTER_SUCCESS: "register/registerSuccess",
    REGISTER_FAILED: "register/registerFailed",
    PHONE_EXISTS: "register/phoneExist",
    PHONE_NOT_EXISTS: "register/phoneNotExist",
    EMAIL_EXISTS: "register/emailExist",
    EMAIL_NOT_EXISTS: "register/emailNotExist",
}

const initialStore = {
    registerData: {},
    isSuccess: false,
    messageFailed: '',
    isEmailValid: true,
    isPhoneValid: true
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if (parsedActionType.length > 2 && parsedActionType[0] === "cityList" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
        case Constants.REGISTER_SUCCESS: {
            return lodash.assign({}, store, {
                isSuccess: true,
            });
        }

        case Constants.REGISTER_FAILED: {
            return lodash.assign({}, store, {
                isSuccess: false,
                messageFailed: action.message
            });
        }

        case Constants.PHONE_EXISTS: {
            return lodash.assign({}, store, {
                isPhoneValid: false,
            });
        }

        case Constants.PHONE_NOT_EXISTS: {
            return lodash.assign({}, store, {
                isPhoneValid: true,
            });
        }

        case Constants.EMAIL_EXISTS: {
            return lodash.assign({}, store, {
                isEmailValid: false,
            });
        }

        case Constants.EMAIL_NOT_EXISTS: {
            return lodash.assign({}, store, {
                isEmailValid: true,
            });
        }

        default: {
            return store;
        }
    }
}

export function Register(registerData) {
  return (dispatch) => {
    dispatch({ type: Constants.REGISTER_START });
    dispatch({type: modalAction.BACKDROP_SHOW});
    fetchPost('/fleet/register', '', registerData).then((response) => {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({ type: Constants.REGISTER_SUCCESS});
          dispatch({type: modalAction.BACKDROP_HIDE});
          alert('Registration success!');
          dispatch(push('/'));
        });
      } else {
        return response.json().then(({error}) => {
          throw error;
        });
      }
    }).catch((e) => {
        const message = (e && e.message) ? e.message : "Failed to register";
        dispatch({ type: Constants.REGISTER_FAILED, message: message });
        dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function CheckPhoneExists(phone) {
  return (dispatch) => {
    let params = {};
    params.phone = phone;
    dispatch({ type: Constants.PHONE_NOT_EXISTS});
    fetchGet('/fleet/check-fleet', '', params).then((response) => {
      if(response.ok) {
        response.json().then((response) => {
          if (response.data.exists) {
            dispatch({ type: Constants.PHONE_EXISTS});
          }
        });
      } 
    });
  }
}

export function CheckEmailExists(email) {
  return (dispatch) => {
    let params = {};
    params.email = email;    
    dispatch({ type: Constants.EMAIL_NOT_EXISTS });
    fetchGet('/fleet/check-fleet', '', params).then((response) => {
      if(response.ok) {
        response.json().then((response) => {
          if (response.data.exists) {
            dispatch({ type: Constants.EMAIL_EXISTS});
          }
        });
      }
    });
  }
}