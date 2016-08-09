import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {orderDetails} from './ordersColumns';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../base';
import {InputWithState} from '../base/input';
import * as OrdersDetails from '../../modules/orders/actions/details';
import OrdersSelector from '../../modules/orders/selector';

const Details = React.createClass({
  getInitialState() {
    return {isEditing: false};
  },
  toEdit() {
    this.setState({isEditing: true});
  },
  stopEdit() {
    this.setState({isEditing: false});
  },
  componentWillMount() {
    this.props.GetDetails();
  },
  render() {
    const {isFetching, order} = this.props;
    const {isEditing} = this.state;

    const editBtnProps = {
      textBase: "Edit",
      textLoading: "Grouping Orders",
      isLoading: false,
      onClick: this.toEdit,
      styles: {
        base: styles.weightEditBtn,
      },
    }

    const saveBtnProps = {
      textBase: "Save",
      textLoading: "Saving",
      isLoading: false,
      onClick: this.stopEdit,
      styles: {
        base: styles.weightSaveBtn,
      },
    }

    const cancelBtnProps = {
      textBase: "Cancel",
      textLoading: "Grouping Orders",
      isLoading: false,
      onClick: this.stopEdit,
      styles: {
        base: styles.weightCancelBtn,
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

    const r2Edit = lodash.map(orderDetails.slice(9, 14), (row) => {
      return (
        <div key={row} style={{clear: 'both'}}>
          <span className={styles.itemLabel}>{row}</span>
          <span className={styles.itemValue}>
            :
            <InputWithState currentText={order[row]} />
          </span>
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
        {
          isFetching &&
          <h3>Fetching order details...</h3>
        }
        {
          !isFetching &&
          <div>
            <div className={styles.detailWrapper} style={{height: 365}}>
              {r1}
            </div>
            <div className={classNaming(styles.detailWrapper, styles.right, styles.detailsPanel)}>
              { !isEditing && <ButtonWithLoading {...editBtnProps} /> }
              { !isEditing && r2 }
              { isEditing && <ButtonWithLoading {...saveBtnProps} /> }
              { isEditing && <ButtonWithLoading {...cancelBtnProps} /> }
              { isEditing && r2Edit}
            </div>
            <div className={classNaming(styles.detailWrapper, styles.right, styles.detailsPanel)}>
              {r3}
            </div>
          </div>
        }
      </Page>
    );
  }
});

function mapStateToPickupOrders(state) {
  const canEdit = state.userLogged && state.userLogged.isCentralHub;
  const {isFetching, order} = state.app.orderDetails;
  console.log('o', order);
  return {
    canEdit,
    isFetching,
    order,
  }
}

function mapDispatchToPickupOrders(dispatch, ownProps) {
  return {
    GetDetails: () => {
      dispatch(OrdersDetails.fetchDetails(ownProps.params.id));
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Details);
