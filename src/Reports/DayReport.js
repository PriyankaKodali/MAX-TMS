import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import './Report.css';
import { showErrorsForInput } from '../Validation';
import { ApiUrl } from '../Config';
import { MyAjax } from '../MyAjax';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import validate from 'validate.js';
import { toast } from 'react-toastify';

var moment = require('moment');

var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;

function trClassFormat(row, rowIdx) {
    if (row["TaskStatus"] != "Closed" && (moment().format("DD-MM-YYYY") > moment(row["EDOC"]).format("DD-MM-YYYY"))) {
        return "reportHeading";
    }
}

function columnClassNameFormat(fieldValue, row, rowIdx, colIdx) {
    if (row["TaskStatus"] == "Closed") {
        return "taskCompleted";
    }
    if (row["TaskStatus"] == "Pending" || row["TaskStatus"] == "InProcess") {
        return "trStatusPending";
    }
    if (row["TaskStatus"] == "Open") {
        return "trStatusOpen";
    }
}

class DayReport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            EmployeeReport: [], Employees: [], Employee: '', Clients: [], Client: '', Status: 'ALL',
            Priority: '', IsDataAvailable: true, TaskId: '', TaskInDetail: {}, TaskLog: [],
            viewTaskInDetail: false, Description: "", Categories: [], Category: null

        }
    }

    componentWillMount() {
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetAllEmployeesWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Employees: data["employees"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetCategories?deptId=" + 9,
            type: "get",
            success: (data) => { this.setState({ Categories: data["categories"] }) }
        })

    }

    GetEmployeeReport() {
        var url = ApiUrl + "/api/Reports/GetEmployeeDayWiseReport?empId=" + this.state.Employee +
            "&clientId=" + this.state.Client + "&fromDate=" + this.state.FromDate +
            "&toDate=" + this.state.ToDate + "&status=" + this.state.Status +
            "&priority=" + this.state.Priority + "&taskId=" + this.state.TaskId + "&catId=" + null;
        MyAjax(
            url,
            (data) => {
                this.setState({ EmployeeReport: data["employeeReport"], IsDataAvailable: true })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )

    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSearchClick.bind(this)} >
                    <div className=" SearchContainerStyle">
                        <div className="col-xs-12">
                            <div className="col-md-2">
                                <label> Employee </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" placeholder="Select Employee" ref="employee" name="employee" value={this.state.Employee} options={this.state.Employees} onChange={this.employeeChanged.bind(this)} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <label>Client</label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" placeholder="Select Client" ref="client" name="client" value={this.state.Client} options={this.state.Clients} onChange={this.clientChanged.bind(this)} />
                                    </div>
                                </div>

                            </div>

                            <div className="col-md-2">
                                <label> From Date </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-calendar"></span>
                                        </span>
                                        <input className="form-control" style={{ lineHeight: '19px' }} type="date" name="fromDate" ref="fromDate" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <label> To Date </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-calendar"></span>
                                        </span>
                                        <input className="form-control" style={{ lineHeight: '19px' }} type="date" name="toDate" ref="toDate" />
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
                                            options={[{ value: 'ALL', label: 'All' }, { value: 'Closed', label: 'Closed' }, { value: 'Open', label: 'Open' },
                                            { value: 'InProcess', label: 'InProcess' }, { value: 'Pending', label: 'Pending' }, { value: 'NotResolved', label: 'Not Resolved' },
                                            { value: 'NotClosed', label: 'Not Closed' }, { value: 'Hold', label: 'Hold' },
                                            { value: 'Resolved', label: 'Resolved' }, { value: 'Reopened', label: 'Reopened' }]}
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
                        </div>
                        <div className="col-xs-12" >
                            <div className="col-md-2">
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon"></span>
                                        <Select className="form-control" placeholder="Select Category" options={this.state.Categories} value={this.state.Category} onChange={this.CategoryChanged.bind(this)} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2" style={{ marginLeft: '10%', marginBottom: '1%' }} >
                                <button type="submit" name="submit" className="btn btn-primary" value="Search" > Search </button>
                                <button type="button" name="clear" className="btn btn-default mleft10" value="Clear" onClick={this.clearClick.bind(this)}> Clear </button>
                            </div>

                        </div>
                    </div>
                </form>

                {
                    this.state.IsDataAvailable ?
                        this.state.EmployeeReport.length > 0 ?
                            <div className="col-xs-12">
                                <BootstrapTable striped hover data={this.state.EmployeeReport}>
                                    <TableHeaderColumn dataField="TaskLogDate" width="9" dataAlign="left" dataFormat={this.TaskLogFormatter.bind(this)}>  TaskLogDate </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskLogDescription" dataAlign="left" width="20" dataFormat={this.DescriptionFormat.bind(this)} >Description</TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskLogStatus" dataAlign="left" width="5" >Status</TableHeaderColumn>
                                    <TableHeaderColumn dataField="HoursWorked" dataAlign="left" headerText="Hours Worked" width="3" >HW </TableHeaderColumn>
                                    <TableHeaderColumn dataField="QuantityWorked" dataAlign="left" headerText="Quantity Worked" width="3" > QW</TableHeaderColumn>
                                    <TableHeaderColumn dataField="EDOC" dataAlign="left" width="6" dataFormat={this.edocFormatter.bind(this)} > EDOC </TableHeaderColumn>
                                    <TableHeaderColumn dataField="client" dataAlign="left" width="7" dataFormat={this.ClientDeptFormatter.bind(this)}>Client/Dept</TableHeaderColumn>
                                    <TableHeaderColumn dataField="category" dataAlign="left" width="7" dataFormat={this.CategoryFormatter.bind(this)}  >  Category </TableHeaderColumn>
                                    <TableHeaderColumn dataField="Subject" dataAlign="left" width="10"  >Subject</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CreatedBy" dataAlign="left" width="6"  >  CreatedBy </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskId" width="6" dataAlign="left" isKey="true" columnClassName={columnClassNameFormat} dataFormat={this.TaskIdFormatter.bind(this)}  > TaskId </TableHeaderColumn>
                                </BootstrapTable>
                            </div>
                            :
                            <div className="col-xs-12 messageStyle"> <h4> No records found </h4> </div>
                        :
                        <div className="loader visible" style={{ marginTop: '12%' }}></div>
                }
                <div id="taskInDetailModel" className="modal fade" role="dialog" ref="taskref" key={this.state.TaskInDetail}>
                    <div className="modal-dialog"></div>
                    <div className="modal-content taskDetailcss">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <div className="modal-title">
                                <label> TaskId :  {this.state.TaskInDetail.TaskId} </label>
                            </div>
                        </div>
                        <div className="modal-body">
                            <table className="table table-condensed table-bordered actionTable mytable">
                                <tbody>
                                    <tr>
                                        <th style={{ width: '10%' }}> Created By</th>
                                        <th style={{ width: '15%' }}> Created date</th>
                                        <th title="Client / Department "> Client/Dept</th>
                                        <th>Category/SubCategory</th>
                                        <th> Subject</th>
                                        <th> Description</th>
                                        <th>Status</th>
                                    </tr>
                                    <tr>
                                        <td> {this.state.TaskInDetail.CreatedBy} </td>
                                        <td>  {moment(this.state.TaskInDetail.CreatedDate).format("DD-MMM-YYYY")} </td>
                                        <td> {this.state.TaskInDetail.Department !== null ? this.state.TaskInDetail.Department : <b>{this.state.TaskInDetail.Client}</b>} </td>
                                        <td>{this.state.TaskInDetail.Category + "/" + this.state.TaskInDetail.SubCategory}</td>
                                        <td> {this.state.TaskInDetail.Subject} </td>
                                        <td>  {this.getDescription(this.state.Description)} </td>
                                        <td>{this.state.TaskInDetail.TaskStatus}</td>
                                    </tr>

                                </tbody>

                            </table>
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
                                        this.state.TaskLog.map((el, i) => {
                                            return (
                                                <tr key={el["Id"]} >
                                                    <td> {moment(el["TaskLogDate"]).format("DD-MMM-YYYY hh:mm a")}</td>
                                                    <td> {el["TaskLogAssignedBy"]}</td>
                                                    <td style={{ width: '50%', paddingTop: '0px' }}>
                                                        {this.getDescription(el["TaskLogDescription"])}
                                                    </td>
                                                    <td>  {el["TaskLogStatus"] == "Closed by assignee" ? " " : el["TaskLogAssignedTo"]} </td>
                                                    <td> {el["TaskLogStatus"]}</td>
                                                    <td style={{ textAlign: 'center' }}> {el["TaskLogHoursWorked"] > 0 ? el["TaskLogHoursWorked"] : ""} </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                            <div className="col-xs-12" style={{ paddingTop: '5px' }}>
                                <div className="col-md-6 col-xs-12" >
                                    <table className="table table-condensed table-bordered headertable">
                                        <tbody>
                                            <tr>
                                                <th> Expected start Date </th>
                                                <td> {this.state.TaskInDetail.StartAndEndDate != null ?
                                                    moment(this.state.TaskInDetail.StartAndEndDate.TaskLogStartDate).format("DD-MMM-YYYY")
                                                    : ""}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Expected Date of Closure</th>
                                                <td> {moment(this.state.TaskInDetail["EDOC"]).format("DD-MMM-YYYY")}</td>
                                            </tr>
                                            <tr>
                                                <th>Budgeted Hours </th>
                                                <td>
                                                    {this.state.TaskInDetail.StartAndEndDate != null ? this.state.TaskInDetail.StartAndEndDate.TaskLogBudgetedHours
                                                        : ""}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-6 col-xs-12 ">
                                    <table className="table table-condensed table-bordered headertable">
                                        <tbody>
                                            <tr>
                                                <th> Actual Start Date </th>
                                                <td> {this.state.TaskInDetail.StartAndEndDate != null ?
                                                    moment(this.state.TaskInDetail.StartAndEndDate.TaskLogStartDate).format("DD-MMM-YYYY")
                                                    : ""}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th> Actual closed date </th>
                                                <td> {this.state.TaskInDetail["CompletedDate"] !== null ? moment(this.state.TaskInDetail["CompletedDate"]).format("DD-MMM-YYYY") : "Not yet completed"} </td>
                                            </tr>
                                            <tr>
                                                <th>Hours Worked </th>
                                                <td> {this.state.TaskInDetail["TotalHoursWorked"] != null ? this.state.TaskInDetail["TotalHoursWorked"] : ""} </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer"></div>
                    </div>
                </div>

            </div >
        )
    }


    gotoChangeDescription(description) {
        const contentBlock = convertFromHTML(description);
        if (contentBlock.contentBlocks !== null) {
            const contentState = ContentState.createFromBlockArray(contentBlock);
            const editorState = EditorState.createWithContent(contentState);
            return editorState;
        }
    }

    getDescription(desc) {
        return (
            <Editor name="actionDescription" readonly={true} id="actionDescription"
                editorState={this.gotoChangeDescription(desc)} toolbarClassName="hide-toolbar"
                wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
            />
        )
    }

    edocFormatter(cell, row) {
        if (moment(row["TaskLogDate"]).format("DD-MM-YYYY") <= moment(row["edoc"]).format("DD-MM-YYYY")) {
            return (
                <p>{moment(row["edoc"]).format("DD-MMM-YYYY")}</p>
            )
        }
        else {
            return (
                <p style={{ color: 'red' }}>{moment(row["edoc"]).format("DD-MMM-YYYY")}</p>
            )
        }
    }


    CategoryChanged(val) {
        if (val) {
            this.setState({ Category: val.value })
        }
        else {
            this.setState({ Category: null })
        }
    }


    ClientDeptFormatter(cell, row) {
        return <p >  {row["Department"] == null ? row["Client"] : row["Department"]} </p>
    }

    CategoryFormatter(cell, row) {
        return (
            <p>{row["Category"] + "/" + row["SubCategory"]}</p>
        )
    }

    employeeChanged(val) {
        if (val) {
            this.setState({ Employee: val.value });
            showErrorsForInput(this.refs.employee.wrapper, null);
        }
        else {
            this.setState({ Employee: '' })
            showErrorsForInput(this.refs.employee.wrapper, ["Select employee"])
        }
    }

    DescriptionFormat(cell, row) {
        return (
            <Editor name="actionDescription" readonly={true} id="actionDescription"
                editorState={this.gotoChangeDescription(row["TaskLogDescription"])} toolbarClassName="hide-toolbar"
                wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
            />
        )
    }
    TaskIdFormatter(cell, row) {
        return (
            <span>
                <span className={"glyphicon glyphicon-star"} style={row["Priority"] == 'HIGH' ? { color: 'red' } : row["Priority"] == 'MEDIUM' ? { color: 'orange' } : { color: 'green' }}
                    name="star" active="true" />
                <span style={{ color: 'none', cursor: 'pointer' }} onClick={() => { this.viewCompleteLog(row) }} >  {row["TaskId"]} </span>
            </span>
        )

    }

    viewCompleteLog(row) {
        this.setState({ TaskInDetail: row, TaskLog: row["TaskLog"], Description: row["Description"] }, () => {
            $("#taskInDetailModel").modal('show');
        })
    }

    TaskLogFormatter(cell, row) {
        return (
            <p>{moment(row["TaskLogDate"]).format("DD-MMM-YYYY h:mm A")}</p>
        )
    }

    clientChanged(val) {
        if (val) {
            this.setState({ Client: val.value })
        }
        else {
            this.setState({ Client: '' })
        }
    }

    StatusChanged(val) {
        if (val) {
            this.setState({ Status: val.value })
        }
        else {
            this.setState({ Status: 'ALL' })
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

    clearClick() {
        this.setState({
            Employee: '',
            Client: '',
            FromDate: null,
            ToDate: null,
            EmployeeReport: []
        })
    }

    handleSearchClick(e) {
        e.preventDefault();
        if (!this.validate(e)) {
            return;
        }
        this.setState({
            Employee: this.state.Employee,
            FromDate: this.refs.fromDate.value,
            ToDate: this.refs.toDate.value
        }, () => {
            this.GetEmployeeReport();
        })

    }

    validate(e) {
        var success = true;
        var isSubmit = e.type === "submit";

        if (!this.state.Employee) {
            showErrorsForInput(this.refs.employee.wrapper, ["Select employee"]);
            success = false;
            if (isSubmit) {
                isSubmit = false;
            }
        }
        if (this.refs.fromDate.value == "") {
            showErrorsForInput(this.refs.fromDate, ["From date required"]);
            success = false;
            if (isSubmit) {
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.fromDate, null);
        }
        if (this.refs.toDate.value == "") {
            showErrorsForInput(this.refs.toDate, ["To date is required"]);
            success = false;
            if (isSubmit) {
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.toDate, null);
        }
        if (success) {
            var dateDiff = ((moment(this.refs.toDate.value).diff(moment(this.refs.fromDate.value), 'days')) + 1);
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

export default DayReport;

