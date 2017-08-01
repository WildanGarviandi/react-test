import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';
import InboundOrdersBody from './inboundOrdersBody';
import InboundOrdersHeaders from './inboundOrdersHeaders';
import * as InboundOrders from './inboundOrdersService';
import { Pagination } from '../views/base';
import { inboundOrdersColumns } from './inboundOrdersColumns';
import config from '../config/configValues.json';

const mapStateToInboundOrders = (state) => {
  const { inboundOrders } = state.app;
  const { currentPage, isFetching, limit, orders, total } = inboundOrders;

  return {
    Headers: InboundOrdersHeaders,
    Body: InboundOrdersBody,
    isFetching,
    items: orders,
    pagination: {
      currentPage, limit, total,
    },
  };
};

const mapDispatchToInboundOrders = (dispatch, ownProps) => {
  const dispatchData = {
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
    },
  };
  return dispatchData;
};

const Table = React.createClass({
  getInitialState() {
    return { id: '' };
  },
  componentDidMount() {
    this.props.GetList();
  },
  render() {
    const { Headers, Body, PaginationActions, isFetching, items, pagination } = this.props;

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
                    <img
                      alt="trip done"
                      src={config.IMAGES.INBOUND_TRIP_DONE}
                      className={styles.emptyTableImage}
                    />
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
  },
});

export default connect(mapStateToInboundOrders, mapDispatchToInboundOrders)(Table);
