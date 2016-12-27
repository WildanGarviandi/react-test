import React from 'react';
import {connect} from 'react-redux';
import {Input, Page} from '../views/base';
import * as InboundTrips from './inboundTripsService';
import InboundTable from './inboundTripsTable';
import FleetsFetch from '../modules/drivers/actions/fleetsFetch';
import styles from './styles.css';
import formStyles from '../components/form.css';
import {push} from 'react-router-redux';

const InboundTripPage = React.createClass({
  gotoTrip(tripID) {
    this.props.gotoTrip(tripID);
  },
  render() {
    const title = "Inbound Trips";
    return (
      <div>
        <Page title={title}>
          <div>
            <span>
              <Input placeholder={'Enter Trip ID'} className={styles.searchInput} onChange={this.onChange} onEnterKeyPressed={this.gotoTrip} />
            </span>
            <span onKeyDown={this.jumpTo}>
              <button className={styles.searchButton}>Search</button>
            </span>
          </div>
          <div className={styles.mainTable}>
            <InboundTable key={this.props.lastPath} lastPath={this.props.lastPath} isInbound={this.props.isInbound} />
          </div>
        </Page>
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const routes = ownProps.routes;
  const paths = routes[routes.length-1].path.split('/');
  const lastPath = paths[paths.length-1];

  return {
    lastPath
  };
};

function DispatchToPage(dispatch) {
  return {
    gotoTrip: (tripID) => {
      dispatch(push(`/trips/${tripID}/`));
    }
  }
}

export default connect(StateToProps, DispatchToPage)(InboundTripPage);
