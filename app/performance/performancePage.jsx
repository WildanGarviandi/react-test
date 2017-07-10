import React from 'react';
import lodash from 'lodash';
import {connect} from 'react-redux';
import {Input, Page} from '../views/base';
import * as Performance from './performanceService';
import * as InboundTrips from '../inboundTrips/inboundTripsService';
import PerformanceTable from './performanceTable';
import FleetsFetch from '../modules/drivers/actions/fleetsFetch';
import styles from './styles.scss';
import formStyles from '../components/form.scss';
import {push} from 'react-router-redux';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import config from '../config/configValues.json';

function getTimeFromSeconds(seconds) {
  let h = seconds / 3600;
  let m = seconds / 60;
  return moment.utc().hours(h).minutes(m).seconds(seconds);
}

const arrayStep = {
  pickupOrders: 0, 
  inbound: 1, 
  updateOrders: 2, 
  grouping: 3,
  outbound: 4
};

const borderStep = 0.25;

class StepLine extends React.Component {
  render() {
    const {percentage, maxIndexValue, step, stepName} = this.props;
    let styleLine;
    if (step === 'pickupOrders') {
      styleLine = styles.lineStepsLeft;
    }

    if (step === 'outbound') {
      styleLine = styles.lineStepsRight;
    }

    const tooltip = "Average Time " + stepName;

    return (
      <div style={{width: ((percentage[step] - borderStep)) + "%"}} 
        className={styleLine + ' ' + (maxIndexValue === arrayStep[step] ? styles.lineStepsRed : styles.lineStepsGreen)}>
        <ReactTooltip />
        <div className={styles.nameStep}>{(percentage[step] > 10) && stepName}</div>
      </div>
    );
  }
};

class StepBox extends React.Component {
  render() {
    const {maxIndexValue, performances, step, stepName} = this.props;
    return (
      <div className={styles.boxSteps}>
        <div className={styles.nameBoxStep}>{stepName}</div>
        <div className={styles.performanceBoxStep}>
          { maxIndexValue === arrayStep[step] &&
            <div>
              <div className={styles.ovalRed} />
              Longest
            </div>
          }
        </div>
        <div className={styles.timeBoxStep}>
          {getTimeFromSeconds(performances.total[step].averageProcessingTime).format('H')}
          <span className={styles.unitTime}>h</span>
          {getTimeFromSeconds(performances.total[step].averageProcessingTime).format('m')}
          <span className={styles.unitTime}>m</span>
          {getTimeFromSeconds(performances.total[step].averageProcessingTime).format('s')}
          <span className={styles.unitTime}>s</span>
        </div>
      </div>  
    );
  }
};

class StatBox extends React.Component {
  render() {
    const {name, value, style} = this.props;
    return (
      <div className={styles.boxStats}>
        <div className={styles.nameBoxStep}>{name}</div>
        <div className={style}>
          {getTimeFromSeconds(value).format('H')}
          <span className={styles.unitTime2}>hour(s)</span>
          {getTimeFromSeconds(value).format('m')}
          <span className={styles.unitTime2}>minute(s)</span>
          {getTimeFromSeconds(value).format('s')}
          <span className={styles.unitTime2}>second(s)</span>
        </div>
      </div>   
    );
  }
};

class PerformancePage extends React.Component {
  componentWillMount() {
    this.props.resetList();
    this.setPerformanceInterval();
  }
  setPerformanceInterval() {
    setInterval(function() {
      this.props.getList();
    }.bind(this), config.performanceInterval);
  }
  render() {
    const {performances, percentage, totalDuration, filters, maxIndexValue} = this.props;
    const startDateFormatted = moment(filters.startDate).format('MM-DD-YYYY');
    const endDateFormatted = moment(filters.endDate).format('MM-DD-YYYY');
    let dateValue = startDateFormatted + ' - ' + endDateFormatted;
    let noPerformance = lodash.isEmpty(performances) || performances.rows.length === 0;
    return (
      <div>
        <Page title="Hub Performance">
          {
            noPerformance &&
            <div className={styles.mainPerformance}>
              <div>
                <div className={styles.titlePerformance}>
                  Your Performance
                </div>
                <div className={styles.filterDateTitle}>
                  Filter By Date
                </div>
                <div className={styles.filterDate}>
                  <DateRangePicker onApply={this.props.changeDate} parentEl="#bootstrapPlaceholder" >
                      <input className={styles.dateInput} value={dateValue} type="text" />
                  </DateRangePicker>
                </div>
              </div>
              <div style={{clear: 'both'}} />
              <div className={styles.noPerformance}>
                <img className={styles.imgNoPerformance} src="/img/icon-scan-input.png" />
                <div>
                  Performance Not Available
                </div>
              </div>
            </div>
          }
          {
            !noPerformance &&
            <div className={styles.mainPerformance}>
              <div>
                <div className={styles.titlePerformance}>
                  Your Performance
                </div>
                <div className={styles.filterDateTitle}>
                  Filter By Date
                </div>
                <div className={styles.filterDate}>
                  <DateRangePicker onApply={this.props.changeDate} parentEl="#bootstrapPlaceholder" >
                      <input className={styles.dateInput} value={dateValue} type="text" />
                  </DateRangePicker>
                </div>
              </div>
              <div style={{clear: 'both'}} />
              <div>
                { percentage.pickupOrders > 0 &&
                  <StepLine percentage={percentage} maxIndexValue={maxIndexValue} step={'pickupOrders'} stepName={'Pickup Orders'} />
                }
                { percentage.inbound > 0 &&
                  <StepLine percentage={percentage} maxIndexValue={maxIndexValue} step={'inbound'} stepName={'Inbound'} />
                }
                { percentage.updateOrders > 0 &&
                  <StepLine percentage={percentage} maxIndexValue={maxIndexValue} step={'updateOrders'} stepName={'Update Orders'} />
                }
                { percentage.grouping > 0 &&
                  <StepLine percentage={percentage} maxIndexValue={maxIndexValue} step={'grouping'} stepName={'Grouping'} />
                }
                { percentage.outbound > 0 &&
                  <StepLine percentage={percentage} maxIndexValue={maxIndexValue} step={'outbound'} stepName={'Outbound'} />
                }
              </div>
              <div style={{clear: 'both'}} />
              { performances.total &&
                <div>
                  <StepBox maxIndexValue={maxIndexValue} performances={performances} step={'pickupOrders'} stepName={'Pickup Orders'} />  
                  <StepBox maxIndexValue={maxIndexValue} performances={performances} step={'inbound'} stepName={'Inbound'} />
                  <StepBox maxIndexValue={maxIndexValue} performances={performances} step={'updateOrders'} stepName={'Update Orders'} />
                  <StepBox maxIndexValue={maxIndexValue} performances={performances} step={'grouping'} stepName={'Grouping'} />
                  <StepBox maxIndexValue={maxIndexValue} performances={performances} step={'outbound'} stepName={'Outbound'} />          
                </div>
              }
              <div style={{clear: 'both'}} />
              <div className={styles.separatorLine} />
              <div className={styles.separatorBox}>
                <div>
                  <div className={styles.ovalRed} />
                  Longest
                </div>
              </div>
              { performances.total &&
                <div> 
                  <StatBox name={'Average Processing Time'} value={performances.total.totalAverage.averageProcessingTime} style={styles.timeBoxStepAverage} />  
                  <StatBox name={'Bottleneck Process'} value={performances.total.bottleNeck.averageProcessingTime} style={styles.timeBoxStepBottleneck} />
                </div>
              }
              <div style={{clear: 'both'}} />
              <div className={styles.mainTable}>
                <PerformanceTable key={this.props.lastPath} lastPath={this.props.lastPath} />
              </div>
            </div>
          }
        </Page>
      </div>
    );
  }
};

function StateToProps(state, ownProps) {
  const routes = ownProps.routes;
  const paths = routes[routes.length-1].path.split('/');
  const lastPath = paths[paths.length-1];
  const {inboundTrips, performance} = state.app;
  const {total, isFetching} = inboundTrips;
  const {performances, filters} = performance;
  let percentage = {};
  let totalDuration = 0;

  if (performances.total) {
    totalDuration = performances.total.pickupOrders.averageProcessingTime +
      performances.total.inbound.averageProcessingTime +
      performances.total.updateOrders.averageProcessingTime +
      performances.total.grouping.averageProcessingTime +
      performances.total.outbound.averageProcessingTime;
    percentage.pickupOrders = (performances.total.pickupOrders.averageProcessingTime / totalDuration) * 100;
    percentage.inbound = (performances.total.inbound.averageProcessingTime / totalDuration) * 100;
    percentage.updateOrders = (performances.total.updateOrders.averageProcessingTime / totalDuration) * 100;
    percentage.grouping = (performances.total.grouping.averageProcessingTime / totalDuration) * 100;
    percentage.outbound = (performances.total.outbound.averageProcessingTime / totalDuration) * 100;
  }

  let perfValue = Object.values(percentage);
  let maxIndexValue = perfValue.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

  return {
    lastPath,
    total,
    isFetching,
    performances,
    percentage,
    totalDuration,
    filters,
    maxIndexValue
  };
};

function DispatchToPage(dispatch) {
  return {
    getList: () => {
      dispatch(Performance.FetchList());
    },
    changeDate: (event, picker) => {
      dispatch(Performance.ChangeDate(picker.startDate, picker.endDate));
    },
    resetList: () => {
      dispatch(Performance.ResetDate());
    }
  }
}

export default connect(StateToProps, DispatchToPage)(PerformancePage);
