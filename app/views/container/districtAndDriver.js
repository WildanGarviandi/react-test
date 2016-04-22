import React from 'react';
import DistrictSetter from './districtSetter';
import DriverSetter from './driverSetter';

const DistrictAndDriver = React.createClass({
  getInitialState() {
    return {inValidation: false};
  },
  validate() {
    this.setState({inValidation: true});
  },
  render() {
    const {containerID, show} = this.props;
    const validation = {
      inValidation: this.state.inValidation,
      validate: this.validate,
    }

    return (
      <div style={{display: show ? 'block' : 'none'}}>
        <DistrictSetter containerID={containerID} {...validation} />
        <div style={{marginBottom: 10}}/>
        <DriverSetter containerID={containerID} {...validation} />
      </div>
    );
  }
});

export default DistrictAndDriver;
