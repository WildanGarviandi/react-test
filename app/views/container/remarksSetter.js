import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';

import * as TripDetails from '../../modules/inboundTripDetails';
import {ButtonBase, ButtonWithLoading} from '../base';
import { TextareaWithDefault } from '../../components/form';

import styles from './styles.css';

const RemarksSetter = React.createClass({
  setRemarksText() {
    this.props.saveTripDetails(this.props.trip.TripID, {remarks: this.state.edit.remarks});
  },
  editRemarks() {
    this.props.changeRemarks();
  },
  cancelChangingRemarks() {
    this.props.cancelChangingRemarks();
  },
  changeState(key) {
    return (value) => {
      this.setState({
        edit: {
          [key]: value
        }
      });
    };
  },
  render() {
    const { isChangingRemarks, trip, isTripEditing } = this.props;

    return (
      <div>
        Remarks / Notes:
        {
          !isChangingRemarks &&
          <div>
            <div className={styles.remarksContent} >{trip.Notes}</div>
            <ButtonBase children={'Edit'} onClick={this.editRemarks} styles={styles.remarksEdit} />
          </div>
        }
        {
          isChangingRemarks &&
          <div>
            <div className={styles.remarksContent}>
              <TextareaWithDefault currentText={trip.Notes} onChange={this.changeState('remarks')} type={'text'} />
            </div>
            <ButtonBase children={'Cancel'} onClick={this.cancelChangingRemarks} styles={styles.remarksCancel}/>
            <ButtonWithLoading textBase={'Save'} textLoading={'Updating'} isLoading={isTripEditing} 
              onClick={this.setRemarksText} styles={{base: styles.remarksSave}} />
          </div>
        }
      </div>
    )
  }
});

const mapStateToProps = (state, ownProps) => {
  const { inboundTripDetails } = state.app;
  const { isChangingRemarks, isTripEditing } = inboundTripDetails;

  return {
    isChangingRemarks,
    isTripEditing
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    saveTripDetails: function (tripID, details) {
      dispatch(TripDetails.EditTrip(tripID, details));
    },
    changeRemarks: function () {
      dispatch(TripDetails.ChangeRemarks());
    },
    cancelChangingRemarks: function () {
      dispatch(TripDetails.CancelChangingRemarks());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RemarksSetter);