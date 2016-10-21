import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import styles from './thirdPartySetter.css';
import styles2 from './styles.css';
import datetimeStyles from './datetime.css';
import {InputWithDefault} from '../base/input';
import {ButtonWithLoading} from '../base';
import {CreateExternalTrip, SaveEdit3PL, SetExternalTrip, StartEdit3PL, StopEdit3PL, UpdateExternalTrip} from '../../modules/inboundTripDetails';
import ImagePreview from '../base/imagePreview';
import ImageUploader from '../base/imageUploader';

const DetailRow = React.createClass({
  generateTypeContent() {
    const {type, value} = this.props;
    
    switch (type) {
      case "datetime" :
        return (
          <span className={styles.itemValue}>:
            <span className={styles.datetimeWrapper}>
              <DateTime onChange={this.props.onChange} defaultValue={value} />
            </span>
          </span>
        );
      case "image" :
        return (
          <div className={styles.imageUploaderWrapper}>
            <ImageUploader currentImageUrl={value} updateImageUrl={(data) => this.props.onChange(data)} />
          </div>
        );
      default :
        return (
          <span className={styles.itemValue}>:
            <span className={styles.inputWrapper}>
              <InputWithDefault currentText={value} onChange={(data) => this.props.onChange(data)} type={type}/>
            </span>
          </span>
        );
      }
  },
  render() {
    const {isEditing, label, type, value} = this.props;

    return (
      <div style={{clear: 'both'}}>
        <span className={styles.itemLabel}>{label}</span>
        {
          !isEditing &&
          <span className={styles.itemValue}>
          : 
          {
            type === "image" ?
            <ImagePreview imageUrl={value} />
            :
            value
          }
          </span>
        }
        {
          isEditing &&
          this.generateTypeContent()
        }
      </div>
    );
  }
});

const ThirdParty = React.createClass({
  save() {
    this.props.save();
  },
  saveEdit() {
    this.props.saveEdit();
  },
  onChange(key) {
    return (val) => {
      this.props.update({[key]: val});
    }
  },
  startEdit() {
    this.props.startEdit();
  },
  stopEdit() {
    this.props.stopEdit();
  },
  render() {
    const {externalTrip: externalTripRaw, isEditing3PL, isInbound, isSaving3PL, prev3PL, trip} = this.props;
    const calendarProps = {
      pickDate: this.pickDate,
      toPrevMonth: this.toPrevMonth,
      toNextMonth: this.toNextMonth,
    };

    const externalTrip = externalTripRaw ? externalTripRaw : {};
    const arrivalTimeLabel = isInbound ? "Arrival Time" : "ETA";

    return (
      <div style={{marginBottom: 15}}>
      {
        (isEditing3PL || !externalTripRaw || !prev3PL) &&
        <div>
          <h4 style={{marginTop: 0, marginBottom: 10, fontWeight: 'normal'}}>Third Party Logistic Details:</h4>
          <DetailRow label="Sender" value={externalTrip.Sender} isEditing={true} type="text" onChange={this.onChange('Sender')} />
          <DetailRow label="Fee" value={externalTrip.Fee} isEditing={true} type="number" onChange={this.onChange('Fee')} />
          <DetailRow label="Transportation" value={externalTrip.Transportation} isEditing={true} type="text" onChange={this.onChange('Transportation')} />
          <DetailRow label="Departure Time" value={externalTrip.DepartureTime} isEditing={true} type="datetime" onChange={this.onChange('DepartureTime')} />
          <DetailRow label={arrivalTimeLabel} value={externalTrip.ArrivalTime} isEditing={true} type="datetime" onChange={this.onChange('ArrivalTime')} />
          <DetailRow label="Receipt" value={externalTrip.PictureUrl} isEditing={true} type="image" onChange={this.onChange('PictureUrl')}/>
          {
            (trip && trip.OrderStatus && trip.OrderStatus.OrderStatus === "BOOKED") ?
            <div style={{clear: 'both'}}>
              <ButtonWithLoading textBase="Save & Start Trip" textLoading="Saving" onClick={this.save} isLoading={false} styles={{base: styles2.normalBtn}} />
            </div>
            :
            <div style={{clear: 'both'}}>
              <ButtonWithLoading textBase="Save Changes" textLoading="Saving" onClick={this.saveEdit} isLoading={isSaving3PL} styles={{base: styles2.normalBtn}} />
              <ButtonWithLoading textBase="Cancel" textLoading="Saving" onClick={this.stopEdit} isLoading={false} styles={{base: styles2.driverBtn}} />
            </div>
          }
        </div>
      }
      {
        !isEditing3PL && externalTripRaw && prev3PL &&
        <div>
          <h4 style={{marginTop: 0, marginBottom: 10, fontWeight: 'normal'}}>Third Party Logistic Details:</h4>
          <DetailRow label="Sender" value={externalTrip.Sender} isEditing={false} />
          <DetailRow label="Fee" value={externalTrip.Fee} isEditing={false} />
          <DetailRow label="Transportation" value={externalTrip.Transportation} isEditing={false} />
          <DetailRow label="Departure Time" value={externalTrip.DepartureTime && externalTrip.DepartureTime.toLocaleString()} isEditing={false} />
          <DetailRow label={arrivalTimeLabel} value={externalTrip.ArrivalTime && externalTrip.ArrivalTime.toLocaleString()} isEditing={false} />
          <DetailRow label="Receipt" value={externalTrip.PictureUrl} isEditing={false} type="image" />
          <div style={{clear: 'both'}}>
          {
            !isInbound &&
            <ButtonWithLoading textBase="Edit" textLoading="Saving" onClick={this.startEdit} isLoading={false} styles={{base: styles2.normalBtn}} />
          }
          </div>
        </div>
      }
      </div>
    );
  }
});

function ThirdPartyState(state) {
  const {externalTrip, isEditing3PL, isSaving3PL, prev3PL} = state.app.inboundTripDetails;

  return {
    externalTrip, isEditing3PL, isSaving3PL, prev3PL,
  }
}

function ThirdPartyDispatch(dispatch, ownProps) {
  return {
    save: () => {
      dispatch(CreateExternalTrip(ownProps.trip.TripID));
    },
    saveEdit: () => {
      dispatch(SaveEdit3PL(ownProps.trip.TripID));
    },
    startEdit: () => {
      dispatch(StartEdit3PL());
    },
    stopEdit: () => {
      dispatch(StopEdit3PL());
    },
    update: (externalTrip) => {
      dispatch(UpdateExternalTrip(externalTrip));
    },
  }
}

export default connect(ThirdPartyState, ThirdPartyDispatch)(ThirdParty);
