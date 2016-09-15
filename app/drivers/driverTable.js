import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as DriverService from './driverService';
import OrderStatusSelector from '../modules/orderStatus/selector';

function StoreBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.myDrivers;

        return {
            value: filters[keyword],
        }
    }    
}

function DispatchBuilder(keyword) {
    return (dispatch) => {
        function OnChange(e) {
            const newFilters = {[keyword]: e.target.value};
            dispatch(DriverService.UpdateFilters(newFilters));
        }

        function OnKeyDown(e) {
            if(e.keyCode !== 13) {
                return;
            }

            dispatch(DriverService.FetchList());
        }

        return {
            onChange: OnChange, 
            onKeyDown: OnKeyDown,
        }
    }
}

function DateTimeDispatch(dispatch) {
    return {
        onChange: function(date) {
            dispatch(DriverService.SetCreatedDate(date));
        }
    }
}

function DropdownStoreBuilder(name) {
    return (store) => {

        const options = {
            "statusName": OrderStatusSelector.GetList(store)
        }

        return {
            value: store.app.myDrivers[name],
            options: options[name]
        }
    }
}

function DropdownDispatchBuilder(filterKeyword) {
    return (dispatch) => {
        return {
            handleSelect: (selectedOption) => {
                const SetFn = DriverService.SetDropDownFilter(filterKeyword);
                dispatch(SetFn(selectedOption));
            }
        }
    }
}

function CheckboxDispatch(dispatch, props) {
    return {
        onChange: () => {
            dispatch(DriverService.ToggleChecked(props.driverID));
        }
    }
}

function CheckboxHeaderStore(store) {
    return {
        value: store.app.myDrivers.selectedAll,
    }
}

function CheckboxHeaderDispatch(dispatch) {
    return {
        onChange: () => {
            dispatch(DriverService.ToggleCheckedAll());
        }
    }
}

function DateRangeBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.myDrivers;
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
                    ['start' + keyword]: picker.startDate,
                    ['end' + keyword]: picker.endDate
                }
                dispatch(DriverService.UpdateAndFetch(newFilters))
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

const DriverIDFilter = ConnectBuilder('driverID')(Table.InputCell);
const NameFilter = ConnectBuilder('name')(Table.InputCell);
const PhoneFilter = ConnectBuilder('phone')(Table.InputCell);
const EmailFilter = ConnectBuilder('email')(Table.InputCell);
/*const UserOrderNumberFilter = ConnectBuilder('userOrderNumber')(Table.InputCell);
const PickupFilter = ConnectBuilder('pickup')(Table.InputCell);
const DropoffFilter = ConnectBuilder('dropoff')(Table.InputCell);
const StatusFilter = ConnectDropdownBuilder('statusName')(Table.FilterDropdown);
const OrderTypeFilter = ConnectDropdownBuilder('orderType')(Table.FilterDropdown);
const OrderOwnerFilter = ConnectDropdownBuilder('orderOwner')(Table.FilterDropdown);
const AssignmentFilter = ConnectDropdownBuilder('assignment')(Table.FilterDropdown);
const CreatedDateFilter = connect(DateRangeBuilder('Created'), DateRangeDispatch('Created'))(Table.FilterDateTimeRangeCell);*/
const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(Table.CheckBoxHeader);
const CheckboxRow = connect(undefined, CheckboxDispatch)(Table.CheckBoxCell);

function DriverParser(driver) {

    return lodash.assign({}, driver, {
        IsChecked: ('IsChecked' in driver) ? driver.IsChecked : false,
        Name: driver.Driver.FirstName + ' ' + driver.Driver.LastName,
        Mobile: driver.Driver.CountryCode + driver.Driver.PhoneNumber
    })
}

function DriverHeader() {
    return (
        <tr className={styles.tr}>
            <CheckboxHeader />
            <Table.TextHeader text="User ID" />
            <Table.TextHeader text="Name" />
            <Table.TextHeader text="Mobile" />
            <Table.TextHeader text="Email" />
        </tr>
    );
}

function DriverFilter() {
    return (
        <tr className={styles.tr}>
            <Table.EmptyCell />
            <DriverIDFilter />
            <NameFilter />
            <PhoneFilter />
            <EmailFilter />
        </tr>
    )
}

function DriverRow({driver}) {
    return (
        <tr className={styles.tr}>
            <CheckboxRow checked={driver.IsChecked} driverID={driver.Driver.UserID} />
            <Table.LinkCell to={'/mydrivers/edit/' + driver.Driver.UserID} text={driver.Driver.UserID} />
            <Table.TextCell text={driver.Name} />
            <Table.TextCell text={driver.Mobile} />
            <Table.TextCell text={driver.Driver.Email} />
        </tr>
    );
}

function DriverTable({drivers}) {
  const headers = <DriverHeader />;
  const body = lodash.map(drivers, (driver) => {
    return <DriverRow key={driver.Driver.UserID} driver={DriverParser(driver)} />
  });

  return (
    <table className={styles.table}>
      <thead>{headers}</thead>
      <tbody><DriverFilter /></tbody>
      <tbody>{body}</tbody>
    </table>
  );
}

export default DriverTable;