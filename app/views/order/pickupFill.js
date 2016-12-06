import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import PickupOrdersTable from './pickupOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../base';
import Accordion from './pickupOrdersAccordion';
import * as OrdersPickup from '../../modules/orders/actions/pickup';
import * as OrdersPickup2 from '../../modules/pickupOrders';

const PickupOrders = React.createClass({
  getInitialState() {
    return {id: ''};
  },
  componentWillMount() {
    this.props.ResetFilter();
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
      <Page title="Add Orders to Trip" backButton="true">
        <Accordion />
        <PickupOrdersTable isFill={true}  GroupOrders={this.props.GroupOrders} />
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
      dispatch(OrdersPickup.fillTrip(tripID));
    },
    ResetFilter: () => {
      dispatch(OrdersPickup2.ResetFilter());
    }
  }
}

export default connect(mapState, mapDispatch)(PickupOrders);
