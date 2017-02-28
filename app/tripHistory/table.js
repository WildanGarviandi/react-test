import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import moment from 'moment';
import {connect} from 'react-redux';
import styles from '../views/base/table.css';
import tableStyles from './table.css';
import styles2 from './styles.css';
import {Glyph} from '../views/base';
import {DropdownWithState2} from '../views/base/dropdown';
import * as TripsHistoryService from './service';
import StatusDropdown from '../views/base/statusDropdown';
import {push} from 'react-router-redux';
import * as Components from '../components/table';
import {formatDate} from '../helper/time';

function InputCell({value, onChange, onKeyDown}) {
    return (
        <input className={styles.searchInput} type="text" value={value} onChange={onChange} onKeyDown={onKeyDown} />
    );
}

function FilterDateTimeCell({value, onChange}) {
    return (
        <DateTime value={value} type="text" onChange={onChange} closeOnSelect={true} />
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
        <StatusDropdown val={value} handleSelect={handleSelect} />
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
      <DropdownWithState2 val={value} options={options} handleSelect={handleSelect} />
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
            dispatch(TripsHistoryService.SetTripType(tripType));
        }
    }
}

const FilterTripTypeWithState = connect(StoreToFilterTripType, DispatchToFilterTripType)(FilterTripType);

function TextHeader({text}) {
  return <th>{text}</th>;
}

function HubCell({currentHubID, district, hub, hubType, merchants}) {
    const markerType = hubType === "origin" ? "export" : "import"

    return (
        <td className={styles.td + ' ' + tableStyles.withIcon}>
            {
                hub && 
                <span>
                {
                    hub.HubID === currentHubID &&
                    <Glyph className={styles.currentHubMarker + ' ' + (hubType === 'origin' ? tableStyles.iconOrigin : tableStyles.iconDestination)} name={markerType} />
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

function AssignedTo(trip) {
  var className = (trip.Driver && trip.Driver.Vehicle && trip.Driver.Vehicle.VehicleID === 1) ? tableStyles.iconVehicleMotor : tableStyles.iconVehicleMiniVan;
  return {
    className: (trip.Driver) ? className : '',
    companyName: (trip.FleetManager && trip.FleetManager.CompanyDetail) ? trip.FleetManager.CompanyDetail.CompanyName : '',
    driverDetail: (trip.Driver) ? trip.Driver.FirstName + ' ' + trip.Driver.LastName + ' / ' + trip.Driver.CountryCode + ' ' + trip.Driver.PhoneNumber : '',
  };
}

function Weight(trip) {
  var result = 0;

  if (trip.UserOrderRoutes) {
    trip.UserOrderRoutes.forEach(function(val, key) {
      if (val.UserOrder && val.UserOrder.PackageWeight) {
        result += val.UserOrder.PackageWeight;
      }
    });
  };

  return result;
}

function Remarks(trip) {
  var notes = '';

  if (trip.Notes) {
    notes = trip.Notes;
    if (notes.length > 50) {
      notes = notes.substring(0, 50) + ' ...';
    };
  };

  return notes;
}

function TripHistoryRow({trip, goToDetails}) {
    const createdDate = moment(new Date(trip.CreatedDate)).format('MMM DD, YYYY. HH:mm');

    return (
        <tr className={styles.tr} onClick={goToDetails.bind(null, trip)}>
            <TextCell text={'TRIP-' + (trip.TripID) || '---'} />
            <HubCellWithState hub={trip.OriginHub} hubType="origin" />
            <HubCellWithState hub={trip.DestinationHub} district={trip.District} hubType="destination" />
            <TextCell text={trip.TripType} />
            <td className={styles.td + ' ' + AssignedTo(trip).className + ' ' + tableStyles.withIcon}><b>{AssignedTo(trip).companyName}</b><br/>{AssignedTo(trip).driverDetail}</td>
            <TextCell text={trip.OrderStatus && trip.OrderStatus.OrderStatus} />
            <TextCell text={createdDate} />
            <TextCell text={trip.UserOrderRoutes.length} />
            <TextCell text={Weight(trip) + ' Kg'} />
            <TextCell text={Remarks(trip)} />
        </tr>
    );
}

function TripHistoryRowDispatch(dispatch) {
    return {
        goToDetails: function (trip) {
            dispatch(push('/trips/' + trip.TripID));
        }
    }
}

const TripHistoryRowStateful = connect(undefined, TripHistoryRowDispatch)(TripHistoryRow);

function TripHistoryHeader() {
  return (
    <tr>
      <TextHeader text="Trip ID" />
      <TextHeader text="Origin Hub" />
      <TextHeader text="Destination Hub" />
      <TextHeader text="Type" />
      <TextHeader text="Assigned To" />
      <TextHeader text="Status" />
      <TextHeader text="Created Date" />
      <TextHeader text="Quantity" />
      <TextHeader text="Weight" />
      <TextHeader text="Remarks" />
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
                    ['start' + keyword]: picker.startDate.toISOString(),
                    ['end' + keyword]: picker.endDate.toISOString()
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
const CreatedDateDateFilter = connect(DateRangeBuilder('CreatedDate'), DateRangeDispatch('CreatedDate'))(Components.FilterDateTimeRangeCell);

function TripHistoryFilters({filters, OnChangeBuilder, OnKeyDown}) {
    function TextFiltersProps(keyword) {
        return {
            value: filters[keyword] || "",
            onChange: OnChangeBuilder(keyword),
            onKeyDown: OnKeyDown,
        }
    }

    return (
      <div className='nb'>
        <div className='row'>
          <div className={styles2.colMd1in7 + ' ' + styles2.filterDropDown}>
            <span>Trip ID</span>
            <div>
              <InputCell {...TextFiltersProps('tripID')} />
            </div>
          </div>
          <div className={styles2.colMd1in7 + ' ' + styles2.filterDropDown}>
            <span>Origin Hub</span>
            <div>
              <InputCell {...TextFiltersProps('origin')} />
            </div>
          </div>
          <div className={styles2.colMd1in7 + ' ' + styles2.filterDropDown}>
            <span>Destination Hub</span>
            <div>
              <InputCell {...TextFiltersProps('destination')} />
            </div>
          </div>
          <div className={styles2.colMd1in7 + ' ' + styles2.filterDropDown}>
            <span>Created Date</span>
            <div className={styles2.datePicker}>
              <CreatedDateDateFilter />
            </div>
          </div>
          <div className={styles2.colMd1in7 + ' ' + styles2.filterDropDown}>
            <span>Fleet</span>
            <div>
              <InputCell {...TextFiltersProps('fleet')} />
            </div>
          </div>
          <div className={styles2.colMd1in7 + ' ' + styles2.filterDropDown}>
            <span>Status</span>
            <FilterStatusCellWithState />
          </div>
          <div className={styles2.colMd1in7 + ' ' + styles2.filterDropDown}>
            <span>Trip Type</span>
            <FilterTripTypeWithState />
          </div>
        </div>
      </div>
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
    <div>
      {filters}
      <table className={styles.table}>
        <thead>{headers}</thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}

export default Table;
