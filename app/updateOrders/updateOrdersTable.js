import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import UpdateOrdersBody from './updateOrdersBody';
import UpdateOrdersHeaders from './updateOrdersHeaders';
import * as UpdateOrders from './updateOrdersService';
import {conf, updateOrdersColumns} from './updateOrdersColumns';
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
      <td colSpan={updateOrdersColumns.length}>
        <div className={styles.fetchingText}>
          Fetching data...
        </div>
      </td>
    );
    if (!isFetching) {
      if (items.length === 0) {
        bodyComponents = (
          <td colSpan={updateOrdersColumns.length}>
            <div className={styles.emptyTableContainer}>
              <span>
                <img src="/img/image-scan-done.png" className={styles.emptyTableImage}/>
                <div className={styles.bigText + ' ' + styles.emptyTableBigText}>
                  Awesome work guys!
                </div>
                <div className={styles.emptyTableSmallText}>
                  You have update all of the orders measurement
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

function mapStateToUpdateOrders(state, ownProps) {
  const {updateOrders} = state.app;
  const {currentPage, isFetching, limit, orders, selected, total} = updateOrders;

  return {
    Headers: UpdateOrdersHeaders,
    Body: UpdateOrdersBody,
    isFetching: isFetching,
    items: orders,
    pagination: {
      currentPage, limit, total,
    }
  }
}

function mapDispatchToUpdateOrders(dispatch, ownProps) {
  return {
    GetList: () => {
      dispatch(UpdateOrders.FetchList());
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(UpdateOrders.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(UpdateOrders.SetLimit(limit));
      },
    }
  }
}

export default connect(mapStateToUpdateOrders, mapDispatchToUpdateOrders)(Table);
