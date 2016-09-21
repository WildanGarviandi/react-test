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

const OrderPage = React.createClass({
    componentWillMount() {
        this.props.FetchList();
    },
    exportOrder() {
        this.props.ExportOrder();
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
                    <ButtonWithLoading {...exportOrderButton} />
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
        ExportOrder: () => {
            dispatch(OrderService.ExportOrder());
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