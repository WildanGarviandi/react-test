import React, { PureComponent } from 'react';
import onClickOutside from 'react-onclickoutside';

import PropTypes from 'prop-types';
import * as _ from 'lodash';

import styles from '../styles.scss';
import DropdownList from '../../components/DropdownMenu';

class EllipsisMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      menus: [
        {
          id: 'EDIT',
          name: 'Edit',
          iconStyles: styles['dropdownMenu__icon--edit'],
        },
        {
          id: 'DELETE',
          name: 'Delete',
          iconStyles: styles['dropdownMenu__icon--delete'],
        },
      ],
    };

    this.showMenu = this.showMenu.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if ('isEditing' in nextProps) {
      const menus = _.cloneDeep(this.state.menus);
      menus[0].name = nextProps.isEditing ? 'Cancel' : 'Edit';
      menus[0].iconStyles = nextProps.isEditing
        ? styles['dropdownMenu__icon--close']
        : styles['dropdownMenu__icon--edit'];
      this.setState({
        menus,
      });
    }
  }

  showMenu() {
    this.setState({
      isOpen: true,
    });
  }

  handleClickOutside() {
    this.setState({
      isOpen: false,
    });
  }

  handleSelect(menu) {
    this.setState({
      isOpen: false,
    });
    this.props.handleSelect(menu);
  }

  render() {
    return (
      <span className={styles.dirverEditOuterContainer}>
        <div
          role="none"
          className={styles.driverEditButton}
          onClick={this.showMenu}
        >
          <span className={styles.ellipsisMenu} />
        </div>
        {this.state.isOpen &&
          <DropdownList
            data={this.state.menus}
            handleSelect={this.handleSelect}
            dropdownStyles={styles.dropdownMenu}
            dropdownItemStyles={styles.dropdownMenu__item}
          />}
      </span>
    );
  }
}

EllipsisMenu.propTypes = {
  handleSelect: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

EllipsisMenu.defaultProps = {
  isEditing: false,
};

export default onClickOutside(EllipsisMenu);
