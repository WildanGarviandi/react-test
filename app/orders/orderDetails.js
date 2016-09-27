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
import Accordion from '../views/base/accordion';
import {Glyph} from '../views/base';

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

const InputStaticRowImage = React.createClass({
  render() {
    const {isEditing, label, value, onChange, type} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
          <img src={value} className={styles.itemImage}>
          </img>
      </div>
    );
  }
});

const FailedAttempt = React.createClass({
    render: function() {
        var attemptComponents = this.props.attempts.map(function(attempt, idx) {
            return (
                <div>
                    <div className={styles.attemptInformationHeader}>
                        Failed Attempt {idx}
                    </div>
                    <InputStaticRow label={'Driver'} value={attempt.Driver && `${attempt.Driver.FirstName} ${attempt.Driver.LastName}`} />
                    <InputStaticRow label={'Reason'} value={attempt.ReasonReturn && `${attempt.ReasonReturn.ReasonName}`} />
                    <InputStaticRow label={'Date'} value={moment(attempt.CreatedDate).format('MM/DD/YYYY hh:mm')} />
                    <InputStaticRowImage label={'Proof of Failed'} value={attempt.ProofOfAttemptURL} />
                </div>
            );
        });
        return <div>{attemptComponents}</div>;
    }
});

const DetailPage = React.createClass({
    getInitialState() {
        return ({
            showPOD: false,
            iconPOD: 'chevron-down',
            showAttempt: false,
            iconAttempt: 'chevron-down',
        })
    },
    componentWillMount() {
        this.props.GetDetails();
    },
    changePODVisible() {
        this.setState({showPOD: !this.state.showPOD});
        this.setState({iconPOD: this.state.iconPOD === 'chevron-down' ? 'chevron-up' : 'chevron-down'});
    },
    changeAttemptVisible() {
        this.setState({showAttempt: !this.state.showAttempt});
        this.setState({iconAttempt: this.state.iconAttempt === 'chevron-down' ? 'chevron-up' : 'chevron-down'});
    },
    render() {
        const {order, isFetching} = this.props;
        const Title = "Order Details";

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
                    <div style={{clear: 'both'}}>
                    </div>
                    <div className={styles.orderDetailsBoxLeft}>
                        <div className={styles.orderDetailsHeader}>
                            Order Details
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputStaticRow label={'Airway Bill'} value={order.UserOrderNumber} />
                            <InputStaticRow label={'Web Order ID'} value={order.WebOrderID} />
                            <InputStaticRow label={'User'} value={order.User && `${order.User.FirstName} ${order.User.LastName} / ${order.User.Email} / ${order.User.CountryCode}${order.User.PhoneNumber}` } />
                            <InputStaticRow label={'Driver'} value={order.Driver && `${order.Driver.FirstName} ${order.Driver.LastName} / ${order.Driver.CountryCode}${order.Driver.PhoneNumber}` } />
                            <InputStaticRow label={'Vehicle'} value={order.Vehicle && order.Vehicle.Name} />
                            <InputStaticRow label={'Status'} value={order.OrderStatus && order.OrderStatus.OrderStatus} />
                            <InputStaticRow label={'Package Details'} value={order.OrderMessage} />
                            <InputStaticRow label={'Delivery Instructions'} value={order.DeliveryInstructions} />
                            <InputStaticRow label={'Pickup Time'} value={moment(order.PickupTime).format('MM/DD/YYYY hh:mm A')} />
                            <InputStaticRow label={'Pickup Information'} 
                                value={ order.PickupAddress && `${order.PickupAddress.FirstName} ${order.PickupAddress.LastName} / 
                                    ${order.PickupAddress.CountryCode}${order.PickupAddress.MobileNumber} / ${order.PickupAddress.Address1}`} />
                            <InputStaticRow label={'Dropoff Information'} 
                                value={ order.DropoffAddress && `${order.DropoffAddress.FirstName} ${order.DropoffAddress.LastName} / 
                                    ${order.DropoffAddress.CountryCode}${order.DropoffAddress.MobileNumber} / ${order.DropoffAddress.Address1}`} />
                        </div>
                    </div> 
                    <div className={styles.orderDetailsBoxRight}>
                        <div className={styles.orderDetailsHeader}>
                            Order Dimension
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputStaticRow label={'Package Weight'} value={order.PackageWeight} />
                            <InputStaticRow label={'Package Volume'} value={order.PackageVolume} />
                            <InputStaticRow label={'Package Width'} value={order.PackageWidth} />
                            <InputStaticRow label={'Package Height'} value={order.PackageHeight} />
                            <InputStaticRow label={'Package Length'} value={order.PackageLength} />
                        </div> 
                    </div>
                    <div style={{clear: 'both'}}>
                    </div>
                    { order.RecipientName &&
                        <div>
                            <div onClick={this.changePODVisible} className={styles.orderDetailsHeader}>
                                POD Information
                                <span className={styles.arrowDown}>
                                    <Glyph name={this.state.iconPOD}/>
                                </span>
                            </div>
                            {   this.state.showPOD &&
                                <div className={styles.orderDetailsFullWidth}>
                                    <div className={styles.orderDetailsInformation}> 
                                        <InputStaticRow label={'Recipient Name'} value={order.RecipientName} />
                                        <InputStaticRow label={'Recipient Phone'} value={order.RecipientPhone} />
                                        <InputStaticRowImage label={'Recipient Signature'} value={order.RecipientSignature} />
                                        <InputStaticRowImage label={'Recipient Photo'} value={order.RecipientPhoto} />
                                    </div>
                                </div>
                            }
                        </div> 
                    }
                    {  order.UserOrderAttempts && order.UserOrderAttempts.length > 0 &&
                        <div>
                            <div onClick={this.changeAttemptVisible} className={styles.orderDetailsHeader}>
                                Attempt Information
                                <span className={styles.arrowDown}>
                                    <Glyph name={this.state.iconAttempt}/>
                                </span>
                            </div>
                            {   this.state.showAttempt &&
                                <div className={styles.orderDetailsFullWidth}>
                                    <div className={styles.orderDetailsInformation}>
                                        <FailedAttempt attempts={order.UserOrderAttempts} />
                                    </div>
                                </div>
                            }
                        </div> 
                    }
                </Page>
            );
        }
    }
});

function StoreToOrdersPage(store) {
    const {order, isFetching} = store.app.myOrders;

    return {
        order,
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
    }
  }
}

export default connect(StoreToOrdersPage, mapDispatchToOrders)(DetailPage);
