import React, { PureComponent } from 'react';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';

import classNames from 'classnames';
import PropTypes from 'prop-types';

import styles from './styles.scss';

class Confirmation extends PureComponent {
  render() {
    const {
      icon,
      title,
      desc,
      children,
      closeModal,
      titleStyles,
      descStyles,
      footerStyles,
      modalStyles,
      headerStyles,
    } = this.props;

    const newTitleStyles = classNames(styles.title, titleStyles);
    const newDescStyles = classNames(styles.desc, descStyles);
    const newFooterStyles = classNames(styles['modal-footer'], footerStyles);
    const newHeaderStyles = classNames(styles['modal-header'], headerStyles);
    return (
      <ModalContainer onClose={closeModal}>
        <ModalDialog onClose={closeModal} className={modalStyles}>
          <div className={newHeaderStyles}>
            <img src={icon} alt="img" />
            <div className={newTitleStyles}>
              {title}
            </div>
            <div className={newDescStyles}>
              {desc}
            </div>
          </div>
          <div className={newFooterStyles}>
            {children}
          </div>
        </ModalDialog>
      </ModalContainer>
    );
  }
}

/* eslint-disable */
Confirmation.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.any,
  desc: PropTypes.any,
  children: PropTypes.any,
  closeModal: PropTypes.func,
  titleStyles: PropTypes.any,
  descStyles: PropTypes.any,
  footerStyles: PropTypes.any,
  modalStyles: PropTypes.any,
  headerStyles: PropTypes.any,
};
/* eslint-enable */

Confirmation.defaultProps = {
  icon: '',
  title: '',
  desc: '',
  children: null,
  closeModal: () => {},
  titleStyles: {},
  descStyles: {},
  footerStyles: {},
  modalStyles: '',
  headerStyles: {},
};

export default Confirmation;
