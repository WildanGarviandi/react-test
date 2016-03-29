import React from 'react';
import styles from './index.css';
import { Dropdown } from './dropdown';
import { Glyph } from './glyph';
import { InputText, InputPassword } from './input';
import { ButtonAtRightTop, PageTitle } from './page';
import { Pagination } from './pagination';
import { Rows, Tables } from './table';
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
      <span>
        <input type="checkbox" checked={checked} onClick={this.handleClick} id={'rememberMe'} />
        <label htmlFor={'rememberMe'}>Keep me logged in</label>
      </span>
    );
  }
});

const ButtonBase = React.createClass({
  render() {
    var { children, className, onClick, type, width } = this.props;
    var btnClass = classNames('btnBase', className);

    return (
      <button className={btnClass} onClick={onClick} type={type} style={{width: width}}>{children}</button>
    );
  }
});

export { ButtonAtRightTop, ButtonBase, CheckBox, Dropdown, Glyph, InputPassword, InputText, Modal, PageTitle, Pagination, Rows, Tables };
