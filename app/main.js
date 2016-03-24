import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import { syncHistoryWithStore, routerMiddleware, routerReducer } from 'react-router-redux'

import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

import auth from './auth';
import rootReducer from './reducers';

import ContainerPage from './modules/container';
import ContainerDetailsPage from './modules/container/details';
import ContainerFillPage from './modules/container/fill';
import ContainerOrderPage from './modules/container/order';
import DashboardPage from './modules/dashboard';
import LoginPage from './modules/login';
import {HubPage, MyOrderPage} from './modules/order';
import './main.css';

function App(props) {
  return <div style={{height: "100%"}}>{props.children}</div>;
}

function requireAuth(nextState, replace, callback) {
  auth.loggedIn().then(function(s) {
    if(!s) {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname }
      })
    } else {
      localStorage.HubID = s.data.hub.HubID;
    }

    callback();
  });
}

const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="/home" component={DashboardPage} onEnter={requireAuth}>
        <Route path="/hubOrder" component={HubPage} />
        <Route path="/container" component={ContainerPage} />
        <Route path="/container/:id" component={ContainerDetailsPage} />
        <Route path="/container/:id/order" component={ContainerOrderPage} />
        <Route path="/container/:id/fill" component={ContainerFillPage} />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
);

const loggerMiddleware = createLogger();

const store = createStore(
  combineReducers({
    app: rootReducer,
    routing: routerReducer
  }),
  applyMiddleware(routerMiddleware(browserHistory), thunkMiddleware, loggerMiddleware)
);

const history = syncHistoryWithStore(browserHistory, store);

const Root = () => {
  return (
    <Provider store={store}>
      {routes}
    </Provider>
  );
}

render(<Root />, document.getElementById('root'));
