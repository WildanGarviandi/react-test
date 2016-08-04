import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import styles from './table.css';
import {StatusFilter, TextFilter} from './filters';
import OrdersPickupActions from '../../modules/orders/actions/pickup';

function FilterCell(type, keyword, func) {
  switch(type) {
    case "StatusDropdown": {
      return <StatusFilter keyword={keyword} filterFunc={func} />;
    }

    case "String": {
      return <TextFilter keyword={keyword} filterFunc={func} />;
    }

    default: {
      return <span />;
    }
  }
}

const FiltersRow = React.createClass({
  getInitialState() {
    return {filter: {}};
  },
  updateFilter(filter) {
    const newFilter = lodash.assign({}, this.state.filter, filter);
    this.setState({
      filter: newFilter
    }, () => {
      this.props.updateFilter(this.state.filter);
    });
  },
  render() {
    const {filters} = this.props;

    const cells = lodash.map(filters, (filter) => {
      const className = classNaming(styles.td, filter.keyword);
      const cell = FilterCell(filter.type, filter.keyword, this.updateFilter);
      return <td key={filter.keyword} className={className}>{cell}</td>;
    });

    return (
      <tbody>
        <tr className={styles.tr, styles.searchRow}>
          {cells}
        </tr>
      </tbody>
    );
  }
});

export default FiltersRow;
