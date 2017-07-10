import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from './table.scss';
import * as TripService from './tripService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {Glyph} from '../views/base';
import {formatDate} from '../helper/time';
import {ButtonBase} from '../views/base';
import {CheckboxHeader2 as CheckboxHeaderBase, CheckboxCell} from '../views/base/tableCell';
import {FilterTop, FilterTop2, FilterText} from '../components/form';
import NumberFormat from 'react-number-format';
import stylesButton from '../components/button.scss';
import {ButtonWithLoading} from '../components/button';
import ReactTooltip from 'react-tooltip';
import config from '../config/configValues.json';
import Countdown from 'react-cntdwn';

function StoreBuilder(keyword) {
  return (store) => {
    const {filters} = store.app.myTrips;

    return {
      value: filters[keyword],
    }
  }    
}

function DispatchBuilder(keyword) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = {[keyword]: e.target.value};
      dispatch(TripService.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if(e.keyCode !== 13) {
        return;
      }

      dispatch(TripService.StoreSetter("currentPage", 1));
      dispatch(TripService.FetchList());
    }

    return {
      onChange: OnChange, 
      onKeyDown: OnKeyDown,
    }
  }
}

function DispatchDateTime(dispatch) {
  return {
    onChange: function(date) {
      dispatch(TripService.SetCreatedDate(date));
    }
  }
}

function DropdownStoreBuilder(name) {
  return (store) => {
    
    const sortOptions = [{
      key: 1, value: 'Deadline (newest)', 
    }, {
      key: 2, value: 'Deadline (oldest)',
    }];

    const options = {
      "statusName": OrderStatusSelector.GetList(store),
      "sortOptions": sortOptions
    }


    return {
      value: store.app.myTrips[name],
      options: options[name]
    }
  }
}

function DropdownDispatchBuilder(filterKeyword) {
  return (dispatch) => {
    return {
      handleSelect: (selectedOption) => {
        const SetFn = TripService.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      }
    }
  }
}

function CheckboxDispatch(dispatch, props) {
  return {
    onToggle: () => {
      dispatch(TripService.ToggleChecked(props.tripID));
    }
  }
}
 
function CheckboxHeaderStore(store) {
  return {
    isChecked: store.app.myTrips.selectedAll,
  }
}
 
function CheckboxHeaderDispatch(dispatch) {
  return {
    onToggle: () => {
      dispatch(TripService.ToggleCheckedAll());
    }
  }
}

function DateRangeBuilder(keyword) {
  return (store) => {
    const {filters} = store.app.myTrips;
    return {
      startDate: filters['start' + keyword],
      endDate: filters['end' + keyword],
    }
  }
}
 
function DateRangeDispatch(keyword) {
  return (dispatch) => {
    return {
      onChange: (event, picker) => {
        const newFilters = {
          ['start' + keyword]: picker.startDate.toISOString(),
          ['end' + keyword]: picker.endDate.toISOString()
        }
        dispatch(TripService.UpdateAndFetch(newFilters))
      }
    }
  }
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
      textBase: 'Assign Trips',
      onClick: this.props.expandDriver,
      styles: {
        base: stylesButton.greenButton3,
      }
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
  }
})

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
      <Table.TextHeader text="Number of Orders" style={{whiteSpace:'nowrap'}} />
    </tr>
  );
}

function GetWeightTrip(orders) {
  return `${lodash.sumBy(orders, 'PackageWeight')}`;
}

function TripParser(trip) {
  function getFullName(user) {
    if (!user) {
      return "";
    }

    return `${user.FirstName} ${user.LastName}`;
  }

  function getMerchantName(route) {
    return route && route.UserOrder && route.UserOrder.User && getFullName(route.UserOrder.User);
  }

  function getDriverName(trip) {
    return trip.Driver && getFullName(trip.Driver);
  }

  function getDropoffCity(route) {
    return route && route.UserOrder && route.UserOrder.DropoffAddress && route.UserOrder.DropoffAddress.District &&
      route.UserOrder.DropoffAddress.District.DistrictMaster && route.UserOrder.DropoffAddress.District.DistrictMaster.Name || false;        
  }

  const merchantNames = lodash
    .chain(trip.UserOrderRoutes)
    .map((route) => (getMerchantName(route)))
    .uniq()
    .value();

  const merchantNamesAll = lodash
    .chain(trip.UserOrderRoutes)
    .map((route) => (getMerchantName(route)))
    .uniq()
    .value()
    .join(', ');

  const uniqueDropoffNames = lodash
    .chain(trip.UserOrderRoutes)
    .map((route) => (getDropoffCity(route)))
    .compact()
    .uniq()
    .value();

  const uniqueDropoffNamesAll = lodash
    .chain(trip.UserOrderRoutes)
    .map((route) => (getDropoffCity(route)))
    .compact()
    .uniq()
    .value()
    .join(', ');

  function getMerchantDetails(merchantNames) {
    if (merchantNames.length === 0 || merchantNames.length === 1) {
      return '';
    } else if (merchantNames.length === 2) {
      return ' +1 other';
    } else {
      return ' +' + (merchantNames.length - 1) + ' others';
    }
  }

  function getDropoffDetails(dropoffNames) {
    if (dropoffNames.length === 0 || dropoffNames.length === 1) {
      return '';
    } else if (dropoffNames.length === 2) {
      return ' +1 other';
    } else {
      return ' +' + (dropoffNames.length - 1) + ' others';
    }
  }

  const routes = lodash.map(trip.UserOrderRoutes, (route) => {
    return route;
  });

  const orders = lodash.map(trip.UserOrderRoutes, (route) => {
    return route.UserOrder;
  });

  const Weight = GetWeightTrip(orders);
  
  const CODOrders = _.filter(orders, (order) => order.IsCOD === true);

  return lodash.assign({}, trip, {
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
      return total + order.TotalValue;
    }, 0),
    CODOrders: CODOrders.length,
    CODTotalValue: _.reduce(CODOrders, (total, order) => {
      return total + order.TotalValue;
    }, 0)
  })
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
  )
}

export const Deadline = React.createClass({
  render() {
    let format = {
      hour: 'hh',
      minute: 'mm',
      second: 'ss'
    };
    let Duration = moment.duration(moment(this.props.deadline).diff(moment(new Date())));
    if (!this.props.deadline) {            
      return <span style={{color: 'black'}}>
          -
      </span>
    } else if (Duration._milliseconds > config.deadline.day) {            
      return <span style={{color: 'black'}}>
          {Duration.humanize()} remaining
      </span>
    } else if (Duration._milliseconds < 0) {
      return <span style={{color: 'red'}}>
          Passed
      </span>
    } else {
      let normalDeadline = (Duration._milliseconds > config.deadline['3hours']) && (Duration._milliseconds < config.deadline.day);
      return <span style={{color: normalDeadline ? 'black' : 'red'}}>
        <Countdown targetDate={new Date(this.props.deadline)}
         startDelay={500}
         interval={1000}
         format={format}
         timeSeparator={':'}
         leadingZero={true} />
      </span>
    }
  }
});

const TripRow = React.createClass({
  getInitialState() {
    return ({isHover: false, isEdit: false});
  },
  expandTrip(trip) {
    this.props.shrink();
    setTimeout(function() {
      if (!this.props.expandedTrip.TripID) {
        this.props.expand(trip);
      } else {
        if (this.props.expandedTrip.TripID !== trip.TripID) {
          this.props.expand(trip);
        } else {
          this.props.shrink();
        }
      }
    }.bind(this), 100);
  },
  onMouseOver() {
    this.setState({isHover: true});
  },
  onMouseOut() {
    this.setState({isHover: false});
  },
  render() {
    const { trip, expandedTrip } = this.props;
    const { isEdit, isHover } = this.state;
    const parsedTrip = TripParser(trip);
    let rowStyles = styles.tr + ' ' + styles.card  + (this.state.isHover && (' ' + styles.hovered));
    if (expandedTrip.TripID === trip.TripID) {
      rowStyles = styles.tr + ' ' + styles.card +  ' ' + styles.select;
    }
    return (
      <tr className={rowStyles} 
        onMouseEnter={this.onMouseOver} onMouseLeave={this.onMouseOut}>
        <td><CheckboxRow isChecked={trip.IsChecked} tripID={trip.TripID} /></td>
        <td onClick={()=>{this.expandTrip(trip)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandTrip(trip)}} className={styles.tripIDColumn}>{`TRIP- ${trip.TripID}`}</td>
        <td onClick={()=>{this.expandTrip(trip)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandTrip(trip)}}>          
          <div className={styles.cardLabel}>
            From
          </div>
          <br />
          <div className={styles.cardValue}>
            {parsedTrip.TripMerchant[0] || 'Unknown'}
            <ReactTooltip />
            <div data-tip={parsedTrip.TripMerchantsAll} className={styles.cardValueDetails}>
              {parsedTrip.TripMerchantDetails}
            </div>
          </div>
        </td>
        <td onClick={()=>{this.expandTrip(trip)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandTrip(trip)}}>
          <div className={styles.cardLabel}>
            Destination
          </div>
          <br />
          <div className={styles.cardValue}>
            {parsedTrip.TripDropoff[0] || 'Unknown'}
            <ReactTooltip />
            <div data-tip={parsedTrip.TripDropoffAll} className={styles.cardValueDetails}>
              {parsedTrip.TripDropoffDetails}
            </div>
          </div>
        </td>
        <td onClick={()=>{this.expandTrip(trip)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandTrip(trip)}}>
          <div className={styles.cardLabel}>
            Items
          </div>
          <br />
          <div className={styles.cardValue}>
            {trip.UserOrderRoutes.length}
          </div>
        </td>
        <td onClick={()=>{this.expandTrip(trip)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandTrip(trip)}}>
          <div className={styles.cardLabel}>
            Weight
          </div>
          <br />
          <div className={styles.cardValue}>
            {parsedTrip.Weight} kg
          </div>
        </td>
        <td onClick={()=>{this.expandTrip(trip)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandTrip(trip)}}>
          <div className={styles.cardLabel}>
            Total Value
          </div>
          <br />
          <div className={styles.cardValue}>
            <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={trip.TotalValue} />
          </div>
        </td>
        <td onClick={()=>{this.expandTrip(trip)}}><div className={styles.cardSeparator} /></td>
        <td onClick={()=>{this.expandTrip(trip)}}>
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
  }
});

const TripBody = React.createClass({
  getBodyContent() {
    const { trips, expandedTrip, expand, shrink } = this.props;
    let content = [];
    trips.forEach((trip) => {
      content.push(<TripRow key={trip.TripID} trip={TripParser(trip)} expandedTrip={expandedTrip} expand={expand} shrink={shrink} />);
    });
    return content;
  },
  render() {
    return (
      <tbody>
        {this.getBodyContent()}
      </tbody>
    );
  }
});

function TripBodyStore() {
  return (store) => {
    const { expandedTrip } = store.app.myTrips;
    return {
      expandedTrip: expandedTrip
    }
  }
}

function TripBodyDispatch() {
  return (dispatch) => {
    return {
      expand: (trip) => {
        dispatch(TripService.ExpandTrip(trip));
      },
      shrink: () => {
        dispatch(TripService.ShrinkTrip());
      }
    }
  }
}

const TripBodyContainer = connect(TripBodyStore, TripBodyDispatch)(TripBody);

function TripTable({trips}) {
  const headers = <TripHeader />;

  return (
    <table className={styles.table}>
      <TripBodyContainer trips={trips} />
    </table>
  );
}

export default TripTable;