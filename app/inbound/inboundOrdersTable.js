import lodash from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import styles from './styles.css';
import InboundOrdersBody from './inboundOrdersBody';
import InboundOrdersHeaders from './inboundOrdersHeaders';
import * as InboundOrders from './inboundOrdersService';
import { ButtonWithLoading, Input, Pagination } from '../views/base';
import { inboundOrdersColumns } from './inboundOrdersColumns';

const Table = React.createClass({
  getInitialState() {
    return { id: '' };
  },
  componentDidMount() {
    this.props.GetList();
  },
  render() {
    const { Headers, Filters, Body, PaginationActions, isFetching, items, pagination } = this.props;

    let bodyComponents = (
      <tbody>
        <tr>
          <td colSpan={inboundOrdersColumns.length}>
            <div className={styles.fetchingText}>
              Fetching data...
        </div>
          </td>
        </tr>
      </tbody>
    );
    if (!isFetching) {
      if (items.length === 0) {
        bodyComponents = (
          <tbody>
            <tr>
              <td colSpan={inboundOrdersColumns.length}>
                <div className={styles.emptyTableContainer}>
                  <span>
                    <img src="/img/image-inbound-trip-done.png" className={styles.emptyTableImage} />
                    <div className={styles.bigText}>
                      Awesome work guys!
                  </div>
                    <div className={styles.emptyTableSmallText}>
                      All trip orders are verified, you have scanned and
                    verified all the inbound orders.
                </div>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        );
      } else {
        bodyComponents = (
          <Body items={items} />
        );
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

function mapStateToInboundOrders(state, ownProps) {
  const { inboundOrders } = state.app;
  const { currentPage, isFetching, limit, orders, selected, total } = inboundOrders;

  return {
    Headers: InboundOrdersHeaders,
    Body: InboundOrdersBody,
    isFetching: isFetching,
    items: orders,
    pagination: {
      currentPage, limit, total,
    }
  }
}

function mapDispatchToInboundOrders(dispatch, ownProps) {
  return {
    GetList: () => {
      if (ownProps.isFill) {
        dispatch(InboundOrders.FetchNotAssignedList());
      } else {
        dispatch(InboundOrders.FetchList());
      }
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(InboundOrders.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(InboundOrders.SetLimit(limit));
      },
    }
  }
}

export default connect(mapStateToInboundOrders, mapDispatchToInboundOrders)(Table);
