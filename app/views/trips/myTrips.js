import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../base';
import MyTripsTable from './myTripsTable';
import InboundTable from './inboundTable';

const ContainerPage = React.createClass({
  render() {
    const isInbound = this.props.isInbound;
    const title = isInbound ? "Inbound Trips" : "Outbound Trips";
    return (
      <div>
        <Page title={title}>
        {
          isInbound &&
          <InboundTable key={this.props.lastPath} lastPath={this.props.lastPath} isInbound={this.props.isInbound} />
        }
        {
          !isInbound &&
          <MyTripsTable key={this.props.lastPath} lastPath={this.props.lastPath} isInbound={this.props.isInbound} />
        }
        </Page>
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const routes = ownProps.routes;
  const paths = routes[routes.length-1].path.split('/');
  const lastPath = paths[paths.length-1];
  const isInbound = lastPath === "inbound";

  return {
    lastPath,
    isInbound,
  };
};

export default connect(StateToProps)(ContainerPage);
