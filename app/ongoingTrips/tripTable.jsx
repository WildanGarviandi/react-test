import React, { Component } from 'react';
import { connect } from 'react-redux';
import NumberFormat from 'react-number-format';
import Countdown from 'react-cntdwn';

import moment from 'moment';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

import * as Table from '../components/table';
import styles from './table.scss';
import * as TripService from './tripService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import { CheckboxHeader2 as CheckboxHeaderBase, CheckboxCell } from '../views/base/tableCell';
import { FilterTop } from '../components/form';
import stylesButton from '../components/button.scss';
import { ButtonWithLoading } from '../components/button';
import config from '../config/configValues.json';
import * as Helper from '../helper/utility';

function StoreBuilder(keyword) {
  return (store) => {
    const { filters } = store.app.myOngoingTrips;

    return {
      value: filters[keyword],
    };
  };
}

function DispatchBuilder(keyword) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = { [keyword]: e.target.value };
      dispatch(TripService.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if (e.keyCode !== config.KEY_ACTION.ENTER) {
        return;
      }

      dispatch(TripService.StoreSetter('currentPage', 1));
      dispatch(TripService.FetchList());
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
    };
  };
}

function DropdownStoreBuilder(name) {
  return (store) => {
    const sortOptions = [{
      key: 1, value: 'Deadline (newest)',
    }, {
      key: 2, value: 'Deadline (oldest)',
    }];

    const options = {
      statusName: OrderStatusSelector.GetList(store),
      sortOptions,
    };

    return {
      value: store.app.myOngoingTrips[name],
      options: options[name],
    };
  };
}

function DropdownDispatchBuilder(filterKeyword) {
  return (dispatch) => {
    const dispatchFunc = {
      handleSelect: (selectedOption) => {
        const SetFn = TripService.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      },
    };

    return dispatchFunc;
  };
}

function CheckboxDispatch(dispatch, props) {
  return {
    onToggle: () => {
      dispatch(TripService.ToggleChecked(props.tripID));
    },
  };
}

function CheckboxHeaderStore(store) {
  return {
    isChecked: store.app.myOngoingTrips.selectedAll,
  };
}

function CheckboxHeaderDispatch(dispatch) {
  return {
    onToggle: () => {
      dispatch(TripService.ToggleCheckedAll());
    },
  };
}

function DateRangeBuilder(keyword) {
  return (store) => {
    const { filters } = store.app.myOngoingTrips;
    return {
      startDate: filters[`start${keyword}`],
      endDate: filters[`end${keyword}`],
    };
  };
}

function DateRangeDispatch(keyword) {
  return (dispatch) => {
    const dispatchFunc = {
      onChange: (event, picker) => {
        const newFilters = {
          [`start${keyword}`]: picker.startDate.toISOString(),
          [`end${keyword}`]: picker.endDate.toISOString(),
        };
        dispatch(TripService.UpdateAndFetch(newFilters));
      },
    };

    return dispatchFunc;
  };
}

function ConnectBuilder(keyword) {
  return connect(StoreBuilder(keyword), DispatchBuilder(keyword));
}

function ConnectDropdownBuilder(keyword) {
  return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(CheckboxHeaderBase);
const CheckboxRow = connect(undefined, CheckboxDispatch)(CheckboxCell);
const ContainerNumberFilter = ConnectBuilder('containerNumber')(Table.InputCell);
const StatusFilter = ConnectDropdownBuilder('statusName')(FilterTop);
const SortFilter = ConnectDropdownBuilder('sortOptions')(FilterTop);
const MerchantFilter = ConnectBuilder('merchant')(Table.InputCell);
const PickupFilter = ConnectBuilder('pickup')(Table.InputCell);
const DropoffFilter = ConnectBuilder('dropoff')(Table.InputCell);
const DriverFilter = ConnectBuilder('driver')(Table.InputCell);
const PickupDateFilter = connect(DateRangeBuilder('Pickup'), DateRangeDispatch('Pickup'))(Table.FilterDateTimeRangeCell);
const OrderFilter = ConnectBuilder('order')(Table.InputCell);

export const Filter = React.createClass({
  render() {
    const reassignTripButton = {
      textBase: 'Reassign Trips',
      onClick: this.props.expandDriver,
      styles: {
        base: stylesButton.greenButton3,
      },
    };
    return (
      <div>
        <CheckboxHeader />
        <SortFilter />
        {
          <div className={styles.reassignBulkButton}>
            <ButtonWithLoading {...reassignTripButton} />
          </div>
        }
      </div>
    );
  },
});

function TripHeader() {
  return (
    <tr>
      <CheckboxHeader />
      <Table.TextHeader text="Trip Number" />
      <Table.TextHeader text="Status" />
      <Table.TextHeader text="Webstore" />
      <Table.TextHeader text="Pickup" />
      <Table.TextHeader text="Dropoff" />
      <Table.TextHeader text="Pickup Time" />
      <Table.TextHeader text="Driver" />
      <Table.TextHeader text="Number of Orders" style={{ whiteSpace: 'nowrap' }} />
    </tr>
  );
}

function GetWeightTrip(orders) {
  return `${_.sumBy(orders, 'PackageWeight')}`;
}

function TripParser(trip) {
  function getFullName(user) {
    if (!user) {
      return '';
    }

    return `${user.FirstName} ${user.LastName}`;
  }

  function getMerchantName(route) {
    return route && route.UserOrder && route.UserOrder.User && getFullName(route.UserOrder.User);
  }

  function getDriverName(tripParam) {
    return tripParam.Driver && getFullName(tripParam.Driver);
  }

  function getDropoffCity(route) {
    return route && route.UserOrder && route.UserOrder.DropoffAddress
      && route.UserOrder.DropoffAddress.District
      && route.UserOrder.DropoffAddress.District.DistrictMaster
      && route.UserOrder.DropoffAddress.District.DistrictMaster.Name;
  }

  const merchantNames = _
    .chain(trip.UserOrderRoutes)
    .map(route => (getMerchantName(route)))
    .uniq()
    .value();

  const merchantNamesAll = _
    .chain(trip.UserOrderRoutes)
    .map(route => (getMerchantName(route)))
    .uniq()
    .value()
    .join(', ');

  const uniqueDropoffNames = _
    .chain(trip.UserOrderRoutes)
    .map(route => (getDropoffCity(route)))
    .compact()
    .uniq()
    .value();

  const uniqueDropoffNamesAll = _
    .chain(trip.UserOrderRoutes)
    .map(route => (getDropoffCity(route)))
    .compact()
    .uniq()
    .value()
    .join(', ');

  function getMerchantDetails(merchantNamesParam) {
    if (merchantNamesParam.length === 0 || merchantNamesParam.length === 1) {
      return '';
    } else if (merchantNamesParam.length === 2) {
      return ' +1 other';
    }

    return ` +${merchantNamesParam.length - 1} others`;
  }

  function getDropoffDetails(dropoffNames) {
    if (dropoffNames.length === 0 || dropoffNames.length === 1) {
      return '';
    } else if (dropoffNames.length === 2) {
      return ' +1 other';
    }

    return ` +${dropoffNames.length - 1} others`;
  }

  const routes = _.map(trip.UserOrderRoutes, (route) => {
    const resultRoute = route;
    return resultRoute;
  });

  const orders = _.map(trip.UserOrderRoutes, (route) => {
    const userOrder = route.UserOrder;
    return userOrder;
  });

  const Weight = GetWeightTrip(orders);

  const CODOrders = _.filter(orders, order => order.IsCOD === true);

  return _.assign({}, trip, {
    TripDriver: getDriverName(trip),
    TripMerchant: merchantNames,
    TripMerchantsAll: merchantNamesAll,
    TripMerchantDetails: getMerchantDetails(merchantNames),
    TripDropoff: uniqueDropoffNames,
    TripDropoffAll: uniqueDropoffNamesAll,
    TripDropoffDetails: getDropoffDetails(uniqueDropoffNames),
    IsChecked: ('IsChecked' in trip) ? trip.IsChecked : false,
    Weight: parseFloat(Weight).toFixed(2),
    TotalValue: _.reduce(orders, (total, order) => {
      const totalValue = total + order.TotalValue;
      return totalValue;
    }, 0),
    CODOrders: CODOrders.length,
    CODTotalValue: _.reduce(CODOrders, (total, order) => {
      const codTotalValue = total + order.TotalValue;
      return codTotalValue;
    }, 0),
  });
}

function TripFilter() {
  return (
    <tr className={styles.tr}>
      <Table.EmptyCell />
      <ContainerNumberFilter />
      <StatusFilter />
      <MerchantFilter />
      <PickupFilter />
      <DropoffFilter />
      <PickupDateFilter />
      <DriverFilter />
      <OrderFilter />
    </tr>
  );
}

export function Deadline({ deadline }) {
  const format = {
    hour: 'hh',
    minute: 'mm',
    second: 'ss',
  };
  const Duration = moment.duration(moment(deadline).diff(moment(new Date())));

  if (!deadline) {
    return <span style={{ color: 'black' }}>-</span>;
  } else if (Duration._milliseconds > config.deadline.day) {
    return <span style={{ color: 'black' }}>{Duration.humanize()} remaining</span>;
  } else if (Duration._milliseconds < 0) {
    return <span style={{ color: 'red' }}>Passed</span>;
  }

  const normalDeadline = (Duration._milliseconds > config.deadline['3hours']) && (Duration._milliseconds < config.deadline.day);
  return (
    <span style={{ color: normalDeadline ? 'black' : 'red' }}>
      <Countdown
        targetDate={new Date(deadline)}
        startDelay={500}
        interval={1000}
        format={format}
        timeSeparator={':'}
        leadingZero
      />
    </span>
  );
}

/* eslint-disable */
Deadline.propTypes = {
  deadline: PropTypes.any.isRequired,
};
/* eslint-enable */

const TripRow = React.createClass({
  getInitialState() {
    return ({ isHover: false, isEdit: false });
  },
  expandTrip(trip) {
    this.props.shrink();
    setTimeout(() => {
      if (!this.props.expandedTrip.TripID) {
        this.props.expand(trip);
      } else {
        if (this.props.expandedTrip.TripID !== trip.TripID) {
          this.props.expand(trip);
        }
        this.props.shrink();
      }
    }, 100);
  },
  onMouseOver() {
    this.setState({ isHover: true });
  },
  onMouseOut() {
    this.setState({ isHover: false });
  },
  render() {
    const { trip, expandedTrip } = this.props;
    const parsedTrip = TripParser(trip);
    const cardValueStatus = styles[`cardValueStatus${trip.OrderStatus.OrderStatusID}`];
    let rowStyles = `${styles.tr} ${styles.card} ${this.state.isHover && styles.hovered}`;
    if (expandedTrip.TripID === trip.TripID) {
      rowStyles = `${styles.tr} ${styles.card} ${styles.select}`;
    }
    return (
      <tr
        className={rowStyles}
        onMouseEnter={this.onMouseOver}
        onMouseLeave={this.onMouseOut}
        onClick={() => this.expandTrip(trip)}
      >
        <td><CheckboxRow isChecked={trip.IsChecked} tripID={trip.TripID} /></td>
        <td><div className={styles.cardSeparator} /></td>
        <td className={styles.tripIDColumn}>{`TRIP- ${trip.TripID}`}</td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={cardValueStatus}>
            {trip.OrderStatus.OrderStatus}
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          {
            trip.Driver &&
            <div className={styles.cardValueDriver}>
              <div className={styles.vehicleIcon}>
                <img
                  className={styles.driverLoadImage}
                  alt="vehicle"
                  src={trip.Driver && trip.Driver.Vehicle && trip.Driver.Vehicle.Name === 'Motorcycle' ?
                    config.IMAGES.MOTORCYCLE : config.IMAGES.VAN}
                />
              </div>
              <div className={styles.cardLabel}>
                Driver
              </div>
              <br />
              <div className={styles.cardValue}>
                {Helper.trimString(trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`, 20)}
              </div>
            </div>
          }
          {
            !trip.Driver &&
            <div className={styles.cardValueDriver} />
          }
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Items
          </div>
          <br />
          <div className={styles.cardValue}>
            {trip.UserOrderRoutes.length}
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Weight
          </div>
          <br />
          <div className={styles.cardValue}>
            {parsedTrip.Weight} kg
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Total Value
          </div>
          <br />
          <div className={styles.cardValue}>
            <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={trip.TotalValue} />
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Deadline
          </div>
          <br />
          <div className={styles.cardValue}>
            <Deadline deadline={trip.Deadline} />
          </div>
        </td>
      </tr>
    );
  },
});

class TripBody extends Component {
  getBodyContent() {
    const { trips, expandedTrip, expand, shrink } = this.props;
    const content = [];
    trips.forEach((trip) => {
      content.push(
        <TripRow
          key={trip.TripID}
          trip={TripParser(trip)}
          expandedTrip={expandedTrip}
          expand={expand}
          shrink={shrink}
        />,
      );
    });
    return content;
  }
  render() {
    return (
      <tbody>
        {this.getBodyContent()}
      </tbody>
    );
  }
}

/* eslint-disable */
TripBody.propTypes = {
  trips: PropTypes.array,
  expandedTrip: PropTypes.any,
  expand: PropTypes.func,
  shrink: PropTypes.func,
};
/* eslint-enable */

TripBody.propTypes = {
  trips: [],
  expandedTrip: {},
  expand: () => {},
  shrink: () => {},
};

function TripBodyStore() {
  return (store) => {
    const { expandedTrip } = store.app.myOngoingTrips;
    return { expandedTrip };
  };
}

function TripBodyDispatch() {
  return (dispatch) => {
    const dispatchFunc = {
      expand: (trip) => {
        dispatch(TripService.ExpandTrip(trip));
      },
      shrink: () => {
        dispatch(TripService.ShrinkTrip());
      },
    };
    return dispatchFunc;
  };
}

const TripBodyContainer = connect(TripBodyStore, TripBodyDispatch)(TripBody);

function TripTable({ trips }) {
  return (
    <table className={styles.table}>
      <TripBodyContainer trips={trips} />
    </table>
  );
}

export default TripTable;

/* eslint-disable */
TripTable.propTypes = {
  trips: PropTypes.array,
};
/* eslint-enable */

TripTable.propTypes = {
  trips: [],
};
