import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading} from '../components/button';
import Table from './orderTable';
import * as Form from '../components/form';
import * as OrderService from './orderService';
import driversFetch from '../modules/drivers/actions/driversFetch';
import styles from './styles.css';
import stylesButton from '../components/button.css';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import * as UtilHelper from '../helper/utility';

const ExportOrder = React.createClass({
    getInitialState() {
        return ({
            showExportModal: false,
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7),
            endDate: new Date(),
        });
    },
    openModal() {
        this.setState({showExportModal: true});
    },
    closeModal() {
        this.setState({showExportModal: false});
    },
    pickDate(event, picker) {
        this.setState({['startDate']: picker.startDate});
        this.setState({['endDate']: picker.endDate});
        this.setState({showExportModal: true});
    },
    exportOrder() {
        this.props.ExportOrder(this.state.startDate, this.state.endDate);
    },
    render() {
        const addExportButton = {
            textBase: 'Export Orders',
            onClick: this.openModal,
            styles: {
                base: stylesButton.greenButton,
            }
        };
        const proceedExportBtn = {
            textBase: "Export",
            onClick: this.exportOrder,
            styles: {
                base: stylesButton.greenButton,
            }
        };
        const startDateFormatted = moment(this.state.startDate).format('MM-DD-YYYY');
        const endDateFormatted = moment(this.state.endDate).format('MM-DD-YYYY');
        let dateValue = startDateFormatted + ' - ' + endDateFormatted;

        return (
            <span onClick={this.openModal}>
              { <ButtonWithLoading {...addExportButton} /> }
              {
                this.state.showExportModal &&
                <ModalContainer onClose={this.closeModal}>
                  <ModalDialog onClose={this.closeModal}>
                    <h4>
                        Select Date:
                    </h4>
                    <DateRangePicker startDate={startDateFormatted} endDate={endDateFormatted} onApply={this.pickDate} >
                        <input type="text" value={dateValue} />
                    </DateRangePicker>   
                    <div style={{clear: 'both'}}>
                        { <ButtonWithLoading {...proceedExportBtn} /> }
                    </div>
                  </ModalDialog>
                </ModalContainer>
              }
            </span>
        );
    }
})

const OrderPage = React.createClass({
    getInitialState() {
        return ({driverID: null, orders: []})
    },
    componentWillMount() {
        this.props.FetchList();
        this.props.FetchDrivers(this.props.userLogged.userID);
    },
    selectDriver(e) {
        this.setState({driverID: e.key});
    },
    assignOrder() {
        let selectedOrders = lodash.filter(this.props.orders, ['IsChecked', true]);
        if (selectedOrders.length < 1) {
            alert('Must selected one or more orders');
            return;
        }
        if (!this.state.driverID) {
            alert('Driver must be set');
            return;
        }
        var orderPage = this;
        orderPage.props.AssignOrder(selectedOrders, orderPage.state.driverID);
    },
    render() {
        const {paginationState, PaginationAction, orders, drivers, userLogged} = this.props;
        const assignOrderButton = {
            textBase: 'Assign Order',
            onClick: this.assignOrder,
            styles: {
                base: styles.assignOrderButton,
            }
        };
        const exportOrderButton = {
            textBase: 'Export Order',
            onClick: this.exportOrder,
            styles: {
                base: stylesButton.greenButton,
            }
        };
        return (
            <Page title="My Order">
                <Pagination {...paginationState} {...PaginationAction} />
                <p>
                    <Link to={'/myorders/add'}>
                        <button className={stylesButton.greenButton}>Add Orders</button> 
                    </Link>
                    <ExportOrder ExportOrder={this.props.ExportOrder} />
                    <ButtonWithLoading {...assignOrderButton} />
                    <Form.DropdownWithState options={drivers} handleSelect={this.selectDriver} />
                </p>
                <Table orders={orders} />
                <Pagination {...paginationState} {...PaginationAction} />
            </Page>
        );
    }
});

function StoreToOrdersPage(store) {
    const {currentPage, limit, total, orders} = store.app.myOrders;
    const userLogged = store.app.userLogged;
    const driversStore = store.app.driversStore;
    const driverList = driversStore.driverList;
    const fleetDrivers = driversStore.fleetDrivers;
    const drivers = lodash.chain(fleetDrivers.dict[userLogged.userID] || []).map((driverID) => {
        return {
            key: driverID,
            value: UtilHelper.UserFullName(driverList.dict[driverID]),
        }
    }).sortBy((arr) => (arr.value)).value();
    return {
        orders: orders,
        drivers: drivers,
        userLogged: userLogged,
        paginationState: {
            currentPage, limit, total,
        },
    }
}

function DispatchToOrdersPage(dispatch) {
    return {
        FetchList: () => {
            dispatch(OrderService.FetchList());
        },
        ExportOrder: (startDate, endDate) => {
            dispatch(OrderService.ExportOrder(startDate, endDate));
        },
        FetchDrivers: (fleetID) => {
            dispatch(driversFetch(fleetID));
        },
        AssignOrder: (orders, driverID) => {
            dispatch(OrderService.AssignOrder(orders, driverID));
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(OrderService.SetCurrentPage(currentPage));
            },
            setLimit: (limit) => {
                dispatch(OrderService.SetLimit(limit));
            },
        }
    }
}

export default connect(StoreToOrdersPage, DispatchToOrdersPage)(OrderPage);