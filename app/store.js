import { browserHistory } from 'react-router';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

import rootReducer from './reducers';

const loggerMiddleware = createLogger();

const store = createStore(
  combineReducers({
    app: rootReducer,
    routing: routerReducer
  }),
  applyMiddleware(routerMiddleware(browserHistory), thunkMiddleware, loggerMiddleware)
);

export default store;
