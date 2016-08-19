import React from 'react';
import InboundDetails from './inboundDetails';

function ThisPage(props) {
  return <InboundDetails {...props} params={props.params} />
}

export default ThisPage;
