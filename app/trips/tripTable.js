import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as TripService from './tripService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {Glyph} from '../views/base';

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

        const options = {
            "statusName": OrderStatusSelector.GetList(store),
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
        onChange: () => {
            dispatch(TripService.ToggleChecked(props.tripID));
        }
    }
}
 
function CheckboxHeaderStore(store) {
    return {
        value: store.app.myTrips.selectedAll,
    }
}
 
function CheckboxHeaderDispatch(dispatch) {
    return {
        onChange: () => {
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

const ContainerNumberFilter = ConnectBuilder('containerNumber')(Table.InputCell);
const DriverFilter = ConnectBuilder('driver')(Table.InputCell);
const MerchantFilter = ConnectBuilder('merchant')(Table.InputCell);
const PickupFilter = ConnectBuilder('pickup')(Table.InputCell);
const DropoffFilter = ConnectBuilder('dropoff')(Table.InputCell);
const StatusFilter = ConnectDropdownBuilder('statusName')(Table.FilterDropdown);
const CreatedDateFilter = connect(DateRangeBuilder('Created'), DateRangeDispatch('Created'))(Table.FilterDateTimeRangeCell);
const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(Table.CheckBoxHeader);
const CheckboxRow = connect(undefined, CheckboxDispatch)(Table.CheckBoxCell);

function TripHeader() {
    return (
        <tr className={styles.tr}>
            <CheckboxHeader />
            <Table.TextHeader />
            <Table.TextHeader text="Container Number" />
            <Table.TextHeader text="Driver" />
            <Table.TextHeader text="Merchant" />
            <Table.TextHeader text="Pickup" />
            <Table.TextHeader text="Dropoff" />
            <Table.TextHeader text="Status" />
            <Table.TextHeader text="Created Date" />
        </tr>
    );
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

    const merchantNames = lodash
        .chain(trip.UserOrderRoutes)
        .map((route) => (getMerchantName(route)))
        .uniq()
        .value()
        .join(', ');

    return lodash.assign({}, trip, {
        TripDriver: getDriverName(trip),
        TripMerchant: merchantNames,
        IsChecked: ('IsChecked' in trip) ? trip.IsChecked : false,
    })
}

function TripFilter() {
    return (
        <tr className={styles.tr}>
            <Table.EmptyCell />
            <Table.EmptyCell />
            <ContainerNumberFilter />
            <DriverFilter />
            <MerchantFilter />
            <PickupFilter />
            <DropoffFilter />
            <StatusFilter />
            <CreatedDateFilter />
        </tr>
    )
}

function TripRow({trip}) {
    return (
        <tr className={styles.tr}>
            <CheckboxRow checked={trip.IsChecked} tripID={trip.TripID} />
            <Table.LinkCell to={'/mytrips/detail/' + trip.TripID} text={<Glyph name={'search'}/>} />
            <Table.TextCell text={trip.ContainerNumber} />
            <Table.TextCell text={trip.Driver && trip.TripDriver } />
            <Table.TextCell text={trip.TripMerchant } />
            <Table.TextCell text={trip.PickupAddress && trip.PickupAddress.Address1} />
            <Table.TextCell text={trip.DropoffAddress && trip.DropoffAddress.Address1} />
            <Table.TextCell text={trip.OrderStatus && trip.OrderStatus.OrderStatus} />
            <Table.TextCell text={moment(trip.CreatedDate).format('MM/DD/YYYY h:mm:ss A')} />
        </tr>
    );
}

function TripTable({trips}) {
  const headers = <TripHeader />;
  const body = lodash.map(trips, (trip) => {
    return <TripRow key={trip.TripID} trip={TripParser(trip)} />
  });

  return (
    <table className={styles.table}>
      <thead>{headers}</thead>
      <tbody><TripFilter /></tbody>
      <tbody>{body}</tbody>
    </table>
  );
}

export default TripTable;