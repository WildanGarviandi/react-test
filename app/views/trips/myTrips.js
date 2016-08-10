import React from 'react';
import {connect} from 'react-redux';
import {TripsSetQueryType} from '../../modules/trips/actions/tripsFetch';
import {Page} from '../base';
import MyTripsTable from './myTripsTable';

const ContainerPage = React.createClass({
  componentWillMount() {
    this.props.setQueryType(this.props.path);
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path) {
      this.props.setQueryType(nextProps.path);
    }
  },
  render() {
    const title = this.props.path === "/myTrips" ? "Inbound Trips" : "Outbound Trips";
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

function DispatchToProps(dispatch) {
  return {
    setQueryType(queryType) {
      dispatch(TripsSetQueryType(queryType));
    }
  };
};

export default connect(StateToProps, DispatchToProps)(ContainerPage);
