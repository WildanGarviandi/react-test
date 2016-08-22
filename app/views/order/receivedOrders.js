import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import ReceivedOrdersTable from './receivedOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../base';
import Accordion from './receivedOrdersAccordion';
import * as ReceivedOrders from '../../modules/receivedOrders';

const PickupOrders = React.createClass({
  getInitialState() {
    return {id: ''};
  },
  onChange(text) {
    this.setState({id: text});
  },
  onEnterKeyPressed(text) {
    this.props.FindID(text);
  },
  render() {
    const groupingOrdersBtnProps = {
      textBase: "Consolidate Orders",
      textLoading: "Consolidate Orders",
      isLoading: this.props.isGrouping,
      onClick: this.props.GroupOrders,
      styles: {
        base: this.props.isGrouping ? styles.greenBtnLoading : styles.greenBtn,
      }
    }

    return (
      <Page title="Received Orders" additional="Deliver this order to next destination">
        <span className={styles.finderWrapper}>
          <span className={styles.finderLabel} onKeyDown={this.jumpTo}>
            Jump to Order with AWB :
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
  }
}

export default connect(mapState, mapDispatch)(PickupOrders);
