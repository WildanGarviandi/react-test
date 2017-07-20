import React, { PureComponent } from 'react';
import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';

import PropTypes from 'prop-types';

import styles from './styles.scss';
import DropdownList from './DropdownMenu';

class ProfileMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      data: [{
        id: 1,
        name: 'Hub Manggarai',
        selected: true,
      }, {
        id: 2,
        name: 'Hub Tebet',
      }, {
        id: 3,
        name: 'Hub Cawang',
      }, {
        id: 4,
        name: 'Hub Depok',
      }],
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
          />
        )}
      </span>
    );
  }
}

/* eslint-disable */
ProfileMenu.propTypes = {
  userLogged: PropTypes.any,
};
/* eslint-enable */

ProfileMenu.defaultProps = {
  userLogged: {},
};

export default onClickOutside(ProfileMenu);
