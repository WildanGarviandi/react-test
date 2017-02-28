import React from 'react';
import Collection from './collection';
import { Dropdown, DropdownTypeAhead, DropdownWithState } from './dropdown';
import { Glyph } from './glyph';
import Infograph from './infograph';
import { CheckBox, Input, InputWithDefault, InputWithDefaultNumberFormatted } from './input';
import ModalMessage from './modalMessage';
import Page, { ButtonAtRightTop, PageTitle } from './page';
import { Pagination } from './pagination';
import { Rows, Tables } from './table';
import Modal from './modal';
import NotificationContainer from './notification';
import classNaming from 'classnames';
import baseStyle from './index.css';

const ButtonBase = React.createClass({
  render() {
    var { children, onClick, styles, type, width, onKeyDown } = this.props;
    var btnClass = classNaming(baseStyle.btnBase, styles);

    return (
      <input className={btnClass} onClick={onClick} type="submit" style={{width: width}} value={children} onKeyDown={onKeyDown} />
    );
  }
});

function ButtonAction(props) {
  return <ButtonBase {...props} styles={baseStyle.btnAction} />;
}

const ButtonWithLoading = React.createClass({
  render() {
    const {textBase, textLoading, isLoading, onClick, styles = {}, base, disabled} = this.props;
    const btnClass = classNaming(baseStyle.btnBase, {[baseStyle.loading]: isLoading}, styles.base);
    const spinnerClass = classNaming(baseStyle.spinner, styles.spinner);

    if(isLoading) {
      return (
        <button {...base} disabled className={btnClass}>
          <span className={spinnerClass}>{textLoading}</span>
        </button>);
    }

    return (
      <button {...base} className={btnClass} onClick={onClick} disabled={disabled}>{textBase}</button>
    );
  }
})

const ButtonStandard = React.createClass({
  render() {
    const {textBase, textLoading, isLoading, onClick, styles = {}, base, urlImage} = this.props;
    const btnClass = classNaming(baseStyle.btnBase, {[baseStyle.loading]: isLoading}, styles.base);

    return (
      <button {...base} className={btnClass} onClick={onClick}>
        { urlImage &&
          <img src={urlImage} className={baseStyle.buttonImage} />
        }
        <span className={baseStyle.buttonTitle}>
          {textBase}
        </span>
      </button>
    );
  }
})

const EmptySpace = React.createClass({
  render() {
    return (
      <div style={{height: this.props.height, clear: 'both'}}></div>
    );
  }
})

export { ButtonAtRightTop, ButtonBase, ButtonAction, ButtonWithLoading, ButtonStandard, CheckBox, Collection, Dropdown, DropdownTypeAhead, DropdownWithState, Glyph, Infograph, Input, InputWithDefault, InputWithDefaultNumberFormatted, Modal, ModalMessage, Page, PageTitle, Pagination, Rows, Tables, NotificationContainer, EmptySpace };