import React from 'react';

const Accordion = React.createClass({
  getInitialState() {
    return { view: this.props.initialState };
  },
  collapseView() {
    this.setState({ view: 'collapsed' });
  },
  expandView() {
    this.setState({ view: 'expanded' });
  },
  toggleView() {
    if (this.state.view === 'collapsed') {
      this.expandView();
    } else {
      this.collapseView();
    }
  },
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
  },
});

export default Accordion;
