import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

import PropTypes from 'prop-types';

import styles from './styles.scss';

class Details extends Component {
  handleClickOutside() {
    this.props.setCurrentDriver(null);
  }

  render() {
    const { PictureUrl, FirstName, LastName } = this.props.driver;
    const { isAvailable, numberOfOrders } = this.props;
    return (
      <div
        className={`${styles.details__container} ${isAvailable
          ? styles['details__container--available']
          : styles['details__container--not-available']}`}
      >
        <img
          alt="driver pic"
          src={PictureUrl}
          className={styles.details__picture}
        />
        <div className={styles.details__info}>
          <p
            className={styles['details__info-name']}
          >{`${FirstName} ${LastName}`}</p>
          <p className={styles['details__info-order']}>
            Number of orders: {numberOfOrders}
          </p>
          <p
            className={
              isAvailable
                ? styles['details__info--available']
                : styles['details__info--not-available']
            }
          >
            {isAvailable ? 'Available' : 'Not available'} for delivery
          </p>
        </div>
      </div>
    );
  }
}

/* eslint-disable */
Details.propTypes = {
  driver: PropTypes.any.isRequired,
  setCurrentDriver: PropTypes.func.isRequired,
  isAvailable: PropTypes.bool.isRequired,
  numberOfOrders: PropTypes.number.isRequired,
};
/* eslint-enable */

export default onClickOutside(Details);
