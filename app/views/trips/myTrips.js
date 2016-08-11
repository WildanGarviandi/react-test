import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../base';
import MyTripsTable from './myTripsTable';

const ContainerPage = React.createClass({
  render() {
    const title = this.props.path === "/inbound" ? "Inbound Trips" : "Outbound Trips";
    return (
      <div>
        <Page title={title}>
          <MyTripsTable key={this.props.path} />
        </Page>
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const routes = ownProps.routes;
  const path = routes[routes.length-1].path;
  return {
    path,
  };
};

export default connect(StateToProps)(ContainerPage);
