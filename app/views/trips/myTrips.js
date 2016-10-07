import React from 'react';
import {connect} from 'react-redux';
import {Input, Page} from '../base';
import * as InboundTrips from '../../modules/inboundTrips';
import MyTripsTable from './myTripsTable';
import InboundTable from './inboundTable';
import FleetsFetch from '../../modules/drivers/actions/fleetsFetch';
import styles from './styles.css';
import formStyles from '../../components/form.css';

const ContainerPage = React.createClass({
  componentWillMount() {
    this.props.fleetsFetch();
  },
  gotoContainer(containerNumber) {
    this.props.gotoContainer(containerNumber);
  },
  render() {
    const isInbound = this.props.isInbound;
    const title = isInbound ? "Inbound Trips" : "Outbound Trips";
    return (
      <div>
        <Page title={title}>
        {
          isInbound &&
          <div>
            <span className={'row ' + styles.finderWrapper} style={{top: -10}}>
              <span className={'col-xs-6 ' + styles.finderLabel} onKeyDown={this.jumpTo}>
                Jump to Container :
              </span>
              <span className={'col-xs-6'}>
                <Input className={formStyles.inputSmall} onChange={this.onChange} onEnterKeyPressed={this.gotoContainer} />
              </span>
            </span>
            <InboundTable key={this.props.lastPath} lastPath={this.props.lastPath} isInbound={this.props.isInbound} />
          </div>
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

function DispatchToPage(dispatch) {
  return {
    gotoContainer: (containerNumber) => {
      dispatch(InboundTrips.GoToContainer(containerNumber));
    },
    fleetsFetch: () => {
      dispatch(FleetsFetch());
    }
  }
}

export default connect(StateToProps, DispatchToPage)(ContainerPage);
