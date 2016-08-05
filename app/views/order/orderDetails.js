import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {orderDetails} from './ordersColumns';
import styles from './styles.css';
import {ButtonWithLoading, Page} from '../base';
import OrdersPickup from '../../modules/orders/actions/pickup';
import OrdersSelector from '../../modules/orders/selector';

const Details = React.createClass({
  componentWillMount() {
    this.props.GetList();
  },
  render() {
    const {order} = this.props;

    const editBtnProps = {
      textBase: "Edit",
      textLoading: "Grouping Orders",
      isLoading: false,
      onClick: () => null,
      styles: {
        base: styles.weightEditBtn,
      },
    }

    const r1 = lodash.map(orderDetails.slice(0,9), (row) => {
      return (
        <div key={row} style={{clear: 'both'}}>
          <span className={styles.itemLabel}>{row}</span>
          <span className={styles.itemValue}>: {order[row]}</span>
        </div>
      );
    });

    const r2 = lodash.map(orderDetails.slice(9, 14), (row) => {
      return (
        <div key={row} style={{clear: 'both'}}>
          <span className={styles.itemLabel}>{row}</span>
          <span className={styles.itemValue}>: {order[row]}</span>
        </div>
      );
    });

    const r3 = lodash.map(orderDetails.slice(14), (row) => {
      return (
        <div key={row} style={{clear: 'both'}}>
          <span className={styles.itemLabel}>{row}</span>
          <span className={styles.itemValue}>: {order[row]}</span>
        </div>
      );
    });

    return (
      <Page title="Order Details">
        <div className={styles.detailWrapper} style={{height: 365}}>
          {r1}
        </div>
        <div className={classNaming(styles.detailWrapper, styles.right, styles.detailsPanel)}>
          <ButtonWithLoading {...editBtnProps} />
          {r2}
        </div>
        <div className={classNaming(styles.detailWrapper, styles.right, styles.detailsPanel)}>
          {r3}
        </div>
      </Page>
    );
  }
});

function mapStateToPickupOrders(state) {
  const items = OrdersSelector.GetOrders(state);
  return {
    order: items[0] || {},
  }
}

function mapDispatchToPickupOrders(dispatch) {
  return {
    GetList: () => {
      dispatch(OrdersPickup.Fetch());
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Details);
