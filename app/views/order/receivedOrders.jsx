import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import ReceivedOrdersTable from './receivedOrdersTable';
import styles from './styles.scss';
import {ButtonWithLoading, Input, Page} from '../base';
import Accordion from './receivedOrdersAccordion';
import * as ReceivedOrders from '../../modules/receivedOrders';

const PickupOrders = React.createClass({
  componentWillMount() {
    this.props.ResetFilter();
  },
  render() {
    return (
      <Page title="Received Orders" additional="Deliver this order to next destination">
        <Accordion />
        <ReceivedOrdersTable />
      </Page>
    );
  }
});

function mapState(state) {
  const {receivedOrders} = state.app;
  const {isGrouping} = receivedOrders;

  return {
    isGrouping,
  }
}

function mapDispatch(dispatch) {
  return {
    Goto: (id) => {
      dispatch(push('/orders/' + id));
    },
    GroupOrders: () => {
      dispatch(ReceivedOrders.ConsolidateOrders());
    },
    FindID: (id) => {
      dispatch(ReceivedOrders.GoToDetails(id));
    },
    ResetFilter: () => {
      dispatch(ReceivedOrders.ResetFilter());
    }
  }
}

export default connect(mapState, mapDispatch)(PickupOrders);
