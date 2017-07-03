import React from 'react';
import { connect } from 'react-redux';

import { Page } from '../views/base';
import * as InboundTrips from './inboundTripsService';
import InboundTable, { Filter } from './inboundTripsTable';
import styles from './styles.scss';
import InboundTripsModal from './inboundTripsModal';

function mapStateToProps(state, ownProps) {
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

function mapDispatchToProps(dispatch) {
  return {
    gotoTrip: (tripID) => {
      dispatch(InboundTrips.GoToTrip(tripID));
    },
    getList: () => {
      dispatch(InboundTrips.FetchList());
    },
    exportOrders: () => {
      dispatch(InboundTrips.exportOrders());
    },
  };
}

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
    const { userLogged, exportOrders } = this.props;
    return (
      <div>
        <Page
          title="Inbound Trips"
          count={{ itemName: 'Items', done: 'All Done', value: this.props.total }}
        >
          <Filter
            userLogged={userLogged}
            exportOrders={exportOrders}
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

export default connect(mapStateToProps, mapDispatchToProps)(InboundTripPage);
