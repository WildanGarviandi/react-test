import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import styles from './styles.scss';
import { ButtonWithLoading, Input, Page, Glyph } from '../views/base';
import { InputWithDefault, CheckBox } from '../views/base/input';
import * as OrdersDetails from './orderDetailsService';
import { formatDate } from '../helper/time';

const conf = {
  Actions: { title: "Actions", cellType: "Actions" },
  DriverShare: { title: "Driver Share" },
  DropoffAddress: { filterType: "String", title: "Dropoff Address", cellType: "String" },
  DropoffCity: { filterType: "String", title: "City", cellType: "String" },
  DropoffState: { filterType: "String", title: "State", cellType: "String" },
  DropoffTime: { title: "Dropoff Time" },
  DueTime: { title: "Deadline", cellType: "Datetime" },
  EtobeeShare: { title: "Etobee Share" },
  FinalCost: { title: "Final Cost" },
  ID: { filterType: "String", title: "AWB / Web Order ID", cellType: "IDLink" },
  IncludeInsurance: { title: "Include Insurance" },
  IsChecked: { headerType: "Checkbox", cellType: "Checkbox" },
  LogisticShare: { title: "Logistic Share" },
  NextDestination: { filterType: "String", title: "Suggested Destination", cellType: "String" },
  OrderCost: { title: "Order Cost" },
  DeliveryFee: { title: "Delivery Fee" },
  OrderStatus: { filterType: "StatusDropdown", title: "Order Status", cellType: "Status" },
  PackageHeight: { title: "Height" },
  PackageLength: { title: "Length" },
  PackageWeight: { title: "Weight" },
  PackageWidth: { title: "Width" },
  PickupAddress: { filterType: "String", title: "Pickup Address", cellType: "String" },
  PickupCity: { filterType: "String", title: "City", cellType: "String" },
  PickupState: { filterType: "String", title: "State", cellType: "String" },
  PickupTime: { filterType: "DateTime", title: "Pickup Time", cellType: "Datetime" },
  PickupType: { title: "Pickup Type" },
  RouteStatus: { filterType: "StatusDropdown", title: "Route Status", cellType: "String" },
  TotalValue: { title: "Total Value" },
  UseExtraHelper: { title: "Use Extra Helper" },
  User: { title: "User" },
  UserOrderNumber: { filterType: "String", title: "AWB", cellType: "Link" },
  VAT: { title: "VAT" },
  WebOrderID: { filterType: "String", title: "Web Order ID", cellType: "String" },
  WebstoreName: { filterType: "String", title: "Webstore Name", cellType: "String" },
  Weight: { filterType: "String", title: "Weight", cellType: "String" },
  ZipCode: { filterType: "String", title: "Zip Code", cellType: "String" },
  IsCOD: { title: "COD Order" },
  SuggestedVendors: { title: "Suggested Vendors", cellType: "Array", filterType: "String" },
};

const orderDetailsSummary = ["UserOrderNumber", "WebOrderID", "User", "PickupType", "RouteStatus", "PickupTime", "PickupAddress", "DropoffTime", "DropoffAddress", "DueTime", "NextDestination"];
const orderDetailsPackage = ["PackageWeight", "PackageLength", "PackageWidth", "PackageHeight"];
const orderDetailsCost = ["TotalValue", "IsCOD"];
const orderDetailsPricing = ["DeliveryFee", "FinalCost", "VAT", "IncludeInsurance", "UseExtraHelper", "EtobeeShare", "DriverShare", "LogisticShare"];

const boolAttributes = ["IncludeInsurance", "UseExtraHelper", "IsCOD"];
const dateTimeAttributes = ["Pickup Time", "Dropoff Time", "Deadline"];

const DetailRow = React.createClass({
  render() {
    const { isEditing, label, value, unit } = this.props;

    return (
      <div className="row">
        <div className={styles.colMd4}>
          <p>{label}</p>
        </div>
        <div className={styles.colMd1}>
          <p>:</p>
        </div>
        <div className={styles.colMd7}>
          {
            !isEditing && !dateTimeAttributes.includes(label) &&
            <span className={styles.itemValue}>{value + ' ' + unit}</span>
          }
          {
            !isEditing && dateTimeAttributes.includes(label) &&
            <span className={styles.itemValue}>{formatDate(value)}</span>
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
    let updatedData = lodash.assign({}, this.state);
    delete updatedData.isEditing;
    this.props.UpdateOrder(updatedData);
    let updatedDataBoolean = lodash.intersection(lodash.keys(updatedData), boolAttributes);
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
        base: styles.btnEdit,
      },
    }

    const saveBtnProps = {
      textBase: "Save",
      textLoading: "Saving Changes",
      isLoading: isUpdating,
      onClick: this.submit,
      styles: {
        base: styles.btnEdit,
      },
    }

    const cancelBtnProps = {
      textBase: "Cancel",
      textLoading: "Grouping Orders",
      isLoading: false,
      onClick: this.props.EndEdit,
      styles: {
        base: styles.btnCancel,
      },
    }

    function PackageUnit(type) {
      switch (type) {
        case 'PackageWeight': return 'kg';
        default: return 'cm';
      }
    }

    const colls = lodash.map(rows, (row) => {
      return <DetailRow key={row.key} label={conf[row.key].title} value={order[row.key]} unit={PackageUnit(row.key)}
        isEditing={row.canEdit && isEditing} onChange={this.textChange(row.key)} submitForm={this.submit} />
    });

    return (
      <div className={styles.colMd4}>
        <p className={styles.title}>{title}
          {
            canEdit &&
            <div className="pull-right">
              {!isEditing && <ButtonWithLoading {...editBtnProps} />}
              {isEditing && <ButtonWithLoading {...saveBtnProps} />}
              {isEditing && !isUpdating && <ButtonWithLoading {...cancelBtnProps} />}
            </div>
          }
        </p>
        {colls}
      </div>
    );
  }
})

const Details = React.createClass({
  getInitialState() {
    return ({
      showAddressWebstore: false,
      showAddressDropoff: false
    });
  },
  showAddressWebstore() {
    this.setState({ showAddressWebstore: true });
  },
  hideAddressWebstore() {
    this.setState({ showAddressWebstore: false });
  },
  showAddressDropoff() {
    this.setState({ showAddressDropoff: true });
  },
  hideAddressDropoff() {
    this.setState({ showAddressDropoff: false });
  },
  componentWillMount() {
    this.props.GetDetails();
    if (document.referrer.split('/').pop() === 'received') {
      this.props.StartEdit();
    }
  },
  render() {
    const { canEdit, isEditing, isFetching, isUpdating, order,
      StartEdit, EndEdit, UpdateOrder, GetDetails, editCOD, editVolume, editWeight } = this.props;

    const Title = "Order Details";

    const summaryRows = orderDetailsSummary.map(function (val) {
      return {
        key: val,
        canEdit: false
      }
    });

    const costRows = orderDetailsPackage.map(function (val) {
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
            <div className={styles.mB15 + " nb"}>
              <div className="row">
                <div className={styles.colMd6 + ' ' + styles.orderTitle}>
                  <h4>{(order.UserOrderNumber || "")}
                    <span> / {(order.WebOrderID || "")}</span>
                    <span className={styles.bgGray}>{(order.CurrentRoute && order.CurrentRoute.OrderStatus ? order.CurrentRoute.OrderStatus.OrderStatus : '')}</span>
                  </h4>
                </div>
              </div>
            </div>
            <div className="nb">
              <div className={styles.mB30 + " row"}>
                <div className={styles.colMd4}>
                  <div className={styles.infoArea + ' ' + styles.bgWhite}>
                    <p className={styles.title}>FROM</p>
                    <p><b>{order.WebstoreName}</b></p>
                    <p>{(order.Pickup) ? order.Pickup.City + ', ' + order.Pickup.ZipCode : ''}</p>
                    {
                      this.state.showAddressWebstore &&
                      <div>
                        <a href="#" onClick={this.hideAddressWebstore}>hide full address</a>
                        <p>{order.PickupAddress}</p>
                      </div>
                    }
                    {
                      !this.state.showAddressWebstore &&
                      <a href="#" onClick={this.showAddressWebstore}>show full address</a>
                    }
                  </div>
                </div>
                <div className={styles.colMd4}>
                  <div className={styles.infoArea + ' ' + styles.bgWhite}>
                    <p className={styles.title}>TO</p>
                    <p><b>{(order.Dropoff) ? order.Dropoff.FirstName + ' ' + order.Dropoff.LastName : ''}</b></p>
                    <p><Glyph name={'arrow-right'} className={styles.glyph} /> {(order.Dropoff) ? order.Dropoff.City + ', ' + order.Dropoff.ZipCode : ''}</p>
                    {
                      this.state.showAddressDropoff &&
                      <div>
                        <a href="#" onClick={this.hideAddressDropoff}>hide full address</a>
                        <p>{order.DropoffAddress}</p>
                      </div>
                    }
                    {
                      !this.state.showAddressDropoff &&
                      <a href="#" onClick={this.showAddressDropoff}>show full address</a>
                    }
                  </div>
                </div>
                <div className={styles.colMd4}>
                  <div className={styles.infoArea + ' ' + styles.bgWhite + ' ' + styles.infoService}>
                    <h2>{order.PickupTypeAbbr}</h2>
                    <p>{order.PickupType}</p>
                  </div>
                </div>
              </div>
              <div className={styles.mB30 + " row"}>
                <div className={styles.colMd4}>
                  <p className={styles.title}>FEES</p>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Delivery Fee</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      Rp. {order.DeliveryFee}
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>VAT</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      Rp. {order.VAT}
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Use Insurance</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      {order.IncludeInsurance}, Rp.
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Use Extra Helper</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      {order.UseExtraHelper}, Rp.
                    </div>
                  </div>
                  <div className={styles.finalCost}>
                    <div className="row">
                      <div className={styles.colMd4}>
                        <p><b>Final Cost</b></p>
                      </div>
                      <div className={styles.colMd1}>
                        :
                      </div>
                      <div className={styles.colMd7}>
                        Rp. {order.FinalCost}
                      </div>
                    </div>
                  </div>
                </div>

                <DetailAcc rows={costRows} order={order} title={"WEIGHT & DIMENSION"} canEdit={canEdit} isEditing={isEditing} isUpdating={isUpdating} UpdateOrder={UpdateOrder} GetDetails={GetDetails} StartEdit={StartEdit} EndEdit={EndEdit} />

                <div className={styles.colMd4}>
                  <p className={styles.title}>COD</p>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Package Value</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      Rp. {order.CODValue}
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Is COD Order</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      {order.IsCOD}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.mB30 + " row"}>
                <div className={styles.colMd4}>
                  <p className={styles.title}>HISTORY</p>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Pickup Time</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      {moment(order.PickupTime).format('H:mm. DD MMM, YYYY')}.
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Cutoff Time</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      {moment(order.CutoffTime).format('H:mm. DD MMM, YYYY')}.
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Pickup Time</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      {moment(order.PickupTime).format('H:mm. DD MMM, YYYY')}.
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Dropoff Time</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      {moment(order.DropoffTime).format('H:mm. DD MMM, YYYY')}.
                    </div>
                  </div>
                  <div className="row">
                    <div className={styles.colMd4}>
                      <p>Deadline</p>
                    </div>
                    <div className={styles.colMd1}>
                      :
                    </div>
                    <div className={styles.colMd7}>
                      <p className={styles.red}>{moment(order.DueTime).format('H:mm. DD MMM, YYYY')}.</p>
                    </div>
                  </div>
                </div>
                <div className={styles.colMd4}>
                  <p className={styles.title}>PROOF OF DELIVERY</p>
                  {
                    (order.CurrentRoute && order.CurrentRoute.OrderStatus && order.CurrentRoute.OrderStatus.OrderStatus !== 'DELIVERED') ?
                      <p>Package not yet delivered</p>
                      :
                      <div>
                        <div className="row">
                          <div className={styles.colMd5}>
                            <p>Recipient Name</p>
                          </div>
                          <div className={styles.colMd1}>
                            :
                        </div>
                          <div className={styles.colMd6}>
                            {order.RecipientName}
                          </div>
                        </div>
                        <div className="row">
                          <div className={styles.colMd5}>
                            <p>Recipient Phone</p>
                          </div>
                          <div className={styles.colMd1}>
                            :
                        </div>
                          <div className={styles.colMd6}>
                            {order.RecipientPhone}
                          </div>
                        </div>
                        <div className="row">
                          <div className={styles.colMd5}>
                            <p>Recipient Relation</p>
                          </div>
                          <div className={styles.colMd1}>
                            :
                        </div>
                          <div className={styles.colMd6}>
                            {order.RecipientRelation}
                          </div>
                        </div>
                        <div className="row">
                          <div className={styles.colMd6}>
                            <p><b>Signature</b></p>
                            <img className={styles.colMd12} src={order.RecipientSignature} />
                          </div>
                          <div className={styles.colMd6}>
                            <p><b>Photo</b></p>
                            <img className={styles.colMd12} src={order.RecipientPhoto} />
                          </div>
                        </div>
                      </div>
                  }
                </div>
              </div>
            </div>
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
