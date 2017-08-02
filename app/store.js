import { browserHistory } from 'react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { addLocaleData } from 'react-intl';
import idLocaleData from 'react-intl/locale-data/id';
import { intlReducer } from 'react-intl-redux';

import RavenMiddleware from 'redux-raven-middleware';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

import rootReducer from './reducers';
import configEnv from '../config.json';
import configValues from './config/configValues.json';

let store;

addLocaleData([
  ...idLocaleData,
]);

const initialState = {
  intl: {
    defaultLocale: 'id',
    locale: configEnv.locale,
  },
};

const mainReducer = (state, action) => {
  if (action.type === 'LOGOUT_SUCCESS') {
    state = undefined;
  }

  return rootReducer(state, action);
};

const handleError = (action) => {
  const response = {
    data: action,
  };
  return response;
};

const ravenMiddleware = RavenMiddleware(configValues.SENTRY_DSN, {}, {
  breadcrumbDataFromAction: handleError,
});

if (process.env && process.env.NODE_ENV === 'production') {
  store = createStore(
    combineReducers({
      app: mainReducer,
      routing: routerReducer,
      intl: intlReducer,
    }),
    initialState,
    applyMiddleware(routerMiddleware(browserHistory), thunkMiddleware, ravenMiddleware),
  );
} else {
  store = createStore(
    combineReducers({
      app: mainReducer,
      routing: routerReducer,
      intl: intlReducer,
    }),
    initialState,
    composeWithDevTools(
      applyMiddleware(
        routerMiddleware(browserHistory),
        thunkMiddleware,
        ravenMiddleware,
      ),
    ),
  );
}

export default store;
