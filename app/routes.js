import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import checkAuth from './modules/auth/actions/checkAuth';
import store from './store';
import App from './views/app';
import ContainerPage from './views/container';
import ContainerDetailsPage from './views/container/details';
import ContainerFillPage from './views/container/fill';
import ContainerQRCodePage from './views/container/qrcode';
import DashboardPage from './views/dashboard';
import LoginPage from './views/login';
import OrderDetailsPage from './views/order/orderDetails';
import PickupOrdersPage from './views/order/pickupOrders';
import ReceivedOrdersPage from './views/order/receivedOrders';
import MyTripDetailsPage from './views/trips/tripDetails';
import MyTripsPage from './views/trips/myTrips';

function requireAuth(nextState, replace, callback) {
  checkAuth(store).then(function(result) {
    if(!result.ok) {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname }
      });
    }

    callback();
  });
}

export default (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={LoginPage} />
      <Route path="/home" component={DashboardPage}>
        <IndexRoute component={ContainerPage} onEnter={requireAuth}/>
        <Route path="/container" component={ContainerPage} onEnter={requireAuth}/>
        <Route path="/container/:id" component={ContainerDetailsPage} onEnter={requireAuth}/>
        <Route path="/container/:id/fill" component={ContainerFillPage} onEnter={requireAuth}/>
        <Route path="/orders/:id" component={OrderDetailsPage} onEnter={requireAuth}/>
        <Route path="/pickupOrders" component={PickupOrdersPage} onEnter={requireAuth} />
        <Route path="/receivedOrders" component={ReceivedOrdersPage} onEnter={requireAuth}/>
        <Route path="/myTrips" component={MyTripsPage} onEnter={requireAuth}/>
        <Route path="/tripsFromHere" component={MyTripsPage} onEnter={requireAuth}/>
        <Route path="/tripDetails/:id" component={MyTripDetailsPage} onEnter={requireAuth}/>
      </Route>
      <Route path="/qrcode/:id" component={ContainerQRCodePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
);
