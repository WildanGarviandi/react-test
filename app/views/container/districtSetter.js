import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';

import {DistrictsActions} from '../../modules';

import {ButtonBase, ButtonWithLoading, DropdownTypeAhead} from '../base';
import styles from './styles.css';

function FindByDistrictID(districts, districtID) {
  return _.find(districts, (district) => (district.DistrictID == districtID));
}

function FindByName(districts, districtName) {
  return _.find(districts, (district) => (district.Name == districtName));
}

const DistrictSetter = React.createClass({
  getInitialState() {
    return {
      isChanging: false,
      nextDistrict: this.props.district,
    }
  },
  cancelChanging() {
    this.setState({isChanging: false, nextDistrict: this.props.district});
  },
  districtSet() {
    const {districtSet, districts} = this.props;
    const district = FindByName(districts, this.state.nextDistrict);
    this.props.districtSet(district.DistrictID);
    this.setState({isChanging: false});
  },
  selectDistrict(val) {
    this.setState({nextDistrict: val});
  },
  toChanging() {
    this.setState({isChanging: true});
  },
  render() {
    const {canChangeDistrict, district, districtsNames, isSettingDistrict} = this.props;
    const {isChanging, nextDistrict} = this.state;
    const showDistrictPicker =  isSettingDistrict || (canChangeDistrict && (!district || isChanging));
    const isError = this.props.inValidation && !district;

    return (
      <div>
        {
          (district || showDistrictPicker) &&
          <span>Districts : </span>
        }
        {
          !showDistrictPicker &&
          <span>{district}</span>
        }
        {
          showDistrictPicker &&
          <span className={classNaming(styles.districtsWrapper, {[styles.error]: isError})}>
            <DropdownTypeAhead options={districtsNames} selectVal={this.selectDistrict} val={nextDistrict} />
          </span>
        }
        {
          canChangeDistrict && !showDistrictPicker &&
          <ButtonBase onClick={this.toChanging} styles={styles.driverBtn}>Change District</ButtonBase>
        }
        {
          showDistrictPicker &&
          <ButtonWithLoading textBase="Set District" textLoading="Setting District" onClick={this.districtSet} isLoading={isSettingDistrict} styles={{base: styles.normalBtn}} />
        }
        {
          showDistrictPicker && district &&
          <ButtonBase onClick={this.cancelChanging} styles={styles.driverBtn}>Cancel</ButtonBase>
        }
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const containerID = ownProps.containerID;
  const container = state.app.containers.containers[containerID];

  const {districts} = state.app.districts;
  const districtsNames = _.map(districts, (district) => (district.Name));

  const containerDistrictIDMaybe = container && 
    container.CurrentTrip &&
    container.CurrentTrip.District && 
    container.CurrentTrip.District.DistrictID;

  const district = FindByDistrictID(districts, containerDistrictIDMaybe) || {};

  const canChangeDistrict = container && 
    container.CurrentTrip && 
    container.CurrentTrip.OrderStatus && 
    container.CurrentTrip.OrderStatus.OrderStatus == 'BOOKED';

  const isSettingDistrict = container && container.isSettingDistrict;

  return {
    district: district.Name,
    canChangeDistrict, districts, districtsNames, isSettingDistrict,
  }
}

function DispatchToProps(dispatch, ownProps) {
  return {
    districtSet(districtID) {
      dispatch(DistrictsActions.districtSet(ownProps.containerID, districtID));
    },
  }
}

export default connect(StateToProps, DispatchToProps)(DistrictSetter);
