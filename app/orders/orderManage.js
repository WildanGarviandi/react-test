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
import {Glyph} from '../views/base';

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

const InputStaticRow = React.createClass({
  render() {
    const {isEditing, label, value, onChange, type} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
          <span className={styles.itemValue}>
            {value}
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

const AddContact = React.createClass({
    getInitialState() {
        return ({
            showContactModal: false
        });
    },
    openModal() {
        this.setState({showContactModal: true});
    },
    closeModal() {
        this.setState({showContactModal: false});
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
    saveContact() {
        const mandatoryFields = ['FirstName', 'LastName', 'Phone', 'Email', 'Street', 'StateID', 'City', 'ZipCode'];
        const filledFields = Object.keys(this.state);
        const unfilledFields = lodash.difference(mandatoryFields, filledFields);
        if (unfilledFields.length > 0) {
            alert('Missing ' + unfilledFields.join())
            return;
        }
        let addedData = lodash.assign({}, this.state);
        delete addedData.showContactModal;
        this.props.AddContact(addedData, this.props.contactType);
    },
    render() {
        const stateOptions = lodash.chain(this.props.stateList)
              .map((key, val) => ({key:key, value: val.toUpperCase()}))
              .sortBy((arr) => (arr.key))
              .value();

        const addContactButton = {
            textBase: '+',
            onClick: this.openModal,
            styles: {
                base: styles.addContactButton
            }
        };

        const saveBtnContact = {
            textBase: "Save",
            textLoading: "Saving Changes",
            onClick: this.saveContact,
            styles: {
                base: styles.weightSaveBtn,
            },
        };

        return (
            <span onClick={this.openModal}>
              { <ButtonWithLoading {...addContactButton} /> }
              {
                this.state.showContactModal &&
                <ModalContainer onClose={this.closeModal}>
                  <ModalDialog onClose={this.closeModal}>
                    <h1>Add New Contact</h1>
                    <InputRow label={'FirstName'} type={'text'} onChange={this.stateChange('FirstName') } />
                    <InputRow label={'LastName'} type={'text'} onChange={this.stateChange('LastName') } />
                    <InputRow label={'Phone'} type={'text'} onChange={this.stateChange('Phone') } />
                    <InputRow label={'Email'} type={'text'} onChange={this.stateChange('Email') } />
                    <InputRow label={'Street'} type={'text'} onChange={this.stateChange('Street') } />
                    <DropdownRow label={'State'} options={stateOptions} handleSelect={this.stateChange('StateID')} />
                    <InputRow label={'City'} type={'text'} onChange={this.stateChange('City') } />
                    <InputRow label={'ZipCode'} type={'text'} onChange={this.stateChange('ZipCode') } />
                    <InputRow label={'CompanyName'} type={'text'} onChange={this.stateChange('CompanyName') } />
                    <div style={{clear: 'both'}}>
                        { <ButtonWithLoading {...saveBtnContact} /> }
                    </div>
                  </ModalDialog>
                </ModalContainer>
              }
            </span>
        );
    }
})

const ManagePage = React.createClass({
    getInitialState() {
        return ({
            PickupTime: new Date(),
            activeContact: null,
            HasShipper: false
        });
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
        if (!lodash.isEmpty(nextProps['pickup'])) {
            this.setState({
                PickupName: `${nextProps['pickup'].FirstName} ${nextProps['pickup'].LastName}`.trim(),
                PickupEmail: nextProps['pickup'].Email,
                PickupCity: nextProps['pickup'].City,
                PickupState: nextProps['pickup'].State && nextProps['pickup'].State.Name,
                PickupZip: nextProps['pickup'].ZipCode,
                PickupMobile: nextProps['pickup'].Phone,
                PickupAddress: nextProps['pickup'].Street,
                PickupAddressDetail: nextProps['pickup'].Street
            });
        }

        if (!lodash.isEmpty(nextProps['dropoff'])) {
            this.setState({                
                DropoffName: `${nextProps['dropoff'].FirstName} ${nextProps['dropoff'].LastName}`.trim(),
                DropoffEmail: nextProps['dropoff'].Email,
                DropoffCity: nextProps['dropoff'].City,
                DropoffState: nextProps['dropoff'].State && nextProps['dropoff'].State.Name,
                DropoffZip: nextProps['dropoff'].ZipCode,
                DropoffMobile: nextProps['dropoff'].Phone,
                DropoffAddress: nextProps['dropoff'].Street,
                DropoffAddressDetail: nextProps['dropoff'].Street
            });
        } 

        if (!lodash.isEmpty(nextProps['shipper'])) {
            this.setState({         
                ShipperName: `${nextProps['shipper'].FirstName} ${nextProps['shipper'].LastName}`.trim(),
                ShipperEmail: nextProps['shipper'].Email,
                ShipperCity: nextProps['shipper'].City,
                ShipperState: nextProps['shipper'].State && nextProps['shipper'].State.Name,
                ShipperZip: nextProps['shipper'].ZipCode,
                ShipperMobile: nextProps['shipper'].Phone,
                ShipperAddress: nextProps['shipper'].Street,
                ShipperAddressDetail: nextProps['shipper'].Street
            })
        }

        if (!lodash.isEmpty(nextProps['order'])) {
            this.setState({
                PickupName: nextProps['order'].PickupAddress.FirstName,
                PickupEmail: nextProps['order'].PickupAddress.EmailID,
                PickupCity: nextProps['order'].PickupAddress.City,
                PickupState: nextProps['order'].PickupAddress.State,
                PickupZip: nextProps['order'].PickupAddress.ZipCode,
                PickupMobile: nextProps['order'].PickupAddress.MobileNumber,
                PickupAddress: nextProps['order'].PickupAddress.Address1,
                PickupAddressDetail: nextProps['order'].PickupAddress.Address2,
                DropoffName: nextProps['order'].DropoffAddress.FirstName,
                DropoffEmail: nextProps['order'].DropoffAddress.EmailID,
                DropoffCity: nextProps['order'].DropoffAddress.City,
                DropoffState: nextProps['order'].DropoffAddress.State,
                DropoffZip: nextProps['order'].DropoffAddress.ZipCode,
                DropoffMobile: nextProps['order'].DropoffAddress.MobileNumber,
                DropoffAddress: nextProps['order'].DropoffAddress.Address1,
                DropoffAddressDetail: nextProps['order'].DropoffAddress.Address2,
                WebOrderID: nextProps['order'].WebOrderID,
                DeliveryInstructions: nextProps['order'].DeliveryInstructions,
                PackageDetails: nextProps['order'].OrderMessage,
                PackageSize: nextProps['order'].Vehicle && nextProps['order'].Vehicle.VehicleID,
                PickupTime: nextProps['order'].PickupTime,
                DeliveryFee: nextProps['order'].OrderCost,
                PackageWeight: nextProps['order'].PackageWeight,
                PackageVolume: nextProps['order'].PackageVolume,
                PackageHeight: nextProps['order'].PackageHeight,
                PackageLength: nextProps['order'].PackageLength,
                PackageWidth: nextProps['order'].PackageWidth,
            });
        }
    },
    selectContact(key) {
        return (value) => {
            this.props.GetContactDetails(value.key, key);
        }
    },
    submit() {
        let updatedData = lodash.assign({}, this.state);
        delete updatedData.activeContact;
        this.props.params.id ? this.props.EditOrder(updatedData) : this.props.AddOrder(updatedData);
    },
    contactClick(contactType) {
        return (value) => {
            this.setState({['activeContact']: contactType});
        };
    },
    hasShipper() {
        return (value) => {
            if (this.state.HasShipper) {
                delete this.state.ShipperName;
                delete this.state.ShipperMobile;
                delete this.state.ShipperEmail;
                delete this.state.ShipperAddress;
                delete this.state.ShipperAddressDetail;
                delete this.state.ShipperCity;
                delete this.state.ShipperState;
                delete this.state.ShipperZip;
            }
            this.setState({['HasShipper']: !this.state.HasShipper});
        };        
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
                        <div className={styles.orderDetailsInformation, styles.contactDetailsBox}>
                            <div className={styles.contactDetails}>
                                <DropdownRow label={'Pickup'} options={contactOptions} handleSelect={this.selectContact('pickup')} />
                                <AddContact AddContact={this.props.AddContact} stateList={this.props.stateList} contactType={'pickup'} />
                                { this.state.PickupName &&
                                    <div className={styles.contactAddress}  onClick={this.contactClick('pickup')}>
                                        Pickup : {`${this.state.PickupName} - ${this.state.PickupAddress}`}
                                        <span className={styles.arrowRight}>
                                            <Glyph name={'chevron-right'}/>
                                        </span>
                                    </div>
                                }
                                <DropdownRow label={'Dropoff'} options={contactOptions} handleSelect={this.selectContact('dropoff')} />
                                <AddContact AddContact={this.props.AddContact} stateList={this.props.stateList} contactType={'dropoff'} />
                                { this.state.DropoffName &&
                                    <div className={styles.contactAddress}  onClick={this.contactClick('dropoff')}>
                                        Dropoff : {`${this.state.DropoffName} - ${this.state.DropoffAddress}`}
                                        <span className={styles.arrowRight}>
                                            <Glyph name={'chevron-right'}/>
                                        </span>
                                    </div>
                                }
                                <div style={{clear: 'both'}}>
                                </div>
                                <button className={styles.contactAddress} onClick={this.hasShipper()}> 
                                    Has Shipper? 
                                </button>
                                { this.state.HasShipper &&
                                    <div>
                                        <DropdownRow label={'Shipper'} options={contactOptions} handleSelect={this.selectContact('shipper')} />
                                        <AddContact AddContact={this.props.AddContact} stateList={this.props.stateList} contactType={'shipper'} />
                                    </div>
                                }
                                { this.state.HasShipper && this.state.ShipperName &&
                                    <div className={styles.contactAddress}  onClick={this.contactClick('shipper')}>
                                        Shipper : {`${this.state.ShipperName} - ${this.state.ShipperAddress}`}
                                        <span className={styles.arrowRight}>
                                            <Glyph name={'chevron-right'}/>
                                        </span>
                                    </div>
                                }
                            </div>
                            <div className={styles.contactDetails}>
                                { this.state.activeContact === 'shipper' &&
                                    <div>
                                        <InputStaticRow label={'Shipper Name'} value={this.state.ShipperName} type={'text'} />
                                        <InputStaticRow label={'Shipper Mobile'} value={this.state.ShipperMobile} type={'text'} />
                                        <InputStaticRow label={'Shipper Email'} value={this.state.ShipperEmail} type={'text'} />
                                        <InputStaticRow label={'Shipper Address'} value={this.state.ShipperAddress} type={'text'} />
                                        <InputStaticRow label={'Shipper Address Detail'} value={this.state.ShipperAddressDetail} type={'text'} />
                                        <InputStaticRow label={'Shipper City'} value={this.state.ShipperCity} type={'text'} />
                                        <InputStaticRow label={'Shipper State'} value={this.state.ShipperState} type={'text'} />
                                        <InputStaticRow label={'Shipper Zip'} value={this.state.ShipperZip} type={'text'} />
                                    </div>
                                }
                                { this.state.activeContact === 'pickup' &&
                                    <div>
                                        <InputStaticRow label={'Pickup Name'} value={this.state.PickupName} type={'text'} />
                                        <InputStaticRow label={'Pickup Mobile'} value={this.state.PickupMobile} type={'text'} />
                                        <InputStaticRow label={'Pickup Email'} value={this.state.PickupEmail} type={'text'} />
                                        <InputStaticRow label={'Pickup Address'} value={this.state.PickupAddress} type={'text'} />
                                        <InputStaticRow label={'Pickup Address Detail'} value={this.state.PickupAddressDetail} type={'text'} />
                                        <InputStaticRow label={'Pickup City'} value={this.state.PickupCity} type={'text'} />
                                        <InputStaticRow label={'Pickup State'} value={this.state.PickupState} type={'text'} />
                                        <InputStaticRow label={'Pickup Zip'} value={this.state.PickupZip} type={'text'} />
                                    </div>
                                }                                
                                { this.state.activeContact === 'dropoff' &&
                                    <div>
                                        <InputStaticRow label={'Dropoff Name'} value={this.state.DropoffName} type={'text'} />
                                        <InputStaticRow label={'Dropoff Mobile'} value={this.state.DropoffMobile} type={'text'} />
                                        <InputStaticRow label={'Dropoff Email'} value={this.state.DropoffEmail} type={'text'} />
                                        <InputStaticRow label={'Dropoff Address'} value={this.state.DropoffAddress} type={'text'} />
                                        <InputStaticRow label={'Dropoff Address Detail'} value={this.state.DropoffAddressDetail} type={'text'} />
                                        <InputStaticRow label={'Dropoff City'} value={this.state.DropoffCity} type={'text'} />
                                        <InputStaticRow label={'Dropoff State'} value={this.state.DropoffState} type={'text'}  />
                                        <InputStaticRow label={'Dropoff Zip'} value={this.state.DropoffZip} type={'text'} />
                                    </div>
                                }
                            </div>
                            <div className={styles.contactDetails}>
                            </div>
                        </div>
                    }
                    { isEditing && order.PickupAddress &&
                        <div className={styles.orderDetailsContact}>
                            <div className={styles.orderDetailsInformation}>
                                <InputRow label={'Pickup Name'} value={order.PickupAddress.FirstName} type={'text'} onChange={this.stateChange('PickupName') } />
                                <InputRow label={'Pickup Mobile'} value={order.PickupAddress.MobileNumber} type={'text'} onChange={this.stateChange('PickupMobile') } />
                                <InputRow label={'Pickup Email'} value={order.PickupAddress.EmailID} type={'text'} onChange={this.stateChange('PickupEmail') } />
                                <InputRow label={'Pickup Address'} value={order.PickupAddress.Address1} type={'text'} onChange={this.stateChange('PickupAddress') } />
                                <InputRow label={'Pickup Address Detail'} value={order.PickupAddress.Address2} type={'text'} onChange={this.stateChange('PickupAddressDetail') } />
                                <InputRow label={'Pickup City'} value={order.PickupAddress.City} type={'text'} onChange={this.stateChange('PickupCity') } />
                                <InputRow label={'Pickup State'} value={order.PickupAddress.State} type={'text'} onChange={this.stateChange('PickupState') } />
                                <InputRow label={'Pickup Zip'} value={order.PickupAddress.ZipCode} type={'text'} onChange={this.stateChange('PickupZip') } />
                            </div>
                        </div> 
                    }
                    { isEditing && order.DropoffAddress &&
                        <div className={styles.orderDetailsContact}>
                            <div className={styles.orderDetailsInformation}>
                                <InputRow label={'Dropoff Name'} value={order.DropoffAddress.FirstName} type={'text'} onChange={this.stateChange('DropoffName') } />
                                <InputRow label={'Dropoff Mobile'} value={order.DropoffAddress.MobileNumber} type={'text'} onChange={this.stateChange('DropoffMobile') } />
                                <InputRow label={'Dropoff Email'} value={order.DropoffAddress.EmailID} type={'text'} onChange={this.stateChange('DropoffEmail') } />
                                <InputRow label={'Dropoff Address'} value={order.DropoffAddress.Address1} type={'text'} onChange={this.stateChange('DropoffAddress') } />
                                <InputRow label={'Dropoff Address Detail'} value={order.DropoffAddress.Address2} type={'text'} onChange={this.stateChange('DropoffAddressDetail') } />
                                <InputRow label={'Dropoff City'} value={order.DropoffAddress.City} type={'text'} onChange={this.stateChange('DropoffCity') } />
                                <InputRow label={'Dropoff State'} value={order.DropoffAddress.State} type={'text'} onChange={this.stateChange('DropoffState') } />
                                <InputRow label={'Dropoff Zip'} value={order.DropoffAddress.ZipCode} type={'text'} onChange={this.stateChange('DropoffZip') } />
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
                            <InputRow label={'Web Order ID'} value={order.WebOrderID} type={'text'} onChange={this.stateChange('WebOrderID') } />
                            <DropdownRow label={'Vehicle'} value={order.Vehicle && order.Vehicle.Name} options={vehicleOptions} handleSelect={this.stateChange('PackageSize')} />
                            <InputRow label={'Package Details'} value={order.OrderMessage} type={'text'} onChange={this.stateChange('PackageComments') } />
                            <InputRow label={'Delivery Instructions'} value={order.DeliveryInstructions} type={'text'} onChange={this.stateChange('DeliveryInstructions') } />
                            <DatetimeRow label={'Pickup Time'} value={moment(order.PickupTime).format('MM/DD/YYYY hh:mm A')} onChange={this.stateChange('PickupTime') } />
                            { isEditing &&
                                <DatetimeRow label={'Due Time'} value={moment(order.DueTime).format('MM/DD/YYYY hh:mm A')} onChange={this.stateChange('DueTime') } />
                            }
                        </div>
                    </div> 
                    <div className={styles.orderDetailsBoxRight}>
                        <div className={styles.orderDetailsHeader}>
                            Order Dimension and Cost
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputRow label={'Delivery Fee'} value={order.OrderCost} type={'number'} onChange={this.stateChange('DeliveryFee') } />
                            <InputRow label={'Package Weight'} value={order.PackageWeight} type={'number'} onChange={this.stateChange('PackageWeight') } />
                            <InputRow label={'Package Volume'} value={order.PackageVolume} type={'number'} onChange={this.stateChange('PackageVolume') } />
                            <InputRow label={'Package Width'} value={order.PackageWidth} type={'number'} onChange={this.stateChange('PackageWidth') } />
                            <InputRow label={'Package Height'} value={order.PackageHeight} type={'number'} onChange={this.stateChange('PackageHeight') } />
                            <InputRow label={'Package Length'} value={order.PackageLength} type={'number'} onChange={this.stateChange('PackageLength') } />
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
    const {states} = store.app.stateList;
    let contactList = {}; 
    contacts.forEach(function(c) {
        contactList[c.FirstName + ' ' + c.LastName] = c.ContactID;
    });
    let stateList = {}; 
    states.forEach(function(state) {
        stateList[state.Name] = state.StateID;
    });

    return {
        contactList,
        stateList,
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
    AddContact: (contact, contactType) => {
      dispatch(ContactService.addContact(contact, contactType));
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
