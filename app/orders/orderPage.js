import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading} from '../components/button';
import Table from './orderTable';
import * as OrderService from './orderService';
import styles from './styles.css';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';

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
            onClick: this.openModal
        };
        const proceedExportBtn = {
            textBase: "Export",
            onClick: this.exportOrder
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
    componentWillMount() {
        this.props.FetchList();
    },
    render() {
        const {paginationState, PaginationAction, orders} = this.props;

        const exportOrderButton = {
            textBase: 'Export Order',
            onClick: this.exportOrder,
            styles: {
                base: styles.exportOrderButton,
            }
        };
        return (
            <Page title="My Order">
                <Pagination {...paginationState} {...PaginationAction} />
                <p>
                    <ExportOrder ExportOrder={this.props.ExportOrder} />
                </p>
                <Table orders={orders} />
                <Pagination {...paginationState} {...PaginationAction} />
            </Page>
        );
    }
});

function StoreToOrdersPage(store) {
    const {currentPage, limit, total, orders} = store.app.myOrders;
    return {
        orders: orders,
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