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
import stylesButton from '../components/button.css';

const OrderPage = React.createClass({
    componentWillMount() {
        this.props.FetchList()
    },
    render() {
        const {paginationState, PaginationAction, orders} = this.props;
        return (
            <Page title="My Order">
                <Pagination {...paginationState} {...PaginationAction} />
                <p>
                    <Link to={'/myorders/add'} className={stylesButton.greenButton}>Add Order</Link>
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