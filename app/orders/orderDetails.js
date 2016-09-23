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

const DetailPage = React.createClass({
    componentWillMount() {
        this.props.GetDetails();
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
                    <div className={styles.orderDetailsHeader}>
                        Contact Information
                    </div>
                    { order.PickupAddress &&
                        <div className={styles.orderDetailsContact}>
                            <div className={styles.orderDetailsInformation}>
                                <InputStaticRow label={'PickupName'} value={order.PickupAddress.FirstName} />
                                <InputStaticRow label={'PickupMobile'} value={order.PickupAddress.MobileNumber} />
                                <InputStaticRow label={'PickupEmail'} value={order.PickupAddress.EmailID} />
                                <InputStaticRow label={'PickupAddress'} value={order.PickupAddress.Address1} />
                                <InputStaticRow label={'PickupAddressDetail'} value={order.PickupAddress.Address2} />
                                <InputStaticRow label={'PickupCity'} value={order.PickupAddress.City} />
                                <InputStaticRow label={'PickupState'} value={order.PickupAddress.State} />
                                <InputStaticRow label={'PickupZip'} value={order.PickupAddress.ZipCode} />
                            </div>
                        </div> 
                    }
                    { order.DropoffAddress &&
                        <div className={styles.orderDetailsContact}>
                            <div className={styles.orderDetailsInformation}>
                                <InputStaticRow label={'DropoffName'} value={order.DropoffAddress.FirstName} />
                                <InputStaticRow label={'DropoffMobile'} value={order.DropoffAddress.MobileNumber} />
                                <InputStaticRow label={'DropoffEmail'} value={order.DropoffAddress.EmailID} />
                                <InputStaticRow label={'DropoffAddress'} value={order.DropoffAddress.Address1} />
                                <InputStaticRow label={'DropoffAddressDetail'} value={order.DropoffAddress.Address2} />
                                <InputStaticRow label={'DropoffCity'} value={order.DropoffAddress.City} />
                                <InputStaticRow label={'DropoffState'} value={order.DropoffAddress.State} />
                                <InputStaticRow label={'DropoffZip'} value={order.DropoffAddress.ZipCode} />
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
                            <InputStaticRow label={'WebOrderID'} value={order.WebOrderID} />
                            <InputStaticRow label={'Vehicle'} value={order.Vehicle && order.Vehicle.Name} />
                            <InputStaticRow label={'PackageDetails'} value={order.OrderMessage} />
                            <InputStaticRow label={'DeliveryInstructions'} value={order.DeliveryInstructions} />
                            <InputStaticRow label={'PickupTime'} value={moment(order.PickupTime).format('MM/DD/YYYY hh:mm A')} />
                        </div>
                    </div> 
                    <div className={styles.orderDetailsBoxRight}>
                        <div className={styles.orderDetailsHeader}>
                            Order Dimension and Cost
                        </div>
                        <div className={styles.orderDetailsInformation}>
                            <InputStaticRow label={'DeliveryFee'} value={order.OrderCost} />
                            <InputStaticRow label={'PackageWeight'} value={order.PackageWeight} />
                            <InputStaticRow label={'PackageVolume'} value={order.PackageVolume} />
                            <InputStaticRow label={'PackageWidth'} value={order.PackageWidth} />
                            <InputStaticRow label={'PackageHeight'} value={order.PackageHeight} />
                            <InputStaticRow label={'PackageLength'} value={order.PackageLength} />
                        </div> 
                    </div>
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
