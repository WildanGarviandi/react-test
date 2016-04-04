import React from 'react';
import Collection from './collection';
import { Dropdown } from './dropdown';
import { Glyph } from './glyph';
import { CheckBox, Input } from './input';
import { ButtonAtRightTop, PageTitle } from './page';
import { Pagination } from './pagination';
import { Rows, Tables } from './table';
import Modal from './modal';
import classNaming from 'classnames';
import baseStyle from './index.css';

const ButtonBase = React.createClass({
  render() {
    var { children, disabled, onClick, styles, type, width } = this.props;
    var btnClass = classNaming(baseStyle.btnBase, styles);

    return (
      <button className={btnClass} onClick={onClick} type={type} style={{width: width}} disabled={disabled}>{children}</button>
    );
  }
});

export { ButtonAtRightTop, ButtonBase, CheckBox, Collection, Dropdown, Glyph, Input, Modal, PageTitle, Pagination, Rows, Tables };
