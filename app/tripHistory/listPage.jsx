import React from 'react';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';

import lodash from 'lodash';

import { Page, Pagination } from '../views/base';
import Table from './table';
import TripParser from './parser';
import * as TripsHistoryService from './service';
import styles from './styles.scss';
import tableStyle from '../views/base/table.scss';
import Glyph from '../components/Glyph';
import { ButtonBase } from '../components/button';

const LinkComponents = React.createClass({
    render: function () {
        let linkComponents = this.props.message.TripID.map(function (trip) {
            return (
                <a href={"/trips/" + trip} target={"_blank"}>{trip} </a>
            );
        });
        return <div>{linkComponents}</div>;
    }
});

const FilterMessage = React.createClass({
    render: function () {
        const { messages } = this.props;
        let messageComponents = messages.map(function (message) {
            return (
                <tr className={tableStyle.tr}>
                    <td>
                        {message.UserOrderNumber}
                    </td>
                    {message.Found ?
                        <td className={styles.noPadding}>
                            <LinkComponents message={message} />
                        </td> :
                        <td>
                            Not found
                        </td>
                    }
                </tr>
            );
        });
        return (
            <tbody>
                {messageComponents}
            </tbody>
        );
    }
});

const TripHistoryPage = React.createClass({
    getInitialState() {
        return ({ opened: true, idsRaw: '', ids: [], idsStart: '', driverID: null, orders: [], filteredOrders: '', showModal: false })
    },
    openModal() {
        this.setState({ showModal: true });
    },
    closeModal() {
        this.setState({ showModal: false });
        this.props.ResetFilterOrder();
    },
    toggleOpen() {
        this.setState({ opened: !this.state.opened, idsStart: this.state.idsRaw });
    },
    cancelChange() {
        this.setState({ opened: true, idsRaw: this.state.idsStart });
    },
    textChange(e) {
        this.setState({ idsRaw: e.target.value });
    },
    textChange(e) {
        this.setState({ idsRaw: e.target.value });
    },
    processText() {
        const { filterAction } = this.props;
        const IDs = _.chain(this.state.idsRaw.match(/\S+/g)).uniq().value();
        if (IDs.length === 0) {
            alert('Please write EDS Number or Order ID');
            return;
        }
        this.setState({ ids: IDs });
        this.toggleOpen();
        const newFilters = { ['userOrderNumbers']: IDs };
        this.props.UpdateFilters(newFilters);
        this.props.FilterMultipleOrder();
        this.openModal();
    },
    clearText() {
        const { filterAction } = this.props;
        this.setState({ ids: [], idsRaw: '' });
        this.toggleOpen();
        const newFilters = { ['userOrderNumbers']: [] };
        this.props.UpdateFilters(newFilters);
        this.props.FilterMultipleOrder();
    },
    componentWillMount() {
        this.props.ResetFilter();
        this.props.FetchList();
    },
    componentWillReceiveProps(nextProps) {
        if (this.state.filteredOrders !== nextProps.filteredOrders) {
            this.setState({
                filteredOrders: nextProps['filteredOrders'],
            });
        }
    },
    render() {
        const { paginationState, PaginationAction, trips } = this.props;

        return (
            <Page title="Trips History">
                <div style={{ clear: 'both' }} />
                <div style={{ marginBottom: 15 }}>
                    {
                        this.state.opened ?
                            <div className={styles.top2} onClick={this.toggleOpen}>
                                <h4 className={styles.title}>
                                    <Glyph name='chevron-down' className={styles.glyphFilter} />
                                    {(this.state.ids.length ? 'Search multiple orders (' + this.state.ids.length + ' keywords)' : 'Search multiple orders')}
                                </h4>
                            </div> :
                            <div className={styles.panel}>
                                <div className={styles.top} onClick={this.toggleOpen}>
                                    <h4 className={styles.title}>
                                        <Glyph name='chevron-up' className={styles.glyphFilter} />
                                        {'Search multiple orders:'}
                                    </h4>
                                </div>
                                <div className={styles.bottom}>
                                    <textarea
                                        style={{ height: 100, width: '100%' }}
                                        value={this.state.idsRaw}
                                        onChange={this.textChange}
                                        placeholder={'Write/Paste EDS Number or Order ID here, separated with newline'} />
                                    <ButtonBase styles={styles.modalBtn} onClick={this.processText}>Filter</ButtonBase>
                                    <a href="javascript:;" className={styles.modalLink} onClick={this.cancelChange}>Cancel</a>
                                </div>
                            </div>
                    }
                </div>
                <Table trips={trips} />
                <Pagination {...paginationState} {...PaginationAction} />
                {
                    this.state.showModal &&
                    <ModalContainer onClose={this.closeModal}>
                        <ModalDialog onClose={this.closeModal}>
                            <div>
                                <table className={tableStyle.table + ' ' + styles.tableMessage}>
                                    <thead>
                                        <tr>
                                            <th>EDS Number</th>
                                            <th>Related Trips</th>
                                        </tr>
                                    </thead>
                                    <FilterMessage messages={this.state.filteredOrders} />
                                </table>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
            </Page>
        );
    }
});

function StoreToTripHistoryPage(store) {
    const { currentPage, limit, total, trips, filteredOrders } = store.app.tripsHistory;
    return {
        trips: lodash.map(trips, TripParser),
        paginationState: {
            currentPage, limit, total,
        },
        filteredOrders
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
        },
        FilterMultipleOrder: () => {
            dispatch(TripsHistoryService.FilterMultipleOrder());
        },
        UpdateFilters: (newFilters) => {
            dispatch(TripsHistoryService.UpdateFilters(newFilters));
        },
        SetCurrentPage: (currentPage) => {
            dispatch(TripsHistoryService.SetCurrentPage(currentPage));
        },
        ResetFilterOrder: () => {
            dispatch(TripsHistoryService.ResetFilterOrder());
        }
    }
}

export default connect(StoreToTripHistoryPage, DispatchToTripsHistoryPage)(TripHistoryPage);
