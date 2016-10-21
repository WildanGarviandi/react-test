import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import styles from './table.css';
import {Glyph} from '../views/base';
import {DropdownWithState2} from '../views/base/dropdown';
import * as TripsHistoryService from './service';
import StatusDropdown from '../views/base/statusDropdown';
import {push} from 'react-router-redux';
import * as Components from '../components/table';
import {formatDate} from '../helper/time';

function InputCell({value, onChange, onKeyDown}) {
    return (
        <td className={styles.td}>
            <input className={styles.searchInput} type="text" value={value} onChange={onChange} onKeyDown={onKeyDown} />
        </td>
    );
}

function FilterDateTimeCell({value, onChange}) {
    return (
        <td className={styles.td + " createdDate"}>
            <DateTime value={value} onChange={onChange} closeOnSelect={true} />
        </td>
    );
}

function StoreToFilterDateTime(store) {
    const {filters} = store.app.tripsHistory;

    return {
        value: filters.CreatedDate,
    }
}

function DispatchToFilterDateTime(dispatch) {
    return {
        onChange: (date) => {
            dispatch(TripsHistoryService.SetCreatedDate(date));
        }
    }
}

const FilterDateTimeCellWithState = connect(StoreToFilterDateTime, DispatchToFilterDateTime)(FilterDateTimeCell);

function TextCell({text}) {
  return <td className={styles.td}>{text}</td>;
}

function DateCell({date}) {
  return <TextCell text={new Date(date).toLocaleString()} />;
}

function CheckBoxCell({checked, toggleChecked}) {
  return <td className={styles.td}><CheckBox checked={checked} onChange={toggleChecked} /></td>;
}

function FilterStatusCell({value, handleSelect}) {
    return (
        <td className={styles.td} style={{width: 100}}>
            <StatusDropdown val={value} handleSelect={handleSelect} />
        </td>
    );
}

function StoreToFiltersStatus(store) {
    const {statusName} = store.app.tripsHistory;

    return {
        value: statusName,
    }
}

function DispatchToFiltersStatus(dispatch) {
    return {
        handleSelect: (status) => {
            dispatch(TripsHistoryService.SetStatus(status));
        }
    }
}

const FilterStatusCellWithState = connect(StoreToFiltersStatus, DispatchToFiltersStatus)(FilterStatusCell);

function FilterTripType({value, options, handleSelect}) {
    return (
        <td className={styles.td} style={{width: 100}}>
            <DropdownWithState2 val={value} options={options} handleSelect={handleSelect} />
        </td>
    );
}

function StoreToFilterTripType(store) {
    const {tripType} = store.app.tripsHistory;
    const options = [{
        key: 0, value: "SHOW ALL",
    },{
        key: 1, value: "FIRST LEG",
    }, {
        key: 2, value: "INTER HUB",
    }, {
        key: 3, value: "LAST LEG",
    }];

    return {
        options,
        value: tripType,
    }
}

function DispatchToFilterTripType(dispatch) {
    return {
        handleSelect: (tripType) => {
            console.log('t', tripType);
            dispatch(TripsHistoryService.SetTripType(tripType));
        }
    }
}

const FilterTripTypeWithState = connect(StoreToFilterTripType, DispatchToFilterTripType)(FilterTripType);

function TextHeader({text}) {
  return <th className={styles.th}>{text}</th>;
}

function HubCell({currentHubID, district, hub, hubType, merchants}) {
    const markerType = hubType === "origin" ? "export" : "import"

    return (
        <td className={styles.td}>
            {
                hub && 
                <span>
                {
                    hub.HubID === currentHubID &&
                    <Glyph className={styles.currentHubMarker} name={markerType} />
                }
                {
                    `${hub.Name}`
                }
                </span>
            }
            {!hub && '---'}
        </td>
    );
}

function HubCellState(store) {
    const {userLogged} = store.app;
    const {hubID} = userLogged;

    return {
        currentHubID: hubID,
    }
}

const HubCellWithState = connect(HubCellState)(HubCell);

function TripHistoryRow({trip, goToDetails}) {
    return (
        <tr className={styles.tr} onClick={goToDetails.bind(null, trip)}>
            <HubCellWithState hub={trip.OriginHub} hubType="origin" />
            <HubCellWithState hub={trip.DestinationHub} district={trip.District} hubType="destination" />
            <TextCell text={(trip.District && trip.District.Name) || '---'} />
            <TextCell text={trip.PickupTime && formatDate(trip.PickupTime)} />
            <TextCell text={trip.DropoffTime && formatDate(trip.DropoffTime)} />
            <TextCell text={trip.FleetName || '---'} />
            <TextCell text={trip.DriverName || '---'} />
            <TextCell text={trip.OrderStatus && trip.OrderStatus.OrderStatus} />
            <TextCell text={trip.TripType} />
            <TextCell text={trip.UserOrderRoutes.length} />
            <TextCell text={trip.LogisticFee} />
        </tr>
    );
}

function TripHistoryRowDispatch(dispatch) {
    return {
        goToDetails: function (trip) {
            dispatch(push('/history/' + trip.TripID));
        }
    }
}

const TripHistoryRowStateful = connect(undefined, TripHistoryRowDispatch)(TripHistoryRow);

function TripHistoryHeader() {
  return (
    <tr className={styles.tr}>
      <TextHeader text="Origin Hub" />
      <TextHeader text="Destination Hub" />
      <TextHeader text="Destination District" />
      <TextHeader text="Pickup Time" />
      <TextHeader text="Dropoff Time" />
      <TextHeader text="Fleet" />
      <TextHeader text="Driver" />
      <TextHeader text="Status" />
      <TextHeader text="Trip Type" />
      <TextHeader text="Total Packages" />
      <TextHeader text="Fee" />
    </tr>
  );
}


function DateRangeBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.tripsHistory;
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
                    ['start' + keyword]: picker.startDate.format('YYYY MM DD'),
                    ['end' + keyword]: picker.endDate.format('YYYY MM DD')
                }
                dispatch(TripsHistoryService.UpdateAndFetch(newFilters))
            },
            onInputKeyDown: (event) => {
                const deleteCode = [8, 46, 32];
                if(deleteCode.indexOf(event.keyCode) > -1) {
                    dispatch(TripsHistoryService.UnsetFilters(['start' + keyword, 'end' + keyword]));
                    dispatch(TripsHistoryService.FetchList());
                }
            }
        }
    }
}

const PickupDateFilter = connect(DateRangeBuilder('Pickup'), DateRangeDispatch('Pickup'))(Components.FilterDateTimeRangeCell);
const DropoffDateFilter = connect(DateRangeBuilder('Dropoff'), DateRangeDispatch('Dropoff'))(Components.FilterDateTimeRangeCell);

function TripHistoryFilters({filters, OnChangeBuilder, OnKeyDown}) {
    function TextFiltersProps(keyword) {
        return {
            value: filters[keyword] || "",
            onChange: OnChangeBuilder(keyword),
            onKeyDown: OnKeyDown,
        }
    }

    return (
        <tr>
            <InputCell {...TextFiltersProps('origin')} />
            <InputCell {...TextFiltersProps('destination')} />
            <InputCell {...TextFiltersProps('district')} />
            <PickupDateFilter />
            <DropoffDateFilter />
            <InputCell {...TextFiltersProps('fleet')} />
            <InputCell {...TextFiltersProps('driver')} />
            <FilterStatusCellWithState />
            <FilterTripTypeWithState />
            <TextCell />
            <TextCell />
        </tr>
    );
}

function StoreToTripHistoryFilters(store) {
    const {filters} = store.app.tripsHistory;

    return {
        filters,
    }
}

function DispatchToTripHistoryFilters(dispatch) {
    function OnChangeBuilder(keyword) {
        return (e) => {
            const newFilters = {[keyword]: e.target.value};
            dispatch(TripsHistoryService.UpdateFilters(newFilters));
        }
    }

    function OnKeyDown(e) {
        if(e.keyCode !== 13) {
            return;
        }

        dispatch(TripsHistoryService.SetCurrentPage(1));
        dispatch(TripsHistoryService.FetchList());
    }

    return {
        OnChangeBuilder, OnKeyDown,
    }
}

const TripHistoryFiltersWithState = connect(StoreToTripHistoryFilters, DispatchToTripHistoryFilters)(TripHistoryFilters);

function Table({trips}) {
  const body = lodash.map(trips, (trip) => {
    return <TripHistoryRowStateful key={trip.TripID} trip={trip} />
  });

  const headers = <TripHistoryHeader />;
  const filters = <TripHistoryFiltersWithState />;

  return (
    <table className={styles.table}>
      <thead>{headers}</thead>
      <tbody>{filters}</tbody>
      <tbody>{body}</tbody>
    </table>
  );
}

export default Table;
