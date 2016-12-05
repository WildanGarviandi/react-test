import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page, Pagination} from '../views/base';
import Table from './table';
import TripParser from './parser';
import * as TripsHistoryService from './service';
import styles from './styles.css';
import {Glyph} from '../views/base';
import {ButtonWithLoading, ButtonBase} from '../components/button';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

const LinkComponents = React.createClass({
    render: function() {
        let linkComponents = this.props.message.TripID.map(function(trip) {
            return (
                <a href={"/history/" + trip} target={"_blank"}>{trip} </a>
            );
        });
        return <div>{linkComponents}</div>;
    }
});

const FilterMessage = React.createClass({
    render: function() {
        const {messages} = this.props;
        let messageComponents = messages.map(function(message) {
            return (
                <div className={styles.foundTrip}>
                    { message.Found ?
                        <span>
                            {message.UserOrderNumber} found on Trip:
                            <LinkComponents message={message} />
                        </span> :
                        <span>
                            {message.UserOrderNumber} not found
                        </span>
                    }
                </div>
            );
        });
        return <div>{messageComponents}</div>;
    }
});

const TripHistoryPage = React.createClass({
    getInitialState() {
        return ({opened: true, idsRaw: '', ids: [], idsStart: '', driverID: null, orders: [], filteredOrders: '', showModal: false})
    },
    openModal() {
        this.setState({showModal: true});
    },
    closeModal() {
        this.setState({showModal: false});
        this.props.ResetFilterOrder();
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
        const newFilters = {['userOrderNumbers']: IDs};
        this.props.UpdateFilters(newFilters);
        this.props.FilterMultipleOrder();
        this.openModal();
    },
    clearText() {
        const {filterAction} = this.props;
        this.setState({ids: [], idsRaw: ''});
        this.toggleOpen();
        const newFilters = {['userOrderNumbers']: []};
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
        const {paginationState, PaginationAction, trips} = this.props;

        return (
            <Page title="Trips History">
                <div style={{clear: 'both'}} />
                    <div style={{marginBottom: 15}}>
                        {
                        this.state.opened ? 
                        <div className={styles.top2} onClick={this.toggleOpen}>
                          <h4 className={styles.title}>
                            <Glyph name='chevron-down' className={styles.glyphFilter} />
                            {'Search Order (' + this.state.ids.length + ' keywords)'}
                          </h4>
                        </div> :
                        <div className={styles.panel}>
                          <div className={styles.top} onClick={this.toggleOpen}>
                            <h4 className={styles.title}>
                              <Glyph name='chevron-up' className={styles.glyphFilter} />
                              {'Web Order ID or User Order Number:'}
                            </h4>
                          </div>
                          <div className={styles.bottom}>
                            <textarea 
                                style={{height: 100, width: '100%'}} 
                                value={this.state.idsRaw} 
                                onChange={this.textChange} 
                                placeholder={'Write/Paste EDS Number or Order ID here, separated with newline'} />
                            <ButtonBase styles={styles.modalBtn} onClick={this.processText}>Filter</ButtonBase>
                            <a href="javascript:;" className={styles.modalLink} onClick={this.cancelChange}>Cancel</a>
                          </div>
                        </div>
                        }
                    </div>
                <Pagination {...paginationState} {...PaginationAction} />
                <Table trips={trips} />
                {
                  this.state.showModal &&
                  <ModalContainer onClose={this.closeModal}>
                    <ModalDialog onClose={this.closeModal}>
                        <div>
                            <FilterMessage messages={this.state.filteredOrders} />
                        </div>
                    </ModalDialog>
                  </ModalContainer>
                }
            </Page>
        );
    }
});

function StoreToTripHistoryPage(store) {
    const {currentPage, limit, total, trips, filteredOrders} = store.app.tripsHistory;
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
