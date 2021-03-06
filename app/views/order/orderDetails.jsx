import React from 'react';
import { connect } from 'react-redux';

import classNaming from 'classnames';
import * as _ from 'lodash';

import { conf, orderDetailsSummary, orderDetailsCost,
  orderDetailsPricing } from './ordersColumns';
import styles from './styles.scss';
import Accordion from '../../components/Accordion';
import { ButtonWithLoading, Page } from '../base';
import { InputWithDefault, CheckBox } from '../base/input';
import * as OrdersDetails from '../../modules/orders/actions/details';
import { formatDate } from '../../helper/time';

const boolAttributes = ["IncludeInsurance", "UseExtraHelper", "IsCOD"];
const dateTimeAttributes = ["Pickup Time", "Dropoff Time", "Deadline"];

const DetailRow = React.createClass({
  render() {
    const { isEditing, label, value } = this.props;

    return (
      <div style={{ clear: 'both' }}>
        <span className={styles.itemLabel}>{label}</span>
        {
          !isEditing && !dateTimeAttributes.includes(label) &&
          <span className={styles.itemValue}>: {value}</span>
        }
        {
          !isEditing && dateTimeAttributes.includes(label) &&
          <span className={styles.itemValue}>: {formatDate(value)}</span>
        }
        {
          isEditing && !(value === 'Yes' || value === 'No') &&
          <span className={styles.itemValue}>
            <InputWithDefault handleSelect={this.props.submitForm} autoFocus={label === 'Package Weight'} currentText={value} onChange={this.props.onChange} type="number" />
          </span>
        }
        {
          isEditing && (value === 'Yes' || value === 'No') &&
          <span className={styles.itemValue}>
            <CheckBox styles={styles} onEnterKeyPressed={this.props.submitForm} checked={value === 'Yes'} onChange={this.props.onChange} />
          </span>
        }
      </div>
    );
  }
});

const DetailAcc = React.createClass({
  textChange(key) {
    return (value) => {
      this.setState({ [key]: value });
    };
  },
  submit() {
    let updatedData = _.assign({}, this.state);
    delete updatedData.isEditing;
    this.props.UpdateOrder(updatedData);
    let updatedDataBoolean = _.intersection(_.keys(updatedData), boolAttributes);
    updatedDataBoolean.forEach(function (key) {
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
    const { accordionAction, accordionState, height, rows, order, title, topStyle, canEdit, isEditing, isUpdating } = this.props;

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

    const colls = _.map(rows, (row) => {
      return <DetailRow key={row.key} label={conf[row.key].title} value={order[row.key]}
        isEditing={row.canEdit && isEditing} onChange={this.textChange(row.key)} submitForm={this.submit} />
    });

    return (
      <div className={topStyle || styles.detailWrapper} >
        <div className={styles.accHeader}>
          {title}
        </div>
        <div style={{ height: height }}>
          {colls}
        </div>
        {
          canEdit &&
          <div className={styles.btnColls}>
            {!isEditing && <ButtonWithLoading {...editBtnProps} />}
            {isEditing && <ButtonWithLoading {...saveBtnProps} />}
            {isEditing && !isUpdating && <ButtonWithLoading {...cancelBtnProps} />}
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
    const { canEdit, isEditing, isFetching, isUpdating, order,
      StartEdit, EndEdit, UpdateOrder, GetDetails, editCOD, editVolume, editWeight } = this.props;

    const Title = "Order Details " + (order.UserOrderNumber || "");

    const summaryRows = orderDetailsSummary.map(function (val) {
      return {
        key: val,
        canEdit: false
      }
    });

    const costRows = orderDetailsCost.map(function (val) {
      var canEdit = false;
      if (val === 'PackageWeight') {
        canEdit = editWeight;
      } else if (['PackageHeight', 'PackageWidth', 'PackageLength'].includes(val)) {
        canEdit = editVolume;
      } else if (['TotalValue', 'IsCOD'].includes(val)) {
        canEdit = editCOD;
      }
      return {
        key: val,
        canEdit: canEdit
      }
    });

    const pricingRows = orderDetailsPricing.map(function (val) {
      return {
        key: val,
        canEdit: false
      }
    });

    return (
      <Page title={Title} backButton="true">
        {
          isFetching &&
          <h3>Fetching order details...</h3>
        }
        {
          !isFetching &&
          <div>
            <Accordion initialState="expanded">
              <DetailAcc rows={summaryRows} order={order} title={"Summary"} topStyle={classNaming(styles.detailWrapper, styles.right, styles.detailsPanel)} />
            </Accordion>
            <Accordion initialState="expanded">
              <DetailAcc rows={costRows} order={order} title={"Cost and Dimension"} canEdit={canEdit} isEditing={isEditing} isUpdating={isUpdating} UpdateOrder={UpdateOrder} GetDetails={GetDetails} StartEdit={StartEdit} EndEdit={EndEdit} />
            </Accordion>
            <Accordion initialState="expanded">
              <DetailAcc rows={pricingRows} order={order} title={"Pricing Details"} />
            </Accordion>
          </div>
        }
      </Page>
    );
  }
});

function mapStateToPickupOrders(state) {
  const { orderDetails, userLogged } = state.app;
  const { editCOD, editVolume, editWeight } = userLogged;
  const { isEditing, isFetching, isUpdating, order } = orderDetails;
  const canEdit = userLogged && (editCOD || editVolume || editWeight);

  return {
    canEdit,
    isEditing,
    isFetching,
    isUpdating,
    order,
    editCOD,
    editVolume,
    editWeight
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
