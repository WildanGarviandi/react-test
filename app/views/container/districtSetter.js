import React from 'react';
import {connect} from 'react-redux';
import classNaming from 'classnames';

import {DistrictsActions} from '../../modules';
import DistrictsFetch from '../../modules/districts/actions/districtsFetch';

import {ButtonBase, ButtonWithLoading, DropdownTypeAhead} from '../base';
import styles from './styles.css';

function FindByDistrictID(districts, districtID) {
  return _.find(districts, (district) => (district.DistrictID == districtID));
}

function FindByName(districts, districtName) {
  return _.find(districts, (district) => (district.Name == districtName));
}

const DistrictSetter = React.createClass({
  componentWillMount() {
    // this.props.DistrictsFetch();
  },
  componentWillReceiveProps(nextProps) {
    this.setState({nextDistrict: {value: nextProps.districtName}});
  },
  getInitialState() {
    return {
      isChanging: false,
      nextDistrict: {value: this.props.districtName},
    }
  },
  cancelChanging() {
    this.setState({isChanging: false, nextDistrict: {value: this.props.districtName}});
  },
  districtSet() {
    this.props.DistrictSet(this.state.nextDistrict.key);
    this.setState({isChanging: false});
  },
  selectDistrict(val) {
    this.setState({nextDistrict: val});
  },
  toChanging() {
    this.setState({isChanging: true});
  },
  render() {
    const {canChangeDistrict, districtName, districts, isFetchingDistrict, isSettingDistrict} = this.props;
    const {isChanging, nextDistrict} = this.state;
    const showDistrictPicker =  isSettingDistrict || (canChangeDistrict && (!districtName || isChanging));
    const isError = this.props.inValidation && !districtName;

    return (
      <div>
        <span>Districts : </span>
        {
          isFetchingDistrict &&
          <span>Fetching Districts List...</span>
        }
        {
          !isFetchingDistrict && !showDistrictPicker &&
          <span>{districtName}</span>
        }
        {
          !isFetchingDistrict && showDistrictPicker &&
          <span className={classNaming(styles.districtsWrapper, {[styles.error]: isError})}>
            <DropdownTypeAhead options={districts} selectVal={this.selectDistrict} val={nextDistrict.value} />
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
          showDistrictPicker && districtName &&
          <ButtonBase onClick={this.cancelChanging} styles={styles.driverBtn}>Cancel</ButtonBase>
        }
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const containerID = ownProps.containerID;
  const container = state.app.containers.containers[containerID];

  const districtsList = state.app.districts.districts;
  const districts = _.map(districtsList, (district) => {
    return {
      key: district.DistrictID,
      value: district.Name
    }
  });

  const containerDistrictIDMaybe = container && 
    container.CurrentTrip &&
    container.CurrentTrip.District &&
    container.CurrentTrip.District.DistrictID;

  const district = _.find(districtsList, (district) => (district.DistrictID == containerDistrictIDMaybe));
  const districtName = district ? district.Name : '';

  const canChangeDistrict = container && 
    container.CurrentTrip && 
    container.CurrentTrip.OrderStatus && 
    (container.CurrentTrip.OrderStatus.OrderStatus == 'BOOKED' || container.CurrentTrip.OrderStatus.OrderStatus == 'PREBOOKED');

  const isSettingDistrict = container && container.isSettingDistrict;
  const isFetchingDistrict = state.app.districts.isFetching;

  return {
    districtName,
    canChangeDistrict, districts, isFetchingDistrict, isSettingDistrict,
  }
}

function DispatchToProps(dispatch, ownProps) {
  return {
    DistrictsFetch() {
      dispatch(DistrictsFetch());
    },
    DistrictSet(districtID) {
      dispatch(DistrictsActions.districtSet(ownProps.containerID, districtID));
    },
  }
}

export default connect(StateToProps, DispatchToProps)(DistrictSetter);
