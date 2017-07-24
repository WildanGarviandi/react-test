import React, { PureComponent } from 'react';

import configValues from '../config/configValues.json';
import styles from './styles.scss';

class ChooseHub extends PureComponent {
  render() {
    return (
      <div className={styles.page}>
        <div className={styles.choose}>
          <div className={styles.choose__header}>
            <div className={styles['header-top']}>
              <div className={styles['header-top__img']}>
                <img
                  src={configValues.IMAGES.LOGO}
                  alt="etobee logo"
                />
              </div>
              <div className={styles['header-top__title']}>
                <span>etobee</span>
              </div>
            </div>
            <div className={styles['choose__header-hub']}>
              <span>Choose a hub</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChooseHub;
