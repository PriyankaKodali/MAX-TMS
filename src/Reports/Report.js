import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '../Config';
import { showErrorsForInput } from '../Validation';
import { toast } from 'react-toastify';
import { MyAjax } from '.././MyAjax.js';
import validate from 'validate.js';
import './Report.css';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;

class Report extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Employee: null, Employees: [], EmployeeReport: false, dataTotalSize: null, Client: null,
            Clients: [], EmployeesList: [], EmployeeTaskReport: [], FromDate: moment().startOf('week').add('d', 1).format("YYYY-MM-DD"),
            ToDate: moment().format("YYYY-MM-DD"), Priority: null, Status: '', SearchClick: false,
            EmpTasksReport: [], EmployeeName: null, RecordsAvailable: true, TotalCount: null, TaskPriority: null,
            TaskId: ''
        }
    }

    componentWillMount() {

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")

        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + '' + "&orgId=" + orgId,
            (data) => { this.setState({ Employees: data["employees"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClients?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }

        })

        var url = ApiUrl + "/api/Activities/GetEmployeesReport?empId=" + this.state.Employee +
            "&fromDate=" + this.state.FromDate + "&toDate=" + this.state.ToDate + "&clientId=" + this.state.Client +
            "&priority=" + this.state.Priority + "&status=" + this.state.Status
        MyAjax(
            url,
            (data) => {
                this.setState({
                    EmployeesList: data["employeesList"], EmployeeTaskReport: data["empReport"],
                    TotalCount: data["TotalCount"], SearchClick: true
                }, () => {
                    if (data["TotalCount"] > 0) {
                        this.setState({ RecordsAvailable: true })
                    }
                    else {
                        this.setState({ RecordsAvailable: false })
                    }

                    //  console.log(this.state.EmployeeTaskReport[0]["HoursWorked"])
                })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )


    }

    render() {
        return (
            <div className="myContainer">

                <form onSubmit={this.handleSearchClick.bind(this)} onChange={this.validate.bind(this)}>
                    <div className="col-xs-12 SearchContainerStyle">

                        <div className="col-md-2">
                            <label> Employee </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" ref="employee" placeholder="Select Employee" name="Employee" value={this.state.Employee} options={this.state.Employees} onChange={this.EmployeeChanged.bind(this)} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> From Date </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-calendar" ></span>
                                    </span>
                                    <input className="form-control" type="date" style={{ lineHeight: '19px' }} name="fromDate" ref="fromDate" defaultValue={this.state.FromDate} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> To Date </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-calendar" ></span>
                                    </span>
                                    <input className="form-control" type="date" style={{ lineHeight: '19px' }} name="toDate" ref="toDate" defaultValue={this.state.ToDate} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> Client </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" ref="client" placeholder="Select Client" name="Client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> Status </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" ref="client" placeholder="Select Status" name="Status" value={this.state.Status}
                                        options={[{ value: 'Open', label: 'Open' }, { value: 'Closed', label: 'Closed' },
                                        { value: 'Pending', label: 'Pending' }, { value: 'Reopened', label: 'Reopened' }]}
                                        onChange={this.StatusChanged.bind(this)} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> Priority </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" ref="priority" placeholder="Select Priority" name="Priority" value={this.state.Priority}
                                        options={[{ value: '0', label: 'High' }, { value: '1', label: 'Medium' },
                                        { value: '2', label: 'Low' }]}
                                        onChange={this.PriorityChanged.bind(this)} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2" style={{ marginTop: '0%', marginBottom: '1%' }} >
                            <button type="submit" name="submit" className="btn btn-primary" value="Search" > Search </button>
                            <button type="button" name="clear" className="btn btn-default mleft10" value="Clear" onClick={this.clearClick.bind(this)}> Clear </button>
                        </div>
                    </div>
                </form>

                {
                    this.state.RecordsAvailable == true ?
                        <div className="col-xs-12" key={this.state.EmployeesList}>
                            {
                                this.state.EmployeesList.map((ele, i) => {
                                    return (
                                        <div className="panel panel-primary">

                                            <div className="panel-heading">
                                                <h6 className="panel-title panelHeading" >
                                                    <a onClick={() => { this.gotoEmployeeActivitiesReport(ele["AssignedTo"], ele["Employee"], "") }}> {ele["Employee"].toUpperCase()} </a>
                                                </h6>
                                            </div>

                                            <div id={this.state.EmployeesList} className="panel-collapse collapse in" >
                                                <div className="panel-body Reportpanel-body" key={this.state.EmployeeTaskReport}>
                                                    {
                                                        <table className="table table-condensed table-bordered actionTable mytable">
                                                            <tbody>
                                                                <tr >
                                                                    <th> TaskId</th>
                                                                    <th> TaskDate </th>
                                                                    <th title="Client/Department">Client/Dept</th>
                                                                    <th> AssignedBy </th>
                                                                    <th> Priority </th>
                                                                    <th> Subject</th>
                                                                    <th data-toggle="tooltip" title="Expected Date Of Closure"> EDOC </th>
                                                                    <th> Task Owner </th>
                                                                    <th> Pending With</th>
                                                                    <th> Status </th>
                                                                    <th data-toggle="tooltip" title="Hours Worked"> HW </th>
                                                                    <th data-toggle="tooltip" title="Completed Date"> CD </th>
                                                                    <th title="TAT(in Days)"> TAT </th>
                                                                </tr>
                                                                {
                                                                    this.state.EmployeeTaskReport.map((e, j) => {
                                                                        if (e["AssignedToId"] == ele["AssignedTo"]) {
                                                                            return (
                                                                                <tr style={{ paddingLeft: '2%' }} className={this.getTaskStyle(e["EDOC"], e["CompletedDate"], e["Status"])} key={j} onClick={() => { this.handleClick(ele["AssignedTo"], ele["Employee"], e["TaskId"], e["Status"]) }}>
                                                                                    <td> {e["TaskId"]} </td>
                                                                                    <td> {moment(e["CreatedDate"]).format("DD-MMM-YYYY")} </td>
                                                                                    <td> {e["Department"] !== null ? e["Department"] : e["ClientName"]}</td>
                                                                                    <td> {e["CreatedBy"]} </td>
                                                                                    <td> {e["Priority"] == "0" ? "High" : e["Priority"] == "1" ? "Medium" : "Low"} </td>
                                                                                    <td > {e["Subject"]} </td>
                                                                                    <td> {moment(e["EDOC"]).format("DD-MMM-YYYY")} </td>
                                                                                    <td> {e["TaskOwner"]} </td>
                                                                                    <td> {e["Status"] == "Closed" ? "" : e["TaskOwner"]} </td>
                                                                                    <td> {e["Status"]}</td>
                                                                                    <td> {e["HoursWorked"] > 0 ? e["HoursWorked"] : " "}</td>
                                                                                    <td > {e["CompletedDate"] != null ? moment(e["CompletedDate"]).format("DD-MMM-YYYY") : " "}   </td>
                                                                                    <td style={{ color: 'red' }}>{this.DelayInDaysCount(e["EDOC"], e["CompletedDate"], e["TaskResolvedDate"], e["Status"])}   </td>
                                                                                </tr>
                                                                            )
                                                                        }

                                                                    })
                                                                }

                                                            </tbody>

                                                        </table>
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                    )
                                })
                            }

                        </div>

                        :

                        <div className="col-xs-12 messageStyle">
                            <h4> No records found for </h4>
                        </div>
                }

                <div id="employeeTasksReportModal" className="modal fade" role="dialog" ref="employeeTasksReportModal">
                    <div className="modal-dialog modal-lg" style={{ width: '1250px' }}>
                        <div className="modal-content">
                            <div className="modal-header" >
                                <label> Employee Name : </label> {this.state.EmployeeName}
                                <label className="mleft1"> From Date : </label> {moment(this.state.FromDate).format("MMM-DD-YYYY")}
                                <label className="mleft1"> To Date :</label> {moment(this.state.ToDate).format("MMM-DD-YYYY")}
                                <label className="mleft1"> Status : </label> {this.state.Status !== "" ? this.state.Status : "All"}
                                <label className="mleft1"> Priority : </label>{this.state.Priority !== null ? this.state.TaskPriority.label : "All"}
                                <button type="button" className="close" data-dismiss="modal">&times;</button>
                                <hr />
                                <div className="col-xs-12" key={this.state.EmpTasksReport}>
                                    {
                                        this.state.EmpTasksReport.map((ele, i) => {
                                            return (
                                                <div>
                                                    <h4 className="col-xs-12"> Task {ele["TaskId"]} Details : </h4>

                                                    <table className="table table-condensed table-bordered actionTable mytable">
                                                        <tbody>
                                                            <tr >
                                                                <th style={{ width: '10%' }}> Created By</th>
                                                                <th style={{ width: '15%' }}> Created date</th>
                                                                <th title="Client / Department "> Client/Dept</th>
                                                                <th> Subject</th>
                                                                <th> Description</th>
                                                            </tr>
                                                            <tr>
                                                                <td> {ele["CreatedBy"]} </td>
                                                                <td>  {moment(ele["CreatedDate"]).format("DD-MMM-YYYY")} </td>
                                                                <td> {ele["Department"] !== null ? ele["Department"] : ele["ClientName"]} </td>
                                                                <td> {ele["Subject"]} </td>
                                                                <td> {ele["TaskDescription"]} </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <div className="col-xs-12" />
                                                    <table className="table table-condensed table-bordered actionTable mytable">
                                                        <tbody>
                                                            <tr>
                                                                <th style={{ width: '12.5%' }}> TaskDate</th>
                                                                <th> Assigned by</th>
                                                                <th> Description</th>
                                                                <th> Assigned To </th>
                                                                <th> Status</th>
                                                                <th> HoursWorked</th>
                                                            </tr>

                                                            {
                                                                ele["ActivityLog"].map((el) => {
                                                                    return (
                                                                        <tr>
                                                                            <td> {moment(el["TaskCreatedDate"]).format("DD-MMM-YYYY hh:mm a")}</td>
                                                                            <td> {el["AssignedBy"]}</td>
                                                                            <td>  {$("<div />").html(el["Description"]).text()} </td>
                                                                            <td>  {el["Status"] == "Closed by assignee" ? " " : el["AssignedTo"]} </td>
                                                                            <td> {el["Status"]}</td>
                                                                            <td> {el["HoursWorked"] > 0 ? el["HoursWorked"] : ""} </td>
                                                                        </tr>
                                                                    )

                                                                })
                                                            }
                                                        </tbody>
                                                    </table>

                                                    <div className="col-xs-12" style={{ paddingTop: '2%' }} >

                                                        <div className="col-md-6 col-xs-12 ">
                                                            <table className="table table-condensed table-bordered headertable">
                                                                <tbody>
                                                                    <tr>
                                                                        <th> Expected start Date </th>
                                                                        <td>{ele["StatDate"] !== null ? moment(ele["StatDate"]).format("DD-MMM-YYYY") : ""}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Expected Date of Closure</th>
                                                                        <td>{ele["ExpectedClosureDate"] != null ? moment(ele["ExpectedClosureDate"]).format("DD-MMM-YYYY") : ""}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Budgeted Hours </th>
                                                                        <td>{ele["BudgetedHours"]}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="col-md-6 col-xs-12 ">
                                                            <table className="table table-condensed table-bordered headertable">
                                                                <tbody>
                                                                    <tr>
                                                                        <th> Actual Start Date </th>
                                                                        <td>{ele["ActualStartDate"] !== null ? moment(ele["ActualStartDate"]).format("DD-MMM-YYYY") : "Not yet started"}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th> Actual closed date </th>
                                                                        <td>{ele["ActualEndDate"] !== null ? moment(ele["ActualEndDate"]).format("DD-MMM-YYYY") : "Not yet completed"}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Hours Worked </th>
                                                                        <td> {ele["HoursWorked"] !== null ? ele["HoursWorked"] : ""}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="col-xs-12">
                                                        <hr />
                                                    </div>

                                                </div>
                                            )
                                        })
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    handleClick(empId, empName, TaskId, status) {
        this.gotoEmployeeActivitiesReport(empId, empName, TaskId);
    }

    getTaskStyle(edoc, cd, status) {
        var EDOC = moment(edoc);
        var CD = moment(cd);

        if (status !== "Closed" && (EDOC < CD || EDOC < moment())) {
            return "trStyleDelay pointer";
        }
        else if (EDOC > CD) {
            return "trStyleSuccess pointer";
        }
        else {
            return "pointer";
        }
    }

    createdDateFormatter(cell, row) {
        return (
            <p> {row["CreatedDate"].format("DD-MMM-YYYY")}</p>
        )
    }

    PriorityFormatter(cell, row) {
        return (
            row["Priority"] == 0 ? "High" : row["Priority"] == 1 ? "Medium" : "Low"
        )
    }

    edocFormatter(cell, row) {
        return (
            moment(row["EDOC"]).format("DD-MMM-YYYY")
        )
    }

    DelayInDaysCount(edoc, completedDate, resolvedDate, status) {

        if (resolvedDate != null) {
            if (edoc < resolvedDate) {
                var days = moment(resolvedDate).diff(moment(edoc), 'days');
                if (days > 0) {
                    return days;
                }
                else {
                    return "";
                }
            }
        }
        else {
            if (status == "Closed" && completedDate != null) {
                if (edoc < completedDate) {
                    var days = moment(completedDate).diff(moment(edoc), 'days');
                    if (days > 0) {
                        return days;
                    }
                    return "";
                }
            }

            else if (edoc > moment()) {
                return "";
            }
            else {
                var days = moment().diff(moment(edoc), 'days');
                if (days > 0) {
                    return days;
                }
            }
        }
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val.value })
        }
        else {
            this.setState({ Client: '' })
        }

    }

    TaskDateFormatter(cell, row) {
        return (
            <p> {moment(row["TaskDate"]).format("MM-DD-YYYY")}  </p>
        )
    }

    categorySubCategory(cell, row) {
        return (
            <p> {row["Category"]} {"/"} {row["SubCategory"]}</p>
        )
    }

    PriorityFormat(cell, row) {
        if (row["Priority"] == 0) {
            return (
                <p> High</p>
            )
        }
        else if (row["Priority"] == 1) {
            return (
                <p> Medium</p>
            )
        }
        else {
            return (
                <p> Low </p>
            )
        }
    }

    completedDateFormat(cell, row) {
        if (row["CompletedDate"] != null) {
            return (
                <p> {moment(row["CompletedDate"]).format("MM-DD-YYYY")}</p>
            )
        }
        else {
            return (
                <p> </p>
            )
        }

    }

    EmployeeChanged(val) {
        if (val) {
            this.setState({ Employee: val.value })
        }
        else {
            this.setState({ Employee: '' })
        }
    }

    PriorityChanged(val) {
        if (val) {
            this.setState({ Priority: val.value, TaskPriority: val })
        }
        else {
            this.setState({ Priority: '' })
        }
    }

    StatusChanged(val) {
        if (val) {
            this.setState({ Status: val.value })
        }
        else {
            this.setState({ Status: '' })
        }
    }

    GetEmployeeReport() {

        var url = ApiUrl + "/api/Activities/GetEmployeesReport?empId=" + this.state.Employee +
            "&fromDate=" + this.refs.fromDate.value + "&toDate=" + this.refs.toDate.value + "&clientId=" + this.state.Client +
            "&priority=" + this.state.Priority + "&status=" + this.state.Status;

        MyAjax(
            url,
            (data) => {
                this.setState({
                    EmployeesList: data["employeesList"],
                    EmployeeTaskReport: data["empReport"], SearchClick: true, TotalCount: data["TotalCount"]
                }, () => {
                    if (data["TotalCount"] > 0) {
                        this.setState({ RecordsAvailable: true })
                    }
                    else {
                        this.setState({ RecordsAvailable: false })
                    }
                })
                $("employeeTasksReportModal").modal("show");
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }

    clearClick() {
        this.state.Priority = null;
        this.state.Status = null;
        this.state.Client = null;
        this.state.Employee = null;
        this.refs.fromDate.value = moment().startOf('week').add('d', 1).format("YYYY-MM-DD");
        this.refs.toDate.value = moment().format("YYYY-MM-DD");
        this.setState({
            Priority: null, Status: '', Client: null, Employee: null
        }, () => {
            this.GetEmployeeReport();
        })
    }

    gotoEmployeeActivitiesReport(empId, empName, TaskId) {
        this.setState({
            EmployeeName: empName, FromDate: this.refs.fromDate.value,
            ToDate: this.refs.toDate.value
        })

        var url = ApiUrl + "/api/Activities/GetIndividualEmpReport?empId=" + empId +
            "&fromDate=" + this.refs.fromDate.value + "&toDate=" + this.refs.toDate.value +
            "&clientId=" + this.state.Client + "&status=" + this.state.Status +
            "&priority=" + this.state.Priority + "&taskId=" + TaskId

        $.ajax({
            url: url,
            type: "get",
            success: (data) => { this.setState({ EmpTasksReport: data["empActivitiesReport"] }) }
        })

        $("#employeeTasksReportModal").modal("show");

    }

    handleSearchClick(e) {
        e.preventDefault();
        if (!this.validate(e)) {
            return;
        }
        this.GetEmployeeReport();
    }

    validate(e) {
        let errors = {};
        var success = true;
        var isSubmit = e.type === "submit";

        if (isSubmit) {
            $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
                el.classList.remove("un-touched");
            });
        }

        if (validate.single(this.refs.fromDate.value, { presence: true }) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.fromDate, ["Please select from date"]);
            if (isSubmit) {
                this.refs.fromDate.focus();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.fromDate, null);
        }

        if (validate.single(this.refs.toDate.value, { presence: true }) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.toDate, ["Please select to date"]);
            if (isSubmit) {
                this.refs.toDate.focus();
                isSubmit = false;
            }
        }
        else if (moment(this.refs.toDate.value).isBefore(moment(this.refs.fromDate.value))) {
            success = false;
            showErrorsForInput(this.refs.toDate, ["To Date should not be less that from date"]);
            if (isSubmit) {
                this.refs.toDate.focus();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.toDate, null);
        }
        return success;
    }

}

export default Report;
