import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import * as OrderService from './orderService';
import * as ContactService from '../contacts/contactService';
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
        return ({
            showContactModal: false,
            PickupName: '',
            PickupCity: '',
            PickupState: '',
            PickupZip: '',
            PickupMobile: '',
            PickupAddress: '',
            PickupAddressDetail: '',
            DropoffName: '',
            DropoffCity: '',
            DropoffState: '',
            DropoffZip: '',
            DropoffMobile: '',
            DropoffAddress: '',
            DropoffAddressDetail: '',
            HasShipper: false,
            ShipperName: '',
            ShipperCity: '',
            ShipperState: '',
            ShipperZip: '',
            ShipperMobile: '',
            ShipperAddress: '',
            ShipperAddressDetail: '',
            PickupTime: new Date(),
            PackageSize: 1,
            DeliveryFee: 0,
            PackageWeight: 0,
            PackageVolume: 0,
            WebOrderID: '',
            PackageWidth: 0,
            PackageHeight: 0,
            PackageLength: 0
        });
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
    componentWillReceiveProps(nextProps) {
        if (nextProps['pickup']) {
            this.setState({
                PickupName: nextProps['pickup'].FirstName + ' ' + nextProps['pickup'].LastName,
                PickupEmail: nextProps['pickup'].Email,
                PickupCity: nextProps['pickup'].City,
                PickupState: nextProps['pickup'].State && nextProps['pickup'].State.Name,
                PickupZip: nextProps['pickup'].ZipCode,
                PickupMobile: nextProps['pickup'].Phone,
                PickupAddress: nextProps['pickup'].Street,
                PickupAddressDetail: nextProps['pickup'].Street
            });
        }

        if (nextProps['dropoff']) {
            this.setState({                
                DropoffName: nextProps['dropoff'].FirstName + ' ' + nextProps['dropoff'].LastName,
                DropoffEmail: nextProps['dropoff'].Email,
                DropoffCity: nextProps['dropoff'].City,
                DropoffState: nextProps['dropoff'].State && nextProps['dropoff'].State.Name,
                DropoffZip: nextProps['dropoff'].ZipCode,
                DropoffMobile: nextProps['dropoff'].Phone,
                DropoffAddress: nextProps['dropoff'].Street,
                DropoffAddressDetail: nextProps['dropoff'].Street
            });
        } 

        if (nextProps['shipper']) {
            this.setState({         
                HasShipper: true,
                ShipperName: nextProps['shipper'].FirstName + ' ' + nextProps['shipper'].LastName,
                ShipperEmail: nextProps['shipper'].Email,
                ShipperCity: nextProps['shipper'].City,
                ShipperState: nextProps['shipper'].State && nextProps['shipper'].State.Name,
                ShipperZip: nextProps['shipper'].ZipCode,
                ShipperMobile: nextProps['shipper'].Phone,
                ShipperAddress: nextProps['shipper'].Street,
                ShipperAddressDetail: nextProps['shipper'].Street
            })
        }
        
    },
    selectContact(key) {
        return (value) => {
            this.props.GetContactDetails(value.key, key);
        }
    },
    submit() {
        let updatedData = lodash.assign({}, this.state);
        delete updatedData.showContactModal;
        this.props.params.id ? this.props.EditOrder(updatedData) : this.props.AddOrder(updatedData);
        console.log(updatedData);
    },
    render() {
        const {isEditing, contactList, isFetching} = this.props;
        const Title = this.props.params.id ? "Edit Order" : "Add Order";
        const order = this.props.params.id ? this.props.order : {};
        const vehicleOptions = configValues.vehicle;

        const contactOptions = lodash.chain(contactList)
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
                    { !isEditing &&
                        <div className={styles.orderDetailsInformation}>
                            <DropdownRow label={'Shipper'} options={contactOptions} handleSelect={this.selectContact('shipper')} />
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
                            <DropdownRow label={'Pickup'} options={contactOptions} handleSelect={this.selectContact('pickup')} />
                            <DropdownRow label={'Dropoff'} options={contactOptions} handleSelect={this.selectContact('dropoff')} />
                        </div>
                    }
                    { isEditing &&
                        <div className={styles.orderDetailsContact}>
                            <div className={styles.orderDetailsInformation}>
                                <InputRow label={'PickupName'} value={order.PickupAddress.FirstName} type={'text'} onChange={this.stateChange('PickupName') } />
                                <InputRow label={'PickupMobile'} value={order.PickupAddress.MobileNumber} type={'text'} onChange={this.stateChange('PickupMobile') } />
                                <InputRow label={'PickupEmail'} value={order.PickupAddress.Email} type={'text'} onChange={this.stateChange('PickupEmail') } />
                                <InputRow label={'PickupAddress'} value={order.PickupAddress.Address1} type={'text'} onChange={this.stateChange('PickupAddress') } />
                                <InputRow label={'PickupAddressDetail'} value={order.PickupAddress.Address2} type={'text'} onChange={this.stateChange('PickupAddressDetail') } />
                                <InputRow label={'PickupCity'} value={order.PickupAddress.City} type={'text'} onChange={this.stateChange('PickupCity') } />
                                <InputRow label={'PickupState'} value={order.PickupAddress.State} type={'text'} onChange={this.stateChange('PickupState') } />
                                <InputRow label={'PickupZip'} value={order.PickupAddress.ZipCode} type={'text'} onChange={this.stateChange('PickupZip') } />
                            </div>
                        </div> 
                    }
                    { isEditing &&
                        <div className={styles.orderDetailsContact}>
                            <div className={styles.orderDetailsInformation}>
                                <InputRow label={'PickupName'} value={order.PickupAddress.FirstName} type={'text'} onChange={this.stateChange('PickupName') } />
                                <InputRow label={'PickupMobile'} value={order.PickupAddress.MobileNumber} type={'text'} onChange={this.stateChange('PickupMobile') } />
                                <InputRow label={'PickupEmail'} value={order.PickupAddress.Email} type={'text'} onChange={this.stateChange('PickupEmail') } />
                                <InputRow label={'PickupAddress'} value={order.PickupAddress.Address1} type={'text'} onChange={this.stateChange('PickupAddress') } />
                                <InputRow label={'PickupAddressDetail'} value={order.PickupAddress.Address2} type={'text'} onChange={this.stateChange('PickupAddressDetail') } />
                                <InputRow label={'PickupCity'} value={order.PickupAddress.City} type={'text'} onChange={this.stateChange('PickupCity') } />
                                <InputRow label={'PickupState'} value={order.PickupAddress.State} type={'text'} onChange={this.stateChange('PickupState') } />
                                <InputRow label={'PickupZip'} value={order.PickupAddress.ZipCode} type={'text'} onChange={this.stateChange('PickupZip') } />
                            </div>
                        </div>
                    }
                    { isEditing &&
                        <div className={styles.orderDetailsContact}>
                            <div className={styles.orderDetailsInformation}>
                                <InputRow label={'PickupName'} value={order.PickupAddress.FirstName} type={'text'} onChange={this.stateChange('PickupName') } />
                                <InputRow label={'PickupMobile'} value={order.PickupAddress.MobileNumber} type={'text'} onChange={this.stateChange('PickupMobile') } />
                                <InputRow label={'PickupEmail'} value={order.PickupAddress.Email} type={'text'} onChange={this.stateChange('PickupEmail') } />
                                <InputRow label={'PickupAddress'} value={order.PickupAddress.Address1} type={'text'} onChange={this.stateChange('PickupAddress') } />
                                <InputRow label={'PickupAddressDetail'} value={order.PickupAddress.Address2} type={'text'} onChange={this.stateChange('PickupAddressDetail') } />
                                <InputRow label={'PickupCity'} value={order.PickupAddress.City} type={'text'} onChange={this.stateChange('PickupCity') } />
                                <InputRow label={'PickupState'} value={order.PickupAddress.State} type={'text'} onChange={this.stateChange('PickupState') } />
                                <InputRow label={'PickupZip'} value={order.PickupAddress.ZipCode} type={'text'} onChange={this.stateChange('PickupZip') } />
                            </div>
                        </div>
                    }
                    <div style={{clear: 'both'}}>
                    </div>
                    <div className={styles.orderDetailsBoxLeft}>
                        <div className={styles.orderDetailsHeader}>
                            Order Details
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputRow label={'WebOrderID'} value={order.WebOrderID} type={'text'} onChange={this.stateChange('WebOrderID') } />
                            <DropdownRow label={'Vehicle'} value={order.Vehicle && order.Vehicle.Name} options={vehicleOptions} handleSelect={this.stateChange('PackageSize')} />
                            <InputRow label={'PackageDetails'} value={order.OrderMessage} type={'text'} onChange={this.stateChange('PackageDetails') } />
                            <InputRow label={'DeliveryInstructions'} value={order.DeliveryInstructions} type={'text'} onChange={this.stateChange('DeliveryInstructions') } />
                            <DatetimeRow label={'PickupTime'} value={moment(order.PickupTime).format('MM/DD/YYYY hh:mm A')} onChange={this.stateChange('PickupTime') } />
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
    const {contacts, shipper, pickup, dropoff} = store.app.myContacts;
    let contactList = {}; 
    contacts.forEach(function(c) {
        contactList[c.FirstName + ' ' + c.LastName] = c.ContactID;
    });
    return {
        contactList,
        order,
        shipper, 
        pickup, 
        dropoff,
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
    GetContactDetails: (id, contactType) => {
      dispatch(ContactService.fetchDetails(id, contactType));
    },
    AddOrder: (order) => {
      dispatch(OrderService.addOrder(order));
    },
    EditOrder: (order) => {
      dispatch(OrderService.editOrder(ownProps.params.id, order));
    }
  }
}

export default connect(StoreToOrdersPage, mapDispatchToOrders)(ManagePage);
