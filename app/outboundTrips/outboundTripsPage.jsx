import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../views/base';
import * as OutboundTripsService from './outboundTripsService';
import MyTripsTable from './outboundTripsTable';
import FleetsFetch from '../modules/drivers/actions/fleetsFetch';
import {ModalContainer} from 'react-modal-dialog';
import AssignTripModal from './outboundTripsModal';

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
        <Page title={title} 
          count={{itemName: 'trip', done: 'All Done', value: this.props.total, isLoading: this.props.isFetching}}>
          <MyTripsTable key={this.props.lastPath} lastPath={this.props.lastPath} />
        </Page>
        {
          this.props.isAssigning &&
          <ModalContainer>
            <AssignTripModal />
          </ModalContainer>
        }
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const {outboundTripsService} = state.app;
  const routes = ownProps.routes;
  const paths = routes[routes.length-1].path.split('/');
  const lastPath = paths[paths.length-1];
  const {isAssigning, total, isFetching} = outboundTripsService;

  return {
    lastPath,
    isAssigning,
    total,
    isFetching
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
