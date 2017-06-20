import React from 'react'
import {CheckBox} from './input'
import styles from './tableCell.scss'

export function CheckboxHeader({isChecked, onToggle}) {
    return (
        <th onClick={onToggle}>
            {
                isChecked ?
                <img src="/img/icon-check-on.png" className={styles.checkbox} /> :
                <img src="/img/icon-check-off.png" className={styles.checkbox} />
            }
        </th>
    );
}

export function CheckboxHeader2({isChecked, onToggle}) {
    return (
        <div className={styles.checkboxHeader2} onClick={onToggle}>
            {
                isChecked ?
                'Unselect All' :
                'Select All'
            }
        </div>
    );
}

export function CheckboxHeaderPlain({isChecked, onToggle}) {
    return (
        <div className={styles.checkboxHeaderPlain} onClick={onToggle}>
            {
                isChecked ?
                'Unselect All' :
                'Select All'
            }
        </div>
    );
}

export function CheckboxCell({isChecked, onToggle}) {
    return (
        <span style={{textAlign: 'center', display: 'block'}} onClick={onToggle}>
            {
                isChecked ?
                <img src="/img/icon-check-on.png" className={styles.checkbox} /> :
                <img src="/img/icon-check-off.png" className={styles.checkbox} />
            }
        </span>
    );
}
