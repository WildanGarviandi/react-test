import classNaming from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
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
    let {className, onClick, opened, options, selectVal, val, width} = this.props;
    let optionsComp = _.map(options, (option) => {
      return <Options key={option} name={option} onClick={selectVal} />
    });

    return (
      <span className={styles.dropdownWrapper} onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler}>
        <span width={width} className={styles.dropdownBase + " " + className} onClick={onClick}>
          <span className={styles.val}>{val}</span>
          <img src="/img/icon-dropdown.png" className={styles.arrowDown} />
        </span>
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
    this.props.selectVal(this.props.option);
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
  componentDidUpdate(prevProps, prevState) {
    if (this.state.highlight !== prevState.highlight) {
      this.ensureActiveItemVisible();
    }
  },
  componentWillUnmount() {
    window.removeEventListener('mousedown', this.pageClick, false);
  },
  componentWillReceiveProps(nextProps) {
    this.setState({txt: nextProps.val || ''});
  },
  ensureActiveItemVisible() {
    var itemComponent = this.refs.activeItem;
    if (itemComponent) {
      var domNode = ReactDOM.findDOMNode(itemComponent);
      this.scrollElementIntoViewIfNeeded(domNode);
    }
  },
  scrollElementIntoViewIfNeeded(domNode) {
    if(!this.refs.optionsWrapper) return;
    const top = this.refs.optionsWrapper.scrollTop;
    const position = domNode.offsetTop;
    if(position < top) {
      this.refs.optionsWrapper.scrollTop = position;
    } else if(top + 104 < position) {
      this.refs.optionsWrapper.scrollTop = position - 104;
    }
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
    this.setState({temp: e.target.value, highlight: 0, opened: true }, () => {
      if(this.refs.optionsWrapper) this.refs.optionsWrapper.scrollTop = 0;
    });
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
    const {val} = this.props;
    return {opened: false, txt: (val ? val : ''), temp: '', highlight: 0};
  },
  openOption() {
    this.setState({opened: true, temp: ''});
    this.refs.textInput.focus();
  },
  closeOption() {
    this.setState({opened: false});
  },
  toggleOption() {
    if(this.state.opened) this.closeOption();
    else this.openOption();
  },
  getFilteredOption() {
    const options = this.props.options;
    const filtered = _.filter(options, (option) => {
      return option.value.toLowerCase().indexOf(this.state.temp.toLowerCase()) > -1;
    });

    return filtered;
  },
  setHighlight(x) {
    const filteredOption = this.getFilteredOption();
    const position = Math.max(0, Math.min(x, filteredOption.length-1));
    this.setState({highlight: position});
  },
  highlightNext() {
    this.setHighlight(this.state.highlight + 1);
  },
  highlightPrev() {
    this.setHighlight(this.state.highlight - 1);
  },
  handleSelect(val) {
    this.props.selectVal(val);
    this.closeOption();
    this.setState({txt: val});
  },
  render() {
    const {opened} = this.state;
    const optionsComp = _.map(this.getFilteredOption(), (option, idx) => {
      let optionProps = {
        key: option.key,
        option: option,
        name: option.value,
        highlight: idx == this.state.highlight,
        idx: idx,
        selectVal: this.handleSelect,
        setHighlight: this.setHighlight,
      };

      if(idx == this.state.highlight) {
        optionProps.ref = 'activeItem';
      }

      return <Options2 {...optionProps} />
    });
    const inputProps = {
      onFocus: this.openOption,
      value: this.state.opened ? this.state.temp : this.state.txt,
      className: this.props.custClass||styles.typeBox,
      onChange: this.handleTextChange,
      onKeyDown: this.handleKeyDown,
      ref: 'textInput',
      type: 'text',
    }

    return (
      <div className={styles.container} onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler}>
        <input {...inputProps} />
        <span className={styles.caretContainer} onClick={this.toggleOption}>
          <Glyph className={styles.caret} name={opened ? "chevron-up" : "chevron-down"} />
        </span>
        {
          opened && optionsComp.length > 0 &&
          <div className={styles.optionsWrapper} ref="optionsWrapper">
            { optionsComp }
          </div>
        }
      </div>
    );
  }
});

const DropdownWithState = React.createClass({
  getInitialState() {
    return {currentVal: this.props.initialValue};
  },
  handleSelect(val) {
    this.setState({
      currentVal: val.value,
    }, () => {
      this.props.handleSelect(val);
    });
  },
  render() {
    const {options} = this.props;
    const {currentVal} = this.state;

    return (
      <DropdownTypeAhead options={options} selectVal={this.handleSelect} val={currentVal} />
    );
  }
});

const DropdownWithState2 = React.createClass({
  handleSelect(val) {
    this.props.handleSelect(val);
  },
  render() {
    const {options, custClass} = this.props;

    return (
      <DropdownTypeAhead options={options} selectVal={this.handleSelect} val={this.props.val} custClass={custClass} />
    );
  }
});

export { Dropdown, DropdownTypeAhead, DropdownWithState, DropdownWithState2 };
