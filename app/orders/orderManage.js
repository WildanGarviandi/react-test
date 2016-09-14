import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import * as OrderService from './orderService';
import styles from './styles.css';
import configValues from '../config/configValues.json';
import DateTime from 'react-datetime';
import moment from 'moment';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {Link} from 'react-router';

const InputRow = React.createClass({
  render() {
    const {isEditing, label, value, onChange, type} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
          <span className={styles.itemValue}>
            <Form.InputWithDefault currentText={value} onChange={this.props.onChange} type={type} />
          </span>
      </div>
    );
  }
});

const DropdownRow = React.createClass({
  render() {
    const {isEditing, label, value, onChange, type, options, handleSelect} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
          <span className={styles.itemValue}>
            <Form.DropdownWithState initialValue={value} options={options} handleSelect={handleSelect} />
          </span>
      </div>
    );
  }
});

const DatetimeRow = React.createClass({
    render() {
        const {isEditing, label, value, onChange, type, options, handleSelect} = this.props;

        return (
          <div style={{clear: 'both'}}>
            <span className={styles.itemLabel}>{label}</span>
              <span className={styles.itemValue}>
                <DateTime onChange={this.props.onChange} defaultValue={value} />
              </span>
          </div>
        );
    }
});

const ManagePage = React.createClass({
    getInitialState() {
        return ({showContactModal: false});
    },
    openModal() {
        this.setState({showContactModal: true});
    },
    closeModal() {
        this.setState({showContactModal: false});
    },
    componentWillMount() {
        if (this.props.params.id) {
            this.props.GetDetails();
        } else {
            this.props.ResetManageOrder();
        }
    },
    stateChange(key) {
        return (value) => {
            this.setState({[key]: value});
            if (typeof value === 'object') {
                this.setState({[key]: value.key});
            }
            if (typeof value === 'object' && value._isAMomentObject) {
                this.setState({[key]: value});
            }
        };
    },
    submit() {
        let updatedData = lodash.assign({}, this.state);
        delete updatedData.showContactModal;
        this.props.AddOrder(updatedData);
        console.log(updatedData);
    },
    render() {
        const {isEditing, statusList, isFetching} = this.props;
        const Title = this.props.params.id ? "Edit Order" : "Add Order";
        const order = this.props.params.id ? this.props.order : {};
        const vehicleOptions = configValues.vehicle;

        const statusOptions = lodash.chain(statusList)
            .map((key, val) => ({key:key, value: val.toUpperCase()}))
            .sortBy((arr) => (arr.key))
            .value();

        const saveBtnProps = {
            textBase: "Save",
            textLoading: "Saving Changes",
            onClick: this.submit,
            styles: {
                base: styles.weightSaveBtn,
            },
        };

        const saveBtnContact = {
            textBase: "Save",
            textLoading: "Saving Changes",
            onClick: this.saveContact,
            styles: {
                base: styles.weightSaveBtn,
            },
        };

        const addShipperButton = {
            textBase: 'Add New',
            onClick: this.openModal,
            styles: {
                base: styles.weightSaveBtn
            }
        };


        if (isFetching) {
            return (
                <Page title={Title}>
                    <div>
                        Loading
                    </div>
                </Page>
            );
        } else {
            return (
                <Page title={Title}>
                    <div className={styles.orderDetailsHeader}>
                        Contact Information
                    </div>
                    <div className={styles.orderDetailsInformation}>
                        <DropdownRow label={'Shipper'} value={order.OrderStatus && order.OrderStatus.OrderStatus} options={statusOptions} handleSelect={this.stateChange('Status')} />
                        <span onClick={this.openModal}>
                          { <ButtonWithLoading {...addShipperButton} /> }
                          {
                            this.state.showContactModal &&
                            <ModalContainer onClose={this.closeModal}>
                              <ModalDialog onClose={this.closeModal}>
                                <h1>Add New Contact</h1>
                                <InputRow label={'Name'} type={'text'} onChange={this.stateChange('Name') } />
                                <InputRow label={'Mobile'} type={'text'} onChange={this.stateChange('Mobile') } />
                                <InputRow label={'Email'} type={'text'} onChange={this.stateChange('Email') } />
                                <InputRow label={'Address'} type={'text'} onChange={this.stateChange('Address') } />
                                <InputRow label={'State'} type={'text'} onChange={this.stateChange('State') } />
                                <InputRow label={'City'} type={'text'} onChange={this.stateChange('City') } />
                                <InputRow label={'Zip'} type={'text'} onChange={this.stateChange('Zip') } />
                                <div style={{clear: 'both'}}>
                                    { <ButtonWithLoading {...saveBtnContact} /> }
                                </div>
                              </ModalDialog>
                            </ModalContainer>
                          }
                        </span>
                        <DropdownRow label={'Pickup'} value={order.OrderStatus && order.OrderStatus.OrderStatus} options={statusOptions} handleSelect={this.stateChange('Status')} />
                        <DropdownRow label={'Dropoff'} value={order.OrderStatus && order.OrderStatus.OrderStatus} options={statusOptions} handleSelect={this.stateChange('Status')} />
                    </div>
                    <div className={styles.orderDetailsBoxLeft}>
                        <div className={styles.orderDetailsHeader}>
                            Order Details
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputRow label={'WebOrderID'} value={order.WebOrderID} type={'text'} onChange={this.stateChange('WebOrderID') } />
                            <DropdownRow label={'Vehicle'} value={order.Vehicle && order.Vehicle.Name} options={vehicleOptions} handleSelect={this.stateChange('Vehicle')} />
                            <InputRow label={'PackageDetails'} value={order.OrderMessage} type={'text'} onChange={this.stateChange('PackageDetails') } />
                            <InputRow label={'DeliveryInstructions'} value={order.DeliveryInstructions} type={'text'} onChange={this.stateChange('DeliveryInstructions') } />
                            <DatetimeRow label={'PickupTime'} value={order.PickupTime} onChange={this.stateChange('PickupTime') } />
                        </div>
                    </div> 
                    <div className={styles.orderDetailsBoxRight}>
                        <div className={styles.orderDetailsHeader}>
                            Order Dimension and Cost
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputRow label={'DeliveryFee'} value={order.OrderCost} type={'number'} onChange={this.stateChange('DeliveryFee') } />
                            <InputRow label={'PackageWeight'} value={order.PackageWeight} type={'number'} onChange={this.stateChange('PackageWeight') } />
                            <InputRow label={'PackageVolume'} value={order.PackageVolume} type={'number'} onChange={this.stateChange('PackageVolume') } />
                            <InputRow label={'PackageWidth'} value={order.PackageWidth} type={'number'} onChange={this.stateChange('PackageWidth') } />
                            <InputRow label={'PackageHeight'} value={order.PackageHeight} type={'number'} onChange={this.stateChange('PackageHeight') } />
                            <InputRow label={'PackageLength'} value={order.PackageLength} type={'number'} onChange={this.stateChange('PackageLength') } />
                        </div> 
                    </div>
                    <div style={{clear: 'both'}}>
                        { <ButtonWithLoading {...saveBtnProps} /> }
                    </div>
                </Page>
            );
        }
    }
});

function StoreToOrdersPage(store) {
    const {isEditing, order, isFetching} = store.app.myOrders;
    const {statusList} = store.app.containers;
    return {
        statusList,
        order,
        isEditing,
        isFetching
    }
}

function mapDispatchToOrders(dispatch, ownProps) {
  return {
    ResetManageOrder: () => {
      dispatch(OrderService.resetManageOrder());
    },
    GetDetails: () => {
      dispatch(OrderService.fetchDetails(ownProps.params.id));
    },
    AddOrder: (order) => {
      dispatch(OrderService.addOrder(order));
    }
  }
}

export default connect(StoreToOrdersPage, mapDispatchToOrders)(ManagePage);
