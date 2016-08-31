import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import checkAuth from './modules/auth/actions/checkAuth';
import store from './store';
import App from './views/app';
import ContainerQRCodePage from './views/container/qrcode';
import DashboardPage from './views/dashboard';
import LoginPage from './views/login';
import OrderDetailsPage from './views/order/orderDetails';
import PickupFillPage from './views/order/pickupFill';
import PickupOrdersPage from './views/order/pickupOrders';
import ReceivedFillPage from './views/order/receivedFill';
import ReceivedOrdersPage from './views/order/receivedOrders';
import MyTripsPage from './views/trips/myTrips';
import TripDetailsPage from './views/trips/tripDetails';

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
        <IndexRoute component={PickupOrdersPage} onEnter={requireAuth}/>
        <Route path="/orders/pickup" component={PickupOrdersPage} onEnter={requireAuth} />
        <Route path="/orders/received" component={ReceivedOrdersPage} onEnter={requireAuth}/>
        <Route path="/orders/:id" component={OrderDetailsPage} onEnter={requireAuth}/>
        <Route path="/trips/inbound" component={MyTripsPage} onEnter={requireAuth}/>
        <Route path="/trips/outbound" component={MyTripsPage} onEnter={requireAuth}/>
        <Route path="/trips/:id" component={TripDetailsPage} onEnter={requireAuth}/>
        <Route path="/trips/:tripID/fillReceived" component={ReceivedFillPage} onEnter={requireAuth}/>
        <Route path="/trips/:tripID/fillPickup" component={PickupFillPage} onEnter={requireAuth}/>
      </Route>
      <Route path="/qrcode/:id" component={ContainerQRCodePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
);
