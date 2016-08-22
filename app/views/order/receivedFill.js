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
    this.props.FindID(text);
  },
  render() {
    const groupingOrdersBtnProps = {
      textBase: "Add Orders",
      textLoading: "Adding Orders",
      isLoading: this.props.isGrouping,
      onClick: this.props.GroupOrders,
      styles: {
        base: this.props.isGrouping ? styles.greenBtnLoading : styles.greenBtn,
      }
    }

    return (
      <Page title="Add Orders to Trip">
        <ButtonWithLoading {...groupingOrdersBtnProps} />
        <Accordion />
        <ReceivedOrdersTable isFill={true}/>
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

function mapDispatch(dispatch, ownParams) {
  const tripID = ownParams.params.tripID;

  return {
    Goto: (id) => {
      dispatch(push('/orders/' + id));
    },
    GroupOrders: () => {
      dispatch(OrdersReceived.fillTrip(tripID));
    },
  }
}

export default connect(mapState, mapDispatch)(PickupOrders);
