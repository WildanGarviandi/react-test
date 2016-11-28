import classNaming from 'classnames';
import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import * as Hubs from '../../modules/hubs/actions';
import {ButtonBase, ButtonWithLoading} from '../base';
import {DropdownWithState} from '../base/dropdown';
import styles from './styles.css';

const HubSetter = React.createClass({
  componentWillMount() {
    this.props.FetchList();
  },
  getInitialState() {
    return {selected: {}};
  },
  selectHub(val) {
    this.setState({selected: val});
  },
  pickHub() {
    this.props.SetHub(this.state.selected.key || this.props.nextHubID);
  },
  stopEdit() {
    this.props.EndEdit();
  },
  toEdit() {
    this.props.StartEdit();
  },
  hubSet() {

  },
  render() {
    const {hubs, isEditing, isFetching, isUpdating, nextHub} = this.props;

    return (
      <div>
        <span>Next Hub : </span>
        {
          isFetching &&
          <span>Fetching Hub List...</span>
        }
        {
          !isFetching &&
          <span>
            {
              !isEditing && nextHub &&
              <span>{nextHub}</span>
            }
            {
              !isEditing && nextHub &&
              <div className={classNaming(styles.buttonWrapper)}>
                <ButtonBase onClick={this.toEdit} styles={styles.driverBtn}>Change Destination</ButtonBase>
              </div>
            }
            {
              isEditing &&
              <span className={classNaming(styles.districtsWrapper)}>
                <DropdownWithState options={hubs} handleSelect={this.selectHub} initialValue={nextHub} />
              </span>
            }
            {
              isEditing &&
              <div className={classNaming(styles.buttonWrapper)}>
                <ButtonWithLoading textBase="Set as Destination" textLoading="Setting Destination" onClick={this.pickHub} isLoading={isUpdating} styles={{base: styles.normalBtn}} />
              </div>
            }
            {
              isEditing && nextHub &&
              <div className={classNaming(styles.buttonWrapper)}>
                <ButtonBase onClick={this.stopEdit} styles={styles.driverBtn}>Cancel</ButtonBase>
              </div>
            }
          </span>
        }
      </div>
    );
  }
});

function mapState(state, ownParams) {
  const {hubs} = state.app;
  const {isEditing, isFetching, isUpdating, list} = hubs;
  const {trip} = ownParams;

  const nextHub = trip.DestinationHub && trip.DestinationHub.Name;
  const nextHubID = trip.DestinationHub && trip.DestinationHub.HubID;

  return {
    isEditing: isEditing || !nextHub,
    isFetching,
    isUpdating,
    hubs: lodash.map(list, (hub) => {
      return {key: hub.HubID, value: hub.Name};
    }),
    nextHub,
    nextHubID
  }
}

function mapDispatch(dispatch, ownParams) {
  return {
    FetchList: () => {
      dispatch(Hubs.fetchList());
    },
    SetHub: (hubID) => {
      dispatch(Hubs.setHub(ownParams.trip.TripID, hubID));
    },
    StartEdit: (hubID) => {
      dispatch(Hubs.startEdit());
    },
    EndEdit: (hubID) => {
      dispatch(Hubs.endEdit());
    }
  }
}

export default connect(mapState, mapDispatch)(HubSetter);
