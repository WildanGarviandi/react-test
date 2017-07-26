import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import groupingBody from './groupingBody';
import groupingHeaders from './groupingHeaders';
import * as Grouping from './groupingService';
import styles from './styles.scss';
import { Pagination } from '../views/base';

function mapStateToGrouping(state) {
  const { grouping } = state.app;
  const { currentPage, isFetching, limit, orders, total, isGrouping } = grouping;

  const stateToProps = {
    Headers: groupingHeaders,
    Body: groupingBody,
    isFetching,
    isGrouping,
    items: orders,
    pagination: {
      currentPage, limit, total,
    },
  };

  return stateToProps;
}

function mapDispatchToGrouping(dispatch) {
  const dispatchFunc = {
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
    },
  };

  return dispatchFunc;
}

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
    };
  }
  componentDidMount() {
    this.props.GetList();
  }
  render() {
    const { Headers, Body, PaginationActions, isFetching, items, pagination } = this.props;

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
                <img alt="group done" src="/img/image-group-done.png" className={styles.emptyTableImage} />
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
}

/* eslint-disable */
Table.propTypes = {
  GetList: PropTypes.func,
  Headers: PropTypes.any,
  Body: PropTypes.any,
  PaginationActions: PropTypes.any,
  isFetching: PropTypes.bool,
  items: PropTypes.array,
  pagination: PropTypes.any,
}
/* eslint-enable */

Table.defaultProps = {
  GetList: () => {},
  Headers: {},
  Body: {},
  PaginationActions: {},
  isFetching: false,
  items: [],
  pagination: {},
};

export default connect(mapStateToGrouping, mapDispatchToGrouping)(Table);
