import React from 'react';
import {connect} from 'react-redux';
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


export default connect(undefined)(qrCode);
