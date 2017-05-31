import React from 'react';
import {connect} from 'react-redux';
import InboundDetails from './tripDetailsInboundPage';
import OutboundDetails from './tripDetailsOutboundPage';
import {GetTripType} from '../modules/trips';
import * as TripDetails from './tripDetailsService';

const ThisPage = React.createClass({
  componentWillMount() {
    this.props.detailsFetch(this.props.params.id);
  },
  componentWillReceiveProps(nextProps) {
    if(this.props.params.id !== nextProps.params.id) {
      this.props.detailsFetch(nextProps.params.id);
    }
  },
  render() {
    const {tripType} = this.props;

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
  const {tripDetails, userLogged} = store.app;
  const {hubID, roleName} = userLogged;
  const {trip} = tripDetails;
  const tripType = GetTripType(trip, hubID, roleName);

  return {
    tripType,
    trip,
  }
}

function DispatchToProps(dispatch) {
  return {
    detailsFetch: function(id) {
      dispatch(TripDetails.FetchDetails(id));
    },
  }
}

export default connect(StateToProps, DispatchToProps)(ThisPage);
