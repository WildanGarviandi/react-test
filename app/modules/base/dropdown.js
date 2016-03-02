import React from 'react';
import _ from 'underscore';
import {ButtonBase} from './';
import {Glyph} from './glyph';
import styles from './dropdown.css';

const Options = React.createClass({
  handleClick() {
    this.props.onClick(this.props.name);
  },
  render() {
    return (
      <span className={styles.option} onClick={this.handleClick}>{this.props.name}</span>
    );
  }
});

const Dropdown = React.createClass({
  componentDidMount() {
    window.addEventListener('mousedown', this.pageClick, false);
  },
  componentWillUnmount() {
    window.removeEventListener('mousedown', this.pageClick, false);
  },
  pageClick(e) {
    if(this.mouseIsDownOnDropdown) return;
    if(this.props.opened) this.props.onClick();
  },
  mouseDownHandler() {
    this.mouseIsDownOnDropdown = true;
  },
  mouseUpHandler() {
    this.mouseIsDownOnDropdown = false;
  },
  render() {
    let {className, onClick, opened, options, selectVal, val} = this.props;
    let optionsComp = _.map(options, (option) => {
      return <Options key={option} name={option} onClick={selectVal} />
    });

    return (
      <span className={styles.dropdownWrapper} onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler}>
        <ButtonBase className={styles.dropdownBase + " " + className} onClick={onClick}>
          <span className={styles.val}>{val}</span>
          <Glyph name={opened ? "chevron-up" : "chevron-down"} />
        </ButtonBase>
        <div className={styles.optionsWrapper}>
          { opened ? optionsComp : "" }
        </div>
      </span>
    );
  }
});

export { Dropdown };
