import React from 'react';
import {ButtonWithLoading} from './';
import styles from './page.css';

const PageTitle = ({title}) => {
  return (<h2 className={styles.contentTitle}>{title}</h2>);
}

const ButtonAtRightTop = ({onClick, val}) => {
  return (<ButtonWithLoading styles={{base: styles.mainBtn}} onClick={onClick}>{val}</ButtonWithLoading>);
}

const MoveButtonToTopRight = (buttons) => {
  return _.map(buttons, (button) => {
    const baseStyle = button.props.styles ?
      styles.topRightBtn + ' ' + button.props.styles.base :
      styles.topRightBtn;
    return React.cloneElement(button, {key: button.props.textBase, styles: {base: baseStyle}});
  })
}

const ClassifyChildren = (children) => {
  let buttons = [];
  let body = [];
  let backLink = [];

  React.Children.forEach(children, (child) => {
    if(!child) return;
    if(child.type.displayName == 'ButtonWithLoading') {
      buttons.push(child);
    } else if(child.type == 'a') {
      backLink.push(child);
    } else {
      body.push(child);
    }
  });

  return {body, buttons: MoveButtonToTopRight(buttons), backLink};
}

export default React.createClass({
  render() {
    const {title, children} = this.props;
    const {backLink, buttons, body} = ClassifyChildren(children);

    return (
      <div style={{position: 'relative'}}>
        {backLink}
        {buttons}
        <PageTitle title={title} />
        {body}
      </div>
    );
  }
});

export {PageTitle, ButtonAtRightTop};
