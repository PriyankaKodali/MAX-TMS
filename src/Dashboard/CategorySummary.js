import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config.js';
import { withRouter } from "react-router-dom";
var moment = require('moment');

class CategorySummary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            CategorySummary: [], EmpId: ''
        }
    }

    componentWillMount() {
        var empId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? '' : sessionStorage.getItem("EmpId");
        // $.ajax({
        //     url: ApiUrl + "/api/Reports/GetDashBoardData?empId=" + empId,
        //     type: "get",
        //     success: (data) => {
        //         this.setState({ CategorySummary: data["categorySummary"], EmpId:empId })
        //     }
        // })
        this.setState({ CategorySummary: this.props.CategorySummary, EmpId: empId })
    }

    componentWillReceiveProps(nextProps) {
        var empId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? '' : sessionStorage.getItem("EmpId");
        this.setState({ CategorySummary: nextProps.CategorySummary, EmpId: empId })
    }

    render() {
        return (
            <div>
                {
                    this.state.CategorySummary.length > 0 ?
                        <div className="col-xs-12 table-responsive globalTable mTop1">
                            <div className="reportHeading"> Category Report</div>
                            <table className="table table-hover table-bordered empDashboard">
                                <thead  >
                                    <tr>
                                        <td rowSpan="2" className="tdName pTop16"  > <b>Category </b> </td>
                                        <td className="tdOpen" colSpan="4"> <b> Open </b> </td>
                                        <td className="tdReopen" colSpan="4"> <b>Reopened</b> </td>
                                        <td className="tdPending" colSpan="4"> <b>Pending</b> </td>
                                        <td className="tdInProcess" colSpan="4" > <b>InProcess</b>  </td>
                                        <td className="tdResolved" colSpan="4"> <b>Resolved</b> </td>
                                        <td className="tdClosed" colSpan="4"> <b>Closed </b> </td>
                                        {/* <td rowSpan="2" className="pTop16"> <b>Total</b> </td> */}
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
                                        <td className="tdTotal" >Total</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.CategorySummary.map((ele, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td className="tleft">
                                                        <small className="tleft">
                                                            {ele["Category"]} </small>
                                                    </td>

                                                    <td className="tdOpen" onClick={() => { this.getCurWeekCategory(ele["CategoryId"], 'Open') }}>{ele["CurWeekOpen"]}</td>
                                                    <td className="tdOpen" onClick={() => { this.getCurMonthCategory(ele["CategoryId"], 'Open') }}>{ele["CurMonthOpen"]}</td>
                                                    <td className="tdOpen" onClick={() => { this.getOthersCategory(ele["CategoryId"], 'Open') }}>{ele["StatusOpen"] - ele["CurMonthOpen"]}</td>
                                                    <td className="tdOpen" onClick={() => { this.getTotalCategory(ele["CategoryId"], 'Open') }} >{ele["StatusOpen"]}</td>

                                                    <td className="tdReopen" onClick={() => { this.getCurWeekCategory(ele["CategoryId"], 'Reopened') }}>{ele["CurWeekReopened"]}</td>
                                                    <td className="tdReopen" onClick={() => { this.getCurMonthCategory(ele["CategoryId"], 'Reopened') }}>{ele["CurMonthReopened"]}</td>
                                                    <td className="tdReopen" onClick={() => { this.getOthersCategory(ele["CategoryId"], 'Reopened') }}>{ele["Reopened"] - ele["CurMonthReopened"]}</td>
                                                    <td className="tdReopen" onClick={() => { this.getTotalCategory(ele["CategoryId"], 'Reopened') }}>{ele["Reopened"]}</td>

                                                    <td className="tdPending" onClick={() => { this.getCurWeekCategory(ele["CategoryId"], 'Pending') }}>{ele["CurWeekPending"]}</td>
                                                    <td className="tdPending" onClick={() => { this.getCurMonthCategory(ele["CategoryId"], 'Pending') }}>{ele["CurMonthPending"]}</td>
                                                    <td className="tdPending" onClick={() => { this.getOthersCategory(ele["CategoryId"], 'Pending') }}>{ele["Pending"] - ele["CurMonthPending"]}</td>
                                                    <td className="tdPending" onClick={() => { this.getTotalCategory(ele["CategoryId"], 'Pending') }}>{ele["Pending"]}</td>

                                                    <td className="tdInProcess" onClick={() => { this.getCurWeekCategory(ele["CategoryId"], 'InProcess') }}>{ele["CurWeekInprocess"]}</td>
                                                    <td className="tdInProcess" onClick={() => { this.getCurMonthCategory(ele["CategoryId"], 'InProcess') }}>{ele["CurMonthInProcess"]}</td>
                                                    <td className="tdInProcess" onClick={() => { this.getOthersCategory(ele["CategoryId"], 'InProcess') }}>{ele["InProcess"] - ele["CurMonthInProcess"]}</td>
                                                    <td className="tdInProcess" onClick={() => { this.getTotalCategory(ele["CategoryId"], 'InProcess') }}>{ele["InProcess"]}</td>

                                                    <td className="tdResolved" onClick={() => { this.getCurWeekCategory(ele["CategoryId"], 'Resolved') }}>{ele["CurWeekResolved"]}</td>
                                                    <td className="tdResolved" onClick={() => { this.getCurMonthCategory(ele["CategoryId"], 'Resolved') }} >{ele["CurMonthResolved"]}</td>
                                                    <td className="tdResolved" onClick={() => { this.getOthersCategory(ele["CategoryId"], 'Resolved') }}>{ele["Resolved"] - ele["CurMonthResolved"]}</td>
                                                    <td className="tdResolved" onClick={() => { this.getTotalCategory(ele["CategoryId"], 'Resolved') }}> {ele["Resolved"]}</td>

                                                    <td className="tdClosed " onClick={() => { this.getCurWeekCategory(ele["CategoryId"], 'Closed') }}>{ele["CurWeekClosed"]}</td>
                                                    <td className="tdClosed" onClick={() => { this.getCurMonthCategory(ele["CategoryId"], 'Closed') }}>{ele["CurMonthClosed"]}</td>
                                                    <td className="tdClosed" onClick={() => { this.getOthersCategory(ele["CategoryId"], 'Closed') }}> {ele["Closed"] - ele["CurMonthClosed"]}</td>
                                                    <td className="tdClosed" onClick={() => { this.getTotalCategory(ele["CategoryId"], 'Closed') }}> {ele["Closed"]}</td>

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
                }

            </div>
        )
    }

    getTotalCategory(catId, status) {
        this.props.history.push({
            state: {
                empId: this.state.EmpId,
                clientId: '',
                catId: catId,
                status: status,
                fromDate: '',
                toDate: '',
            },
            pathname: "/ActivityReport"
        })
    }

    getCurMonthCategory(catId, status) {
        this.props.history.push({
            state: {
                empId: this.state.EmpId,
                clientId: '',
                status: status,
                fromDate: moment().startOf('month').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: catId
            },
            pathname: "/ActivityReport"
        })
    }

    getOthersCategory(catId, status) {
        this.props.history.push({
            state: {
                empId: this.state.EmpId,
                clientId: '',
                catId: catId,
                status: status,
                fromDate: '',
                toDate: moment().startOf('month').format("YYYY-MM-DD")
            },
            pathname: "/ActivityReport"
        })
    }

    getCurWeekCategory(status, catId) {
        this.props.history.push({
            state: {
                empId: this.state.EmpId,
                clientId: '',
                catId: catId,
                status: status,
                fromDate: moment().startOf('week').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
            },
            pathname: "/ActivityReport"
        })
    }
}

export default withRouter(CategorySummary);