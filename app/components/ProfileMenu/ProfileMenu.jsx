import React, { PureComponent } from 'react';
import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';

import PropTypes from 'prop-types';

import styles from './styles.scss';
import configValues from '../../config/configValues.json';
import DropdownList from '../DropdownMenu';

class ProfileMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      data: this.props.hubs.map((hub) => {
        const prefix = hub.Hub.Type === configValues.HUB_TYPE.GENERAL ?
            'Local ' : '';
        const data = {
          id: hub.Hub.HubID,
          name: `${prefix}${hub.Hub.Name}`,
          selected: hub.Hub.HubID === this.props.hubID,
        };
        return data;
      }),
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  toggleMenu() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  handleClickOutside() {
    this.setState({
      isOpen: false,
    });
  }

  handleSelect(selectedData) {
    const data = this.state.data.map((partData) => {
      const newData = Object.assign({}, partData, {
        selected: partData.id === selectedData.id,
      });
      return newData;
    });

    this.setState({
      data,
    });
    this.toggleMenu();
    this.props.chooseHub(selectedData.id, true);
  }

  renderChevron() {
    return (
      <div className={styles.chevron}>
        <FontAwesome
          name={this.state.isOpen ? 'chevron-down' : 'chevron-right'}
          size="lg"
          className={styles.chevron__arrow}
        />
      </div>
    );
  }

  render() {
    const selectedData = this.state.data.find((data) => {
      const selected = data.selected;
      return selected;
    });

    return (
      <span>
        <div
          role="none"
          className={styles.profile}
          onClick={(e) => {
            e.stopPropagation();
            this.toggleMenu();
          }}
        >
          <div className={styles.switch}>
            <span className={styles.switch__label}>{selectedData.name}</span>
          </div>
          {this.renderChevron()}
        </div>
        {this.state.isOpen && (
          <DropdownList
            toggleMenu={this.toggleMenu}
            data={this.state.data}
            handleSelect={this.handleSelect}
            dropdownStyles={styles['dropdown-profile']}
            iconStyles={styles['etobee-logo']}
            contentStyles={styles['dropdown-content']}
            dropdownItemStyles={styles['dropdown-hub']}
          />
        )}
      </span>
    );
  }
}

/* eslint-disable */
ProfileMenu.propTypes = {
  hubs: PropTypes.array.isRequired,
  token: PropTypes.string.isRequired,
  hubID: PropTypes.number.isRequired,
  chooseHub: PropTypes.func.isRequired,
};
/* eslint-enable */

export default onClickOutside(ProfileMenu);
