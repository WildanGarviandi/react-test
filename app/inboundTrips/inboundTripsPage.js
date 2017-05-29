import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Input, Page } from '../views/base';
import * as InboundTrips from './inboundTripsService';
import InboundTable, { Filter } from './inboundTripsTable';
import FleetsFetch from '../modules/drivers/actions/fleetsFetch';
import styles from './styles.css';
import formStyles from '../components/form.css';
import InboundTripsModal from './inboundTripsModal';

const InboundTripPage = React.createClass({
  getInitialState() {
    return ({
      tripID: null,
    });
  },
  componentWillMount() {
    this.props.getList();
  },
  gotoTrip() {
    this.props.gotoTrip(this.state.tripID);
  },
  onChange(e) {
    this.setState({
      tripID: e,
    });
  },
  render() {
    const title = this.props.isFetching ? 'Inbound Trips' : this.props.total > 0 ? `Inbound Trips (${this.props.total})` : 'Inbound Trips (All Done)';
    const { userLogged } = this.props;
    return (
      <div>
        <Page title="Inbound Trips" count={{ itemName: 'Items', done: 'All Done', value: this.props.total }}>
          <Filter
            userLogged={userLogged}
          />
          <div className={styles.mainTable}>
            <InboundTable
              key={this.props.lastPath}
              lastPath={this.props.lastPath}
              isInbound={this.props.isInbound}
            />
          </div>
          <InboundTripsModal />
        </Page>
      </div>
    );
  },
});

function StateToProps(state, ownProps) {
  const routes = ownProps.routes;
  const paths = routes[routes.length - 1].path.split('/');
  const lastPath = paths[paths.length - 1];
  const { inboundTrips, userLogged } = state.app;
  const { total, isFetching } = inboundTrips;

  return {
    lastPath,
    total,
    isFetching,
    userLogged,
  };
}

function DispatchToPage(dispatch) {
  return {
    gotoTrip: (tripID) => {
      dispatch(InboundTrips.GoToTrip(tripID));
    },
    getList: () => {
      dispatch(InboundTrips.FetchList());
    },
  };
}

export default connect(StateToProps, DispatchToPage)(InboundTripPage);
