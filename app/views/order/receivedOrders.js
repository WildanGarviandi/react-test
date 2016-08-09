import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import ReceivedOrdersTable from './receivedOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../base';
import Accordion from './receivedOrdersAccordion';
import * as OrdersReceived from '../../modules/orders/actions/received';

const PickupOrders = React.createClass({
  getInitialState() {
    return {id: ''};
  },
  onChange(text) {
    this.setState({id: text});
  },
  onEnterKeyPressed(text) {
    this.props.Goto(text);
  },
  render() {
    const groupingOrdersBtnProps = {
      textBase: "Consolidate Orders",
      textLoading: "Consolidate Orders",
      isLoading: this.props.isGrouping,
      onClick: this.props.GroupOrders,
    }

    return (
      <Page title="Received Orders">
        <span className={styles.finderWrapper}>
          <span className={styles.finderLabel}>
            Jump to OrderID :
          </span>
          <Input onChange={this.onChange} onEnterKeyPressed={this.onEnterKeyPressed} />
        </span>
        <ButtonWithLoading {...groupingOrdersBtnProps} />
        <Accordion />
        <ReceivedOrdersTable />
      </Page>
    );
  }
});

function mapState(state) {
  const {pickupOrders} = state.app;
  const {isGrouping} = pickupOrders;

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
      dispatch(OrdersReceived.groupOrders());
    }
  }
}

export default connect(mapState, mapDispatch)(PickupOrders);
