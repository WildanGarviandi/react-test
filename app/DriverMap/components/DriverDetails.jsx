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
    return (
      <div className={styles.details__container}>
        <img
          alt="driver pic"
          src={PictureUrl}
          className={styles.details__picture}
        />
        <div className={styles.details__info}>
          <p
            className={styles['details__info--name']}
          >{`${FirstName} ${LastName}`}</p>
          <p className={styles['details__info--order']}>Number of orders: 4</p>
          <p className={styles['details__info--availability']}>
            Available for delivery
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
};
/* eslint-enable */

export default onClickOutside(Details);
