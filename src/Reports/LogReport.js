import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '../Config';
import { toast } from 'react-toastify';
import { MyAjax } from '.././MyAjax.js';
import './Report.css';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { showErrorsForInput } from '../Validation';
import validate from 'validate.js';

var moment = require('moment');


class LogReport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Employee: "", Employees: [], EmployeeReport: false, dataTotalSize: null, Client: '',
            Clients: [], EmployeesList: [], EmployeeTaskReport: [],
            Priority: null, Status: 'ALL', SearchClick: false,
            EmpTasksReport: [], EmployeeName: null, IsDataAvailable: false, TotalCount: null, TaskPriority: null,
            TaskId: '', ToDate: moment().format("YYYY-MM-DD"),
            FromDate: moment().format("YYYY-MM-DD"),
            ReportData: [], EmployeeTaskData: [], isEmployeeChecked: true,
            isClientChecked: false, TaskId: '',
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

        this.GetEmployeeReport();
    }

    GetEmployeeReport() {
        var url = ""

        if (this.state.isEmployeeChecked) {
            url = ApiUrl + "/api/Reports/GetEmployeesLogReport?empId=" + this.state.Employee +
                "&fromDate=" + this.state.FromDate + "&toDate=" + this.state.ToDate + "&clientId=" + this.state.Client +
                "&priority=" + this.state.Priority + "&status=" + this.state.Status + "&taskId=" + this.state.TaskId +
                "&catId=" + null;
        }
        else {
            url = ApiUrl + "/api/Reports/GetClientLogReport?empId=" + this.state.Employee +
                "&fromDate=" + this.state.FromDate + "&toDate=" + this.state.ToDate + "&clientId=" + this.state.Client +
                "&priority=" + this.state.Priority + "&status=" + this.state.Status + "&taskId=" + this.state.TaskId +
                "&catId=" + null;
        } 
        MyAjax(
            url,
            (data) => {
                this.setState({ ReportData: data["reportData"], SearchClick: true, IsDataAvailable: true })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }

    render() {
        return (
            <div className="myContainer" >
                <form onSubmit={this.handleSearchClick.bind(this)} onChange={this.validate.bind(this)}>
                    <div className=" SearchContainerStyle">
                        <div className="col-xs-12">
                            <h4 className="reportHeader">Activities Log Report</h4>
                        </div>
                        <div className="col-xs-12">
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
                                <label> Log From Date </label>
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
                                <label> Log To Date </label>
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
                                            options={[{ value: 'ALL', label: 'All' }, { value: 'Closed', label: 'Closed' }, { value: 'Open', label: 'Open' },
                                            { value: 'InProcess', label: 'InProcess' }, { value: 'Pending', label: 'Pending' }, { value: 'NotResolved', label: 'Not Resolved' },
                                            { value: 'NotClosed', label: 'Not Closed' },  { value: 'Hold', label: 'Hold' },
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
                        <div className="col-xs-12">
                            <div className="col-md-2">
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon"> </span>
                                        <input className="form-control" type="text" placeholder="Task Id" ref="taskId" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 form-group" key={this.state.isEmployeeChecked} >
                                <div className="col-md-2 form-group" key={this.state.isEmployeeChecked} >
                                    <label className="radiocontainer" style={{ marginBottom: '-35px', marginTop: '10px' }}  >
                                        <label className="radiolabel" > Employee </label>
                                        <input type="radio" name="reportType" className="form-control folderChecked" defaultChecked={this.state.isEmployeeChecked} onClick={this.EmployeeWiseReportClick.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                                <div className="col-md-2 form-group" key={this.state.isClientChecked} style={{ marginLeft: '41%', marginTop: '-17px' }}   >
                                    <label className="col-md-2 radiocontainer"  >
                                        <label className="radiolabel">  Client </label>
                                        <input type="radio" name="reportType" className="form-control fileChecked form-control" defaultChecked={this.state.isClientChecked} onClick={this.ClientWiseReportClick.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-2" style={{ marginTop: '0%', marginBottom: '1%' }} >
                                <button type="submit" name="submit" className="btn btn-primary" value="Search" > Search </button>
                                <button type="button" name="clear" className="btn btn-default mleft10" value="Clear" onClick={this.clearClick.bind(this)}> Clear </button>
                            </div>
                        </div>
                    </div>
                </form>

                {
                    this.state.IsDataAvailable == true ?
                        this.state.ReportData.length > 0 ?
                            <div className="col-xs-12" key={this.state.ReportData}>
                                {
                                    this.state.ReportData.map((ele, i) => {
                                        if (this.state.Employee !== '') {
                                            if (ele["TaskLogAssignedById"] == this.state.Employee) {
                                                return (
                                                    <div className="panel-group" id="accordion" key={i}>
                                                        <div className="panel panel-default">
                                                            <div className="panel-heading">
                                                                <h6 className="panel-title panelHeading" style={{ paddingTop: '6px' }}>
                                                                    <p data-toggle="collapse" data-parent="#accordion" href={"#collapse" + i}>
                                                                        {ele["Client"] != null ? ele["Client"].toUpperCase() : ele["TaskLogAssignedBy"].toUpperCase()}
                                                                    </p>
                                                                </h6>
                                                            </div>
                                                            <div id={"collapse" + i} className="panel-collapse collapse">
                                                                <div className="panel-body">
                                                                    {
                                                                        ele["Task"].map((e, j) => {
                                                                            return (
                                                                                <div key={e["TaskId"] + j} className={(j % 2) == 0 ? "tasklogOdd" : "tasklogEven"} >
                                                                                    <div>
                                                                                        <table className="table table-condensed table-bordered actionTable mytable">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <th>Task Id</th>
                                                                                                    <th>Created By</th>
                                                                                                    <th>Created Date</th>
                                                                                                    <th>EDOC</th>
                                                                                                    <th>Priority</th>
                                                                                                    <th>Client/Dept</th>
                                                                                                    <th>Category/SubCategory</th>
                                                                                                    {e["Project"] != null ? <th>Project</th> : ""}
                                                                                                    {e["ProjectLocation"] != null ? <th>Location</th> : ""}
                                                                                                    <th>Status</th>
                                                                                                </tr>

                                                                                                <tr>
                                                                                                    <td>{e["TaskId"]}</td>
                                                                                                    <td>{e["CreatedBy"]}</td>
                                                                                                    <td>{moment(e["CreatedDate"]).format("DD-MMM-YYYY")} </td>
                                                                                                    <td>{(e["CompletedDate"] != null && (moment(e["EDOC"]).format("DD-MM-YYYY") < moment().format("DD-MM-YYYY"))) ?
                                                                                                        <p> {moment().format("DD-MMM-YYYY")} </p> :
                                                                                                        <p style={{ color: 'red' }}>   {moment().format("DD-MMM-YYYY")}  </p>
                                                                                                    }
                                                                                                    </td>
                                                                                                    <td>{e["Priority"]}</td>
                                                                                                    <td> {e["Department"] != null ? e["Department"] : <b>{e["Client"]}</b>} <span /></td>
                                                                                                    <td>{e["Category"] + "/" + e["SubCategory"]}</td>
                                                                                                    {e["Project"] != null ? <td> <span> {e["Project"]} </span> </td> : ""}
                                                                                                    {e["ProjectLocation"] != null ?
                                                                                                        <td> {e["ProjectLocation"] != null ? <span> {e["ProjectLocation"]} </span> : ""}</td> : ""}
                                                                                                    <td>{e["Status"]}</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                        <p> <b> Subject :</b>  {e["Subject"]} </p>
                                                                                        <div>
                                                                                            <b >Description : </b>
                                                                                            <Editor name="actionDescription" readonly={true} id="actionDescription"
                                                                                                editorState={this.gotoChangeDescription(e["Description"])} toolbarClassName="hide-toolbar"
                                                                                                wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                                                            />
                                                                                        </div>
                                                                                        <table className="table table-condensed table-bordered actionTable mytable">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <th> Expected Start Date  </th>
                                                                                                    <td> {e["ExpectedStartDate"] != null ? moment(e["ExpectedStartDate"]["TaskLogStartDate"]).format("DD-MMM-YYYY") : "Not yet started"} </td>
                                                                                                    <th> Expected End Date </th>
                                                                                                    <td>  {e["ExpectedEndDate"] != null ? moment(e["ExpectedEndDate"]["TaskLogEndDate"]).format("DD-MMM-YYYY") : ""} </td>
                                                                                                    <th> Budgeted Hours </th>
                                                                                                    <td>{e["BudgetedHours"] != null ? e["BudgetedHours"]["TaskLogBudgetedHours"] : "0"}</td>
                                                                                                    <th> Hours worked </th> <td>{e["HoursWorked"] != null ? e["HoursWorked"] : "0"}</td>
                                                                                                    <th>Actual Close Date  </th>
                                                                                                    <td> {e["CompletedDate"] != null ? moment(e["CompletedDate"]).format("DD-MMM-YYYY") : "Not yet closed"}</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>

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

                                                                                                e["TaskLog"].map((el, j) => {
                                                                                                    return (
                                                                                                        //   <tr className= { moment(this.state.FromDate).format("DD-MM-YYYY") >= moment(el["TaskLogDate"]).format("DD-MM-YYYY") || moment(this.state.ToDate).format("DD-MM-YYYY") == moment(el["TaskLogDate"]).format("DD-MM-YYYY") ? "selectedDateRow": ""} >
                                                                                                        <tr className={el["TaskLogAssignedById"] == this.state.Employee ? this.setRowStyle(el["TaskLogDate"]) : ""}>
                                                                                                            <td> {moment(el["TaskLogDate"]).format("DD-MMM-YYYY hh:mm a")}</td>
                                                                                                            <td> {el["TaskLogAssignedBy"]}</td>
                                                                                                            <td style={{ width: '50%', paddingTop: '0px' }}>
                                                                                                                <Editor name="actionResponse" readonly={true} id="actionResponse"
                                                                                                                    editorState={this.gotoChangeContent(el["TaskLogDescription"])} toolbarClassName="hide-toolbar"
                                                                                                                    wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                                                                                />
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
                                                                                    <div />
                                                                                    {/* <div className="col-xs-12">
                                                             <hr style={{marginTop: '14px', marginBottom: '14px'}} />
                                                         </div> */}
                                                                                </div>
                                                                            )

                                                                        })
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            else {
                                                return (
                                                    <span></span>
                                                );
                                            }
                                        }
                                        else {
                                            return (
                                                <div className="panel-group" id="accordion" key={i}>
                                                    <div className="panel panel-default">
                                                        <div className="panel-heading">
                                                            <h6 className="panel-title panelHeading" style={{ paddingTop: '6px' }}>
                                                                <p data-toggle="collapse" data-parent="#accordion" href={"#collapse" + i}>
                                                                    {ele["Client"] != null ? ele["Client"].toUpperCase() : ele["TaskLogAssignedBy"].toUpperCase()}
                                                                    {/* {
                                                                   this.state.isClientChecked ?   ele["Client"].toUpperCase(): ele["TaskLogAssignedBy"].toUpperCase()
                                                                    } */}
                                                                </p>
                                                            </h6>
                                                        </div>
                                                        <div id={"collapse" + i} className="panel-collapse collapse">
                                                            <div className="panel-body">
                                                                {
                                                                    ele["Task"].map((e, j) => {
                                                                        return (
                                                                            <div key={e["TaskId"] + j} className={(j % 2) == 0 ? "tasklogOdd" : "tasklogEven"} >
                                                                                <div>
                                                                                    <table className="table table-condensed table-bordered actionTable mytable">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <th>Task Id</th>
                                                                                                <th>Created By</th>
                                                                                                <th>Created Date</th>
                                                                                                <th>EDOC</th>
                                                                                                <th>Priority</th>
                                                                                                <th>Client/Dept</th>
                                                                                                {e["Project"] != null ? <th>Project</th> : ""}
                                                                                                {e["ProjectLocation"] != null ? <th>Location</th> : ""}
                                                                                                <th>Category/SubCategory</th>
                                                                                                <th>Status</th>
                                                                                            </tr>

                                                                                            <tr>
                                                                                                <td>{e["TaskId"]}</td>
                                                                                                <td>{e["CreatedBy"]}</td>
                                                                                                <td>{moment(e["CreatedDate"]).format("DD-MMM-YYYY")} </td>
                                                                                                <td>{(e["CompletedDate"] != null && (moment(e["EDOC"]).format("DD-MM-YYYY") < moment().format("DD-MM-YYYY"))) ?
                                                                                                    <p> {moment().format("DD-MMM-YYYY")} </p> :
                                                                                                    <p style={{ color: 'red' }}>   {moment().format("DD-MMM-YYYY")}  </p>
                                                                                                }
                                                                                                </td>
                                                                                                <td>{e["Priority"]}</td>
                                                                                                <td> {e["Department"] != null ? e["Department"] : <b> {e["Client"]}</b>} <span /></td>
                                                                                                {e["Project"] != null ? <td> <span> {e["Project"]} </span> </td> : ""}
                                                                                                {e["ProjectLocation"] != null ?
                                                                                                    <td> {e["ProjectLocation"] != null ? <span> {e["ProjectLocation"]} </span> : ""}</td> : ""}
                                                                                                <td>{e["Category"] + "/" + e["SubCategory"]}</td>
                                                                                                <td>{e["Status"]}</td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                    <p> <b> Subject :</b>  {e["Subject"]} </p>
                                                                                    <div>
                                                                                        <b >Description : </b>
                                                                                        <Editor name="actionDescription" readonly={true} id="actionDescription"
                                                                                            editorState={this.gotoChangeDescription(e["Description"])} toolbarClassName="hide-toolbar"
                                                                                            wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                                                        />
                                                                                    </div>

                                                                                    {/* <p>
                                                               <b> Expected Start Date : </b>  { e["ExpectedStartDate"]!=null ? moment(e["ExpectedStartDate"]["TaskLogStartDate"]).format("DD-MMM-YYYY") : "" } <span />
                                                               <b> Expected End Date : </b> { e["ExpectedEndDate"]!=null? moment(e["ExpectedEndDate"]["TaskLogEndDate"]).format("DD-MMM-YYYY") : ""} <span />
                                                               <b> Budgeted Hours : </b> {e["BudgetedHours"]!=null ? e["BudgetedHours"]["TaskLogBudgetedHours"] : ""} <span />
                                                               <b> Hours worked : </b> {e["HoursWorked"]} <span />
                                                               <b> Actual Close Date : </b> {e["CompletedDate"] !=null ? moment(e["CompletedDate"]).format("DD-MMM-YYYY") : ""}
                                                            </p> */}

                                                                                    <table className="table table-condensed table-bordered actionTable mytable">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <th> Expected Start Date  </th>
                                                                                                <td> {e["ExpectedStartDate"] != null ? moment(e["ExpectedStartDate"]["TaskLogStartDate"]).format("DD-MMM-YYYY") : "Not yet started"} </td>
                                                                                                <th> Expected End Date </th>
                                                                                                <td>  {e["ExpectedEndDate"] != null ? moment(e["ExpectedEndDate"]["TaskLogEndDate"]).format("DD-MMM-YYYY") : ""} </td>
                                                                                                <th> Budgeted Hours </th>
                                                                                                <td>{e["BudgetedHours"] != null ? e["BudgetedHours"]["TaskLogBudgetedHours"] : "0"}</td>
                                                                                                <th> Hours worked </th> <td>{e["HoursWorked"] != null ? e["HoursWorked"] : "0"}</td>
                                                                                                <th>Actual Close Date  </th>
                                                                                                <td> {e["CompletedDate"] != null ? moment(e["CompletedDate"]).format("DD-MMM-YYYY") : "Not yet closed"}</td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>

                                                                                </div>

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

                                                                                            e["TaskLog"].map((el, j) => {
                                                                                                return (
                                                                                                    //   <tr className= { moment(this.state.FromDate).format("DD-MM-YYYY") >= moment(el["TaskLogDate"]).format("DD-MM-YYYY") || moment(this.state.ToDate).format("DD-MM-YYYY") == moment(el["TaskLogDate"]).format("DD-MM-YYYY") ? "selectedDateRow": ""} >
                                                                                                    <tr className={this.setRowStyle(el["TaskLogDate"])}>
                                                                                                        <td> {moment(el["TaskLogDate"]).format("DD-MMM-YYYY hh:mm a")}</td>
                                                                                                        <td> {el["TaskLogAssignedBy"]}</td>
                                                                                                        <td style={{ width: '50%', paddingTop: '0px' }}>
                                                                                                            <Editor name="actionResponse" readonly={true} id="actionResponse"
                                                                                                                editorState={this.gotoChangeContent(el["TaskLogDescription"])} toolbarClassName="hide-toolbar"
                                                                                                                wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                                                                            />
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
                                                                                <div />
                                                                                {/* <div className="col-xs-12">
                                                             <hr style={{marginTop: '14px', marginBottom: '14px'}} />
                                                         </div> */}
                                                                            </div>
                                                                        )

                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })
                                }
                            </div>
                            :
                            <div className="col-xs-12 messageStyle">
                                <h4> No records found </h4>
                            </div>
                        :
                        <div className="loader visible" style={{ marginTop: '12%' }}></div>
                }

            </div>
        )
    }


    setRowStyle(logDate) {
        var fromDate = this.state.FromDate;
        var toDate = this.state.ToDate;
        if (moment(logDate).isSameOrAfter(moment(fromDate))) {
            if ((moment(logDate)) <= (moment(toDate)) || moment(logDate).format("DD-MM-YYYY") == moment(toDate).format("DD-MM-YYYY")) {
                return "selectedDateRow";
            }
            else {
                return "";
            }
        }
        else {
            return "";
        }
    }

    ClientWiseReportClick() {
        this.setState({ isEmployeeChecked: false, isClientChecked: true })
    }

    EmployeeWiseReportClick() {
        this.setState({ isEmployeeChecked: true, isClientChecked: false })
    }

    gotoChangeContent(content) {

        const contentBlock = convertFromHTML(content);
        if (contentBlock.contentBlocks !== null) {
            const contentState = ContentState.createFromBlockArray(contentBlock);
            const editorState = EditorState.createWithContent(contentState);
            return editorState;
        }
        else {
            const editor = EditorState.createEmpty();
            return editor;
        }

    }

    gotoChangeDescription(description) {
        const contentBlock = convertFromHTML(description);
        if (contentBlock.contentBlocks !== null) {
            const contentState = ContentState.createFromBlockArray(contentBlock);
            const editorState = EditorState.createWithContent(contentState);
            return editorState;
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

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val.value })
        }
        else {
            this.setState({ Client: '' })
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
            this.setState({ Status: 'ALL' })
        }
    }

    clearClick() {
        this.refs.fromDate.value = moment().format('YYYY-MM-DD');
        this.refs.toDate.value = moment().format('YYYY-MM-DD');

        this.setState({
            Employee: '', Client: '', FromDate: moment().format('YYYY-MM-DD'),
            ToDate: moment().format('YYYY-MM-DD'), Status: 'ALL', Priority: null, isEmployeeChecked: true,
            isClientChecked: false, TaskId: ''
        }, () => {
            this.GetEmployeeReport();
        })
    }

    handleSearchClick(e) {
        e.preventDefault();
        if (!this.validate()) {
            return;
        }
        else {
            this.setState({
                Employee: this.state.Employee,
                FromDate: this.refs.fromDate.value,
                ToDate: this.refs.toDate.value,
                Status: this.state.Status,
                Priority: this.state.Priority,
                IsDataAvailable: false
            }, () => {
                this.GetEmployeeReport();
            })
        }
    }

    validate() {
        var success = true;

        if (this.refs.fromDate.value == "") {
            showErrorsForInput(this.refs.fromDate, ["From Date is required"]);
            this.refs.fromDate.focus();
            success = false;
        }
        else {
            showErrorsForInput(this.refs.fromDate, null);
        }

        if (this.refs.toDate.value == "") {
            showErrorsForInput(this.refs.toDate, ["To Date is required"]);
            this.refs.toDate.focus()
            success = false;
        }
        else {
            showErrorsForInput(this.refs.toDate, null);
        }

        if (this.refs.fromDate.value > this.refs.toDate.value) {
            showErrorsForInput(this.refs.fromDate, ["From date is greater than to date"]);
            this.refs.fromDate.focus()
            success = false;
        }
        else {
            showErrorsForInput(this.refs.fromDate, null);
        }

        if (this.refs.taskId.value !== "") {
            var TaskIdConstraints = {
                length: {
                    maximum: 10
                }
            }

            if (validate.single(this.refs.taskId.value, TaskIdConstraints) !== undefined) {
                success = false;
                showErrorsForInput(this.refs.taskId, ["Enter valid task id"]);
                this.refs.taskId.focus();
            }
            else {
                showErrorsForInput(this.refs.taskId, null);
            }
        }


        return success;

    }
}

export default LogReport;
