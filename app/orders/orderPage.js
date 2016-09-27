import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading, ButtonBase} from '../components/button';
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
import {Glyph} from '../views/base';

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
        return ({opened: true, idsRaw: '', ids: [], idsStart: '', driverID: null, orders: []})
    },
    toggleOpen() {
        this.setState({opened: !this.state.opened, idsStart: this.state.idsRaw});
    },
    cancelChange() {
        this.setState({opened: true, idsRaw: this.state.idsStart});
    },
    textChange(e) {
        this.setState({idsRaw: e.target.value});
    },
    textChange(e) {
        this.setState({idsRaw: e.target.value});
    },
    processText() {
        const {filterAction} = this.props;
        const IDs = _.chain(this.state.idsRaw.match(/\S+/g)).uniq().value();
        this.setState({ids: IDs});
        this.toggleOpen();
        const newFilters = {['userOrderNumbers']: JSON.stringify(IDs)};
        this.props.UpdateFilters(newFilters);
        this.props.StoreSetter("currentPage", 1);
        this.props.FetchList();
    },
    clearText() {
        const {filterAction} = this.props;
        this.setState({ids: [], idsRaw: ''});
        this.toggleOpen();
        const newFilters = {['userOrderNumbers']: []};
        this.props.UpdateFilters(newFilters);
        this.props.StoreSetter("currentPage", 1);
        this.props.FetchList();
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
                base: stylesButton.greenButton,
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
            <div style={{marginBottom: 15}}>
              {
                this.state.opened ? 
                <div className={styles.top2} onClick={this.toggleOpen}>
                  <h4 className={styles.title}>
                    <Glyph name='chevron-down' className={styles.glyph} />
                    {'Filter Order (' + this.state.ids.length + ' keywords)'}
                  </h4>
                </div> :
                <div className={styles.panel}>
                  <div className={styles.top} onClick={this.toggleOpen}>
                    <h4 className={styles.title}>
                      <Glyph name='chevron-up' className={styles.glyph} />
                      {'Web Order ID or User Order Number:'}
                    </h4>
                  </div>
                  <div className={styles.bottom}>
                    <textarea style={{height: 100, width: '100%'}} value={this.state.idsRaw} onChange={this.textChange} placeholder={'Write/Paste EDS Number or Order ID here, separated with newline'} />
                    <ButtonBase styles={styles.modalBtn} onClick={this.processText}>Filter</ButtonBase>
                    <a href="javascript:;" className={styles.modalLink} onClick={this.cancelChange}>Cancel</a>
                    <a href="javascript:;" className={styles.modalLink} onClick={this.clearText}>Clear</a>
                  </div>
                </div>
              }
              </div>
                <Pagination {...paginationState} {...PaginationAction} />
                <p>
                    <ButtonWithLoading {...assignOrderButton} />
                    <Link to={'/myorders/add'}>
                        <button className={stylesButton.greenButton}>Add Orders</button> 
                    </Link>
                    <ExportOrder ExportOrder={this.props.ExportOrder} />
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
        UpdateFilters: (newFilters) => {
            dispatch(OrderService.UpdateFilters(newFilters));
        },
        StoreSetter: (name, value) => {
            dispatch(OrderService.StoreSetter(name, value));
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