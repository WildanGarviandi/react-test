import React from 'react';
import {connect} from 'react-redux';
import ordersPrepareIDs from '../../modules/containers/actions/ordersPrepareIDs';
import {ButtonBase, Glyph} from '../base';
import styles from './accordion.scss';

const Filter = React.createClass({
  getInitialState() {
    return {opened: true, idsRaw: '', ids: [], idsStart: ''};
  },
  toggleOpen() {
    this.setState({opened: !this.state.opened, idsStart: this.state.idsRaw});
  },
  cancelChange() {
    this.setState({opened: true, idsRaw: this.state.idsStart});
  },
  textChange(e) {
    this.setState({idsRaw: e.target.value});
  },
  processText() {
    const {ordersPrepareIDs} = this.props;
    const IDs = _.chain(this.state.idsRaw.match(/\S+/g)).uniq().value();
    this.setState({ids: IDs});
    this.toggleOpen();
    ordersPrepareIDs(IDs);
  },
  clearText() {
    const {ordersPrepareIDs} = this.props;
    this.setState({ids: [], idsRaw: ''});
    this.toggleOpen();
    ordersPrepareIDs([]);
  },
  render() {
    const {opened, idsRaw, ids} = this.state;
    return (
      <div style={{marginBottom: 15}}>
      {
        opened ? 
        <div className={styles.top2} onClick={this.toggleOpen}>
          <h4 className={styles.title}>
            <Glyph name='chevron-down' className={styles.glyph} />
            {'Filter Order (' + ids.length + ' keywords)'}
          </h4>
        </div> :
        <div className={styles.panel}>
          <div className={styles.top} onClick={this.toggleOpen}>
            <h4 className={styles.title}>
              <Glyph name='chevron-up' className={styles.glyph} />
              {'Web Order ID or User Order Number:'}
            </h4>
          </div>
          <div className={styles.bottom}>
            <textarea style={{height: 100, width: '100%'}} value={idsRaw} onChange={this.textChange} placeholder={'Write/Paste EDS Number or Order ID here, separated with newline'} />
            <ButtonBase styles={styles.modalBtn} onClick={this.processText}>Filter</ButtonBase>
            <a href="javascript:;" className={styles.modalLink} onClick={this.cancelChange}>Cancel</a>
            <a href="javascript:;" className={styles.modalLink} onClick={this.clearText}>Clear</a>
          </div>
        </div>
      }
      </div>
    );
  }
});

const Dispatch = (dispatch) => {
  return {
    ordersPrepareIDs: function(ids) {
      dispatch(ordersPrepareIDs(ids));
    },
  }
}

export default connect(undefined, Dispatch)(Filter);
