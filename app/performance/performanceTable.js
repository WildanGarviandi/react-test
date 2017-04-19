import lodash from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {push} from 'react-router-redux';
import * as Performance from './performanceService';
import {DropdownTypeAhead, Input, Pagination} from '../views/base';
import DateRangePicker from '../views/base/dateRangePicker';
import tableStyles from './table.css';
import {formatDate} from '../helper/time';
import {modalAction} from '../modules/modals/constants';
import ModalActions from '../modules/modals/actions';
import classnaming from 'classnames';
import styles from './styles.css';
import {TripParser} from '../modules/trips';

const ColumnsOrder = ['date', 'process', 'processingTime', 'totalOrders'];

const ColumnsTitle = {
  date: "Date",
  process: "Process",
  processingTime: "Average Processing Time",
  totalOrders: "Total Orders"
};

function getTimeFromSeconds(seconds) {
  let h = seconds / 3600;
  let m = seconds / 60;
  return moment.utc().hours(h).minutes(m).seconds(seconds);
}

class Table extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      performances: _.sortBy(this.props.performances, 'date'),
      sortedDesc: true
    };
  }
  sortTable(criteria) {
    this.setState({
      performances: _.sortBy(this.state.performances, 'date'),
      sortedDesc: !this.state.sortedDesc
    });
    if (this.state.sortedDesc) {
      this.setState({
        performances: _.sortBy(this.state.performances, 'date').reverse()
      });
    }
  }
  render() {
    const Headers = _.map(ColumnsOrder, (columnKey) => {
      if (columnKey === 'date') {
        return <th onClick={this.sortTable.bind(this)} key={columnKey}>
          {ColumnsTitle[columnKey]} <img className={styles.sortDate} src="/img/icon-sort.png" />
        </th>;
      }
      return <th key={columnKey}>{ColumnsTitle[columnKey]}</th>;
    });

    const Body = _.map(this.state.performances, (item, idx) => {
      const cells = _.map(ColumnsOrder, (columnKey) => {
        const contentsProcess = ['Pickup Orders', 'Inbound', 'Update Orders', 'Grouping', 'Outbound'];
        const contentsProcessingTime = [
          `${getTimeFromSeconds(item.pickupOrders.averageProcessingTime).format('H')}h 
            ${getTimeFromSeconds(item.pickupOrders.averageProcessingTime).format('m')}m
            ${getTimeFromSeconds(item.pickupOrders.averageProcessingTime).format('s')}s`,
          `${getTimeFromSeconds(item.inbound.averageProcessingTime).format('H')}h 
            ${getTimeFromSeconds(item.inbound.averageProcessingTime).format('m')}m
            ${getTimeFromSeconds(item.inbound.averageProcessingTime).format('s')}s`,
          `${getTimeFromSeconds(item.updateOrders.averageProcessingTime).format('H')}h 
            ${getTimeFromSeconds(item.updateOrders.averageProcessingTime).format('m')}m 
            ${getTimeFromSeconds(item.updateOrders.averageProcessingTime).format('s')}s`,
          `${getTimeFromSeconds(item.grouping.averageProcessingTime).format('H')}h 
            ${getTimeFromSeconds(item.grouping.averageProcessingTime).format('m')}m 
            ${getTimeFromSeconds(item.grouping.averageProcessingTime).format('s')}s`,
          `${getTimeFromSeconds(item.outbound.averageProcessingTime).format('H')}h 
            ${getTimeFromSeconds(item.outbound.averageProcessingTime).format('m')}m 
            ${getTimeFromSeconds(item.outbound.averageProcessingTime).format('s')}s`
        ];
        const contentsTotalOrders = [
          item.pickupOrders.totalOrders,
          item.inbound.totalOrders,
          item.updateOrders.totalOrders,
          item.grouping.totalOrders,
          item.outbound.totalOrders
        ];

        if (columnKey === 'date') {
          return <td className={tableStyles.td + ' ' + styles.tripIDColumn} key={columnKey}>
            {moment(item.date).format('MMMM Do YYYY')}
          </td>;
        }
        if (columnKey === 'process') {
          return <td key={columnKey}>
            <div>
              <TableInside contents={contentsProcess}/>
            </div>
          </td>;
        }
        if (columnKey === 'processingTime') {
          return <td className={styles.processingColumn} key={columnKey}>
            <div>
              <TableInside contents={contentsProcessingTime}/>
            </div>
          </td>;
        }
        if (columnKey === 'totalOrders') {
          return <td key={columnKey}>
            <div>
              <TableInside contents={contentsTotalOrders}/>
            </div>
          </td>;
        }
        return <td className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
      });

      return <tr key={idx} className={tableStyles.tr}>{cells}</tr>;
    });

    return (
      <table className={tableStyles.table}>
        <thead><tr>{Headers}</tr></thead>
        <tbody>{Body}</tbody>
      </table>
    );
  }
};

class TableInside extends React.Component {
  render() {
    var tableComponents = this.props.contents.map(function(content, idx) {
      return (
        <tr key={idx}>
          <td>
            {content}
          </td>
        </tr>
      );
    }.bind(this));
    return (
      <table className={tableStyles.tableInside}>
        <tbody>
          {tableComponents}
        </tbody>
      </table>
    );
  }
};

class TableStateful extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      trip: this.props.trip, 
      filters: this.props.filters
    };
  }
  render() {
    const {paginationAction, paginationState, tripsIsFetching, performances} = this.props;

    const paginationProps = _.assign({}, paginationAction, paginationState);

    const tableProps = {
      items: this.props.trips,
      isFetching: tripsIsFetching,
      performances: performances && performances.rows
    }

    return (
      <div>
        <div style={{opacity: tripsIsFetching ? 0.5 : 1}}>
          <Table {...tableProps} />
        </div>
      </div>
    );
  }
};

function StateToProps(state) {
  const {inboundTrips, userLogged, performance} = state.app;
  const {hubID, isCentralHub} = userLogged;
  const {isFetching, limit, total, currentPage, trips} = inboundTrips;
  const {performances} = performance;

  const paginationState = {
    currentPage: currentPage,
    limit: limit,
    total: total,
  }
  return {
    paginationState, trips, tripsIsFetching: isFetching, performances
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    initialLoad() {
      dispatch(Performance.FetchList());
    }
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
