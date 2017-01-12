import React from 'react';
import {connect} from 'react-redux';
import {Input, Page} from '../views/base';
import * as OutboundTripsService from './outboundTripsService';
import MyTripsTable from './outboundTripsTable';
import FleetsFetch from '../modules/drivers/actions/fleetsFetch';
import styles from './styles.css';
import formStyles from '../components/form.css';

const ContainerPage = React.createClass({
  componentWillMount() {
    this.props.fleetsFetch();
    this.props.ResetFilterOutbound();
  },
  gotoContainer(containerNumber) {
    this.props.gotoContainer(containerNumber);
  },
  render() {
    const title = "Outbound";
    return (
      <div>
        <Page title={title}>
        <MyTripsTable key={this.props.lastPath} lastPath={this.props.lastPath} />
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
    lastPath,
  };
};

function DispatchToPage(dispatch) {
  return {
    gotoContainer: (containerNumber) => {
      dispatch(OutboundTripsService.GoToContainer(containerNumber));
    },
    fleetsFetch: () => {
      dispatch(FleetsFetch());
    },
    ResetFilterInbound: () => {
      dispatch(OutboundTripsService.ResetFilterInbound());
    },
    ResetFilterOutbound: () => {
      dispatch(OutboundTripsService.ResetFilter());
    }
  }
}

export default connect(StateToProps, DispatchToPage)(ContainerPage);
