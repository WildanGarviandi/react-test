import React from 'react'
import {CheckBox} from './input'
import styles from './tableCell.css'

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
