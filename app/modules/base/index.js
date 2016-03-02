import React from 'react';
import styles from './index.css';
import { Dropdown } from './dropdown';
import { Glyph } from './glyph';
import { InputText, InputPassword } from './input';
import { Pagination } from './pagination';
import { Tables, TableComponent } from './table';
import Modal from './modal';

var classNames = require('classnames/bind').bind(styles);

const CheckBox = React.createClass({
  handleClick(e) {
    let { onClick } = this.props;
    if(!onClick) return;
    onClick(e.target.checked);
  },
  render() {
    let { checked } = this.props;

    return (
      <input type="checkbox" checked={checked} onClick={this.handleClick} />
    );
  }
});

const ButtonBase = React.createClass({
  render() {
    var { children, className, onClick, type } = this.props;
    var btnClass = classNames('btnBase', className);

    return (
      <button className={btnClass} onClick={onClick} type={type}>{children}</button>
    );
  }
});

export { ButtonBase, CheckBox, Dropdown, Glyph, InputPassword, InputText, Modal, Pagination, Tables, TableComponent };
