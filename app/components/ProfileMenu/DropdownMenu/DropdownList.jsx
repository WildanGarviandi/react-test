import React, { PureComponent } from 'react';

import PropTypes from 'prop-types';

import styles from './styles.scss';
import DropdownItemBase from './DropdownItem';

class DropdownList extends PureComponent {
  render() {
    return (
      <div className={styles['dropdown-list']}>
        {
          this.props.data.map((data) => {
            const renderData = (
              <DropdownItemBase
                key={data.id}
                data={data}
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
  handleSelect: PropTypes.func.isRequired
};
/* eslint-enable */

DropdownList.defaultProps = {
  data: [],
};

export default DropdownList;
