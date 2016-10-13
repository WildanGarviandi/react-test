import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading} from '../components/button';
import Table from './driverTable';
import * as DriverService from './driverService';
import styles from './styles.css';

const DriverPage = React.createClass({
    componentWillMount() {
        this.props.FetchList()
    },
    render() {
        const {paginationState, PaginationAction, drivers} = this.props;
        return (
            <Page title="My Driver">
                <Pagination {...paginationState} {...PaginationAction} />
                <Table drivers={drivers} />
                <Pagination {...paginationState} {...PaginationAction} />
            </Page>
        );
    }
});

function StoreToDriversPage(store) {
    const {currentPage, limit, total, drivers} = store.app.myDrivers;
    return {
        drivers: drivers,
        paginationState: {
            currentPage, limit, total,
        },
    }
}

function DispatchToDriversPage(dispatch) {
    return {
        FetchList: () => {
            dispatch(DriverService.FetchList());
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(DriverService.SetCurrentPage(currentPage));
            },
            setLimit: (limit) => {
                dispatch(DriverService.SetLimit(limit));
            },
        }
    }
}

export default connect(StoreToDriversPage, DispatchToDriversPage)(DriverPage);