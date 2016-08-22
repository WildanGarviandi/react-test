import React from 'react';
import {connect} from 'react-redux';
import InboundDetails from './inboundDetails';
import OutboundDetails from './outboundDetails';
import {GetTripType} from '../../modules/trips';
import * as TripDetailsTrue from '../../modules/inboundTripDetails';

const ThisPage = React.createClass({
  componentWillMount() {
    this.props.detailsFetch(this.props.params.id);
  },
  render() {
    const {tripType} = this.props;
    console.log('TYPE!!', tripType);

    if(tripType === "FIRSTLEG" || tripType === "INBOUND") {
      return <InboundDetails {...this.props} />
    } else if(tripType === "OUTBOUND") {
      return <OutboundDetails {...this.props} />
    } else if(tripType === "FETCH") {
      return <div><h3>Fetching Trip Details...</h3></div>;
    }

    return <div><h3>Trip Details Not Available</h3></div>;
  }
});

function StateToProps(store) {
  const {inboundTripDetails, userLogged} = store.app;
  const {hubID} = userLogged;
  const {trip} = inboundTripDetails;
  const tripType = GetTripType(trip, hubID);

  return {
    tripType,
  }
}

function DispatchToProps(dispatch) {
  return {
    detailsFetch: function(id) {
      dispatch(TripDetailsTrue.FetchDetails(id));
    },
  }
}

export default connect(StateToProps, DispatchToProps)(ThisPage);
