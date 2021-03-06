import * as _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
import Countdown from 'react-cntdwn';
import classNaming from 'classnames';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import moment from 'moment';

import * as PickupOrders from './pickupOrdersService';
import OrdersSelector from '../modules/orders/selector';
import styles from './styles.scss';
import { ButtonWithLoading, ButtonStandard, Input, Pagination, DropdownWithState, ButtonBase } from '../views/base';
import BodyRow, { CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell, ButtonCell } from '../views/base/cells';
import { FilterTop, FilterText, FilterTopMultiple } from '../components/form';
import { Headers, Body } from '../views/base/table';
import HeadersRow from '../views/base/headers';
import { CheckBox } from '../views/base/input';
import { CheckboxHeader, CheckboxCell } from '../views/base/tableCell';
import { formatDate } from '../helper/time';
import stylesTable from '../views/base/table.scss';
import ModalActions from '../modules/modals/actions';
import config from '../config/configValues.json';
import { checkPermission } from '../helper/permission';

const conf = {
  Actions: { title: "Actions", cellType: "Actions" },
  DueTime: { title: "Deadline", cellType: "Datetime" },
  ID: { filterType: "String", title: "AWB / Web Order ID", cellType: "IDLink" },
  IsChecked: { headerType: "Checkbox", cellType: "Checkbox" },
  PickupFullAddress: { filterType: "String", title: "Pickup Address", cellType: "String" },
  PickupCity: { filterType: "String", title: "City", cellType: "String" },
  PickupZip: { filterType: "String", title: "Zip Code", cellType: "String" },
  WebstoreName: { filterType: "String", title: "Webstore Name", cellType: "String" },
  Weight: { filterType: "String", title: "Weight", cellType: "String" },
  ZipCode: { filterType: "String", title: "Zip Code", cellType: "String" },
}

const pickupOrdersColumns = ["IsChecked", "ID", "WebstoreName", "Weight", "PickupFullAddress", "PickupCity", "PickupZip", "DueTime"];

let cityList = {};
let fleetList = [];

/*
 * Get filter text from store
 *
*/
function getStoreFilterText(keyword, title) {
  return (store) => {
    const { filters } = store.app.pickupOrders;
    return {
      value: filters[keyword],
      title: title
    }
  }
}

/*
 * Dispatch filter text
 *
*/
function dispatchFilterText(keyword) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = { [keyword]: e.target.value };
      dispatch(PickupOrders.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if (e.keyCode !== 13) {
        return;
      }

      dispatch(PickupOrders.StoreSetter("currentPage", 1));
      dispatch(PickupOrders.FetchList());
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
    }
  }
}

/*
 * Connect store and dispatch for filter text
 *
*/
function connectFilterText(keyword, title) {
  return connect(getStoreFilterText(keyword, title), dispatchFilterText(keyword));
}

/*
 * Get filter dropdown from store
 *
*/
function getStoreFilterDropdown(name, title) {
  return (store) => {
    const { hubs, pickupOrders } = store.app;
    let cityOptions = [{
      key: 0, value: 'All',
    }];

    let hubOptions = [{
      key: 0,
      value: 'All',
      checked: false,
    }];

    cityOptions = cityOptions.concat(_.chain(cityList)
      .map((key, val) => ({ key, value: val }))
      .sortBy(arr => arr.key)
      .value());

    if (hubs && hubs.list) {
      let options = [];
      options = _.chain(hubs.list)
        .map(hub => ({
          key: hub.HubID,
          value: `Hub ${hub.Name}`,
          checked: false,
        }))
        .sortBy(arr => arr.key)
        .value();

      hubOptions = [...hubOptions, ...options];

      if (pickupOrders && pickupOrders.hubIDs &&
        pickupOrders.hubIDs.length > 0) {
        const ids = pickupOrders.hubIDs;
        hubOptions = hubOptions.map((hub) => {
          const data = Object.assign({}, hub, {
            checked: _.some(ids, id => id === hub.key),
          });
          return data;
        });
      }
    }

    const options = {
      city: cityOptions,
      hubs: hubOptions,
    };

    return {
      value: store.app.pickupOrders[name],
      options: options[name],
      title,
    };
  };
}

/*
 * Dispatch filter dropdown
 *
*/
function dispatchFilterDropdown(filterKeyword) {
  return (dispatch) => {
    const action = {
      handleSelect: (selectedOption) => {
        const SetFn = PickupOrders.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      },
    };
    return action;
  };
}

function dispatchFilterMultiDropdown(filterKeyword) {
  return (dispatch) => {
    const action = {
      handleSelect: (selectedOption) => {
        dispatch(selectedOption.checked ? PickupOrders.addHubFilter(selectedOption) :
          PickupOrders.deleteHubFilter(selectedOption));
        const SetFn = PickupOrders.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      },
      handleSelectAll: (options) => {
        dispatch(PickupOrders.setAllHubFilter(options));
        const SetFn = PickupOrders.SetDropDownFilter(filterKeyword);
        dispatch(SetFn());
      },
    };
    return action;
  };
}

/*
 * Connect store and dispatch for filter dropdown
 *
*/
function connectFilterDropdown(keyword, title) {
  return connect(getStoreFilterDropdown(keyword, title), dispatchFilterDropdown(keyword));
}

function connectFilterMultiDropdown(keyword, requestParam, title) {
  return connect(getStoreFilterDropdown(keyword, title), dispatchFilterMultiDropdown(requestParam));
}

const MerchantFilter = connectFilterText('merchant', 'Merchant')(FilterText);
const CityFilter = connectFilterDropdown('city', 'City')(FilterTop);
const ZipFilter = connectFilterText('zipCode', 'ZIP Code')(FilterText);
const HubFilter = connectFilterMultiDropdown('hubs', 'hubIDs', 'Hubs (can be multiple)')(FilterTopMultiple);

function ButtonPickup({ onClick, disabled, userLogged }) {
  const hasPermission = checkPermission(userLogged, 'MARK_AS_READY');
  if (hasPermission) {
    return (
      <button
        className={disabled ? styles.manualGroupButtonDisable : styles.manualGroupButton}
        disabled={disabled}
        onClick={onClick}
      >
        Mark as Ready
    </button>
    );
  }
  return null;
}

/* eslint-disable */
ButtonPickup.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  userLogged: PropTypes.object.isRequired
};
/* eslint-enable */

/*
 * Dispatch for button manual group
 *
*/
function mapDispatchToSetPickupButtonGroup(dispatch, ownParams) {
  return {
    onClick: function () {
      dispatch(PickupOrders.MarkPickup());
    }
  }
}

function stateToPickupButtonGroup(state) {
  const { userLogged } = state.app;

  return {
    userLogged,
  };
}

const SetPickupButton = connect(stateToPickupButtonGroup,
  mapDispatchToSetPickupButtonGroup)(ButtonPickup);

/*
 * Get store for checkbox header
 *
*/
function stateToCheckboxHeader(state) {
  const checkedAll = state.app.pickupOrders.checkedAll;
  return {
    isChecked: checkedAll,
  }
}

/*
 * Dispatch checkbox header
 *
*/
function mapDispatchToCheckBoxHeader(dispatch) {
  return {
    onToggle: function () {
      dispatch(PickupOrders.ToggleSelectAll());
    }
  }
}

/*
 * Get store for checkbox
 *
*/
function mapDispatchToCheckBox(dispatch, ownProps) {
  return {
    onToggle: function (val) {
      dispatch(PickupOrders.ToggleSelectOne(ownProps.item.UserOrderID));
    }
  }
}

/*
 * Dispatch for link cell
 *
*/
function mapDispatchToLink(dispatch, ownParams) {
  return {
    onClick: function () {
      dispatch(push('/orders/' + ownParams.item.UserOrderID));
    }
  }
}

/*
 * Dispatch for button cell
 *
*/
function mapDispatchToButton(dispatch, ownParams) {
  return {
    onClick: function () {
      dispatch(PickupOrders.ShowAssignModal());
    }
  }
}

const PickupOrdersCheckBoxHeader = connect(stateToCheckboxHeader, mapDispatchToCheckBoxHeader)(CheckboxHeader);
const PickupOrdersCheckBox = connect(undefined, mapDispatchToCheckBox)(CheckboxCell);
const PickupOrdersLink = connect(undefined, mapDispatchToLink)(OrderIDLinkCell);
const PickupOrdersButton = connect(undefined, mapDispatchToButton)(ButtonCell);

/*
 * Customize header component
 *
*/
function HeaderComponent(type, item) {
  switch (type) {
    case "Checkbox": {
      return <PickupOrdersCheckBox />;
    }

    default: {
      return <span>{item.header.title}</span>;
    }
  }
}

/*
 * Show headers for pickup orders table
 *
*/
function PickupOrdersHeaders() {
  const headers = Headers(conf, pickupOrdersColumns);
  return (
    <thead>
      <tr>
        <PickupOrdersCheckBoxHeader />
        <th>{'AWB'}<br />{'(Web Order ID)'}</th>
        <th>{'Merchant'}</th>
        <th>{'Weight'}</th>
        <th>{'Pick Up Address'}</th>
        <th>{'City'}</th>
        <th>{'ZIP Code'}</th>
        <th>{'Deadline'}</th>
      </tr>
    </thead>
  );
}

/*
 * Customize body component
 *
*/
function BodyComponent(type, keyword, item, index, onClick) {
  switch (type) {
    case "String": {
      return <TextCell text={item[keyword]} />
    }

    case "Checkbox": {
      return <PickupOrdersCheckBox isChecked={item[keyword]} item={item} />
    }

    case "Link": {
      return <PickupOrdersLink text={item[keyword]} item={item} to={'/orders/' + item.UserOrderID} />
    }

    case "IDLink": {
      return <PickupOrdersLink eds={item.UserOrderNumber} id={item.WebOrderID} item={item} to={'/orders/' + item.UserOrderID} />
    }

    case "Datetime": {
      switch (keyword) {
        case "PickupTime": {
          let color, back;

          return <span style={{ color: color, backgroundColor: back }}>
            <TextCell text={formatDate(item[keyword])} />
          </span>
        }
        case "DueTime": {
          let format = {
            hour: 'hh',
            minute: 'mm',
            second: 'ss'
          };
          let Duration = moment.duration(moment(item[keyword]).diff(moment(new Date())));
          if (Duration._milliseconds > config.deadline.day) {
            return <span style={{ color: 'black' }}>
              <span>
                {Duration.humanize()}
              </span>
            </span>
          } else if (Duration._milliseconds < 0) {
            return <span style={{ color: 'red' }}>
              <span>
                Passed
              </span>
            </span>
          } else {
            let normalDeadline = Duration._milliseconds > config.deadline['3hours'] && Duration._milliseconds < config.deadline.day;
            return <span style={{ color: normalDeadline ? 'black' : 'red' }}>
              <span>
                <Countdown targetDate={new Date(item[keyword])}
                  startDelay={500}
                  interval={1000}
                  format={format}
                  timeSeparator={':'}
                  leadingZero={true} />
              </span>
            </span>
          }
        }
        default: {
          return <TextCell text={formatDate(item[keyword])} />
        }
      }
    }

    case "Actions": {
      return <PickupOrdersButton value={'Assign'} />
    }

    default: {
      return null;
    }
  }
}

/*
 * Show body for pickup orders table
 *
*/
function PickupOrdersBody({ items }) {
  const body = Body(conf, pickupOrdersColumns);

  const rows = _.map(items, (item, idx) => {
    const cells = _.map(body, (column) => {
      const cell = BodyComponent(column.type, column.keyword, item, idx);

      const className = stylesTable.td + ' ' + stylesTable[column.keyword];

      return <td key={column.keyword} className={className}>{cell}</td>;
    });

    return <tr key={idx} className={stylesTable.tr + ' ' + styles.noPointer}>{cells}</tr>
  });

  return (
    <tbody>
      {rows}
    </tbody>
  );
}

/*
 * Filter component
 *
*/
export const Filter = React.createClass({
  render() {
    const { isFetching } = this.props;
    const style = isFetching ? { opacity: 0.5 } : {};
    return (
      <div className={styles.filterTop}>
        <MerchantFilter />
        <CityFilter />
        <ZipFilter />
        {this.props.userLogged.roleName === config.role.SUPERHUB && <HubFilter />}
        <SetPickupButton disabled={!this.props.isSetPickupActive} />
      </div>
    );
  }
})

/*
 * Main table component
 *
*/
const Table = React.createClass({
  componentWillUnmount() {
    this.props.resetFilter();
  },
  getInitialState() {
    return ({
      showVendor: true,
      showDriver: false
    });
  },
  activateReady() {
    this.setState({ showVendor: true });
    this.setState({ showDriver: false });
  },
  activateNotReady() {
    this.setState({ showVendor: false });
    this.setState({ showDriver: true });
  },
  closeModal() {
    this.props.CloseModal();
  },
  render() {
    const { Headers, Body, PaginationActions, isFetching, isFill, isPickup, items, pagination } = this.props;
    const style = isFetching ? { opacity: 0.5 } : {};

    let bodyComponents = (
      <tbody className={styles.noOrder}>
        <tr>
          <td colSpan={8}>
            <div style={{ fontSize: 20, textAlign: 'center' }}>
              Fetching data...
          </div>
          </td>
        </tr>
      </tbody>
    );

    if (!isFetching) {
      if (items.length === 0) {
        if (!_.isEmpty(this.props.filters)) {
          bodyComponents = (
            <tbody className={styles.noOrder}>
              <tr>
                <td colSpan={pickupOrdersColumns.length}>
                  <div className={styles.noOrderDesc}>
                    <img src="/img/image-ok.png" />
                    <div style={{ fontSize: 20 }}>
                      Orders not found
                    </div>
                    <div style={{ fontSize: 12, marginTop: 20 }}>
                      Please choose another filter to get the orders.
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          );
        } else {
          bodyComponents = (
            <tbody className={styles.noOrder}>
              <tr>
                <td colSpan={pickupOrdersColumns.length}>
                  <div className={styles.noOrderDesc}>
                    <img src="/img/image-ok.png" />
                    <div style={{ fontSize: 20 }}>
                      All of the orders are ready to be picked!
                    </div>
                    <div style={{ fontSize: 12, marginTop: 20 }}>
                      Please open the “Ready to be picked” section to assign all of those orders to your drivers / vendor partners.
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          );
        }
      } else {
        bodyComponents = (
          <Body items={items} />
        );
      }
    }

    return (
      <div style={style}>
        <div className={styles.mainTable}>
          <table className={styles.table}>
            <Headers />
            {bodyComponents}
          </table>
          <Pagination {...pagination} {...PaginationActions} />
        </div>
      </div>
    );
  }
});

/*
 * Get store for pickup orders table
 *
*/
function mapStateToPickupOrders(state, ownProps) {
  const { pickupOrders } = state.app;
  const { currentPage, isFetching, isGrouping, limit, orders, total, isMarkingPickup,
    showModal, filters } = pickupOrders;
  const { cities } = state.app.cityList;
  const { fleets } = state.app.nearbyFleets;
  cities.forEach(function (city) {
    cityList[city.Name] = city.CityID;
  });
  fleetList = fleets;

  return {
    Headers: PickupOrdersHeaders,
    Body: PickupOrdersBody,
    isFetching,
    isGrouping,
    isMarkingPickup,
    items: orders,
    pagination: {
      currentPage, limit, total,
    },
    isPickup: true,
    isFill: ownProps.isFill,
    showModal,
    fleets,
    filters,
  };
}

/*
 * Dispatch pickup orders table
 *
*/
function mapDispatchToPickupOrders(dispatch, ownProps) {
  return {
    GetList: () => {
      if (ownProps.isFill) {
        dispatch(PickupOrders.FetchNotAssignedList());
      } else {
        dispatch(PickupOrders.FetchList());
      }
    },
    PaginationActions: {
      setCurrentPage: (currentPage) => {
        dispatch(PickupOrders.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(PickupOrders.SetLimit(limit));
      },
    },
    CloseModal() {
      dispatch(PickupOrders.HideAssignModal());
    },
    resetFilter() {
      dispatch(PickupOrders.ResetFilter());
    },
  };
}

export default connect(mapStateToPickupOrders, mapDispatchToPickupOrders)(Table);
