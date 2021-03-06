import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const viewAccordion = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
};

class Accordion extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      view: this.props.initialState,
    };

    this.collapseView = this.collapseView.bind(this);
    this.expandView = this.expandView.bind(this);
    this.toggleView = this.toggleView.bind(this);
  }
  collapseView() {
    this.setState({ view: viewAccordion.COLLAPSED });
  }
  expandView() {
    this.setState({ view: viewAccordion.EXPANDED });
  }
  toggleView() {
    if (this.state.view === viewAccordion.COLLAPSED) {
      this.expandView();
    } else {
      this.collapseView();
    }
  }
  render() {
    const accordionAction = {
      collapseView: this.collapseView,
      expandView: this.expandView,
      toggleView: this.toggleView,
    };

    const accordionState = this.state.view;

    return (
      <div>
        {React.cloneElement(this.props.children, { accordionAction, accordionState })}
      </div>
    );
  }
}

/* eslint-disable */
Accordion.propTypes = {
  initialState: PropTypes.any.isRequired,
  children: PropTypes.any,
};
/* eslint-enable */

Accordion.defaultProps = {
  children: {},
};

export default Accordion;
