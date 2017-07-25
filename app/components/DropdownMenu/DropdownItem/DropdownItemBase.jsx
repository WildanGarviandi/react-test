import React, { PureComponent } from 'react';

import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './styles.scss';

class DropdownItemBase extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
    };

    this.toggleHover = this.toggleHover.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect() {
    this.props.handleSelect(this.props.data);
  }

  toggleHover() {
    this.setState({
      isHovered: !this.state.isHovered,
    });
  }

  render() {
    const { data, iconStyles } = this.props;

    const dropdownItemStyles = classNames(styles.dropdownitem,
      this.props.dropdownItemStyles);

    return (
      <div
        role="none"
        className={dropdownItemStyles}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
        onClick={this.handleSelect}
      >
        <div className={styles.dropdownitem__icon}>
          <div className={iconStyles} />
          <div className={styles.dropdownitem__content}>
            <div className={styles['dropdownitem__content-hub']}>
              {data.name}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/* eslint-disable */
DropdownItemBase.propTypes = {
  data: PropTypes.any,
  handleSelect: PropTypes.func.isRequired,
  iconStyles: PropTypes.any,
  dropdownItemStyles: PropTypes.any,
};
/* eslint-enable */

DropdownItemBase.defaultProps = {
  data: {},
  iconStyles: {},
  dropdownItemStyles: {},
};

export default DropdownItemBase;
