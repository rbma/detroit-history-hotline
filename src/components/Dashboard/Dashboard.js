//-----------------------------------------
//
// Main Dashboard
//
//-----------------------------------------
import React, { Component } from 'react';
import classNames from 'classnames';
import CallTable from './CallTable/CallTable';
import Radio from './Radio/Radio';
import './Dashboard.css';

export default class Dashboard extends Component {
  componentDidMount() {
    this.props.setFlash();
  }
  render() {
    const { bootFinished, data, handleMouseEnter, lastVisit } = this.props;

    const cx = classNames({
      Dashboard: true,
      active: bootFinished
    });

    return (
      <div className={cx}>
        <div className="Dashboard__flex">
          <div className="Dashboard__col">
            <CallTable
              calls={data.calls.slice(0, 10)}
              handleMouseEnter={handleMouseEnter}
            />
          </div>
          <div className="Dashboard__col col__r">
            <CallTable
              right={true}
              calls={data.calls.slice(9)}
              handleMouseEnter={handleMouseEnter}
            />
          </div>
        </div>
      </div>
    );
  }
}