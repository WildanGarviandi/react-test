/* eslint no-underscore-dangle: ["error", { "allow": ["_milliseconds"] }] */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Countdown from 'react-cntdwn';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import ReactDOM from 'react-dom';

import _ from 'lodash';
import moment from 'moment';

import { FilterTop, Filter as FilterDropdown } from '../components/form';
import { Pagination2 } from '../components/pagination2';
import * as orderMonitoringService from './orderMonitoringService';
import { CheckboxHeaderPlain, CheckboxCell } from '../views/base/tableCell';
import styles from './table.scss';
import mainStyles from './styles.scss';
import config from '../config/configValues.json';
import envConfig from '../../config.json';

const rowPropTypes = {
  expandedOrder: PropTypes.any,
  order: PropTypes.any,
  profilePicture: PropTypes.any,
  tab: PropTypes.any,
  getDetail: PropTypes.func,
};

const rowDefaultProps = {
  expandedOrder: null,
  order: null,
  profilePicture: null,
  tab: null,
  getDetail: null,
};

class OrderRow extends PureComponent {
  render() {
    const { expandedOrder, order, profilePicture, tab, getDetail } = this.props;
    const FLEET_IMAGE = profilePicture;
    let rowStyles = `${styles.tr} ${styles.card} `;
    if (expandedOrder.UserOrderNumber === order.UserOrderNumber) {
      rowStyles += styles.select;
    }

    return (
      <tr className={rowStyles}>
        <td className={`${styles.driverInput} ${styles.td}`}>
          <Checkbox isChecked={order.IsChecked} orderID={order.UserOrderNumber} tab={tab} />
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardSeparator} />
        </td>
        <td
          role="none"
          onClick={() => getDetail(order.UserOrderID)}
        >
          <img
            alt="etobee"
            className={styles.orderLoadImage}
            src={order.IsTrunkeyOrder ? config.IMAGES.ETOBEE_LOGO : FLEET_IMAGE}
            onError={(e) => { e.target.src = config.IMAGES.DEFAULT_LOGO; }}
          />
        </td>
        <td
          role="none"
          className={`${styles.td} ${styles.orderIDColumn}`}
          onClick={() => getDetail(order.UserOrderID)}
        >
          {order.UserOrderNumber}
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardSeparator} />
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardLabel}>
            Deadline
          </div>
          <br />
          <div className={`${styles.cardValue} ${styles.cancelled}`}>
            <Deadline deadline={order.DueTime} />
          </div>
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardSeparator} />
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardLabel}>
            {"Driver's Name"}
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.Driver ? `${order.Driver.FirstName} ${order.Driver.LastName}` : '-'}
          </div>
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardSeparator} />
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardLabel}>
            Order Status
          </div>
          <br />
          <div className={`${styles.cardValue} ${styles[order.OrderStatus.OrderStatus]}`}>
            {order.OrderStatus.OrderStatus}
          </div>
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardSeparator} />
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardLabel}>
            COD Type
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.IsCOD ? 'COD' : 'Non-COD'}
          </div>
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardSeparator} />
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardLabel}>
            COD Status
          </div>
          <br />
          {
            order.IsCOD &&
            <div className={styles.cardValue}>
              {
                order.CODPaymentUserOrder && order.CODPaymentUserOrder.CODPayment ?
                  order.CODPaymentUserOrder.CODPayment.Status : 'Unpaid'
              }
            </div>
          }
          {
            !order.IsCOD &&
            <div className={styles.cardValue}>-</div>
          }
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardSeparator} />
        </td>
        <td
          role="none"
          className={styles.td}
          onClick={() => getDetail(order.UserOrderID)}
        >
          <div className={styles.cardLabel}>
            Fleet&apos;s Area
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.DropoffAddress.City}
          </div>
        </td>
      </tr>
    );
  }
}

OrderRow.propTypes = rowPropTypes;
OrderRow.defaultProps = rowDefaultProps;

// START DROPDOWN FILTER

function DropdownDispatchBuilder(keyword, tab) {
  const dispatchFunc = (dispatch, props) => {
    const handleSelectFunc = {
      handleSelect: (value) => {
        dispatch(orderMonitoringService.SetDropDownFilter(keyword, value, tab || props.tab));
      },
    };
    return handleSelectFunc;
  };
  return dispatchFunc;
}

function DropdownStoreBuilder(name) {
  return (store, props) => {
    const { sortOptions, orderTypeOptions, statusOptions, codOptions } = config;
    statusOptions.total = _.union(
      statusOptions.pending,
      statusOptions.succeed,
      statusOptions.failed,
    );
    const options = {
      statusOptions: statusOptions[props.tab],
      sortOptions,
      orderTypeOptions,
      codOptions,
    };

    return {
      value: store.app.orderMonitoring[name][props.tab],
      options: options[name],
    };
  };
}

function ConnectDropdownBuilder(keyword) {
  return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const StatusFilter = ConnectDropdownBuilder('statusOptions')(FilterDropdown);
const CODFilter = ConnectDropdownBuilder('codOptions')(FilterDropdown);

const SortFilter = ConnectDropdownBuilder('sortOptions')(FilterTop);
const OrderTypeFilter = ConnectDropdownBuilder('orderTypeOptions')(FilterTop);

// END DROPDOWN FILTER

// START INPUT FILTER

function InputStoreBuilder(keyword) {
  return (store, props) => {
    const { filters } = store.app.orderMonitoring;
    if (!_.isEmpty(filters[props.tab])) {
      return { value: filters[props.tab][keyword] };
    }

    return { value: '' };
  };
}

function InputDispatchBuilder(keyword, placeholder) {
  return (dispatch, props) => {
    const { tab } = props;
    function OnChange(e) {
      const value = (keyword === 'userOrderNumber') ? e.target.value.toUpperCase() : e.target.value;

      const newFilters = {
        filters: {
          [tab]: {
            [keyword]: value,
          },
        },
      };
      dispatch(orderMonitoringService.SetFilter(newFilters));
    }

    function OnKeyDown(e) {
      if (e.keyCode !== config.KEY_ACTION.ENTER) {
        return;
      }
      dispatch(orderMonitoringService.SetCurrentPage(1, tab));
      dispatch(orderMonitoringService.FetchList(tab));
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
      placeholder,
    };
  };
}

function ConnectBuilder(keyword, placeholder) {
  return connect(InputStoreBuilder(keyword), InputDispatchBuilder(keyword, placeholder));
}

function InputFilter({ value, onChange, onKeyDown, placeholder }) {
  return (
    <input
      className={styles.inputSearch}
      placeholder={placeholder}
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}

/* eslint-disable */
InputFilter.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  placeholder: PropTypes.any,
};
/* eslint-enable */

InputFilter.defaultProps = {
  value: {},
  onChange: () => { },
  onKeyDown: () => { },
  placeholder: {},
};

const EDSFilter = ConnectBuilder('userOrderNumber', 'Search for EDS...')(InputFilter);
const NameFilter = ConnectBuilder('driverName', 'Search for driver...')(InputFilter);
const FleetFilter = ConnectBuilder('dropoffCity', "Search for fleet's area...")(InputFilter);

// END INPUT FILTER

// START DATERANGEPICKER

function Daterangepicker({ startDate, endDate, onChange }) {
  const startDateFormatted = moment(startDate).format('MM-DD-YYYY');
  const endDateFormatted = moment(endDate).format('MM-DD-YYYY');
  let dateValue = `${startDateFormatted} - ${endDateFormatted}`;
  if (!startDate && !endDate) {
    dateValue = '';
  }

  return (
    <div className={styles.searchInputWrapper}>
      <DateRangePicker
        startDate={startDateFormatted}
        endDate={endDateFormatted}
        onApply={onChange}
        maxDate={moment()}
        parentEl="#bootstrapPlaceholder"
      >
        <input className={styles.searchInput} type="text" defaultValue={dateValue} />
      </DateRangePicker>
    </div>
  );
}

/* eslint-disable */
Daterangepicker.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  onChange: PropTypes.func,
};
/* eslint-enable */

Daterangepicker.defaultProps = {
  startDate: '',
  endDate: '',
  onChange: () => { },
};

function DaterangeStoreBuilder() {
  return (store) => {
    const { startDate, endDate } = store.app.orderMonitoring;

    return { startDate, endDate };
  };
}

function DaterangeDispatch() {
  return (dispatch) => {
    const onChange = {
      onChange: (event, picker) => {
        const { startDate, endDate } = picker;
        const newDate = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };

        dispatch(orderMonitoringService.SetDate(newDate));
        dispatch(orderMonitoringService.FetchAllList());
      },
    };
    return onChange;
  };
}

const Datepicker = connect(DaterangeStoreBuilder, DaterangeDispatch)(Daterangepicker);

// END DATERANGEPICKER

// START CHECKBOX

function CheckboxHeaderStore() {
  return (store, props) => {
    const isCheckedFunc = {
      isChecked: store.app.orderMonitoring.selectedAll[props.tab],
    };
    return isCheckedFunc;
  };
}

function CheckboxHeaderDispatch() {
  const dispatchFunc = (dispatch, props) => {
    const onToggleFunc = {
      onToggle: () => {
        dispatch(orderMonitoringService.ToggleCheckAll(props.tab));
      },
    };
    return onToggleFunc;
  };
  return dispatchFunc;
}

const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(CheckboxHeaderPlain);

function CheckboxDispatch(dispatch, props) {
  return {
    onToggle: () => {
      dispatch(orderMonitoringService.ToggleSelectOrder(props.orderID, props.tab));
    },
  };
}

const Checkbox = connect(null, CheckboxDispatch)(CheckboxCell);

// END CHECKBOX

// START COUNTDOWN

export class Deadline extends PureComponent {
  render() {
    const format = {
      hour: 'hh',
      minute: 'mm',
      second: 'ss',
    };
    const Duration = moment.duration(moment(this.props.deadline).diff(moment(new Date())));
    if (!this.props.deadline) {
      return (
        <span className={styles['text-normal']}>
          -
        </span>
      );
    } else if (Duration._milliseconds > config.deadline.day) {
      return (
        <span className={styles['text-normal']}>
          {Duration.humanize()} remaining
        </span>
      );
    } else if (Duration._milliseconds < 0) {
      return (
        <span className={styles['text-danger']}>
          Passed
        </span>
      );
    }
    const normalDeadline = (Duration._milliseconds > config.deadline['3hours']) && (Duration._milliseconds < config.deadline.day);
    return (
      <span className={normalDeadline ? styles['text-normal'] : styles['text-danger']}>
        <Countdown
          targetDate={new Date(this.props.deadline)}
          startDelay={500}
          interval={1000}
          format={format}
          timeSeparator={':'}
          leadingZero
        />
      </span>
    );
  }
}

/* eslint-disable */
Deadline.propTypes = {
  deadline: PropTypes.any,
};
/* eslint-enable */

Deadline.defaultProps = {
  deadline: {},
};

// END COUNTDOWN

const filterPropTypes = {
  pagination: PropTypes.any,
  tab: PropTypes.any,
  orders: PropTypes.any,
  hideOrder: PropTypes.func,
  checkedOrders: PropTypes.any,
  showDelivery: PropTypes.func,
  showUpdateCOD: PropTypes.func,
  searchResult: PropTypes.any,
};

const filterDefaultProps = {
  pagination: null,
  tab: null,
  orders: null,
  hideOrder: () => { },
  checkedOrders: {},
  showDelivery: () => { },
  showUpdateCOD: () => { },
  searchResult: {},
};

export class Filter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside.bind(this), true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside.bind(this), true);
  }

  toggleMenu() {
    this.setState({ showMenu: !this.state.showMenu });
  }

  handleClickOutside(event) {
    try {
      const domNode = ReactDOM.findDOMNode(this);
      if ((!domNode || !domNode.contains(event.target))) {
        this.setState({
          showMenu: false,
        });
      }
    } catch (e) {
      return false;
    }
    return null;
  }

  showDelivery() {
    this.props.hideOrder();
    let checkedInvalidStatus = false;
    const validStatus = config.deliverableOrderStatus;
    this.props.checkedOrders.some((order) => {
      if (!_.includes(validStatus, order.OrderStatus.OrderStatusID)) {
        checkedInvalidStatus = true;
      }
    });
    if (checkedInvalidStatus) {
      alert('You have checked one or more order with invalid status');
      return;
    }
    this.props.showDelivery();
  }

  showUpdateCOD() {
    this.props.hideOrder();
    let checkedInvalidStatus = false;
    const validStatus = config.updatableCOD;
    this.props.checkedOrders.some((order) => {
      if (!_.includes(validStatus, order.OrderStatus.OrderStatusID)) {
        checkedInvalidStatus = true;
      }
      if (!order.IsCOD) {
        checkedInvalidStatus = true;
      }
    });
    if (checkedInvalidStatus) {
      alert('You have checked one or more order with invalid status or non-COD');
      return;
    }
    this.props.showUpdateCOD();
  }

  render() {
    const { PaginationAction, paginationState } = this.props.pagination;
    const { tab, orders, searchResult } = this.props;

    const checked = _.some(orders[tab], ['IsChecked', true]);

    return (
      <div>
        <SortFilter tab={tab} />
        <OrderTypeFilter tab={tab} />
        <Datepicker tab={tab} />

        {searchResult[tab] &&
          <span className={styles.searchResult}>
            {searchResult[tab]} order found from search result.
          </span>
        }

        {(tab === 'succeed' || tab === 'pending') &&
          <div className={mainStyles.menuActionContainer}>
            <button
              disabled={!checked}
              className={mainStyles.buttonAction}
              onClick={() => this.toggleMenu()}
            >
              <div className={mainStyles.spanAction}>Action</div>
              <img
                alt="icon"
                src={this.state.showMenu ? '/img/icon-collapse.png' : '/img/icon-dropdown-2.png'}
                className={mainStyles.iconAction}
              />
            </button>
            {this.state.showMenu &&
              <ul className={mainStyles.actionContainer}>
                <li
                  role="none"
                  onClick={() => this.showDelivery()}
                >
                  Mark Delivered
                </li>
                {envConfig.features.updateCODVendor &&
                  <li
                    role="none"
                    onClick={() => this.showUpdateCOD()}
                  >
                    Update COD
                </li>
                }
              </ul>
            }
          </div>
        }

        {searchResult[tab] &&
          <span className={styles.searchResult}>
            {searchResult[tab]} order found from search result.
          </span>
        }

        <Pagination2 {...paginationState} {...PaginationAction} tab={this.props.tab} style={{ marginTop: '5px' }} />

        <div className={styles.row}>
          <CheckboxHeader tab={tab} />
          <EDSFilter tab={tab} />
          <NameFilter tab={tab} />
          <StatusFilter tab={tab} />
          <CODFilter tab={tab} />
          <FleetFilter tab={tab} />
        </div>
      </div>
    );
  }
}

Filter.propTypes = filterPropTypes;
Filter.defaultProps = filterDefaultProps;

function FilterDispatchBuilder() {
  return (dispatch) => {
    const modalFunc = {
      ShowDeliveryModal: () => {
        dispatch(orderMonitoringService.ShowDeliveryModal());
      },
      HideDeliveryModal: () => {
        dispatch(orderMonitoringService.HideDeliveryModal());
      },
    };
    return modalFunc;
  };
}

connect(undefined, FilterDispatchBuilder)(Filter);

const tablePropsType = {
  orders: PropTypes.any,
  tab: PropTypes.any,
  expandedOrder: PropTypes.any,
  FetchDetails: PropTypes.func,
  HideOrder: PropTypes.func,
  ExpandOrder: PropTypes.func,
};

const tableDefaultProps = {
  orders: null,
  tab: null,
  expandedOrder: {},
  FetchDetails: () => { },
  HideOrder: () => { },
  ExpandOrder: () => { },
};

class OrderTable extends PureComponent {
  expand(order, tab) {
    this.props.HideOrder();
    setTimeout(() => {
      this.props.ExpandOrder(order, tab);
    }, 1);
  }

  render() {
    const { orders, tab } = this.props;
    return (
      <table className={styles.table}>
        <tbody>
          {orders[tab].map((order, idx) => (
            <OrderRow
              key={idx}
              order={order}
              expandOrder={(tab === 'pending') && (() => this.expand(order, tab))}
              expandedOrder={this.props.expandedOrder}
              getDetail={this.props.FetchDetails}
              tab={tab}
            />
          ))}
        </tbody>
      </table>
    );
  }
}

function OrderTableStoreBuilder() {
  return (store) => {
    const { orders, expandedOrder } = store.app.orderMonitoring;

    return { orders, expandedOrder };
  };
}

function OrderTableDispatchBuilder() {
  return (dispatch) => {
    const orderFunc = {
      ExpandOrder: (order, tab) => {
        dispatch(orderMonitoringService.ExpandOrder(order, tab));
      },
      HideOrder: () => {
        dispatch(orderMonitoringService.HideOrder());
      },
      FetchList: (tab) => {
        dispatch(orderMonitoringService.FetchList(tab));
      },
      FetchDetails: (orderID) => {
        dispatch(orderMonitoringService.FetchDetails(orderID));
      },
    };

    return orderFunc;
  };
}


OrderTable.propTypes = tablePropsType;
OrderTable.defaultProps = tableDefaultProps;

export default connect(OrderTableStoreBuilder, OrderTableDispatchBuilder)(OrderTable);
