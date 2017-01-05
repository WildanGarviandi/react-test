import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';

import {ButtonBase, ButtonWithLoading} from '../views/base';
import { TextareaWithDefault } from './form';

import styles from './RemarksSetter.css';

const RemarksSetter = React.createClass({
  getInitialState() {
    return {
      showEdit: false,
      edit: {
        remarks: ""
      }
    }
  },
  setRemarksText() {
    this.props.saveTripDetails(this.props.trip.TripID, {remarks: this.state.edit.remarks});
  },
  editRemarks() {
    this.props.changeRemarks();
  },
  cancelChangingRemarks() {
    this.props.cancelChangingRemarks();
  },
  showEdit() {
    this.setState({
      showEdit: true
    });
  },
  hideEdit() {
    this.setState({
      showEdit: false
    });
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
      <div className={styles.remarksContainer} onMouseLeave={this.hideEdit} onMouseEnter={this.showEdit}>
        <span className={styles.remarksTitle}>Remarks / Notes:</span>
        {
          !isChangingRemarks &&
          <span>
            <span className={styles.remarksContent} >
              <span className={styles.remarksText}>{trip.Notes}</span>
              {
                this.state.showEdit &&
                <ButtonBase children={'Edit'} onClick={this.editRemarks} styles={styles.remarksEdit} />
              }
            </span>
          </span>
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