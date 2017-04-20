import React from 'react';
import styles from './table.css';

const OrderRow = React.createClass({
  getInitialState() {
    return ({isHover: false, isEdit: false});
  },
  render() {
    const DEFAULT_IMAGE = "/img/default-logo.png";
    const ETOBEE_IMAGE = "/img/etobee-logo.png";

    let rowStyles = styles.tr + ' ' + styles.card  + (this.state.isHover && (' ' + styles.hovered));
    return (
      <tr className={rowStyles}>
        <td>Checkbox</td>
        <td><div className={styles.cardSeparator} /></td>
        <td><img className={styles.orderLoadImage} src={true ? ETOBEE_IMAGE : FLEET_IMAGE} onError={(e)=>{e.target.src=DEFAULT_IMAGE}} /></td>
        <td><div className={styles.cardSeparator} /></td>
        <td className={styles.orderIDColumn}>123</td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Deadline
          </div>
          <br />
          <div className={styles.cardValue}>
            14 weeks
          </div>
        </td>
      </tr>
    );
  }
});

 export default OrderRow
