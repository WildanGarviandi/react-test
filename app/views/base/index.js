import React from 'react';
import Collection from './collection';
import { Dropdown } from './dropdown';
import { Glyph } from './glyph';
import { CheckBox, Input } from './input';
import Page, { ButtonAtRightTop, PageTitle } from './page';
import { Pagination } from './pagination';
import { Rows, Tables } from './table';
import Modal from './modal';
import classNaming from 'classnames';
import baseStyle from './index.css';

const ButtonBase = React.createClass({
  render() {
    var { children, onClick, styles, type, width } = this.props;
    var btnClass = classNaming(baseStyle.btnBase, styles);

    return (
      <button className={btnClass} onClick={onClick} type={type} style={{width: width}}>{children}</button>
    );
  }
});

const ButtonAction = React.createClass({
  render() {
    var { children, onClick, styles, type, width } = this.props;
    var btnClass = classNaming(baseStyle.btnAction, styles);

    return (
      <button className={btnClass} onClick={onClick} type={type} style={{width: width}}>{children}</button>
    );
  }
});

const ButtonWithLoading = React.createClass({
  render() {
    const {textBase, textLoading, isLoading, onClick, styles, base} = this.props;
    const btnClass = classNaming(baseStyle.btnBase, {[baseStyle.loading]: isLoading}, styles.base);
    const spinnerClass = classNaming(baseStyle.spinner, styles.spinner);

    if(isLoading) {
      return (
        <button {...base} disabled className={btnClass}>
          <span className={spinnerClass}>{textLoading}</span>
        </button>);
    }

    return (
      <button {...base} className={btnClass} onClick={onClick}>{textBase}</button>
    );
  }
})

export { ButtonAtRightTop, ButtonBase, ButtonAction, ButtonWithLoading, CheckBox, Collection, Dropdown, Glyph, Input, Modal, Page, PageTitle, Pagination, Rows, Tables };
