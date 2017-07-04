import React from 'react';
import classNaming from 'classnames';
import baseStyle from './button.scss';

const ButtonBase = React.createClass({
  render() {
    var { children, onClick, styles, type, width } = this.props;
    var btnClass = classNaming(baseStyle.btnBase, styles);

    return (
      <button className={btnClass} onClick={onClick} type={type} style={{width: width}}>{children}</button>
    );
  }
});

function ButtonAction(props) {
  return <ButtonBase {...props} styles={baseStyle.btnAction} />;
}

const ButtonWithLoading = React.createClass({
  render() {
    const {textBase, textLoading, isLoading, onClick, styles = {}, base} = this.props;
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

export { ButtonBase, ButtonAction, ButtonWithLoading };
