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
import GroupingPage from './grouping/grouping';
import MyTripsPage from './views/trips/myTrips';
import TripDetailsPage from './views/trips/tripDetails';
import TripManifestPage from './views/trips/tripManifest';
import MyAssignedTripsPage from './trips/tripPage';
import MyAssignedTripsDetailPage from './trips/tripDetails';
import MyOrdersPage from './orders/orderPage';
import ManageOrdersPage from './orders/orderManage';
import MyOrdersDetailsPage from './orders/orderDetails';
import TripHistoryList from './tripHistory/listPage';
import TripHistoryDetails from './tripHistory/detailsPage';
import MyContactPage from './contacts/contactPage';
import ManageContactsPage from './contacts/contactManagePage';
import MyDriverPage from './drivers/driverPage';
import ManageDriversPage from './drivers/driverManagePage';
import MyDriverOrdersPage from './drivers/driverOrderPage';

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

function requireHubAuth(nextState, replace, callback) {
  checkAuth(store).then(function(result) {
    if(!result.ok || !result.data.hub) {
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
        <Route path="/orders/received" component={ReceivedOrdersPage} onEnter={requireHubAuth}/>
        <Route path="/grouping" component={GroupingPage} onEnter={requireHubAuth}/>
        <Route path="/orders/:id" component={OrderDetailsPage} onEnter={requireHubAuth}/>
        <Route path="/trips/inbound" component={MyTripsPage} onEnter={requireHubAuth}/>
        <Route path="/trips/outbound" component={MyTripsPage} onEnter={requireHubAuth}/>
        <Route path="/trips/:id" component={TripDetailsPage} onEnter={requireHubAuth}/>
        <Route path="/trips/:tripID/fillReceived" component={ReceivedFillPage} onEnter={requireHubAuth}/>
        <Route path="/trips/:tripID/fillPickup" component={PickupFillPage} onEnter={requireHubAuth}/>
        <Route path="/mytrips" component={MyAssignedTripsPage} onEnter={requireAuth} />
        <Route path="/mytrips/detail/:tripID" component={MyAssignedTripsDetailPage} onEnter={requireAuth} />
        <Route path="/myorders/open" component={()=>(<MyOrdersPage statusFilter="open" />)} onEnter={requireAuth} />
        <Route path="/myorders/ongoing" component={()=>(<MyOrdersPage statusFilter="ongoing" />)} onEnter={requireAuth} />
        <Route path="/myorders/completed" component={()=>(<MyOrdersPage statusFilter="completed" />)} onEnter={requireAuth} />
        <Route path="/myorders/add" component={ManageOrdersPage} onEnter={requireAuth} />
        <Route path="/myorders/edit/:id" component={ManageOrdersPage} onEnter={requireAuth} />
        <Route path="/myorders/details/:id" component={MyOrdersDetailsPage} onEnter={requireAuth} />
        <Route path="/history" component={TripHistoryList} onEnter={requireAuth}/>
        <Route path="/history/:id" component={TripHistoryDetails} onEnter={requireAuth}/>
        <Route path="/mycontacts" component={MyContactPage} onEnter={requireAuth} />
        <Route path="/mycontacts/add" component={ManageContactsPage} onEnter={requireAuth} />
        <Route path="/mycontacts/edit/:id" component={ManageContactsPage} onEnter={requireAuth} />
        <Route path="/mydrivers" component={MyDriverPage} onEnter={requireAuth}/>
        <Route path="/mydrivers/add" component={ManageDriversPage} onEnter={requireAuth} />
        <Route path="/mydrivers/edit/:id" component={ManageDriversPage} onEnter={requireAuth} />
        <Route path="/mydrivers/orders/:id" component={MyDriverOrdersPage} onEnter={requireAuth}/>
      </Route>
      <Route path="/trips/:tripID/manifest" component={TripManifestPage} onEnter={requireAuth} />
      <Route path="/qrcode/:id" component={ContainerQRCodePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
);
