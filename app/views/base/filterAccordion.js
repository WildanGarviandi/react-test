import React from 'react';
import {ButtonBase, Glyph} from '../base';
import styles from './filterAccordion.css';

export default React.createClass({
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
    const {filterAction} = this.props;
    const IDs = _.chain(this.state.idsRaw.match(/\S+/g)).uniq().value();
    this.setState({ids: IDs});
    this.toggleOpen();
    filterAction(IDs);
  },
  clearText() {
    const {filterAction} = this.props;
    this.setState({ids: [], idsRaw: ''});
    this.toggleOpen();
    filterAction([]);
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
