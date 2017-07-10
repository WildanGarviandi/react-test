import React, { PropTypes } from 'react';
import * as _ from 'lodash';
import ReactDOM from 'react-dom';
import classNaming from 'classnames';

import styles from './form.scss';
import { Glyph } from '../views/base/glyph';
import { ButtonBase } from './button';
import config from '../config/configValues.json';
import { DropdownWithState2 as Dropdown2 } from '../views/base/dropdown';

const Form = React.createClass({
  displayName: 'Form',

  propTypes: {
    children: PropTypes.node,
    values: PropTypes.object,
    update: PropTypes.func,
    reset: PropTypes.func,
    onSubmit: PropTypes.func
  },

  render() {
    return (
      <form>
        {this.props.children}
      </form>
    );
  }
});

const CheckBox = React.createClass({
  getInitialState() {
    return { checked: this.props.checked || false };
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.checked !== this.props.checked) {
      this.setState({ checked: nextProps.checked });
    }
  },
  handleClick(e) {
    let { onChange } = this.props;
    if (!onChange) return;
    onChange(e.target.checked);
    this.setState({ checked: !this.state.checked });
  },
  render() {
    let { checked, label, name, styles = {} } = this.props;

    var classes = classNaming(
      this.props.className,
      styles.checkbox,
      {
        'form-control': true,
      }
    );

    return (
      <div className='nb'>
        <span className={styles.container}>
          <input type="checkbox" checked={this.state.checked} onChange={this.handleClick} id={name} className={classes} />
          <label htmlFor={name} className={styles.label}>{label}</label>
        </span>
      </div>
    );
  }
});

const Input = React.createClass({
  handleChange(e) {
    let { onChange } = this.props;

    if (!onChange) return;
    onChange(e.target.value);
  },
  handleEnterKey(e) {
    if (e.keyCode === 13 && this.props.onEnterKeyPressed) {
      this.props.onEnterKeyPressed(e.target.value);
    }
  },
  render() {
    let { base, notes, styles = {} } = this.props;

    var classes = classNaming(
      this.props.className,
      styles.input,
      {
        'form-control': true,
      }
    );

    return (
      <div className='nb'>
        <span className={styles.container}>
          <input {...base} className={classes} onChange={this.handleChange} onKeyDown={this.handleEnterKey} />
          <span className={styles.notes}>{notes}</span>
        </span>
      </div>
    );
  }
});

const InputWithState = React.createClass({
  getInitialState() {
    return { currentText: "" };
  },
  setText(val) {
    this.setState({ currentText: val });
  },
  handleSelect() {
    this.props.handleSelect(this.state.currentText);
  },
  render() {
    return <Input {...this.props} onChange={this.setText} onEnterKeyPressed={this.handleSelect} />
  }
})

const InputWithDefault = React.createClass({
  getInitialState() {
    return { currentText: this.props.currentText || "" };
  },
  componentWillReceiveProps(nextProps) {
    if (this.props.currentText !== nextProps.currentText) {
      this.setState({ currentText: nextProps.currentText });
    }
  },
  setText(val) {
    this.setState({ currentText: val });
    if (this.props.onChange) {
      this.props.onChange(val);
    }
  },
  handleSelect() {
    this.props.handleSelect(this.state.currentText);
  },
  render() {
    return <Input {...this.props} base={{ value: this.state.currentText, type: this.props.type }} onChange={this.setText} onEnterKeyPressed={this.handleSelect} />
  }
});

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
    if (this.mouseIsDownOnDropdown) return;
    if (this.props.opened) this.props.onClick();
  },
  mouseDownHandler() {
    this.mouseIsDownOnDropdown = true;
  },
  mouseUpHandler() {
    this.mouseIsDownOnDropdown = false;
  },
  render() {
    let { className, onClick, opened, options, selectVal, val, width } = this.props;
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
            {optionsComp}
          </div>
        }
      </span>
    );
  }
});

const Options2 = React.createClass({
  handleChange() {
    if (this.props && this.props.isMultiple) {
      this.props.option.checked = !this.props.option.checked;
    }
    this.props.selectVal(this.props.option);
  },
  handleEnter() {
    this.props.setHighlight(this.props.idx);
  },
  render() {
    const optionsClass = classNaming(styles.option, { [styles.highlight]: this.props.highlight });
    const { isMultiple, option } = this.props;

    return (
      <span
        role="option"
        aria-selected="false"
        className={optionsClass}
        onClick={this.handleChange}
        onMouseEnter={this.handleEnter}
      >
        <div
          className={styles['option-content']}
        >
          <div
            className={styles['option-text']}
          >
            {this.props.name}
          </div>
          {isMultiple &&
            <input
              type="checkbox"
              checked={option.checked}
              className={styles['check-multi']}
            />
          }
        </div>
      </span>
    );
  },
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
    let txt = '';
    if (!nextProps.isMultiple) {
      txt = nextProps.val || '';
    } else {
      txt = _.chain(nextProps.options)
        .filter(option => option.checked)
        .map(option => option.value)
        .value()
        .join();
    }
    this.setState({ txt });
  },
  ensureActiveItemVisible() {
    var itemComponent = this.refs.activeItem;
    if (itemComponent) {
      var domNode = ReactDOM.findDOMNode(itemComponent);
      this.scrollElementIntoViewIfNeeded(domNode);
    }
  },
  scrollElementIntoViewIfNeeded(domNode) {
    if (!this.refs.optionsWrapper) return;
    const top = this.refs.optionsWrapper.scrollTop;
    const position = domNode.offsetTop;
    if (position < top) {
      this.refs.optionsWrapper.scrollTop = position;
    } else if (top + 104 < position) {
      this.refs.optionsWrapper.scrollTop = position - 104;
    }
  },
  pageClick() {
    if (this.mouseIsDownOnDropdown) return;
    if (this.state.opened) this.closeOption();
  },
  mouseDownHandler() {
    this.mouseIsDownOnDropdown = true;
  },
  mouseUpHandler() {
    this.mouseIsDownOnDropdown = false;
  },
  handleTextChange(e) {
    this.setState({ temp: e.target.value, highlight: 0, opened: true }, () => {
      if (this.refs.optionsWrapper) this.refs.optionsWrapper.scrollTop = 0;
    });
  },
  handleKeyDown(e) {
    if (e.keyCode === config.KEY_ACTION.UP_ARROW) {
      this.highlightPrev();
    } else if (e.keyCode === config.KEY_ACTION.DOWN_ARROW) {
      this.highlightNext();
    } else if (e.keyCode === config.KEY_ACTION.ENTER && !this.props.isMultiple) {
      const filteredOption = this.getFilteredOption();
      if (filteredOption.length > 0) {
        this.handleSelect(filteredOption[this.state.highlight]);
      }
    }
  },
  getInitialState() {
    const { val } = this.props;
    return {
      opened: false,
      txt: val || '',
      temp: '',
      highlight: 0,
    };
  },
  openOption() {
    this.setState({ opened: true, temp: '' });
    this.refs.textInput.focus();
  },
  closeOption() {
    this.setState({ opened: false });
  },
  toggleOption() {
    if (this.state.opened) this.closeOption();
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
    const position = Math.max(0, Math.min(x, filteredOption.length - 1));
    this.setState({ highlight: position });
  },
  highlightNext() {
    this.setHighlight(this.state.highlight + 1);
  },
  highlightPrev() {
    this.setHighlight(this.state.highlight - 1);
  },
  handleSelect(val) {
    let txt = '';
    if (!this.props.isMultiple) {
      this.closeOption();
      txt = val;
    } else {
      txt = _.chain(this.props.options)
        .filter(option => option.checked)
        .map(option => option.value)
        .value()
        .join();
    }
    this.setState({ txt });
    this.props.selectVal(val);
  },
  render() {
    const { opened } = this.state;
    const { isMultiple } = this.props;
    const optionsComp = _.map(this.getFilteredOption(), (option, idx) => {
      const optionProps = {
        key: option.key,
        option,
        name: option.value,
        highlight: idx === this.state.highlight,
        idx,
        selectVal: this.handleSelect,
        setHighlight: this.setHighlight,
        isMultiple,
      };

      if (idx === this.state.highlight) {
        optionProps.ref = 'activeItem';
      }

      return <Options2 {...optionProps} />;
    });

    let value = '';

    if (this.props.isMultiple) {
      value = this.state.txt;
    } else {
      value = this.state.opened ? this.state.temp : this.state.txt;
    }

    const inputProps = {
      onFocus: this.openOption,
      value,
      className: !this.props.isMultiple ? styles.typeBox : styles['typeBox-multi'],
      onChange: this.handleTextChange,
      onKeyDown: this.handleKeyDown,
      ref: 'textInput',
      type: 'text',
    };

    return (
      <div
        role="button"
        className={this.props.isMultiple ? styles['container-multi'] : styles.container}
        onMouseUp={this.mouseUpHandler}
        onMouseDown={this.mouseDownHandler}
      >
        <input {...inputProps} />
        {
          !this.props.isMultiple &&
          <span className={styles.caretContainer} onClick={this.toggleOption}>
            <Glyph className={styles.caret} name={opened ? 'chevron-up' : 'chevron-down'} />
          </span>
        }
        {
          opened && optionsComp.length > 0 &&
          <div className={styles.optionsWrapper} ref='optionsWrapper'>
            {optionsComp}
          </div>
        }
      </div>
    );
  }
});

const DropdownTypeAhead2 = React.createClass({
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
    this.setState({ txt: nextProps.val || '' });
  },
  ensureActiveItemVisible() {
    var itemComponent = this.refs.activeItem;
    if (itemComponent) {
      var domNode = ReactDOM.findDOMNode(itemComponent);
      this.scrollElementIntoViewIfNeeded(domNode);
    }
  },
  scrollElementIntoViewIfNeeded(domNode) {
    if (!this.refs.optionsWrapper) return;
    const top = this.refs.optionsWrapper.scrollTop;
    const position = domNode.offsetTop;
    if (position < top) {
      this.refs.optionsWrapper.scrollTop = position;
    } else if (top + 104 < position) {
      this.refs.optionsWrapper.scrollTop = position - 104;
    }
  },
  pageClick(e) {
    if (this.mouseIsDownOnDropdown) return;
    if (this.state.opened) this.closeOption();
  },
  mouseDownHandler() {
    this.mouseIsDownOnDropdown = true;
  },
  mouseUpHandler() {
    this.mouseIsDownOnDropdown = false;
  },
  handleTextChange(e) {
    this.setState({ temp: e.target.value, highlight: 0, opened: true }, () => {
      if (this.refs.optionsWrapper) this.refs.optionsWrapper.scrollTop = 0;
    });
  },
  handleKeyDown(e) {
    if (e.keyCode == 38) {
      this.highlightPrev();
    } else if (e.keyCode == 40) {
      this.highlightNext();
    } else if (e.keyCode == 13) {
      const filteredOption = this.getFilteredOption();
      if (filteredOption.length > 0) {
        this.handleSelect(filteredOption[this.state.highlight]);
      }
    }
  },
  getInitialState() {
    const { val } = this.props;
    return { opened: false, txt: (val ? val : ''), temp: '', highlight: 0 };
  },
  openOption() {
    this.setState({ opened: true, temp: '' });
    this.refs.textInput.focus();
  },
  closeOption() {
    this.setState({ opened: false });
  },
  toggleOption() {
    if (this.state.opened) this.closeOption();
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
    const position = Math.max(0, Math.min(x, filteredOption.length - 1));
    this.setState({ highlight: position });
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
    this.setState({ txt: val });
  },
  render() {
    const { opened } = this.state;
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

      if (idx == this.state.highlight) {
        optionProps.ref = 'activeItem';
      }

      return <Options2 {...optionProps} />
    });

    const inputProps = {
      onFocus: this.openOption,
      value: this.state.opened ? this.state.temp : this.state.txt,
      className: styles.typeBox2,
      onChange: this.handleTextChange,
      onKeyDown: this.handleKeyDown,
      ref: 'textInput',
      type: 'text',
    }

    return (
      <div className={styles.container} onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler}>
        <input {...inputProps} />
        <span className={styles.caretContainer} onClick={this.toggleOption}>
          <Glyph className={styles.caret2} name={opened ? "chevron-up" : "chevron-down"} />
        </span>
        {
          opened && optionsComp.length > 0 &&
          <div className={styles.optionsWrapper} ref="optionsWrapper">
            {optionsComp}
          </div>
        }
      </div>
    );
  }
});

const DropdownWithState = React.createClass({
  getInitialState() {
    return { currentVal: this.props.initialValue };
  },
  handleSelect(val) {
    this.setState({
      currentVal: val.value,
    }, () => {
      this.props.handleSelect(val);
    });
  },
  render() {
    const { options } = this.props;
    const { currentVal } = this.state;

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
    const { options, isMultiple } = this.props;

    return (
      <DropdownTypeAhead
        options={options}
        isMultiple={isMultiple}
        selectVal={this.handleSelect}
        val={this.props.val}
      />
    );
  },
});

const DropdownWithState3 = React.createClass({
  getInitialState() {
    return { currentVal: this.props.initialValue };
  },
  handleSelect(val) {
    this.setState({
      currentVal: val.value,
    }, () => {
      this.props.handleSelect(val);
    });
  },
  render() {
    const { options } = this.props;
    const { currentVal } = this.state;

    return (
      <DropdownTypeAhead2 options={options} selectVal={this.handleSelect} val={currentVal} />
    );
  }
});

const Textarea = React.createClass({
  handleChange(e) {
    let { onChange } = this.props;

    if (!onChange) return;
    onChange(e.target.value);
  },
  handleEnterKey(e) {
    if (e.keyCode === 13 && this.props.onEnterKeyPressed) {
      this.props.onEnterKeyPressed(e.target.value);
    }
  },
  render() {
    let { base, notes, styles = {} } = this.props;

    return (
      <span className={styles.container}>
        <textarea {...base} className={styles.input} onChange={this.handleChange} onKeyDown={this.handleEnterKey} rows={4} cols={22} />
        <span className={styles.notes}>{notes}</span>
      </span>
    );
  }
});

const TextareaWithDefault = React.createClass({
  getInitialState() {
    return { currentText: this.props.currentText || "" };
  },
  componentWillReceiveProps(nextProps) {
    if (this.props.currentText !== nextProps.currentText) {
      this.setState({ currentText: nextProps.currentText });
    }
  },
  setText(val) {
    this.setState({ currentText: val });
    if (this.props.onChange) {
      this.props.onChange(val);
    }
  },
  handleSelect() {
    this.props.handleSelect(this.state.currentText);
  },
  render() {
    return <Textarea {...this.props} base={{ value: this.state.currentText, type: this.props.type }} onChange={this.setText} onEnterKeyPressed={this.handleSelect} />
  }
});

const FilterTop = React.createClass({
  render() {
    return (
      <div className={styles.filterTop}>
        <div className={styles.filterTitle}>{this.props.title}</div>
        <div>
          <DropdownWithState2
            val={this.props.value}
            options={this.props.options}
            handleSelect={this.props.handleSelect}
          />
        </div>
      </div>
    );
  },
});

const FilterTopMultiple = React.createClass({
  handleSelect(selectedOption) {
    if (selectedOption.value === 'All') {
      const options = this.props.options.map((option) => {
        const data = Object.assign({}, option, {
          checked: selectedOption.checked,
        });
        return data;
      });
      this.props.handleSelectAll(options);
      return;
    }
    this.props.handleSelect(selectedOption);
  },
  render() {
    const isMultiple = true;

    return (
      <div className={styles.filterTop}>
        <div className={styles.filterTitle}>{this.props.title}</div>
        <div>
          <DropdownWithState2
            val={this.props.value}
            options={this.props.options}
            handleSelect={this.handleSelect}
            isMultiple={isMultiple}
          />
        </div>
      </div>
    );
  },
});

function Filter({ value, options, handleSelect }) {
  return (
    <div className={styles.custFilterTop}>
      <Dropdown2 val={value} options={options} handleSelect={handleSelect} custClass={styles.custDropdown} />
    </div>
  )
}

const FilterTop2 = React.createClass({
  render() {
    return (
      <div className={styles.filterTop}>
        <div className={styles.filterTitle}>{this.props.title}</div>
        <div>
          <Dropdown2 val={this.props.value} options={this.props.options} handleSelect={this.props.handleSelect} />
        </div>
      </div>
    );
  }
});

const Radio = React.createClass({
  displayName: 'Radio',

  contextTypes: {
    radioGroup: React.PropTypes.object
  },

  render: function () {
    const { name, selectedValue, onChange } = this.context.radioGroup;
    const optional = {};
    if (selectedValue !== undefined) {
      optional.checked = (this.props.value === selectedValue);
    }
    if (typeof onChange === 'function') {
      optional.onChange = onChange.bind(null, this.props.value);
    }

    return (
      <input
        {...this.props}
        type="radio"
        name={name}
        {...optional} />
    );
  }
});

const FilterText = React.createClass({
  render() {
    return (
      <div className={styles.filterTop}>
        <div className={styles.filterTitle}>{this.props.title}</div>
        <div>
          <input className={styles.searchInput} type="text" value={this.props.value} onChange={this.props.onChange} onKeyDown={this.props.onKeyDown} />
        </div>
      </div>
    );
  }
});

function Filter({ value, options, handleSelect }) {
  return (
    <div className={styles.custFilterTop}>
      <Dropdown2 val={value} options={options} handleSelect={handleSelect} custClass={styles.custDropdown} />
    </div>
  )
}

const RadioGroup = React.createClass({
  displayName: 'RadioGroup',

  propTypes: {
    name: React.PropTypes.string,
    selectedValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.bool,
    ]),
    onChange: React.PropTypes.func,
    children: React.PropTypes.node.isRequired,
    Component: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func,
      React.PropTypes.object,
    ])
  },

  getDefaultProps: function () {
    return {
      Component: "div"
    };
  },

  childContextTypes: {
    radioGroup: React.PropTypes.object
  },

  getChildContext: function () {
    const { name, selectedValue, onChange } = this.props;
    return {
      radioGroup: {
        name, selectedValue, onChange
      }
    }
  },

  render: function () {
    const { Component, name, selectedValue, onChange, children } = this.props;
    return <Component>{children}</Component>;
  }
});

export { Form, CheckBox, Filter, FilterTop, FilterTop2, FilterTopMultiple, FilterText, Input, InputWithDefault, InputWithState, Dropdown, DropdownTypeAhead, DropdownWithState, DropdownWithState2, DropdownWithState3, Textarea, TextareaWithDefault, RadioGroup, Radio };
