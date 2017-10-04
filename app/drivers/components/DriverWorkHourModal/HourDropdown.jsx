import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

import PropTypes from 'prop-types';

import styles from './styles.scss';
import DropdownList from '../../../components/DropdownMenu';

class HourDropdown extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleClickOutside() {
    this.props.handleClickOutside();
  }

  handleSelect(date) {
    this.props.handleSelect(date, this.props.workingTime.key);
  }

  render() {
    const { workingTime, attr } = this.props;

    return (
      <DropdownList
        data={workingTime[attr]}
        handleSelect={this.handleSelect}
        dropdownStyles={styles.dropdownMenu}
        dropdownItemStyles={styles.dropdownMenu__item}
        contentStyles={styles.dropdownMenu__content}
      />
    );
  }
}

/* eslint-disable */
HourDropdown.propTypes = {
  handleClickOutside: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  workingTime: PropTypes.object.isRequired,
  attr: PropTypes.string.isRequired
};
/* eslint-enable */

export default onClickOutside(HourDropdown);
