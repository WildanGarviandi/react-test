import React from 'react';
import DateRangePicker from 'react-daterange-picker';
import moment from 'moment-range';

const stateDefinitions = {
  available: {
    color: null,
    label: 'Available',
  },
};

const DatePicker = React.createClass({
  componentDidMount() {
    window.addEventListener('mousedown', this.pageClick, false);
  },
  componentWillUnmount() {
    window.removeEventListener('mousedown', this.pageClick, false);
  },
  pageClick() {
    if(this.mouseIsDownOnDropdown) return;
    this.props.hidePicker();
  },
  getInitialState() {
    return {
      value: null,
    };
  },
  handleSelect(range) {
    this.setState({
      value: range,
    });
    this.props.selectRange(range);
    this.props.hidePicker();
  },
  mouseDownHandler() {
    this.mouseIsDownOnDropdown = true;
  },
  mouseUpHandler() {
    this.mouseIsDownOnDropdown = false;
  },
  render() {
    const styles = {
      display: this.props.show ? 'block' : 'none',
      position: 'absolute',
      right: 0,
      backgroundColor: '#fff',
      border: 'solid 1px #ccc',
      borderRadius: 5,
      zIndex: 2,
    }

    return (
      <div style={styles} onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler}>
        <DateRangePicker
          numberOfCalendars={2}
          selectionType='range'
          singleDateRange={true}
          stateDefinitions={stateDefinitions}
          defaultState="available"
          value={this.state.value}
          onSelect={this.handleSelect} />
      </div>
    );
  },
});

export default DatePicker;
