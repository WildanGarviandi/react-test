import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import styles from './table.scss';

const PickRow = React.createClass({
  handleClick() {
    const {item, pickContainer} = this.props;
    if(item.status == 'Active') pickContainer(item.ContainerID);
  },
  render() {
    let {children} = this.props;
    return (<tr className={styles.tr} onClick={this.handleClick}>{children}</tr>);
  }
});

const PickRowDispatch = (dispatch) => {
  return {
    pickContainer: function(id) {
      dispatch(push('/container/' + id));
    }
  }
}

export default connect(undefined, PickRowDispatch)(PickRow);
