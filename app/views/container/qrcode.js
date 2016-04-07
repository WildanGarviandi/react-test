import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
var QRCode = require('qrcode.react');

const qrCode = React.createClass({
  componentDidMount: function() {
    window.print();
  },
  render() {
    return (
      <div>
        <div><QRCode value={this.props.params.id} /></div>
        <div><h3>{this.props.params.id}</h3></div>
        <div>{(this.printPage)}</div>
      </div>
    );
  }
});

const dispatchToProps = (dispatch) => {
  return {
    backToContainer: function() {
      dispatch(push('/container'));
    }
  }
}

export default connect(undefined, dispatchToProps)(qrCode);
