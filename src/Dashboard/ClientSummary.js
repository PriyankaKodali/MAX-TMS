import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config.js';
import { HashRouter } from 'react-router-dom';
import { withRouter } from "react-router-dom";

var moment = require('moment');

class ClientSummary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ClientSummary: [], IsDataAvailable: false, EmpId: ''
        }
    }
    componentWillMount() {
        var empId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? '' : sessionStorage.getItem("EmpId");
        // $.ajax({
        //     url: ApiUrl + "/api/Reports/GetDashBoardData?empId=" + empId,
        //     type: "get",
        //     success: (data) => {
        //         this.setState({
        //            IsDataAvailable: true,
        //             EmpId: empId
        //         })
        //     }
        // })
        this.setState({ ClientSummary: this.props.ClientSummary, IsDataAvailable: true, EmpId: empId })
    }

    componentWillReceiveProps(nextProps) {
        var empId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? '' : sessionStorage.getItem("EmpId");
        this.setState({ ClientSummary: nextProps.ClientSummary, IsDataAvailable: true, EmpId: empId })
    }

    render() {
        return (
            <div>
                {
                    this.state.IsDataAvailable ?
                        this.state.ClientSummary.length > 0 ?
                            <div className="col-xs-12 table-responsive globalTable mTop1">
                                <div className="clientReportHeading">  Client Report </div>
                                <table className="table table-hover table-bordered empDashboard">
                                    <thead  >
                                        <tr>
                                            <td rowSpan="2" className="tdName pTop16" > <b>Client</b>  </td>
                                            <td className="tdOpen" colSpan="4"> <b> Open </b> </td>
                                            <td className="tdReopen" colSpan="4"> <b>Reopened</b> </td>
                                            <td className="tdPending" colSpan="4"> <b>Pending</b> </td>
                                            <td className="tdInProcess" colSpan="4" > <b>InProcess</b>  </td>
                                            <td className="tdResolved" colSpan="4"> <b>Resolved</b> </td>
                                            <td className="tdClosed" colSpan="4"> <b>Closed </b> </td>
                                        </tr>
                                        <tr className="theadRow">
                                            <td > Week </td>
                                            <td > Month </td>
                                            <td > Others </td>
                                            <td > Total </td>

                                            <td > Week</td>
                                            <td > Month</td>
                                            <td > Others</td>
                                            <td > Total</td>

                                            <td  >Week</td>
                                            <td  >Month</td>
                                            <td >Others</td>
                                            <td  >Total</td>

                                            <td >Week</td>
                                            <td >Month</td>
                                            <td >Others</td>
                                            <td >Total</td>

                                            <td >Week</td>
                                            <td >Month</td>
                                            <td >Others</td>
                                            <td >Total</td>

                                            <td >Week</td>
                                            <td >Month</td>
                                            <td >Others</td>
                                            <td className="tdTotal" >Total</td>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.ClientSummary.map((ele, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td className="tleft">  <small className="tleft"> {ele["ClientName"]} </small>   </td>
                                                        <td className="tdOpen" onClick={() => { this.getActivitesOfWeek(ele["ClientId"], 'Open') }} >{ele["CurWeekOpen"]}</td>
                                                        <td className="tdOpen" onClick={() => { this.getActivitiesOfMonth(ele["ClientId"], 'Open') }} >{ele["CurMonthOpen"]}</td>
                                                        <td className="tdOpen" onClick={() => { this.getOtherActivities(ele["ClientId"], 'Open') }} >{ele["StatusOpen"] - ele["CurMonthOpen"]}</td>
                                                        <td className="tdOpen" onClick={() => { this.getTotalActivities(ele["ClientId"], 'Open') }} >{ele["StatusOpen"]}</td>

                                                        <td className="tdReopen" onClick={() => { this.getActivitesOfWeek(ele["ClientId"], 'Reopened') }} >{ele["CurWeekReopened"]}</td>
                                                        <td className="tdReopen" onClick={() => { this.getActivitesOfMonth(ele["ClientId"], 'Reopened') }} >{ele["CurMonthReopened"]}</td>
                                                        <td className="tdReopen" onClick={() => { this.getOtherActivities(ele["ClientId"], 'Reopened') }} >{ele["Reopened"] - ele["CurMonthReopened"]}</td>
                                                        <td className="tdReopen" onClick={() => { this.getTotalActivities(ele["ClientId"], 'Reopened') }} >{ele["Reopened"]}</td>

                                                        <td className="tdPending" onClick={() => { this.getActivitesOfWeek(ele["ClientId"], 'Pending') }} >{ele["CurWeekPending"]}</td>
                                                        <td className="tdPending" onClick={() => { this.getActivitiesOfMonth(ele["ClientId"], 'Pending') }}>{ele["CurMonthPending"]}</td>
                                                        <td className="tdPending" onClick={() => { this.getOtherActivities(ele["ClientId"], 'Pending') }}>{ele["Pending"] - ele["CurMonthPending"]}</td>
                                                        <td className="tdPending" onClick={() => { this.getTotalActivities(ele["ClientId"], 'Pending') }}>{ele["Pending"]}</td>

                                                        <td className="tdInProcess" onClick={() => { this.getActivitesOfWeek(ele["ClientId"], 'InProcess') }}  >{ele["CurWeekInProcess"]}</td>
                                                        <td className="tdInProcess" onClick={() => { this.getActivitiesOfMonth(ele["ClientId"], 'InProcess') }} >{ele["CurMonthInProcess"]}</td>
                                                        <td className="tdInProcess" onClick={() => { this.getOtherActivities(ele["ClientId"], 'InProcess') }} >{ele["InProcess"] - ele["CurMonthInProcess"]}</td>
                                                        <td className="tdInProcess" onClick={() => { this.getTotalActivities(ele["ClientId"], 'InProcess') }}>{ele["InProcess"]}</td>

                                                        <td className="tdResolved" onClick={() => { this.getActivitesOfWeek(ele["ClientId"], 'Resolved') }} >{ele["CurWeekResolved"]}</td>
                                                        <td className="tdResolved" onClick={() => { this.getActivitesOfMonth(ele["ClientId"], 'Resolved') }} >{ele["CurMonthResolved"]}</td>
                                                        <td className="tdResolved" onClick={() => { this.getOtherActivities(ele["ClientId"], 'Resolved') }} >{ele["Resolved"] - ele["CurMonthResolved"]}</td>
                                                        <td className="tdResolved" onClick={() => { this.getTotalActivities(ele["ClientId"], 'Resolved') }} >{ele["Resolved"]}</td>

                                                        <td className="tdClosed" onClick={() => { this.getActivitesOfWeek(ele["ClientId"], 'Closed') }} >{ele["CurWeekClosed"]}</td>
                                                        <td className="tdClosed" onClick={() => { this.getActivitesOfMonth(ele["ClientId"], 'Closed') }}>{ele["CurMonthClosed"]}</td>
                                                        <td className="tdClosed" onClick={() => { this.getOtherActivities(ele["ClientId"], 'Closed') }}>{ele["Closed"] - ele["CurWeekClosed"]}</td>
                                                        <td className="tdClosed" onClick={() => { this.getTotalActivities(ele["ClientId"], 'Closed') }} > {ele["Closed"]}</td>

                                                        {/* <td > {ele["Total"]}</td> */}
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            :
                            <div />
                        :
                        <div className="loader visible" style={{ marginTop: '25%' }}></div>
                }
            </div>
        )
    }
    getActivitesOfWeek(clientId, status) {
        this.props.history.push({
            state: {
                status: status,
                empId: this.state.EmpId,
                clientId: clientId,
                fromDate: moment().startOf('week').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

    getActivitiesOfMonth(clientId, status) {
        this.props.history.push({
            state: {
                status: status,
                empId: this.state.EmpId,
                clientId: clientId,
                fromDate: moment().startOf('month').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

    getOtherActivities(clientId, status) {
        this.props.history.push({
            state: {
                status: status,
                empId: this.state.EmpId,
                clientId: clientId,
                fromDate: '',
                toDate: moment().startOf('month').format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }


    getTotalActivities(clientId, status) {
        this.props.history.push({
            state: {
                status: status,
                empId: this.state.EmpId,
                clientId: clientId,
                fromDate: '',
                toDate: '',
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }
}

export default withRouter(ClientSummary);