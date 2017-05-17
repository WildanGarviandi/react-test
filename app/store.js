import { browserHistory } from 'react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import { addLocaleData } from 'react-intl';
import idLocaleData from 'react-intl/locale-data/id';
import { intlReducer } from 'react-intl-redux';
import rootReducer from './reducers';

import configEnv from '../config.json';

let store;

addLocaleData([
  ...idLocaleData
]);

const initialState = {
  intl: {
    defaultLocale: 'id',
    locale: configEnv.locale
  }
};

const mainReducer = (state, action) => {
  if (action.type === 'LOGOUT_SUCCESS') {
    state = undefined;
  }

  return rootReducer(state, action);
}

if (process.env && process.env.NODE_ENV === "production") {
  store = createStore(
    combineReducers({
      app: mainReducer,
      routing: routerReducer,
      intl: intlReducer
    }),
    initialState,
    applyMiddleware(routerMiddleware(browserHistory), thunkMiddleware)
  );
} else {
  store = createStore(
    combineReducers({
      app: mainReducer,
      routing: routerReducer,
      intl: intlReducer
    }),
    initialState,
    composeWithDevTools(
      applyMiddleware(routerMiddleware(browserHistory), thunkMiddleware)
    )
  );
}

export default store;
