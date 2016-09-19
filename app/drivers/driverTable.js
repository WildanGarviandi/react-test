import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as DriverService from './driverService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {Glyph} from '../views/base';
import {Link} from 'react-router';

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

const NameFilter = ConnectBuilder('name')(Table.InputCell);
const PhoneFilter = ConnectBuilder('phone')(Table.InputCell);
const EmailFilter = ConnectBuilder('email')(Table.InputCell);
const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(Table.CheckBoxHeader);
const CheckboxRow = connect(undefined, CheckboxDispatch)(Table.CheckBoxCell);

function DriverParser(driver) {

    return lodash.assign({}, driver, {
        IsChecked: ('IsChecked' in driver) ? driver.IsChecked : false,
        Name: driver.FirstName + ' ' + driver.LastName,
        Mobile: driver.CountryCode + driver.PhoneNumber
    })
}

function DriverHeader() {
    return (
        <tr className={styles.tr}>
            <CheckboxHeader />
            <Table.TextHeader />
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
            <Table.EmptyCell />
            <NameFilter />
            <PhoneFilter />
            <EmailFilter/>
        </tr>
    )
}

function DriverRow({driver}) {
    return (
        <tr className={styles.tr}>
            <CheckboxRow checked={driver.IsChecked} driverID={driver.Driver.UserID} />
            <td>
                <Link title='View Details' to={'/mydrivers/edit/' + driver.UserID} className={styles.linkMenu}>
                    {<Glyph name={'search'}/>}
                </Link>
                <Link title='View Orders' to={'/mydrivers/orders/' + driver.UserID} className={styles.linkMenu}>
                    {<Glyph name={'list-alt'}/>}
                </Link>
            </td>
            <Table.TextCell text={driver.Name} />
            <Table.TextCell text={driver.Mobile} />
            <Table.TextCell text={driver.Email} />
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