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
            Clients: [], EmployeesList: [], EmployeeTaskReport: []
        }
    }

    componentWillMount() {

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")

        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?UserId=" + '' + "&OrgId=" + orgId,
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

        var url = ApiUrl + "/api/Activities/GetEmployeeReport?empId=" + this.state.Employee +
            "&fromDate=" + null + "&toDate=" + null + "&clientId=" + this.state.Client
        MyAjax(
            url,
            (data) => {
                this.setState({ EmployeesList: data["employeesList"], EmployeeTaskReport: data["employeesTaskList"] })
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
                    <div className="col-xs-12">
                        <div className="col-md-3">
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
                                    <input className="form-control" type="date" style={{ lineHeight: '19px' }} name="fromDate" ref="fromDate" />
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
                                    <input className="form-control" type="date" style={{ lineHeight: '19px' }} name="toDate" ref="toDate" />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
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
                        <div className="col-md-2" style={{ marginTop: '2%' }} >
                            <button type="submit" name="submit" className="btn btn-primary" value="Search" > Search </button>
                        </div>
                    </div>
                </form>

                <div className="col-xs-12" key={this.state.EmployeesList}>

                    {
                        this.state.EmployeesList.map((ele, i) => {
                            return (
                                <div className="panel panel-primary">
                                    <div className="panel-heading">
                                        {ele["Employee"].toUpperCase()}

                                    </div>

                                    <div id={this.state.EmployeesList} className="panel-collapse collapse in">
                                        <div className="panel-body" key={i}>
                                            {
                                                <table className="table table-condensed table-bordered mytable">
                                                    <tr>
                                                        <th> TaskId</th>
                                                        <th> TaskDate </th>
                                                        <th> AssignedBy </th>
                                                        <th> Priority </th>
                                                        <th> Subject</th>
                                                        <th> EDOC </th>
                                                        <th> Assigned To </th>
                                                        <th> Task Owner </th>
                                                        <th> Pending With</th>
                                                        <th> Status </th>
                                                        <th > CD </th>
                                                        <th> Delay(days) </th>

                                                    </tr>
                                                    {
                                                        this.state.EmployeeTaskReport.map((e, j) => {
                                                            if (e["TaskOwnerId"] == ele["TaskOwner"]) {
                                                                return (
                                                                    <tr key={i}>
                                                                        <td> {e["TaskId"]} </td>
                                                                        <td> {moment(e["CreatedDate"]).format("DD-MMM-YYYY")} </td>
                                                                        <td> {e["AssignedBy"]} </td>
                                                                        <td> {e["Priority"] == "0" ? "High" : e["Priority"] == "1" ? "Medium" : "Low"} </td>
                                                                        <td > {e["Subject"]} </td>
                                                                        <td> {moment(e["EDOC"]).format("DD-MMM-YYYY")} </td>
                                                                        <td> {e["AssignedTo"]}</td>
                                                                        <td> {e["TaskOwner"]} </td>
                                                                        <td> {e["Status"] === "Closed" ? "" : e["TaskOwner"]} </td>
                                                                        <td> {e["Status"]}</td>
                                                                        <td > {e["CompletedDate"] != null ? moment(e["CompletedDate"]).format("DD-MMM-YYYY") : " "}   </td>
                                                                        <td style={{ color: 'red' }}>{this.DelayInDaysCount(e["EDOC"], e["CompletedDate"], e["Status"])}   </td>
                                                                    </tr>
                                                                )
                                                            }

                                                        })
                                                    }

                                                </table>
                                            }

                                        </div>
                                    </div>

                                </div>

                            )

                        })
                    }


                </div>


            </div>
        )
    }

    DelayInDaysCount(edoc, completedDate, status) {
        if (completedDate == null) {
            var days = moment().diff(moment(edoc), 'days');
            return days;
        }
        else if (completedDate > edoc) {
            var days = moment(completedDate).diff(moment(edoc), 'days');
            return days;
        }
        else {
            return "";
        }
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val })
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
            this.setState({ Employee: val })
            showErrorsForInput(this.refs.employee.wrapper, [])
        }
        else {
            this.setState({ Employee: '' })
            showErrorsForInput(this.refs.employee.wrapper, ["Please select employee"])
        }
    }

    GetEmployeeReport() {

        if (this.state.Client !== null) {
            this.state.Client = this.state.Client.value
        }
        else {
            this.state.Client = null
        }

        $.ajax({
            url: ApiUrl + "/api/Activities/GetEmployeeReport?EmpId=" + this.state.Employee.value +
                "&fromDate=" + this.refs.fromDate.value + "&toDate=" + this.refs.toDate.value +
                "&client=" + this.state.Client.value,
            type: "get",
            success: (data) => { this.setState({ EmployeeReport: data["employeeReport"] }) }
        })
    }

    handleSearchClick(e) {
        e.preventDefault();

        if (!this.validate(e)) {
            return;
        }
        // this.setState({ viewEmployeeReport: true });

        //  this.GetEmployeeReport.bind(this);

        if (this.state.Client != null) {
            this.state.Client = this.state.Client.value
        }
        else {
            this.state.Client = null;
        }


        var url = ApiUrl + "/api/Activities/GetEmployeeReport?empId=" + this.state.Employee.value +
            "&fromDate=" + this.refs.fromDate.value + "&toDate=" + this.refs.toDate.value + "&clientId=" + this.state.Client

        MyAjax(
            url,
            (data) => {
                this.setState({ EmployeesList: data["employeesList"], EmployeeTaskReport: data["employeesTaskList"] })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )


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

        if (!this.state.Employee || !this.state.Employee.value) {
            success = false;
            showErrorsForInput(this.refs.employee.wrapper, ["Please select employee"])
            if (isSubmit) {
                this.refs.employee.focus();
                isSubmit = false;
            }
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







// <div className="col-xs-12" key={this.state.viewEmployeeReport}>
// {
//     this.state.viewEmployeeReport ?
//         <BootstrapTable striped hover data={this.state.EmployeeReport}  >
//             <TableHeaderColumn dataField="TaskId" dataAlign="left" isKey="true" dataSort={true} width="18" > Task Id </TableHeaderColumn>
//             <TableHeaderColumn dataField="TaskDate" dataAlign="left" dataSort={true} width="30" dataFormat={this.TaskDateFormatter.bind(this)} > Task Date </TableHeaderColumn>
//             <TableHeaderColumn dataField="AssignedBy" dataAlign="left" dataSort={true} width="25" >Assigned By</TableHeaderColumn>
//             <TableHeaderColumn dataField="Category/SubCategory" dataAlign="left" dataSort={true} width="35" dataFormat={this.categorySubCategory.bind(this)}> Category/SubCategory</TableHeaderColumn>
//             {/* <TableHeaderColumn dataField="SubCategory" dataAlign="left" dataSort={true}> Sub Category</TableHeaderColumn> */}
//             <TableHeaderColumn dataField="Priority" dataAlign="left" dataSort={true} width="20" dataFormat={this.PriorityFormat.bind(this)}> Priority </TableHeaderColumn>
//             <TableHeaderColumn dataField="HoursWorked" dataAlign="left" dataSort={true} width="23" > Hours Worked </TableHeaderColumn>
//             <TableHeaderColumn dataField="CompletedDate" dataAlign="left" width="32" dataSort={true} dataFormat={this.completedDateFormat.bind(this)}> Completed Date </TableHeaderColumn>
//             <TableHeaderColumn dataField="Status" dataAlign="left" daatSort={true} width="25"> Status</TableHeaderColumn>
//         </BootstrapTable>
//         :
//         <div />
// }
// </div>