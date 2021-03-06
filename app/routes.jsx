import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { push } from 'react-router-redux';

import checkAuth from './modules/auth/actions/checkAuth';
import store from './store';
import App from './views/app';
import ContainerQRCodePage from './views/container/qrcode';
import DashboardPage from './dashboard';
import LoginPage from './login/LoginPage';
import RegisterPage from './views/register';
import OrderDetailsPage from './orderDetails/orderDetails';
import PickupFillPage from './views/order/pickupFill';
import PickupOrdersPage from './pickupOrders/pickupOrdersPage';
import OrderMonitoringPage from './orderMonitoring/orderMonitoringPage';
import ReceivedFillPage from './views/order/receivedFill';
import ReceivedOrdersPage from './views/order/receivedOrders';
import GroupingPage from './grouping/grouping';
import InboundOrdersPage from './inbound/inboundOrders';
import updateOrdersPage from './updateOrders/updateOrders';
import InboundTripsPage from './inboundTrips/inboundTripsPage';
import TripDetailsPage from './tripDetails/tripDetails';
import MyAssignedTripsPage from './trips/tripPage';
import MyOrdersPage from './orders/orderPage';
import MyOrdersManagePage from './orders/orderManage';
import TripHistoryList from './tripHistory/listPage';
import TripHistoryDetails from './tripHistory/detailsPage';
import MyContactPage from './contacts/contactPage';
import ManageContactsPage from './contacts/contactManagePage';
import MyDriverPage from './drivers/driverPage';
import MyOutboundTripsPage from './outboundTrips/outboundTripsPage';
import OutboundTripsManifestPage from './outboundTrips/outboundTripsManifest';
import OutboundTripsCoverManifestPage from './outboundTrips/outboundTripsCoverManifest';
import { modalAction } from './modules/modals/constants';
import MyOngoingTripsPage from './ongoingTrips/tripPage';
import PerformancePage from './performance/performancePage';
import ChooseHubPage from './ChooseHub';
import DriverMapPage from './DriverMap';

function requireAuth(nextState, replace, callback) {
  store.dispatch({ type: modalAction.BACKDROP_SHOW });
  checkAuth(store).then(result => {
    if (!result.ok) {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname },
      });
    }
    store.dispatch({ type: modalAction.BACKDROP_HIDE });

    callback();
  });
}

function requireHubAuth(nextState, replace, callback) {
  store.dispatch({ type: modalAction.BACKDROP_SHOW });
  checkAuth(store).then(result => {
    if (!result.ok || !result.data.hub) {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname },
      });
    }
    store.dispatch({ type: modalAction.BACKDROP_HIDE });

    callback();
  });
}

const requireGoogleHubAuth = (nextState, replace, callback) => {
  const { hubs, token, userID } = store.getState().app.userLogged;
  if (hubs.length === 0) {
    localStorage.token = token;
    localStorage.userID = userID;
    localStorage.hubs = JSON.stringify([]);
    return store.dispatch(push('/orders/pickup'));
  }
  return callback();
};

export default (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={LoginPage} />
      <Route path="/home" component={DashboardPage}>
        <IndexRoute component={PickupOrdersPage} onEnter={requireAuth} />
        <Route
          path="/performance"
          component={PerformancePage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/orders/pickup"
          component={PickupOrdersPage}
          onEnter={requireAuth}
        />
        <Route
          path="/orders/received"
          component={ReceivedOrdersPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/grouping"
          component={GroupingPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/inbound"
          component={InboundOrdersPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/orders/update"
          component={updateOrdersPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/orders/:id"
          component={OrderDetailsPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/trips/inbound"
          component={InboundTripsPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/trips/outbound"
          component={MyOutboundTripsPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/trips/:id"
          component={TripDetailsPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/trips/:tripID/fillReceived"
          component={ReceivedFillPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/trips/:tripID/fillPickup"
          component={PickupFillPage}
          onEnter={requireHubAuth}
        />
        <Route
          path="/ordermonitoring"
          component={OrderMonitoringPage}
          onEnter={requireAuth}
        />
        <Route
          path="/mytrips"
          component={MyAssignedTripsPage}
          onEnter={requireAuth}
        />
        <Route
          path="/myongoingtrips"
          component={MyOngoingTripsPage}
          onEnter={requireAuth}
        />
        <Route
          path="/myorders"
          component={() => <MyOrdersPage />}
          onEnter={requireAuth}
        />
        <Route
          path="/myorders/add"
          component={MyOrdersManagePage}
          onEnter={requireAuth}
        />
        <Route
          path="/history"
          component={TripHistoryList}
          onEnter={requireAuth}
        />
        <Route
          path="/history/:id"
          component={TripHistoryDetails}
          onEnter={requireAuth}
        />
        <Route
          path="/mycontacts"
          component={MyContactPage}
          onEnter={requireAuth}
        />
        <Route
          path="/mycontacts/add"
          component={ManageContactsPage}
          onEnter={requireAuth}
        />
        <Route
          path="/mycontacts/edit/:id"
          component={ManageContactsPage}
          onEnter={requireAuth}
        />
        <Route
          path="/mydrivers"
          component={MyDriverPage}
          onEnter={requireAuth}
        />
        <Route
          path="/driverMap"
          component={DriverMapPage}
          onEnter={requireAuth}
        />
      </Route>
      <Route
        path="/trips/:tripID/manifest"
        component={OutboundTripsManifestPage}
        onEnter={requireAuth}
      />
      <Route
        path="/trips/:tripID/coverManifest"
        component={OutboundTripsCoverManifestPage}
        onEnter={requireAuth}
      />
      <Route path="/qrcode/:id" component={ContainerQRCodePage} />
      <Route path="/login" component={LoginPage} />
      <Route
        path="/choose-hub"
        component={ChooseHubPage}
        onEnter={requireGoogleHubAuth}
      />
      <Route path="/register" component={RegisterPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
);
