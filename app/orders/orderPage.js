import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading} from '../components/button';
import Table from './orderTable';
import * as OrderService from './orderService'

const OrderPage = React.createClass({
    componentWillMount() {
        this.props.FetchList()
    },
    goToAddOrder() {
        window.location = '/myorders/add';
    },
    render() {
        const {paginationState, PaginationAction, orders} = this.props;
        const addOrderButton = {
            textBase: 'Add Order',
            onClick: this.goToAddOrder,
        }
        return (
            <Page title="My Order">
                <ButtonWithLoading {...addOrderButton} />
                <Pagination {...paginationState} {...PaginationAction} />
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