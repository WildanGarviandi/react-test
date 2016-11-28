import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page, Pagination} from '../views/base';
import Table from './table';
import TripParser from './parser';
import * as TripsHistoryService from './service';

const TripHistoryPage = React.createClass({
    componentWillMount() {
        this.props.ResetFilter();
        this.props.FetchList();
    },
    render() {
        const {paginationState, PaginationAction, trips} = this.props;

        return (
            <Page title="Trips History">
                <Pagination {...paginationState} {...PaginationAction} />
                <Table trips={trips} />
            </Page>
        );
    }
});

function StoreToTripHistoryPage(store) {
    const {currentPage, limit, total, trips} = store.app.tripsHistory;
    return {
        trips: lodash.map(trips, TripParser),
        paginationState: {
            currentPage, limit, total,
        },
    }
}

function DispatchToTripsHistoryPage(dispatch) {
    return {
        FetchList: () => {
            dispatch(TripsHistoryService.FetchList());
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(TripsHistoryService.SetCurrentPage(currentPage));
            },
            setLimit: (limit) => {
                dispatch(TripsHistoryService.SetLimit(limit));
            },
        },
        ResetFilter: () => {
            dispatch(TripsHistoryService.ResetFilter());
        }
    }
}

export default connect(StoreToTripHistoryPage, DispatchToTripsHistoryPage)(TripHistoryPage);
