import React, { PureComponent } from 'react';

import configValues from '../config/configValues.json';
import styles from './styles.scss';
import DropdownList from '../components/DropdownMenu';

class ChooseHub extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [{
        id: 1,
        name: 'Central Hub Jakarta Barat',
      }, {
        id: 2,
        name: 'Local Hub Jakarta Selatan',
      }, {
        id: 3,
        name: 'Local Hub Jakarta Timur',
      }, {
        id: 4,
        name: 'Local Hub Jakarta Pusat',
      }, {
        id: 5,
        name: 'Local Hub Jakarta Utara',
      }],
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(selectedData) {
    console.log(selectedData);
  }

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
          <DropdownList
            data={this.state.data}
            handleSelect={this.handleSelect}
            iconStyles={styles['etobee-logo']}
            dropdownStyles={styles['dropdown-list']}
            dropdownItemStyles={styles['dropdown-hub']}
          />
        </div>
      </div>
    );
  }
}

export default ChooseHub;
