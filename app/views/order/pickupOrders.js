import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import PickupOrdersTable from './pickupOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../base';
import Accordion from './pickupOrdersAccordion';
import * as PickupOrders from '../../modules/pickupOrders';
import Infographic from './infoGraphic';

const PickupOrdersPage = React.createClass({
  componentWillMount() {
    if (!this.props.userLogged.hubID) {
      window.location.href ='/myorders';
    }
  },
  render() {
    return (
      <Page title="Pickup Orders" additional="Get this order from merchant">
        <Infographic />
        <Accordion />
        <PickupOrdersTable />
      </Page>
    );
  }
});

function mapState(state) {
  const {pickupOrders} = state.app;
  const userLogged = state.app.userLogged;
  const {isGrouping} = pickupOrders;

  return {
    isGrouping,
    userLogged
  }
}

function mapDispatch(dispatch) {
  return {
    GroupOrders: () => {
      dispatch(PickupOrders.GroupOrders());
    }
  }
}

export default connect(mapState, mapDispatch)(PickupOrdersPage);
