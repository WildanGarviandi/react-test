import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import Table from './tripTable';
import * as TripService from './tripService'

const TripPage = React.createClass({
    componentWillMount() {
        this.props.FetchList()
    },
    render() {
        const {paginationState, PaginationAction, trips} = this.props;
        return (
            <Page title="My Trips">
                <Pagination {...paginationState} {...PaginationAction} />
                <Table trips={trips} />
                <Pagination {...paginationState} {...PaginationAction} />
            </Page>
        );
    }
});

function StoreToTripsPage(store) {
    const {currentPage, limit, total, trips} = store.app.myTrips;
    return {
        trips: trips,
        paginationState: {
            currentPage, limit, total,
        },
    }
}

function DispatchToTripsPage(dispatch) {
    return {
        FetchList: () => {
            dispatch(TripService.FetchList());
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(TripService.SetCurrentPage(currentPage));
            },
            setLimit: (limit) => {
                dispatch(TripService.SetLimit(limit));
            },
        }
    }
}

export default connect(StoreToTripsPage, DispatchToTripsPage)(TripPage);