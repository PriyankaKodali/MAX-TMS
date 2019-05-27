import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config.js';
import SendNotification from './SendNotification';
import { withRouter } from "react-router-dom";

var moment = require('moment');

class EmployeeSummary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            EmployeesSummary: [], SendNotification: false, IsEmpReportAvailable: false
        }
    }

    componentWillMount() {
        this.setState({ EmployeesSummary: this.props.EmployeesSummary, IsEmpReportAvailable: true })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ EmployeesSummary: nextProps.EmployeesSummary, IsEmpReportAvailable: true })
    }

    render() {
        return (
            <div>
                {
                    this.state.IsEmpReportAvailable ?
                        <div className="col-xs-12  table-responsive globalTable mTop1">
                            <div className="reportHeading">  Employees Report </div>
                            <table className="table table-hover table-bordered empDashboard" style={{ backgroundColor: 'none' }}>
                                <thead>
                                    <tr>
                                        <td rowSpan="2" className="tdName pTop16"> <b> Employee  </b> </td>
                                        <td className="tdOpen" colSpan="4"> <b> Open </b> </td>
                                        <td colSpan="4" className="tdReopen"> <b>Reopened</b> </td>
                                        <td className="tdPending" colSpan="4"> <b>Pending</b> </td>

                                        <td className="tdInProcess" colSpan="4" > <b>InProcess</b>  </td>
                                        <td className="tdResolved" colSpan="4"> <b>Resolved</b> </td>
                                        <td className="tdClosed" colSpan="4"> <b>Closed </b> </td>
                                        <td rowSpan="2" className="pTop16"> <b>Total</b> </td>
                                    </tr>
                                    <tr className="theadRow">
                                        <td  >Week</td>
                                        <td  >Month</td>
                                        <td   >Others</td>
                                        <td  >Total</td>

                                        <td  >Week</td>
                                        <td  >Month</td>
                                        <td >Others</td>
                                        <td  >Total</td>

                                        <td  >Week</td>
                                        <td  >Month</td>
                                        <td >Others</td>
                                        <td  >Total</td>

                                        <td  >Week</td>
                                        <td >Month</td>
                                        <td >Others</td>
                                        <td >Total</td>

                                        <td  >Week</td>
                                        <td  >Month</td>
                                        <td >Others</td>
                                        <td  >Total</td>

                                        <td  >Week</td>
                                        <td  >Month</td>
                                        <td >Others</td>
                                        <td  >Total</td>

                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.EmployeesSummary.map((ele, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td className={"tleft " + (ele["UnUpdatedTasks"] > 0 ? "bgRed" : "")}  >
                                                        <small className="tleft"> {ele["Employee"]} </small>
                                                        <small style={{ float: 'right' }}> <i className="material-icons msgIcon tdIcon" onClick={() => { this.handleNotify(ele["EmpId"]) }}>&#xe0c9;</i></small>
                                                        <p className="lastAct">
                                                            {
                                                                ele["LastActivityTime"] != null ?
                                                                    moment(ele["LastActivityTime"]).format("DD-MMM-YYYY h:mm a")
                                                                    :
                                                                    ""
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="tdOpen" onClick={() => { this.getActivitesOfWeek(ele["EmpId"], 'Open') }} >{ele["CurWeekOpen"]}</td>
                                                    <td className="tdOpen" onClick={() => { this.getActivitiesOfMonth(ele["EmpId"], 'Open') }} >{ele["CurMonthOpen"]}</td>
                                                    <td className="tdOpen" onClick={() => { this.getOtherActivities(ele["EmpId"], 'Open') }} > {ele["StatusOpen"] - ele["CurMonthOpen"]} </td>
                                                    <td className="tdOpen" onClick={() => { this.getTotalActivities(ele["EmpId"], 'Open') }}>{ele["StatusOpen"]}</td>

                                                    <td className="tdReopen" onClick={() => { this.getActivitesOfWeek(ele["EmpId"], 'Reopened') }} >{ele["CurWeekReopened"]}</td>
                                                    <td className="tdReopen" onClick={() => { this.getActivitiesOfMonth(ele["EmpId"], 'Reopened') }}>{ele["CurMonthReopened"]}</td>
                                                    <td className="tdReopen" onClick={() => { this.getOtherActivities(ele["EmpId"], 'Reopened') }}>{ele["Reopened"] - ele["CurMonthReopened"]}</td>
                                                    <td className="tdReopen" onClick={() => { this.getTotalActivities(ele["EmpId"], 'Reopened') }} > {ele["Reopened"]}</td>

                                                    <td className="tdPending" onClick={() => { this.getActivitesOfWeek(ele["EmpId"], 'Pending') }} >{ele["CurWeekPending"]}</td>
                                                    <td className="tdPending" onClick={() => { this.getActivitiesOfMonth(ele["EmpId"], 'Pending') }}>{ele["CurMonthPending"]}</td>
                                                    <td className="tdPending" onClick={() => { this.getOtherActivities(ele["EmpId"], 'Pending') }}>{ele["Pending"] - ele["CurMonthPending"]}</td>
                                                    <td className="tdPending" onClick={() => { this.getTotalActivities(ele["EmpId"], 'Pending') }} > {ele["Pending"]}</td>

                                                    <td className="tdInProcess" onClick={() => { this.getActivitesOfWeek(ele["EmpId"], 'InProcess') }} > {ele["CurWeekInprocess"]}</td>
                                                    <td className="tdInProcess" onClick={() => { this.getActivitiesOfMonth(ele["EmpId"], 'InProcess') }} > {ele["CurMonthInProcess"]}</td>
                                                    <td className="tdInProcess" onClick={() => { this.getOtherActivities(ele["EmpId"], 'InProcess') }} > {ele["InProcess"] - ele["CurMonthInProcess"]}</td>
                                                    <td className="tdInProcess" onClick={() => { this.getTotalActivities(ele["EmpId"], 'InProcess') }} > {ele["InProcess"]}</td>

                                                    <td className="tdResolved" onClick={() => { this.getActivitesOfWeek(ele["EmpId"], 'Resolved') }} >{ele["CurWeekResolved"]}</td>
                                                    <td className="tdResolved" onClick={() => { this.getActivitiesOfMonth(ele["EmpId"], 'Resolved') }} >{ele["CurMonthResolved"]}</td>
                                                    <td className="tdResolved" onClick={() => { this.getOtherActivities(ele["EmpId"], 'Resolved') }} >{ele["Resolved"] - ele["CurMonthResolved"]}</td>
                                                    <td className="tdResolved" onClick={() => { this.getTotalActivities(ele["EmpId"], 'Resolved') }} >  {ele["Resolved"]}</td>

                                                    <td className="tdClosed" onClick={() => { this.getActivitesOfWeek(ele["EmpId"], 'Closed') }} >{ele["CurWeekClosed"]}</td>
                                                    <td className="tdClosed" onClick={() => { this.getActivitiesOfMonth(ele["EmpId"], 'Closed') }} >{ele["CurMonthClosed"]}</td>
                                                    <td className="tdClosed" onClick={() => { this.getOtherActivities(ele["EmpId"], 'Closed') }} >{ele["Closed"] - ele["CurMonthClosed"]}</td>
                                                    <td className="tdClosed" onClick={() => { this.getTotalActivities(ele["EmpId"], 'Closed') }} > {ele["Closed"]}</td>

                                                    <td style={{ textAlign: 'center' }}>{ele["Total"]}</td>
                                                    {/* <td className="tdIcon">/td> */}
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                        :
                        <div className="loader visible" style={{ marginTop: '25%' }} ></div>
                }
                {
                    this.state.SendNotification ?
                        <div className="modal fade" id="sendNotification" role="dialog" data-keyboard="false" data-backdrop="static" key={this.state.AddNewClient}>
                            <div className="modal-dialog modal-lg"  >
                                <div className="modal-content">
                                    <div className="modal-header" style={{ background: '#f5f3f3', borderBottom: '0px solid' }}>
                                        <button type="button" className="modelClose btnClose" data-dismiss="modal" id="closeNotificationModal"> &times; </button>
                                        <h4 className="modal-title">
                                            <p className="modalHeading"> Notification</p>
                                        </h4>
                                    </div>
                                    <div className="modal-body col-xs-12" key={this.state.AddNewModel}>
                                        <SendNotification EmpId={this.state.Employee} closeModel={this.CloseNotificationModel.bind(this)} />
                                    </div>
                                    <div className="modal-footer"> </div>
                                </div>
                            </div>
                        </div>
                        :
                        ""
                }
            </div>
        )
    }

    handleNotify(empId) {
        this.setState({ Employee: empId, SendNotification: true }, () => {
            $("#sendNotification").modal('show');
        })
    }

    CloseNotificationModel() {
        $("#closeNotificationModal").click();
    }

    getActivitesOfWeek(empId, status) {
        this.props.history.push({
            state: {
                status: status,
                empId: empId,
                clientId: '',
                fromDate: moment().startOf('week').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

    getActivitiesOfMonth(empId, status) {
        this.props.history.push({
            state: {
                status: status,
                empId: empId,
                clientId: '',
                fromDate: moment().startOf('month').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

    getOtherActivities(empId, status) {
        this.props.history.push({
            state: {
                status: status,
                empId: empId,
                clientId: '',
                fromDate: '',
                toDate: moment().startOf('month').format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }

    getTotalActivities(empId, status) {
        this.props.history.push({
            state: {
                status: status,
                empId: empId,
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

export default withRouter(EmployeeSummary);