import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config';
import Select from 'react-select';
import { showErrorsForInput } from '../Validation';

import DatePicker from "react-datepicker";

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;




function trClassFormat(row, rowIdx) {

    if (row["ClockInTime"] == null) {
        return "notClockedIn";
    }
}

class AttendanceReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            AttendanceReport: [], currentPage: 1, sizePerPage: 50, dataTotalSize: 1, Employee: '',
            FromDate: moment().format("YYYY-MM-DD"), ToDate: moment().format("YYYY-MM-DD"),
            Employees: [], Employee: '',IsDataAvailable: false,
        }
    }

    componentWillMount() {
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetAllEmployeesWithAspNetUserId?orgId=" + 1003,
            type: "get",
            success: (data) => { this.setState({ Employees: data["employees"] }) }
        })

        this.handleAttendanceReport();
    }

    handleAttendanceReport() {
        var url = ApiUrl + "/api/EmployeeLocation/GetAttendanceReport?empId=" + this.state.Employee +
            "&fromDate=" + moment(this.state.FromDate).format("YYYY-MM-DD") +
            "&toDate=" + moment(this.state.ToDate).format("YYYY-MM-DD")

        $.ajax({
            url: url,
            type: "GET",
            success: (data) => {
                this.setState({
                    AttendanceReport: data["attendanceReport"], IsDataAvailable: true,
                    dataTotalSize: data["totalCount"]
                }, () => {
                    $("loader").hide();
                    $("button[name='submit']").show();
                })
            }
        })
    }

    render() {
        return (
            <div className="col-xs-12">
                <form onSubmit={this.handleSearch.bind(this)}>
                    <div className="col-xs-12">
                        <div className="col-md-3">
                            <label>Employee</label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" name="employee" ref="employee" placeholder="Select Employee" options={this.state.Employees} value={this.state.Employee} onChange={this.EmployeeChanged.bind(this)} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label>From Date</label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-calendar" > </span>
                                    </span>
                                    {/* <DatePicker className="form-control" name="fromDate" ref="fromDate"  onChange={this.handleFromDateChange.bind(this)}  /> */}
                                    <input className="form-control" style={{ lineHeight: '19px' }} type="date" name="fromDate" ref="fromDate" defaultValue={moment(this.state.FromDate).format("YYYY-MM-DD")} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label>To Date</label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-calendar">  </span>
                                    </span>
                                    {/* <DatePicker className="form-control" name="ToDate" ref="toDate"  onChange={this.handleToDateChange.bind(this)}  /> */}
                                    <input className="form-control" type="date" style={{ lineHeight: '19px' }} name="ToDate" ref="toDate" defaultValue={moment(this.state.ToDate).format("YYYY-MM-DD")} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2" style={{ marginTop: '1.8%', marginBottom: '1%' }} >
                            <button type="submit" name="submit" className="btn btn-primary" value="Search" > Search </button>
                            <div className="loader" style={{ marginTop: '1.8%', marginBottom: '1%' }}></div>
                            <button type="button" name="clear" className="btn btn-default mleft10" value="Clear" onClick={this.clearClick.bind(this)}> Clear </button>
                        </div>
                    </div>
                </form>
                {
                    this.state.IsDataAvailable ?
                        <div className="col-xs-12" key={this.state.AttendanceReport}>
                            <BootstrapTable striped hover data={this.state.AttendanceReport} trClassName={trClassFormat} >
                                <TableHeaderColumn dataField="EmployeeName" dataAlign="left" isKey={true} width="10" > Employee Name </TableHeaderColumn>
                                <TableHeaderColumn dataField="AttendanceDate" dataAlign="left" dataFormat={this.logInDateFormat.bind(this)} width="10" > LogIn Date </TableHeaderColumn>
                                <TableHeaderColumn dataField="ClockInDelay" dataAlign="center" dataFormat={this.DelayForLogin.bind(this)} width="8" > LogIn Delay </TableHeaderColumn>
                                <TableHeaderColumn dataField="ClockInAddress" dataAlign="left" width="21" > Login Location</TableHeaderColumn>
                                <TableHeaderColumn dataField="ClockOutTime" dataAlign="center" dataFormat={this.clockOutFormatter.bind(this)} width="7" > Logout Time </TableHeaderColumn>
                                <TableHeaderColumn dataField="ClockOutDelay" dataAlign="center" dataFormat={this.clockOutDelay.bind(this)} width="8"  > Early Logout </TableHeaderColumn>                                
                                <TableHeaderColumn dataField="ClockOutAddress" dataAlign="left" width="20"  > ClockOut Location </TableHeaderColumn>
                            </BootstrapTable>
                        </div>
                        :
                        <div className="loader visible" style={{marginTop: '5%'}}></div>
                }

            </div>
        )
    }

    handleFromDateChange(val) {
        this.setState({ FromDate: moment(val).format("YYYY-MM-DD") })
    }

    handleToDateChange(val) {
        this.setState({ ToDate: moment(val).format("YYYY-MM-DD") })
    }
    onSizePerPageList(sizePerPage) {
        this.getAttendanceReport(this.state.currentPage, sizePerPage);
    }

    onPageChanged(page, sizePerPage) {
        this.getAttendanceReport(page, sizePerPage);
    }

    DelayForLogin(cell, row) {
        if (row["ClockInDelay"] != null) {
            if (row["ClockInDelay"] > 0) {
                var totalMinutes = row["ClockInDelay"]
                var formatedMinutes =  Math.floor(totalMinutes / 60)  + ':' + totalMinutes % 60
                return (
                    <p style={{ color: 'red' }}>{formatedMinutes}</p>
                )
            }
        }
    }

    logInDateFormat(cell, row) {
        if (row["ClockInTime"] != null) {
            return (
                <p>{moment(row["ClockInTime"]).format("DD-MMM-YYYY h : mm A")}</p>
            )
        }
        else {
            return (
                <p>{moment(row["AttendanceDate"]).format("DD-MMM-YYYY")}</p>
            )
        }
    }

    clockOutDelay(cell, row) {
        if (row["ClockOutDelay"] != null) {
            if (row["ClockOutDelay"] > 0) {
                var totalMinutes = row["ClockOutDelay"]
                var formatedMinutes = Math.floor(totalMinutes / 60) + ':' + totalMinutes % 60
                return (
                    <p style={{ color: 'green' }}>{formatedMinutes}</p>
                )
            }
        }
    }

    clearClick() {
        this.setState({
            FromDate: moment().format("YYYY-MM-DD"),
            ToDate: moment().format("YYYY-MM-DD"),
            Employee: ''
        }, () => {
            this.refs.fromDate.value = moment().format("YYYY-MM-DD");
            this.refs.toDate.value = moment().format("YYYY-MM-DD");
            this.handleAttendanceReport();
        })

    }

    clockInFormatter(cell, row) {
        if (row["ClockInTime"] != null) {
            return (<p>{moment(row["ClockInTime"]).format("DD-MMM-YYYY h : mm A")}</p>)
        }
    }

    clockOutFormatter(cell, row) {
        if (row["ClockOutTime"] != null) {
            return (<p>{moment(row["ClockOutTime"]).format("DD-MMM-YYYY h : mm A")}</p>)
        }
    }

    EmployeeChanged(val) {
        if (val) {
            this.setState({ Employee: val.value });
            showErrorsForInput(this.refs.employee.wrapper, null);
        }
        else {
            this.setState({ Employee: '' })
        }
    }

    handleSearch(e) {
        e.preventDefault();

        $("loader").show();
        $("button[name='submit']").hide();

        if (!this.validate(e)) {
            $("loader").hide();
            $("button[name='submit']").show();
            return;
        }

        this.setState({
            Employee: this.state.Employee,
            FromDate: this.refs.fromDate.value,
            ToDate: this.refs.toDate.value,
            IsDataAvailable: false
        }, () => {
            this.handleAttendanceReport();
        })
    }

    validate(e) {
        var success = true;
        var isSubmit = e.type === "submit";


        if (this.refs.fromDate.value == "") {
            success = false;
            showErrorsForInput(this.refs.fromDate, ["From Date is required"])
            if (isSubmit) {
                isSubmit = false;
                this.refs.fromDate.focus();
            }
        }
        else {
            showErrorsForInput(this.refs.fromDate, null);
        }

        if (this.refs.toDate.value == "") {
            success = false;
            showErrorsForInput(this.refs.toDate, ["To Date is required"])
            if (isSubmit) {
                isSubmit = false;
                this.refs.toDate.focus();
            }
        }
        else {
            showErrorsForInput(this.refs.toDate, null)
        }

        if (moment(this.refs.toDate.value).isBefore(moment(this.refs.fromDate.value))) {
            success = false;
            showErrorsForInput(this.refs.fromDate, ["Should be less than To Date"])
            if (isSubmit) {
                isSubmit = false;
                this.refs.fromDate.focus();
            }
        }

        if (success) {
            var dateDiff = ((moment(this.refs.toDate.value).
                diff(moment(this.refs.fromDate.value), 'days')) + 1);
            if (dateDiff > 2) {
                if (!this.state.Employee) {
                    success = false;
                    showErrorsForInput(this.refs.employee.wrapper, ["Please select an employee"]);
                    if (isSubmit) {
                        isSubmit = false;
                        this.refs.employee.focus();
                    }
                }
            }
            else {
                showErrorsForInput(this.refs.employee.wrapper, null);
            }

        }

        return success;
    }
}

export default AttendanceReport;