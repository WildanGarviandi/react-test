import React from 'react';
import {connect} from 'react-redux';
import {StatusList} from '../../modules';
import {Infograph} from '../base';

const Infographic = React.createClass({
  handleFilter(attr) {
    const {pickStatus, category} = this.props;
    console.log('cag', category);
    pickStatus(category[attr], attr.toUpperCase());
  },
  render() {
    const {containerInfo} = this.props;
    const Info = _.map(containerInfo, (val, key) => {
      return <Infograph key={key} attr={key} val={val} onClick={this.handleFilter} />;
    });

    return (
      <div>
        {Info}
        <div style={{clear: 'both'}} />
      </div>
    );
  }
});

const stateToProps = (state) => {
  const {groups: containerInfo, statusCategory} = state.app.containers;
  return {
    containerInfo,
    category: _.assign({}, statusCategory, {booked: [1]}),
  }
}

const dispatchToProps = (dispatch) => {
  return {
    pickStatus: function(val, name) {
      dispatch(StatusList.pick(val, name));
    },    
  }
}

export default connect(stateToProps, dispatchToProps)(Infographic);
