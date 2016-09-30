import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import styles from './table.css';
import {Glyph, CheckBox} from '../views/base';
import {DropdownWithState2} from '../views/base/dropdown';
import StatusDropdown from '../views/base/statusDropdown';
import {Link} from 'react-router';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';

export function EmptyCell() {
    return <td className={styles.td}></td>;
}

export function InputCell({value, onChange, onKeyDown}) {
    return (
        <td className={styles.td}>
            <input className={styles.searchInput} type="text" value={value} onChange={onChange} onKeyDown={onKeyDown} />
        </td>
    );
}

export function FilterDateTimeCell({value, onChange}) {
    return (
        <td className={styles.td + " createdDate"}>
            <DateTime value={value} onChange={onChange} closeOnSelect={true} />
        </td>
    );
}

export function TextCell({text}) {
  return <td className={styles.td}>{text}</td>;
}

export function DateCell({date}) {
  return <TextCell text={new Date(date).toLocaleString()} />;
}

export function CheckBoxCell({checked, onChange}) {
  return <td className={styles.td}><CheckBox checked={checked} onChange={onChange} /></td>;
}

export function CheckBoxHeader({checked, onChange}) {
  return <th className={styles.th}><CheckBox checked={checked} onChange={onChange} /></th>;
}

export function FilterStatusCell({value, handleSelect}) {
    return (
        <td className={styles.td}>
            <StatusDropdown val={value} handleSelect={handleSelect} />
        </td>
    );
}

export  function FilterDropdown({value, options, handleSelect}) {
    return (
        <td className={styles.dropdownColumn}>
            <DropdownWithState2 val={value} options={options} handleSelect={handleSelect} />
        </td>
    );
}

export function TextHeader({text}) {
  return <th className={styles.th}>{text}</th>;
}

export function LinkCell({onClick, text, to}) {
  return <td><Link to={to} className={styles.link}>{text}</Link></td>;
}

export function FilterDateTimeRangeCell({startDate, endDate, onChange}) {
    const startDateFormatted = moment(startDate).format('MM-DD-YYYY');
    const endDateFormatted = moment(endDate).format('MM-DD-YYYY');
    let dateValue = startDateFormatted + ' - ' + endDateFormatted;
    if (!startDate && !endDate) {
        dateValue = '';
    }
    return (
        <td className={styles.td}>
            <DateRangePicker startDate={startDateFormatted} endDate={endDateFormatted} onApply={onChange} >
                <input className={styles.searchInput + " " + styles.createdDate} type="text" value={dateValue} />
            </DateRangePicker>
        </td>
    );
}

export function SortCriteria({onClick, glyphName}) {
    return (
        <span onClick={onClick} className={styles.glyphRight}>
            <Glyph name={glyphName} />
        </span>
    );
}
