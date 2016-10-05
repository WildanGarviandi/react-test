import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {conf, orderDetails} from './ordersColumns';
import styles from './styles.css';
import Accordion from '../base/accordion';
import {ButtonWithLoading, Input, Page} from '../base';
import {InputWithDefault, CheckBox} from '../base/input';
import * as OrdersDetails from '../../modules/orders/actions/details';
import OrdersSelector from '../../modules/orders/selector';

const boolAttributes = ["IncludeInsurance", "UseExtraHelper", "IsCOD"];

const DetailRow = React.createClass({
  render() {
    const {isEditing, label, value} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
        {
          !isEditing &&
          <span className={styles.itemValue}>: {value}</span>
        }
        {
          isEditing && !(value === 'Yes' || value === 'No') &&
          <span className={styles.itemValue}>
            :
            <InputWithDefault autoFocus={label === 'Package Weight'} currentText={value} onChange={this.props.onChange} type="number" />
          </span>
        }
        {
          isEditing && (value === 'Yes' || value === 'No') &&
          <span className={styles.itemValue}>
            :
            <CheckBox styles={styles} checked={value === 'Yes'} onChange={this.props.onChange} />
          </span>
        }
      </div>
    );
  }
});

const DetailAcc = React.createClass({
  textChange(key) {
    return (value) => {
      this.setState({[key]: value});
    };
  },
  submit() {
    let updatedData = lodash.assign({}, this.state);
    delete updatedData.isEditing;
    this.props.UpdateOrder(updatedData);
    let updatedDataBoolean = lodash.intersection(lodash.keys(updatedData), boolAttributes);
    updatedDataBoolean.forEach(function(key) {
      updatedData[key] = updatedData[key] ? 'Yes' : 'No';
    });
    setTimeout(() => {
      this.props.GetDetails();
      if (document.referrer.split('/').pop() === 'received') {
        window.close();
      }
    }, 1500);
  },
  render() {
    const {accordionAction, accordionState, height, rows, order, title, topStyle, canEdit, isEditing, isUpdating} = this.props;

    const editBtnProps = {
      textBase: "Edit",
      textLoading: "Grouping Orders",
      isLoading: false,
      onClick: this.props.StartEdit,
      styles: {
        base: styles.weightEditBtn,
      },
    }

    const saveBtnProps = {
      textBase: "Save",
      textLoading: "Saving Changes",
      isLoading: isUpdating,
      onClick: this.submit,
      styles: {
        base: styles.weightSaveBtn,
      },
    }

    const cancelBtnProps = {
      textBase: "Cancel",
      textLoading: "Grouping Orders",
      isLoading: false,
      onClick: this.props.EndEdit,
      styles: {
        base: styles.weightCancelBtn,
      },
    }

    const colls = lodash.map(rows, (row) => {
      return <DetailRow key={row} label={conf[row].title} value={order[row]} isEditing={isEditing} onChange={this.textChange(row) } />
    });

    return (
      <div className={topStyle || styles.detailWrapper} >
        <div className={styles.accHeader}>
          {title}
        </div>
        <div style={{height: height}}>
          {colls}
        </div>
        {
          canEdit &&
          <div className={styles.btnColls}>
            { !isEditing && <ButtonWithLoading {...editBtnProps} /> }
            { isEditing && <ButtonWithLoading {...saveBtnProps} /> }
            { isEditing && !isUpdating && <ButtonWithLoading {...cancelBtnProps} /> }
          </div>
        }
      </div>
    );
  }
})

const Details = React.createClass({
  componentWillMount() {
    this.props.GetDetails();
    if (document.referrer.split('/').pop() === 'received') {
      this.props.StartEdit();
    }
  },
  render() {
    const {canEdit, isEditing, isFetching, isUpdating, order, StartEdit, EndEdit, UpdateOrder, GetDetails} = this.props;

    const r2Edit = lodash.map(orderDetails.slice(9, 15), (row) => {
      return (
        <div key={row} style={{clear: 'both'}}>
          <span className={styles.itemLabel}>{conf[row].title}</span>
        </div>
      );
    });

    const Title = "Order Details " + (order.UserOrderNumber || "");

    return (
      <Page title={Title}>
        {
          isFetching &&
          <h3>Fetching order details...</h3>
        }
        {
          !isFetching &&
          <div>
            <Accordion initialState="expanded">
              <DetailAcc rows={orderDetails.slice(0,9)} order={order} title={"Summary"} topStyle={classNaming(styles.detailWrapper, styles.right, styles.detailsPanel)}/>
            </Accordion>
            <Accordion initialState="expanded">
              <DetailAcc rows={orderDetails.slice(9,15)} order={order} title={"Cost and Dimension"} canEdit={canEdit} isEditing={isEditing} isUpdating={isUpdating} UpdateOrder={UpdateOrder} GetDetails={GetDetails} StartEdit={StartEdit} EndEdit={EndEdit}/>
            </Accordion>
            <Accordion initialState="expanded">
              <DetailAcc rows={orderDetails.slice(15)} order={order} title={"Pricing Details"} />
            </Accordion>
          </div>
        }
      </Page>
    );
  }
});

function mapStateToPickupOrders(state) {
  const canEdit = state.app.userLogged && state.app.userLogged.isCentralHub;
  const {isEditing, isFetching, isUpdating, order} = state.app.orderDetails;

  return {
    canEdit,
    isEditing,
    isFetching,
    isUpdating,
    order,
  }
}

function mapDispatchToPickupOrders(dispatch, ownProps) {
  return {
    GetDetails: () => {
      dispatch(OrdersDetails.fetchDetails(ownProps.params.id));
    },
    UpdateOrder: (order) => {
      dispatch(OrdersDetails.editOrder(ownProps.params.id, order));
    },
    StartEdit: () => {
      dispatch(OrdersDetails.startEditing());
    },
    EndEdit: () => {
      dispatch(OrdersDetails.endEditing());
    }
  }
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Details);
