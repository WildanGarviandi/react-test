import React, { PureComponent } from 'react';

import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './styles.scss';
import DropdownItemBase from './DropdownItem';

class DropdownList extends PureComponent {
  render() {
    const dropdownListStyles = classNames(styles['dropdown-list'],
      this.props.dropdownStyles);
    return (
      <div className={dropdownListStyles}>
        {
          this.props.data.map((data) => {
            const renderData = (
              <DropdownItemBase
                key={data.id}
                data={data}
                iconStyles={this.props.iconStyles}
                dropdownItemStyles={this.props.dropdownItemStyles}
                contentStyles={this.props.contentStyles}
                handleSelect={this.props.handleSelect}
              />
            );
            return renderData;
          })
        }
      </div>
    );
  }
}

/* eslint-disable */
DropdownList.propTypes = {
  data: PropTypes.array,
  handleSelect: PropTypes.func.isRequired,
  dropdownStyles: PropTypes.any.isRequired,
  dropdownItemStyles: PropTypes.any.isRequired,
  iconStyles: PropTypes.any,
  contentStyles: PropTypes.any,
};
/* eslint-enable */

DropdownList.defaultProps = {
  data: [],
  iconStyles: {},
  dropdownItemStyles: {},
  contentStyles: {},
};

export default DropdownList;
