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
import stylesButton from '../components/button.css';
import {Glyph} from '../views/base';
import {formatDate} from '../helper/time';

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
    const {isEditing, label, value, onChange, type, options, handleSelect, withoutLabel} = this.props;
    return (
      <div style={{clear: 'both'}}>
        { withoutLabel &&
            <span>
              <Form.DropdownWithState initialValue={value} options={options} handleSelect={handleSelect} />
            </span>
        }
        { !withoutLabel &&
          <div>
              <span className={styles.itemLabel}>{label}</span>
              <div className={styles.itemValue}>
                <Form.DropdownWithState initialValue={value} options={options} handleSelect={handleSelect} />
              </div>
          </div>
        }
      </div>
    );
  }
});

const DatetimeRow = React.createClass({
    render() {
        const {isEditing, label, value, onChange, type, options, handleSelect} = this.props;

        return (
          <div className='nb' style={{clear: 'both'}}>
            <span className={styles.itemLabel}>{label}</span>
              <span className={styles.itemValue}>
                <DateTime parentEl="#bootstrapPlaceholder" onChange={this.props.onChange} defaultValue={value} />
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
        var regexEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        var regexPhone = /^[+]?([\d]{3}(-| )?[\d]{3}(-| )?[\d]{4}|[\d]{5,12}|}|[(][\d]{3}[)](-| )?[\d]{3}(-| )?[\d]{4})$/;
        let errorMessage = [];
        if (unfilledFields.length > 0) {
          errorMessage.push('Missing ' + unfilledFields.join())
        }
        if (this.state.Email && !regexEmail.test(this.state.Email)) {
          errorMessage.push('Invalid email');  
        }
        if (this.state.Phone && !regexPhone.test(this.state.Phone)) {
          errorMessage.push('Invalid phone');  
        }
        if (errorMessage.length > 0) {
          alert(errorMessage.join())
          return;
        }
        let addedData = lodash.assign({}, this.state);
        delete addedData.showContactModal;
        this.props.AddContact(addedData, this.props.contactType);
        this.props.contactClick();
    },
    render() {
        const stateOptions = lodash.chain(this.props.stateList)
              .map((key, val) => ({key:key, value: val.toUpperCase()}))
              .sortBy((arr) => (arr.key))
              .value();

        const saveBtnContact = {
            textBase: "Save",
            textLoading: "Saving Changes",
            onClick: this.saveContact,
            styles: {
                base: stylesButton.greenButton5,
            },
        };

        return (
            <span>
              <img src={"/img/icon-add.png"} className={styles.addContactButton} onClick={this.openModal}/>
              {
                this.state.showContactModal &&
                <ModalContainer>
                  <ModalDialog>
                    <div className={styles.modalTitle}>
                      Add New Contact
                    </div>
                    <div onClick={this.closeModal} className={styles.modalClose}>
                      X
                    </div>
                    <InputRow label={'First Name'} type={'text'} onChange={this.stateChange('FirstName') } />
                    <InputRow label={'Last Name'} type={'text'} onChange={this.stateChange('LastName') } />
                    <InputRow label={'Phone'} type={'text'} onChange={this.stateChange('Phone') } />
                    <InputRow label={'Email'} type={'text'} onChange={this.stateChange('Email') } />
                    <InputRow label={'Address'} type={'text'} onChange={this.stateChange('Street') } />
                    <DropdownRow label={'State'} options={stateOptions} handleSelect={this.stateChange('StateID')} />
                    <InputRow label={'City'} type={'text'} onChange={this.stateChange('City') } />
                    <InputRow label={'Zip Code'} type={'text'} onChange={this.stateChange('ZipCode') } />
                    <InputRow label={'Company Name'} type={'text'} onChange={this.stateChange('CompanyName') } />
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
            HasShipper: false
        });
    },
    componentWillMount() {
        this.props.ResetFilter();
        this.props.ResetManageOrder();
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
                PickupAddress: nextProps['pickup'].Street
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
                DropoffAddress: nextProps['dropoff'].Street
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
                ShipperAddress: nextProps['shipper'].Street
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
            this.setState({['activeContact']: key});
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
                if (this.state.activeContact === 'shipper') {
                    delete this.state.activeContact;  
                } 
            }
            this.setState({['HasShipper']: !this.state.HasShipper});
        };        
    },
    render() {
        const {isEditing, contactList, isFetching, isFetchingContact} = this.props;
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
                base: stylesButton.greenButton,
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
                        <div className={styles.orderDetailsInformation}>
                            { 
                                !isFetchingContact &&
                                <div className={styles.contactDetails}>
                                    <DropdownRow withoutLabel={true} label={'Pickup'} value={this.state.PickupName} options={contactOptions} handleSelect={this.selectContact('pickup')} />
                                    <AddContact contactClick={this.contactClick('pickup')} AddContact={this.props.AddContact} stateList={this.props.stateList} contactType={'pickup'} />
                                    <InputStaticRow label={'Pickup Name'} value={this.state.PickupName} type={'text'} />
                                    <InputStaticRow label={'Pickup Mobile'} value={this.state.PickupMobile} type={'text'} />
                                    <InputStaticRow label={'Pickup Email'} value={this.state.PickupEmail} type={'text'} />
                                    <InputStaticRow label={'Pickup Address'} value={this.state.PickupAddress} type={'text'} />
                                    <InputStaticRow label={'Pickup City'} value={this.state.PickupCity} type={'text'} />
                                    <InputStaticRow label={'Pickup State'} value={this.state.PickupState} type={'text'} />
                                    <InputStaticRow label={'Pickup Zip'} value={this.state.PickupZip} type={'text'} />
                                </div>
                            }
                            { 
                                !isFetchingContact &&
                                <div className={styles.contactDetails}>
                                    <DropdownRow withoutLabel={true} label={'Dropoff'} value={this.state.DropoffName} options={contactOptions} handleSelect={this.selectContact('dropoff')} />
                                    <AddContact contactClick={this.contactClick('dropoff')} AddContact={this.props.AddContact} stateList={this.props.stateList} contactType={'dropoff'} />
                                    <InputStaticRow label={'Dropoff Name'} value={this.state.DropoffName} type={'text'} />
                                    <InputStaticRow label={'Dropoff Mobile'} value={this.state.DropoffMobile} type={'text'} />
                                    <InputStaticRow label={'Dropoff Email'} value={this.state.DropoffEmail} type={'text'} />
                                    <InputStaticRow label={'Dropoff Address'} value={this.state.DropoffAddress} type={'text'} />
                                    <InputStaticRow label={'Dropoff City'} value={this.state.DropoffCity} type={'text'} />
                                    <InputStaticRow label={'Dropoff State'} value={this.state.DropoffState} type={'text'}  />
                                    <InputStaticRow label={'Dropoff Zip'} value={this.state.DropoffZip} type={'text'} />
                                </div>
                            }
                            { 
                                !isFetchingContact &&
                                <div className={styles.contactDetails}>
                                    { !this.state.HasShipper &&
                                        <span>
                                            <button className={styles.addShipper} onClick={this.hasShipper()}> 
                                              + Add Shipper
                                            </button>
                                            <div className={styles.addShipperDesc}>
                                              only select if different than pickup
                                            </div>
                                        </span>
                                    }
                                    { /*this.state.HasShipper &&
                                        <button className={styles.addShipper} onClick={this.hasShipper()}> 
                                            Delete Shipper
                                        </button>*/
                                    }
                                    { this.state.HasShipper &&
                                        <div>
                                            <DropdownRow withoutLabel={true} label={'Shipper'} value={this.state.ShipperName} options={contactOptions} handleSelect={this.selectContact('shipper')} />
                                            <AddContact contactClick={this.contactClick('shipper')} AddContact={this.props.AddContact} stateList={this.props.stateList} contactType={'shipper'} />
                                            <InputStaticRow label={'Shipper Name'} value={this.state.ShipperName} type={'text'} />
                                            <InputStaticRow label={'Shipper Mobile'} value={this.state.ShipperMobile} type={'text'} />
                                            <InputStaticRow label={'Shipper Email'} value={this.state.ShipperEmail} type={'text'} />
                                            <InputStaticRow label={'Shipper Address'} value={this.state.ShipperAddress} type={'text'} />
                                            <InputStaticRow label={'Shipper City'} value={this.state.ShipperCity} type={'text'} />
                                            <InputStaticRow label={'Shipper State'} value={this.state.ShipperState} type={'text'} />
                                            <InputStaticRow label={'Shipper Zip'} value={this.state.ShipperZip} type={'text'} />
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    }
                    <div style={{clear: 'both'}}>
                    </div>
                    <div className={styles.orderDetailsBoxLeft}>
                        <div className={styles.orderDetailsHeader}>
                            Order Details
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputRow label={'Web Order ID'} type={'text'} onChange={this.stateChange('WebOrderID') } />
                            <DropdownRow label={'Vehicle'} options={vehicleOptions} handleSelect={this.stateChange('PackageSize')} />
                            <InputRow label={'Details'} type={'text'} onChange={this.stateChange('PackageComments') } />
                            <InputRow label={'Instructions'} type={'text'} onChange={this.stateChange('DeliveryInstructions') } />
                            <DatetimeRow label={'Pickup Time'} onChange={this.stateChange('PickupTime') } />
                            <DatetimeRow label={'Deadline'} onChange={this.stateChange('DueTime') } />
                        </div>
                    </div> 
                    <div className={styles.orderDetailsBoxRight}>
                        <div className={styles.orderDetailsHeader}>
                            Order Dimension and Cost
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputRow label={'Delivery Fee'} type={'number'} onChange={this.stateChange('DeliveryFee') } />
                            <div>
                              <div className={styles.itemLabel2}>Weight/Volume</div>
                              <div className={styles.itemValue3}>
                                <Form.InputWithDefault onChange={this.stateChange('PackageWeight')} type={'number'} />
                              </div>
                              <div className={styles.unitValue}>kg</div>
                              <div className={styles.itemValue3}>
                                <Form.InputWithDefault onChange={this.stateChange('PackageVolume')} type={'number'} />
                              </div>
                              <div className={styles.unitValue}>cbm</div>
                            </div>
                            <div>
                              <div className={styles.itemLabel2}>Width/Height/Length</div>
                              <div className={styles.itemValue2}>
                                <Form.InputWithDefault onChange={this.stateChange('PackageWidth')} type={'number'} />
                              </div>
                              <div className={styles.unitValue}>cm</div>
                              <div className={styles.itemValue2}>
                                <Form.InputWithDefault onChange={this.stateChange('PackageHeight')} type={'number'} />
                              </div>
                              <div className={styles.unitValue}>cm</div>
                              <div className={styles.itemValue2}>
                                <Form.InputWithDefault onChange={this.stateChange('PackageLength')} type={'number'} />
                              </div>
                              <div className={styles.unitValue}>cm</div>
                            </div>
                        </div> 
                    </div>
                    <div style={{float: 'right'}}>
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
        contactList[`${c.FirstName} ${c.LastName}`] = c.ContactID;
    });
    let stateList = {}; 
    states.forEach(function(state) {
        stateList[state.Name] = state.StateID;
    });

    return {
        contactList: contactList,
        stateList: stateList,
        order: order,
        shipper: shipper, 
        pickup: pickup, 
        dropoff: dropoff,
        isEditing: isEditing,
        isFetching: isFetching,
        isFetchingContact: store.app.myContacts.isFetching
    }
}

function mapDispatchToOrders(dispatch, ownProps) {
  return {
    GetDetails: () => {
      dispatch(OrderService.fetchDetails(ownProps.params.id));
    },
    GetContactDetails: (id, contactType) => {
      dispatch(ContactService.fetchDetails(id, contactType));
    },
    AddContact: (contact, contactType) => {
      dispatch(ContactService.addContact(contact, contactType));
    },
    ResetFilter: () => {
      dispatch(ContactService.resetFilter());
    },
    AddOrder: (order) => {
      dispatch(OrderService.addOrder(order));
    },
    ResetManageOrder: () => {
      dispatch(ContactService.resetManageContact());
    },
    EditOrder: (order) => {
      dispatch(OrderService.editOrder(ownProps.params.id, order));
    }
  }
}

export default connect(StoreToOrdersPage, mapDispatchToOrders)(ManagePage);