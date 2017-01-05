import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import groupingBody from './groupingBody';
import groupingHeaders from './groupingHeaders';
import * as Grouping from './groupingService';
import styles from './styles.css';
import {ButtonWithLoading, Input, Pagination} from '../views/base';

const Table = React.createClass({
  getInitialState() {
    return {id: ''};
  },
  componentDidMount() {
    this.props.GetList();
  },
  render() {
    const {Headers, Filters, Body, PaginationActions, isFetching, items, pagination} = this.props;

    let bodyComponents = (
      <td colSpan={8}>
        <div className={styles.fetchingText}>
          Fetching data...
        </div>
      </td>
    );
    if (!isFetching) {
      if (items.length === 0) {
        bodyComponents = (
          <td colSpan={12}>
            <div className={styles.emptyTableContainer}>
              <span>
                <img src="/img/image-group-done.png" className={styles.emptyTableImage} />
                <div className={styles.bigText}>
                  You have successfully create Bags/Trips for all of your orders!
                </div>
                <div className={styles.smallTextGrey}>
                  Please go the outbound page to dispatch all of those bags/trips to your customer.
                </div>
              </span>
            </div>
          </td>
        );
      } else {
        bodyComponents = (
          <Body items={items} />
        )
      }
    }

    return (
      <div>
        <table className={styles.table}>
          <Headers />
          {bodyComponents}
        </table>
        <Pagination {...pagination} {...PaginationActions} />
      </div>
    );
  }
});

function mapStateToGrouping(state, ownProps) {
  const {grouping} = state.app;
  const {currentPage, isFetching, limit, orders, selected, total, isGrouping} = grouping;

  return {
    Headers: groupingHeaders,
    Body: groupingBody,
    isFetching,
    isGrouping,
    items: orders,
    pagination: {
      currentPage, limit, total,
    }
  }
}

function mapDispatchToGrouping(dispatch, ownProps) {
  return {
    GetList: () => {
      dispatch(Grouping.FetchList());
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(Grouping.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(Grouping.SetLimit(limit));
      },
    }
  }
}

export default connect(mapStateToGrouping, mapDispatchToGrouping)(Table);
