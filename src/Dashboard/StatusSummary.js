import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config.js';
import { withRouter } from "react-router-dom";

var moment = require('moment');

class StatusSummary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            StatusSummary: [], EmpId: ''
        }
    }

    componentWillMount() {
        this.setState({ StatusSummary: this.props.StatusSummary })
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ StatusSummary: nextProps.StatusSummary })
    }

    render() {
        return (
            <div>
                <div className="col-xs-12 reportHeading"> Status Summary </div>
                {
                    this.state.StatusSummary.length > 0 ?
                        <table className="table table-condensed table-bordered headertable" >
                            <tbody>
                                <tr>
                                    <th > Status </th>
                                    <th className="alignRight"> Week </th>
                                    <th className="alignRight"> Month </th>
                                    <th className="alignRight"> Others </th>
                                    <th className="alignRight"> Total </th>
                                </tr>
                                <tr className="tdOpen">
                                    <th style={{ backgroundColor: '#f7e7e7' }}>Open</th>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitesOfWeek('Open') }}> {this.state.StatusSummary[0].OpenCurWeek} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitiesOfMonth('Open') }}> {this.state.StatusSummary[0].OpenCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getOtherActivities('Open') }}> {this.state.StatusSummary[0].StatusOpen - this.state.StatusSummary[0].OpenCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getTotalActivities('Open') }}> {this.state.StatusSummary[0].StatusOpen} </td>
                                </tr>

                                <tr className="tdOpen">
                                    <th style={{ backgroundColor: '#f7e7e7' }}>Reopened </th>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitesOfWeek('Reopened') }}> {this.state.StatusSummary[0].ReopenedCurWeek} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitiesOfMonth('Reopened') }}> {this.state.StatusSummary[0].ReopenedCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getOtherActivities('Reopened') }}> {this.state.StatusSummary[0].Reopened - this.state.StatusSummary[0].ReopenedCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getTotalActivities('Reopened') }}> {this.state.StatusSummary[0].Reopened} </td>
                                </tr>

                                <tr className="tdPending">
                                    <th style={{ backgroundColor: ' #f3f1d0' }}>Pending </th>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitesOfWeek('Pending') }}> {this.state.StatusSummary[0].PendingCurWeek} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitiesOfMonth('Pending') }}> {this.state.StatusSummary[0].PendingCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getOtherActivities('Pending') }}> {this.state.StatusSummary[0].Pending - this.state.StatusSummary[0].PendingCurMonth - this.state.StatusSummary[0].PendingCurWeek} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getTotalActivities('Pending') }}> {this.state.StatusSummary[0].Pending} </td>
                                </tr>

                                <tr className="tdPending">
                                    <th style={{ backgroundColor: ' #f3f1d0' }}> In Process</th>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitesOfWeek('InProcess') }}> {this.state.StatusSummary[0].InProcessCurWeek} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitiesOfMonth('InProcess') }}> {this.state.StatusSummary[0].InProcessCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getOtherActivities('InProcess') }}> {this.state.StatusSummary[0].InProcess - this.state.StatusSummary[0].InProcessCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getTotalActivities('InProcess') }}> {this.state.StatusSummary[0].InProcess} </td>
                                </tr>

                                <tr className="tdResolved">
                                    <th style={{ backgroundColor: '#d8f1e3' }}>Resolved</th>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitesOfWeek('Resolved') }}> {this.state.StatusSummary[0].ResolvedCurWeek} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitiesOfMonth('Resolved') }} > {this.state.StatusSummary[0].ResolvedCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getOtherActivities('Resolved') }}> {this.state.StatusSummary[0].Resolved - this.state.StatusSummary[0].ResolvedCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getTotalActivities('Resolved') }} > {this.state.StatusSummary[0].Resolved} </td>
                                </tr>

                                <tr className="tdClosed">
                                    <th style={{ backgroundColor: '#c1f1d6' }}>Closed</th>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitesOfWeek('Closed') }}> {this.state.StatusSummary[0].ClosedCurWeek} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getActivitiesOfMonth('Closed') }}> {this.state.StatusSummary[0].ClosedCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getOtherActivities('Closed') }}> {this.state.StatusSummary[0].Closed - this.state.StatusSummary[0].ClosedCurMonth} </td>
                                    <td className="pointer alignRight" onClick={() => { this.getTotalActivities('Closed') }}> {this.state.StatusSummary[0].Closed} </td>
                                </tr>
                                <tr>
                                    <th colSpan="4" className="alignRight"> Total</th>
                                    <td colSpan="5" className="pointer alignRight" onClick={() => { this.getActivitiesReport() }}>{this.state.StatusSummary[0].Total}  </td>
                                </tr>
                            </tbody>
                        </table>
                        :
                        <div />
                }

            </div>
        )
    }

    getActivitesOfWeek(status) {
        this.props.history.push({
            state: {
                status: status,
                empId: this.state.EmpId,
                clientId: '',
                fromDate: moment().startOf('week').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

    getActivitiesOfMonth(status) {
        this.props.history.push({
            state: {
                status: status,
                empId: this.state.EmpId,
                clientId: '',
                fromDate: moment().startOf('month').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

    getOtherActivities(status) {
        this.props.history.push({
            state: {
                status: status,
                empId: this.state.EmpId,
                clientId: '',
                fromDate: '',
                toDate: moment().startOf('month').format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }


    getTotalActivities(status) {
        this.props.history.push({
            state: {
                status: status,
                empId: this.state.EmpId,
                clientId: '',
                fromDate: '',
                toDate: '',
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

    getActivitiesReport() {
        this.props.history.push({
            state: {
                status: 'ALL',
                empId: '',
                clientId: '',
                fromDate: '',
                toDate: '',
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

}

export default withRouter(StatusSummary)