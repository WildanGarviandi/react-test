import classNaming from 'classnames';
import React from 'react';
import _ from 'underscore';
import {ButtonBase} from './';
import {Glyph} from './glyph';
import {Input} from './input';
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
    let {className, onClick, opened, options, selectVal, val, width} = this.props;
    let optionsComp = _.map(options, (option) => {
      return <Options key={option} name={option} onClick={selectVal} />
    });

    return (
      <span className={styles.dropdownWrapper} onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler}>
        <ButtonBase width={width} className={styles.dropdownBase + " " + className} onClick={onClick}>
          <span className={styles.val}>{val}</span>
          <Glyph name={opened ? "chevron-up" : "chevron-down"} />
        </ButtonBase>
        {
          opened &&
          <div className={styles.optionsWrapper}>
            { optionsComp }
          </div>
        }
      </span>
    );
  }
});

const Options2 = React.createClass({
  handleClick() {
    this.props.selectVal(this.props.name);
  },
  handleEnter() {
    this.props.setHighlight(this.props.idx);
  },
  render() {
    const optionsClass = classNaming(styles.option, {[styles.highlight]: this.props.highlight});
    return (
      <span className={optionsClass} onClick={this.handleClick} onMouseEnter={this.handleEnter}>{this.props.name}</span>
    );
  }
});

const DropdownTypeAhead = React.createClass({
  componentDidMount() {
    window.addEventListener('mousedown', this.pageClick, false);
  },
  componentWillUnmount() {
    window.removeEventListener('mousedown', this.pageClick, false);
  },
  pageClick(e) {
    if(this.mouseIsDownOnDropdown) return;
    if(this.state.opened) this.closeOption();
  },
  mouseDownHandler() {
    this.mouseIsDownOnDropdown = true;
  },
  mouseUpHandler() {
    this.mouseIsDownOnDropdown = false;
  },
  handleTextChange(e) {
    this.setState({txt: e.target.value, highlight: 0, opened: true  });
  },
  handleKeyDown(e) {
    if(e.keyCode == 38) {
      this.highlightPrev();
    } else if(e.keyCode == 40) {
      this.highlightNext();
    } else if(e.keyCode == 13) {
      const filteredOption = this.getFilteredOption();
      if(filteredOption.length > 0) {
        this.handleSelect(filteredOption[this.state.highlight]);
      }
    }
  },
  getInitialState() {
    return {opened: false, txt: '', highlight: 0};
  },
  openOption() {
    this.setState({opened: true});
  },
  closeOption() {
    this.setState({opened: false});
  },
  toggleOption() {
    this.setState({opened: !this.state.opened});
  },
  getFilteredOption() {
    const options = this.props.options;
    return _.filter(options, (option) => {
      return option.toLowerCase().indexOf(this.state.txt.toLowerCase()) > -1;
    });
  },
  setHighlight(x) {
    const filteredOption = this.getFilteredOption();
    this.setState({highlight: Math.max(0, Math.min(x, filteredOption.length))});
  },
  highlightNext() {
    this.setHighlight(this.state.highlight + 1);
  },
  highlightPrev() {
    this.setHighlight(this.state.highlight - 1);
  },
  handleSelect(val) {
    const {selectVal} = this.props;
    selectVal(val);
    this.closeOption();
    this.setState({txt: val});
  },
  render() {
    const {opened} = this.state;
    const optionsComp = _.map(this.getFilteredOption(), (option, idx) => {
      return <Options2 key={option} name={option} highlight={idx == this.state.highlight} idx={idx} setHighlight={this.setHighlight} selectVal={this.handleSelect} />
    });

    const inputProps = {
      onFocus: this.openOption,
      value: this.state.txt,
      className: styles.typeBox,
      onChange: this.handleTextChange,
      onKeyDown: this.handleKeyDown
    }

    return (
      <div className={styles.container} onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler}>
        <input {...inputProps} />
        <span className={styles.caretContainer} onClick={this.toggleOption}>
          <Glyph className={styles.caret} name={opened ? "chevron-up" : "chevron-down"} />
        </span>
        {
          opened && optionsComp.length > 0 &&
          <div className={styles.optionsWrapper}>
            { optionsComp }
          </div>
        }
      </div>
    );
  }
});

export { Dropdown, DropdownTypeAhead };
