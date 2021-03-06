import React from 'react';
import { ButtonWithLoading } from './Button';
import styles from './page.scss';

const PageTitle = ({ additional, title }) => {
  return (
    <span>
      <h2 className={styles.contentTitle}>{title}</h2>
      {additional && <h3 className={styles.additionalTitle}><em>-- {additional}</em></h3>}
    </span>
  );
}

const ButtonAtRightTop = ({ onClick, val }) => {
  return (<ButtonWithLoading styles={{ base: styles.mainBtn }} onClick={onClick}>{val}</ButtonWithLoading>);
}

const MoveButtonToTopRight = (buttons) => {
  return _.map(buttons, (button) => {
    const baseStyle = button.props.styles ?
      styles.topRightBtn + ' ' + button.props.styles.base :
      styles.topRightBtn;
    return React.cloneElement(button, { key: button.props.textBase, styles: { base: baseStyle } });
  })
}

const ClassifyChildren = (children) => {
  let buttons = [];
  let body = [];
  let backLink = [];

  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (child.type.displayName == 'ButtonWithLoading') {
      buttons.push(child);
    } else if (child.type == 'a') {
      backLink.push(React.cloneElement(child, { key: backLink.length, style: { marginBottom: 10, display: "block" } }));
    } else {
      body.push(child);
    }
  });

  return { body, buttons: MoveButtonToTopRight(buttons), backLink };
}

const Page = React.createClass({
  render() {
    const { title, children, additional } = this.props;
    const { backLink, buttons, body } = ClassifyChildren(children);

    return (
      <div style={{ position: 'relative' }}>
        {backLink}
        {buttons}
        <PageTitle title={title} additional={additional} />
        {body}
      </div>
    );
  }
});

export { Page, PageTitle, ButtonAtRightTop };
