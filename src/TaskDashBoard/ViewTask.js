import React, { Component } from 'react';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '.././Config.js';
import { toast } from 'react-toastify';
import { MyAjaxForAttachments, MyAjax } from '../MyAjax.js';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { validate } from 'validate.js'
import './TaskDashBoard.css';
import { AssigneesList } from '../Task/AssigneesList';
import {
    user, client, department, taskType, priority, employeeName,
    status, sortCol, sortDir, taskCategory, screen
} from '../Globals';

var moment = require('moment');

class ViewTask extends Component {

    constructor(props) {
        super(props);
        var assignees = [{ AssigneeId: null, AssigneeName: "", Quantity: null }]

        this.state = {
            TaskInfo: [], TaskLog: [],
            Assignees: [], ActivityLog: [], PreviouslyWorkedQuantity: null,
            showHoursWorked: false, StartDate: moment().format("YYYY-MM-DD"), budgetedHoursDisabled: false,
            Description: EditorState.createEmpty(), ActionType: null, IsDisabled: false, DescriptionHtml: "",
            AssignedBy: null, TaskOwner: null, TaskId: '', Status: null, Status: null, Statuses: [],
            EndDate: "", maxBudgetedHours: '', BudgetedHours: '', TaskAssignees: assignees, OrgId: null,
            AddMultipleAssignees: false, markAsUnreadClick: false, LoginUser: '', Notifications: 0,
            RowNum: 1, TotalRecords: 0, IsDataAvailable: false, Task: [], Points: ''
        }
    }

    componentWillMount() {

        if (this.props.location.state !== undefined) {
            this.setState({
                TaskId: this.props.location.state["TaskId"],
                TaskCreator: this.props.location.state["CreatedBy"],
                TaskOwner: this.props.location.state["TaskOwner"],
                Status: this.props.location.state["Status"],
                LoginUser: user != "" ? user : sessionStorage.getItem("Emp_Id"),
                //LoginUser:  this.props.location.state["EmpId"],
                Notifications: this.props.location.state["Notifications"],
                RowNum: this.props.location.state["RowId"],
                LoginUserName: this.props.location.state["EmployeeName"]
            }, () => {
                this.GetTaskInfo()
            })
        }
        else {
            this.props.history.push("/TaskDashBoard");
        }
    }

    GetTaskInfo() {
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")

        MyAjax(
            ApiUrl + "/api/Activities/GetTaskDetail?taskId=" + this.state.TaskId +
            "&employeeId=" + this.state.LoginUser,
            (data) => {
                this.setState({
                    Task: data["taskDetail"], TaskLog: data["taskDetail"]["TaskLog"],
                    IsDataAvailable: true, Points: data["taskDetail"]["Points"]
                })
            },
            (error) => toast(error.responseText, { type: toast.TYPE.ERROR })
        )

        if (this.state.Status != "Closed") {
            if (this.state.LoginUser == this.state.TaskCreator) {
                if (this.state.Status == "Open" || this.state.Status === "Pending") {
                    this.setState({ Statuses: [{ value: "AcceptToClose", label: "Accept To Close" }, { value: 'Comments', label: 'Comments/Remarks' }] })
                }
                else {
                    this.setState({ Statuses: [{ value: "AcceptToClose", label: "Accept To Close" }, { value: 'Comments', label: 'Comments/Remarks' }, { value: "Reopen", label: "Reopen" }] })
                }
            }
        }

        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + this.state.TaskCreator + "&OrgId=" + orgId,
            (data) => {
                this.setState({ Assignees: data["employees"] }, () => {
                    var employees = data["employees"];
                    var currentLogin = employees.findIndex((i) => i.value == sessionStorage.getItem("EmpId"));
                    employees.splice(currentLogin, 1);
                    this.setState({ Assignees: employees });
                })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )

        $.ajax({
            url: ApiUrl + "/api/Activities/GetTaskHoursWorkedInfo?taskId=" + this.state.TaskId +
                "&userId=" + this.state.LoginUser,
            type: "get",
            success: (data) => {
                this.setState({ ActivityLog: data["activitylog"] }, () => {
                    if (this.state.ActivityLog !== null) {
                        this.setState({
                            HoursWorked: data["activitylog"]["TotalHoursWorked"]
                        }, () => {
                            if (data["activitylog"]["TotalHoursWorked"] > 0) {
                                this.setState({ showHoursWorked: true })
                            }
                            if (data["activitylog"]["TotalQuantityWorked"] > 0) {
                                this.setState({ PreviouslyWorkedQuantity: data["activitylog"]["TotalQuantityWorked"] })
                            }
                            if (data["activitylog"]["EndDate"] !== null) {
                                this.setState({
                                    StartDate: moment(data["activitylog"]["StartDate"]).format("YYYY-MM-DD"),
                                    EndDate: moment(data["activitylog"]["EndDate"]).format("YYYY-MM-DD"),
                                    BudgetedHours: data["activitylog"]["BudgetedHours"],
                                    isAcknowledged: true
                                })

                                if (this.state.LoginUser !== this.state.TaskCreator) {
                                    this.setState({
                                        Statuses: [{ value: "Assign", label: "Assign" },
                                        { value: "Pending", label: "Pending" },
                                        { value: "Hold", label: "Hold" },
                                        { value: "Resolved", label: "Resolved" }]
                                    })
                                }
                            }
                            else {
                                if (this.state.LoginUser !== this.state.TaskCreator) {
                                    this.setState({
                                        Statuses: [{ value: "Assign", label: "Assign" },
                                        { value: "InProcess", label: "InProcess/Acknowledgement" },
                                        { value: "Pending", label: "Pending" },
                                        { value: "Hold", label: "Hold" },]
                                    })
                                }

                            }
                        })
                    }
                    else {
                        this.setState({ showHoursWorked: false })
                    }
                })
            }
        })
    }

    componentDidUpdate() {
        $("#input-id").fileinput({
            theme: "explorer",
            hideThumbnailContent: true,
            uploadUrl: ApiUrl + "/api/Task",
            uploadAsync: true,
            overwriteInitial: false,
            initialPreviewAsData: true,
            showCancel: false,
            showRemove: false,
            showUpload: false,
            minFileCount: 1,
            fileActionSettings: {
                showUpload: false,
                showRemove: true
            }
        })
    }

    render() {
        return (
            <div className="container" key={this.props.location.state}>
                <div className="col-xs-12" style={{ marginTop: '1%' }}>
                    <h4 className="col-md-6"> <label>Task Details : {this.state.TaskId}</label><span className="pull-right" /> </h4>
                    {
                        this.state.Notifications > 0 ?
                            <button style={{ float: 'right' }} className="col-md-2 btn btn-default btn-sm unreadBtn mleft1" onClick={this.markAsUnreadClick.bind(this)}  > Mark as Unread </button>
                            :
                            <div />
                    }
                    <span></span>
                    <button style={{ float: 'right' }} className="col-md-2 btn btn-default btn-sm backBtn mLeft1" onClick={() => {
                        //this.props.history.push("/TaskDashboard/" + this.props.location.state["EmpId"])
                        // this.props.history.push({
                        //     state: { 
                        //         EmpId: user,
                        //         EmployeeName: employeeName
                        //     },
                        //     pathname: "/TaskDashboard"
                        // })

                        this.props.history.push({
                            state: {
                                EmpId: this.props.location.state["EmpId"],
                                EmployeeName: employeeName
                            },
                            pathname: "/TaskDashboard"
                        })

                    }}  > Back </button>
                    <span></span>
                    <button style={{ float: 'right' }} type="button" name="nxtbtn" className="btn btn-default btn-sm mLeft1" onClick={() => { this.handleNextClick() }}>
                        <span className="glyphicon glyphicon-forward"></span> Next
                    </button>
                    <span></span>
                    <button style={{ float: 'right' }} type="button" name="prebtn" className="btn btn-default btn-sm mLeft1" onClick={() => { this.handlePreviousClick() }}>
                        <span className="glyphicon glyphicon-backward"></span> Previous
                    </button>


                </div>

                {
                    this.state.IsDataAvailable ?
                        <div>
                            <div className="col-md-6 col-xs-12 ">
                                <table className="table table-condensed table-bordered headertable">
                                    <tbody>
                                        <tr>
                                            <th>Created By</th>
                                            <td>{this.state.Task["CreatedBy"]}</td>
                                        </tr>
                                        <tr>
                                            <th>Created On</th>
                                            <td>{moment(this.state.Task["CreatedDate"]).format("DD-MMM-YYYY h:mm a")}</td>
                                        </tr>
                                        <tr>
                                            <th>Assigned To </th>
                                            <td>{this.state.Task["TaskOwner"]}</td>
                                        </tr>
                                        <tr>
                                            <th>Category</th>
                                            <td>{this.state.Task["Category"]}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-md-6 col-xs-12" style={{ marginBottom: '1%' }}>
                                <table className="table table-condensed table-bordered headertable" >
                                    <tbody>
                                        <tr>
                                            <th> Exp. Date of closure/Priority </th>
                                            <td >{moment(this.state.Task["EDOC"]).format("DD-MMM-YYYY")} /
                                  <span className={this.state.Task["Priority"] == "HIGH" ?
                                                    "priorityHigh" : this.state.Task["Priority"] == "MEDIUM" ?
                                                        "priorityMedium" : "priorityLow"}>  {this.state.Task["Priority"]}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Status</th>
                                            <td> {this.state.Task["Status"]} </td>
                                        </tr>
                                        <tr>
                                            <th>Assigned Date</th>
                                            <td> {moment(this.state.Task["CreatedDate"]).format("DD-MMM-YYYY h:mm a")}  </td>
                                        </tr>
                                        <tr>
                                            <th>SubCategory</th>
                                            <td>
                                                <p>{this.state.Task["SubCategory"]}
                                                    {this.state.Task["Quantity"] ?
                                                        <span> : {this.state.Task["Quantity"]} </span>
                                                        : null}
                                                </p>

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-xs-12">
                                <table className="table table-condensed table-bordered headertable">
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '20px' }}>Subject </th>
                                            <td> <b> {this.state.Task["Subject"]} </b> </td>
                                        </tr>
                                        <tr>
                                            <th style={{ width: '20px' }} >Description</th>
                                            <td>
                                                <Editor name="actionResponse" readonly={true} id="actionResponse"
                                                    editorState={this.getDescription(this.state.Task["Description"])} toolbarClassName="hide-toolbar"
                                                    wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                />
                                            </td>
                                        </tr>
                                        {
                                            this.state.Task["TaskType"] === "Client" ?
                                                <tr>
                                                    <th style={{ width: '20px' }}> Client </th>
                                                    <td> <b> {this.state.Task["Client"]}</b> </td>
                                                </tr>
                                                :
                                                <tr />
                                        }

                                        {
                                            this.state.Task["TaskType"] === "Client" && this.state.Task["ProjectLocation"] != null ?
                                                <tr >
                                                    <th style={{ width: '20px' }}> Location </th>
                                                    <td > {this.state.Task["ProjectLocation"]} </td>
                                                </tr>
                                                :
                                                <tr />
                                        }

                                    </tbody>
                                </table>
                            </div>

                            <div className="col-xs-12" >
                                <p>
                                    {this.state.Task["Quantity"] ?
                                        <span><b> Budgeted Quantity : </b>{this.state.Task["Quantity"]}</span>
                                        : <span />
                                    }
                                    {
                                        this.state.budgetedHoursDisabled == true ?
                                            <span><b> Budgeted Hours : </b>  {this.state.BudgetedHours} </span>
                                            : <span />
                                    }
                                    {
                                        this.state.PreviouslyWorkedQuantity !== null ?
                                            <span> <b>Quantity Worked : </b> {this.state.PreviouslyWorkedQuantity} </span>
                                            : <span />
                                    }
                                    {
                                        this.state.showHoursWorked == true ?
                                            <span><b>Hours worked : </b> {this.state.HoursWorked} </span>
                                            : <span />
                                    }
                                </p>

                            </div>

                            <h4 className="col-xs-12" > <label>  Action/Responses </label> </h4>

                            <div className="col-xs-12">
                                <table className="table table-condensed table-bordered actionTable mytable">
                                    <tbody>
                                        <tr>
                                            <th > Task Date</th>
                                            <th> Assigned By</th>
                                            <th ></th>
                                            <th colSpan={2} style={{ width: '40%' }}> Action/ Response</th>
                                            <th  >Assigned To</th>
                                            <th > Status </th>
                                            <th >Hours Worked </th>
                                            {this.state.Task["Quantity"] != null && this.state.Task["Quantity"] != 0 ?
                                                <th>Quantity Worked</th>
                                                : null
                                            }
                                        </tr>
                                        {
                                            this.state.TaskLog.map((ele, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td > <p> {moment(ele["TaskLogDate"]).format("DD-MMM-YYYY h:mm a")} </p>  </td>
                                                        <td > {ele["TaskLogAssignedBy"]} </td>
                                                        <td >  {
                                                            ele["Attachments"] != null ?
                                                                ele["Attachments"].map((el) => {
                                                                    if (el["AttachmentURL"] !== null) {
                                                                        return (
                                                                            <a href={el["AttachmentURL"]} target="blank"> <i className='fa fa-paperclip' style={{ fontSize: '18px', cursor: 'pointer' }}  ></i> </a>
                                                                        )
                                                                    }
                                                                })
                                                                :
                                                                null
                                                        }
                                                        </td>
                                                        <td colSpan={2} style={{ paddingTop: '1px' }}>
                                                            <Editor name="actionResponse" readonly={true} id="actionResponse"
                                                                editorState={this.gotoChangeContent(ele["TaskLogDescription"])} toolbarClassName="hide-toolbar"
                                                                wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                            />
                                                        </td>

                                                        <td > {ele["TaskLogAssignedTo"]}</td>
                                                        <td> {ele["TaskLogStatus"]}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {ele["HoursWorked"] > 0 ?
                                                                ele["HoursWorked"]
                                                                :
                                                                null
                                                            }
                                                        </td>
                                                        {this.state.Task["Quantity"] != null && this.state.Task["Quantity"] != 0 ?
                                                            <td style={{ textAlign: 'center' }}>
                                                                {ele["QuantityWorked"] > 0 ? ele["QuantityWorked"] : ""}
                                                            </td>
                                                            :
                                                            null
                                                        }
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-xs-12" style={{ marginTop: '1%' }} key={this.state.Statuses}>
                                {
                                    this.state.Status != "Closed" && this.state.LoginUser == this.state.TaskOwner || this.state.LoginUser == this.state.TaskCreator ?
                                        <div className="panel panel-default" >
                                            <div className="panel-heading" style={{ paddingBottom: '38px' }} >
                                                <h4>Action</h4>
                                            </div>
                                            <div className="panel-body pver10 p0">
                                                <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)} key={this.state.EmployeeId} key={this.state.Statuses} >
                                                    <div className="col-md-3">
                                                        <label> Action Type</label>
                                                        <div className="form-group">
                                                            <div className="input-group">
                                                                <span className="input-group-addon">
                                                                    <span className="glyphicon glyphicon-user"></span>
                                                                </span>
                                                                <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.ActionType}
                                                                    options={this.state.Statuses} onChange={this.ActionTypeChanged.bind(this)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {
                                                        this.state.ActionType != null ?
                                                            <div>
                                                                {
                                                                    this.state.ActionType.value === "Pending" || this.state.ActionType.value === "InProcess" ?
                                                                        <div >
                                                                            <div className="col-md-3">
                                                                                <label>Expected Start Date </label>
                                                                                <div className="form-group">
                                                                                    <div className="input-group">
                                                                                        <span className="input-group-addon">
                                                                                            <span className="glyphicon glyphicon-calendar"></span>
                                                                                        </span>
                                                                                        <input className="form-control" disabled={this.state.IsDisabled} style={{ lineHeight: '19px' }} type="date" name="DOS" ref="dos" autoComplete="off" defaultValue={this.state.StartDate} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <label>Expected Date of Completion </label>
                                                                                <div className="form-group">
                                                                                    <div className="input-group">
                                                                                        <span className="input-group-addon">
                                                                                            <span className="glyphicon glyphicon-calendar"></span>
                                                                                        </span>
                                                                                        <input className="form-control" disabled={this.state.IsDisabled} style={{ lineHeight: '19px' }} type="date" name="DOC" ref="doc" autoComplete="off" defaultValue={this.state.EndDate} onChange={this.EdocChanged.bind(this)} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="col-md-3">
                                                                                <label>Planned Budgeted Hours</label>
                                                                                <div className="form-group">
                                                                                    <div className="input-group">
                                                                                        <span className="input-group-addon">
                                                                                            <span className="glyphicon glyphicon-time" ></span>
                                                                                        </span>
                                                                                        <input className="form-control" disabled={this.state.budgetedHoursDisabled} name="BudgetedHours" type="number" min="0" max={this.state.maxBudgetedHours} ref="budgetedhours" defaultValue={this.state.BudgetedHours} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        : ""
                                                                }

                                                                <div className="col-md-2" style={{ width: '26%' }} >
                                                                    <label> Hours Worked</label>
                                                                    <div className="form-group">
                                                                        <div className="input-group">
                                                                            <span className="input-group-addon">
                                                                                <span className="glyphicon glyphicon-time" ></span>
                                                                            </span>
                                                                            <input className="form-control" name="HoursWorked" type="number" min="0" max="10" ref="hoursWorked" autoComplete="off" />
                                                                        </div>
                                                                    </div>
                                                                </div>


                                                                {
                                                                    this.state.showHoursWorked == true ?
                                                                        <div className="col-md-3 form-group" style={{ width: '20%' }}>
                                                                            <label> Previously worked hours </label>
                                                                            <input className="form-control" disabled="true" name="previouslyWorkedHours" value={this.state.HoursWorked} />
                                                                        </div>
                                                                        : ""
                                                                }

                                                                {this.state.Task["Quantity"] ?
                                                                    <div className="col-md-2 form-group">
                                                                        <label>Budgeted Quantity</label>
                                                                        <input className="form-control" name="budgetedHours" disabled="true" value={this.state.Task["Quantity"]} />
                                                                    </div>
                                                                    : <div />
                                                                }
                                                                {
                                                                    this.state.PreviouslyWorkedQuantity !== null && this.state.ActionType.value !== "Comments" ?
                                                                        <div className="col-md-2 form-group" >
                                                                            <label>Worked quantity </label>
                                                                            <input className="form-control" name="previousQuantity" disabled="true" value={this.state.PreviouslyWorkedQuantity} />
                                                                        </div>
                                                                        : <div />
                                                                }

                                                                {
                                                                    this.state.Task["Quantity"] && this.state.LoginUser != this.state.TaskCreator && this.state.ActionType.value !== "Assign" && this.state.ActionType.value !== "Comments" ?
                                                                        <div className="col-md-2 form-group">
                                                                            <label>Qunatity Worked</label>
                                                                            <input className="form-control" type="number" placeholder="Quantity worked" name="quantityWorked" ref="quantityWorked" />
                                                                        </div>
                                                                        : <div />
                                                                }

                                                                {
                                                                    this.state.ActionType.value === "Assign" ?
                                                                        <div>
                                                                            <div className="col-md-3">
                                                                                <label> Assignee</label>
                                                                                <div className="form-group">
                                                                                    <div className="input-group">
                                                                                        <span className="input-group-addon">
                                                                                            <span className="glyphicon glyphicon-user"></span>
                                                                                        </span>
                                                                                        <Select className="form-control" name="AssignedTo" ref="assignee" placeholder="Select an Assignee" value={this.state.TaskAssignees[0]["AssigneeId"]} options={this.state.Assignees} onChange={this.AssigneeChanged.bind(this)} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {this.state.Task["Quantity"] !== null ?
                                                                                <div className="col-md-2" >
                                                                                    <label>Quantity</label>
                                                                                    <div className="form-group">
                                                                                        <div className="input-group">
                                                                                            <span className="input-group-addon"> </span>
                                                                                            <input className="form-control" type="number" step="1" name="quantity" ref="quantity" placeholder="Quantity" defaultValue={this.state.TaskAssignees[0]["Quantity"]} onChange={this.QuantityChanged.bind(this)} />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                :
                                                                                <div />
                                                                            }
                                                                            <div className="col-md-1" style={{ marginTop: '2%' }}>
                                                                                <button className="btn btn-primary glyphicon glyphicon-plus" type="button" name="add" value="addAssignee" title="Add multiple assignnees" onClick={this.AddAssignees.bind(this)}></button>
                                                                            </div>
                                                                        </div>
                                                                        : <div />
                                                                }

                                                                {
                                                                    this.state.ActionType.value == "Hold" ?
                                                                        <div>
                                                                            <div className="col-md-3">
                                                                                <label>Remind on</label>
                                                                                <div className="form-group">
                                                                                    <div className="input-group">
                                                                                        <span className="input-group-addon">
                                                                                            <span className="glyphicon glyphicon-calendar"></span>
                                                                                        </span>
                                                                                        <input className="form-control" style={{ lineHeight: '19px' }} type="date" name="remindOn" ref="remindDate" autoComplete="off" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        :
                                                                        <div />
                                                                }

                                                            </div>
                                                            : <div />
                                                    }
                                                    <div className="col-xs-12" key={this.state.TaskAssignees}>
                                                        <div className="col-xs-12">
                                                            {
                                                                this.state.TaskAssignees.map((ele, i) => {
                                                                    if (ele["AssigneeName"] !== '' && ele["Quantity"] != null && ele["Quantity"] != "") {
                                                                        return (
                                                                            <span key={i + moment().format('h:mm')}>  <b>Assignee Name :  </b> {ele["AssigneeName"]}
                                                                                <b>  Quantity : </b> {ele["Quantity"]}
                                                                                {
                                                                                    (this.state.TaskAssignees.length) !== (i + 1) ? <b>,</b> : null
                                                                                }
                                                                            </span>
                                                                        )
                                                                    }
                                                                    else {
                                                                        if (ele["AssigneeName"] !== '') {
                                                                            return (
                                                                                <span key={i + moment().format('h:mm')}>  <b>Assignee Name :  </b> {ele["AssigneeName"]}
                                                                                    {
                                                                                        (this.state.TaskAssignees.length) !== (i + 1) ? <b>,</b> : null
                                                                                    }
                                                                                </span>
                                                                            )
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                    {
                                                        this.state.LoginUser == this.state.TaskOwner || this.state.LoginUser == this.state.TaskCreator ?
                                                            <div>
                                                                <div className="col-xs-12" style={{ paddingTop: '12px' }}>
                                                                    <label> Action  </label>
                                                                    <div className="form-group" style={{ height: "auto" }}>
                                                                        <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor" toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }} editorState={this.state.Description} toolbarClassName="toolbarClassName" wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner" onEditorStateChange={this.messageBoxChange.bind(this)} />
                                                                        <input type="hidden" id="desc" ref="description" name="forErrorShowing" />
                                                                    </div>
                                                                </div>
                                                                <div className="col-xs-12 form-group">
                                                                    <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any" multiple />
                                                                    {/* showUpload="false" */}
                                                                </div>
                                                                <div className="col-xs-12 text-center form-group">
                                                                    <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                                                                    <button type="submit" name="submit" className="btn btn-primary" style={{ marginTop: '1%' }}>Submit</button>
                                                                </div>
                                                            </div>
                                                            :
                                                            <div />
                                                    }
                                                </form>
                                            </div>
                                        </div>
                                        :
                                        <div />
                                }
                            </div>
                            {
                                this.state.AddMultipleAssignees ?
                                    <div className="modal fade" id="assigneesModal" role="dialog" data-backdrop="static" key={this.state.TaskAssignees}>
                                        <div className="modal-dialog modal-lg" style={{ width: '728px' }}>
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <button type="button" className="close" data-dismiss="modal" id="closeModal">&times;</button>
                                                    <h4 className="modal-title">Assignees List</h4>
                                                </div>
                                                <div className="modal-body">
                                                    <AssigneesList CreatorId={this.state.TaskCreator} QuantityWorked={this.state.PreviouslyWorkedQuantity !== null ? this.state.PreviouslyWorkedQuantity : ""} TaskId={this.state.TaskId} BudgetedQuantity={this.state.Task["Quantity"]} SelectedAssigneesList={this.state.TaskAssignees} OrgId={this.state.OrgId} UpdatedTaskAssigneesList={this.handleAssignees.bind(this)} />
                                                </div>
                                                <div className="modal-footer"> </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div />
                            }


                        </div>
                        :
                        <div className="loader visible" style={{ marginLeft: '50%', marginTop: '10%' }}></div>
                }


            </div>
        )
    }

    AddAssignees() {
        this.setState({ AddMultipleAssignees: true }, () => {
            $("#assigneesModal").modal('show');
        })
    }

    AssigneeChanged(val) {
        var assignee = this.state.TaskAssignees;
        if (val != null) {
            assignee[0]["AssigneeId"] = val.value;
            assignee[0]["AssigneeName"] = val.label;
            this.setState({ TaskAssignees: assignee })
            showErrorsForInput(this.refs.assignee.wrapper, null);
        }
        else {
            assignee[0]["AssigneeId"] = '';
            assignee[0]["AssigneeName"] = '';
            this.setState({ TaskAssignees: assignee })
            showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
        }
    }

    QuantityChanged() {
        var assignee = this.state.TaskAssignees;
        var budgetedQuantity = this.state.Task["Quantity"];
        assignee[0]["Quantity"] = this.refs.quantity.value;
        if (this.refs.quantity.value <= 0) {
            showErrorsForInput(this.refs.quantity, ["Should be greater than 0"]);
        }
        else if (budgetedQuantity != "") {
            if (this.refs.quantity.value > budgetedQuantity) {
                showErrorsForInput(this.refs.quantity, ["Quantity greater than budgeted quantity"]);
            }
            else {
                showErrorsForInput(this.refs.quantity, null);
            }
        }
        else {
            showErrorsForInput(this.refs.quantity, null);
        }
        this.setState({ TaskAssignees: assignee });
    }

    handleAssignees(val) {
        $("#closeModal").click();
        var assignee = this.state.TaskAssignees;
        this.refs.quantity.value = val[0]["Quantity"];
        this.setState({ TaskAssignees: val })
    }

    getDescription(desc) {
        if (this.state.Task.Description !== undefined) {
            var contentBlock = this.state.Task["Description"];
            if (contentBlock) {
                const editorState = EditorState.createWithContent(ContentState.createFromBlockArray(
                    convertFromHTML(contentBlock)
                ));
                return editorState;
            }
        }
        else {
            const editor = EditorState.createEmpty();
            return editor;
        }
    }

    gotoChangeContent(content) {
        const contentBlock = convertFromHTML(content);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock);
            const editorState = EditorState.createWithContent(contentState);
            return editorState;
        }
    }

    uploadCallback(file) {
    }

    messageBoxChange(val) {
        this.setState({ Description: val, DescriptionHtml: draftToHtml(convertToRaw(val.getCurrentContent())) });
    }

    ActionTypeChanged(val) {
        if (val) {
            this.setState({ ActionType: val })
            showErrorsForInput(this.refs.action.wrapper, null)
        }
        else {
            this.setState({ ActionType: '' })
            showErrorsForInput(this.refs.action.wrapper, ["Please select action type"]);
        }
    }

    handleModelChange(model) {
        this.setState({ model: model });
    }

    EdocChanged() {
        if (this.refs.doc.value != "") {
            var budgetedDays = moment(this.refs.doc.value).diff(moment(this.refs.dos.value), 'days');
            if (budgetedDays == 0) {
                this.setState({ maxBudgetedHours: 8, budgetedHoursDisabled: false })
            }
            else {
                this.setState({ maxBudgetedHours: budgetedDays * 8, budgetedHoursDisabled: false })
            }
        }
        else {
            this.refs.budgetedhours.value = ""
            this.setState({ budgetedHoursDisabled: true });
            showErrorsForInput(this.refs.doc, ["Select expected date of closer"]);
        }
    }


    handlePreviousClick() {

        var rowNum = this.state.RowNum - 1;
        if (rowNum > 0) {
            var url = ApiUrl + "/api/Activities/GetTask?userId=" + user + "&clientId=" + client +
                "&departmentId=" + department + "&taskType=" + taskType + "&priority=" + priority +
                "&status=" + status + "&page=" + rowNum + "&count=" + 1 +
                "&sortCol=" + sortCol + "&sortDir=" + sortDir + "&taskCategory=" + taskCategory

            $.ajax({
                url: url,
                type: "GET",
                success: (data) => {
                    if (data["reqTask"] !== null) {
                        this.setState({
                            RowNum: data["reqTask"]["RowNum"], TaskId: data["reqTask"]["TaskId"],
                            TaskCreator: data["reqTask"]["CreatedBy"],
                            TaskOwner: data["reqTask"]["TaskOwner"],
                            IsDataAvailable: false
                        }, () => {
                            this.GetTaskInfo();
                        })
                    }
                    else {
                        this.setState({ RowNum: this.state.RowNum, TaskId: this.state.TaskId }, () => {
                            this.GetTaskInfo();
                        })
                    }

                }
            })
        }
        else {
            this.setState({ RowNum: this.state.RowNum, TaskId: this.state.TaskId }, () => {
                this.GetTaskInfo();
            })
        }

    }

    handleNextClick() {
        var rowNum = this.state.RowNum + 1;

        var url = ApiUrl + "/api/Activities/GetTask?userId=" + user + "&clientId=" + client +
            "&departmentId=" + department + "&taskType=" + taskType + "&priority=" + priority +
            "&status=" + status + "&page=" + rowNum + "&count=" + 1 +
            "&sortCol=" + sortCol + "&sortDir=" + sortDir + "&taskCategory=" + taskCategory

        $.ajax({
            url: url,
            type: "GET",
            success: (data) => {
                if (data["reqTask"] !== null) {
                    this.setState({
                        RowNum: data["reqTask"]["RowNum"], TaskId: data["reqTask"]["TaskId"],
                        TaskCreator: data["reqTask"]["CreatedBy"], TaskOwner: data["reqTask"]["TaskOwner"],
                        IsDataAvailable: false
                    }, () => {
                        this.GetTaskInfo();
                    })
                }
                else {
                    this.setState({ RowNum: this.state.RowNum, TaskId: this.state.TaskId }, () => {
                        this.GetTaskInfo();
                    })
                }
            }
        })
    }

    handleSubmit(e) {
        e.preventDefault();

        $(".loader").show();
        $("button[name='submit']").hide();

        if (!this.validate(e)) {

            $(".loader").hide();
            $("button[name='submit']").show();
            return;
        }

        var data = new FormData();
        data.append("taskId", this.state.TaskId);
        data.append("actionType", this.state.ActionType.value);
        data.append("description", this.state.DescriptionHtml);
        data.append("OrgId", sessionStorage.getItem("OrgId"));

        if (this.state.Points) {
            data.append("points", this.state.Points);
        }
        else {
            data.append("points", 0);
        }

        if (this.state.ActionType.value === "Assign") {
            //  data.append("assignee", this.state.Assignee.value);
            data.append("hoursWorked", this.refs.hoursWorked.value);
            data.append("assigneeList", JSON.stringify(this.state.TaskAssignees));
            data.append("ParentTaskDetails", JSON.stringify(this.state.TaskLog));
        }

        if (this.state.ActionType.value === "Pending" || this.state.ActionType.value === "InProcess") {
            data.append("budgetedHours", this.refs.budgetedhours.value);
            data.append("edos", this.refs.dos.value);
            data.append("edoc", this.refs.doc.value);
            data.append("hoursWorked", this.refs.hoursWorked.value);
        }

        if (this.state.ActionType.value === "Resolved") {
            data.append("hoursWorked", this.refs.hoursWorked.value)
        }

        if (this.state.ActionType.value !== "Reopen" && this.state.ActionType.value != "Comments" && this.state.ActionType.value != "AcceptToClose" && this.state.ActionType.value != "Assign") {
            if (this.state.Task["Quantity"] != null) {
                data.append("quantityWorked", this.refs.quantityWorked.value);
            }
        }

        if (this.state.ActionType.value == "Hold") {
            data.append("remindDate", this.refs.remindDate.value);
        }

        var files = $("#input-id").fileinput("getFileStack");

        for (var i = 0; i < files.length; i++) {

            if (files[i] != undefined) {
                data.append(files[i].filename, files[i]);
            }
        }

        var url = ApiUrl + "/api/Activities/EditActivity"

        try {

            MyAjaxForAttachments(
                url,
                (data) => {
                    toast(" Task " + this.state.ActionType.label + " was successfully!", {
                        type: toast.TYPE.SUCCESS
                    });
                    $("button[name='submit']").show();
                    this.state.LoginUser != sessionStorage.getItem("EmpId") ?
                        this.props.history.push("/TaskDashBoard/" + this.state.LoginUser) :
                        this.props.history.push("/TaskDashBoard");
                    return true;
                },
                (error) => {
                    toast(error.responseText, {
                        type: toast.TYPE.ERROR,
                        autoClose: false
                    });
                    $(".loader").hide();
                    $("button[name='submit']").show();
                    return false;
                },
                "POST",
                data
            );
        }
        catch (e) {
            toast("An error occured, please try again later", {
                type: toast.TYPE.ERROR
            });
            $(".loader").hide();
            $("button[name='submit']").show();
            return false;
        }

    }

    markAsUnreadClick() {
        var data = new FormData();
        MyAjaxForAttachments(
            ApiUrl + "/api/Activities/AddNotification?taskId=" + this.state.TaskId,
            (data) => {
                toast(" Marked as unread!", {
                    type: toast.TYPE.SUCCESS
                });
                this.props.history.push("/TaskDashboard/" + this.state.LoginUser)
                return true;
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }),
            "POST",
            data
        )
    }

    validate(e) {
        // var success = ValidateForm(e);
        let errors = {};
        var success = true;
        var isSubmit = e.type === "submit";
        var budgetedQuantity = this.state.Task["Quantity"];

        if (isSubmit) {
            $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
                el.classList.remove("un-touched");
            });
        }

        if (!this.state.ActionType || !this.state.ActionType.value) {
            success = false;
            showErrorsForInput(this.refs.action.wrapper, ["Please select action type"]);
            if (isSubmit) {
                this.refs.action.focus();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.action.wrapper, []);
        }

        if (this.state.ActionType !== undefined && this.state.ActionType.value == "Hold") {
            if (validate.single(this.refs.remindDate.value, { presence: true }) !== undefined) {
                success = false;
                showErrorsForInput(this.refs.remindDate, ["Select date of remainder "]);
                if (isSubmit) {
                    this.refs.remindDate.focus();
                    isSubmit = false;
                }
            }
            else {
                if (moment(this.refs.remindDate.value).format("YYYY-MM-DD") <= moment().format("YYYY-MM-DD")) {
                    success = false;
                    showErrorsForInput(this.refs.remindDate, ["Reminder should be greater than current day"]);
                    if (isSubmit) {
                        this.refs.remindDate.focus();
                        isSubmit = false;
                    }
                }
                else {
                    showErrorsForInput(this.refs.remindDate, "");
                }
            }
        }

        if (this.state.ActionType != undefined && this.state.ActionType.value != "Reopen" && this.state.ActionType.value != "AcceptToClose") {
            if (this.state.ActionType.value == "Assign") {
                var AssigneesList = this.state.TaskAssignees;
                if (AssigneesList.length == 1) {
                    if (AssigneesList[0]["AssigneeId"] == null) {
                        showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
                        success = false;
                        if (isSubmit) {
                            this.refs.assignee.focus();
                            isSubmit = false;
                        }
                    }
                    else {
                        if (budgetedQuantity != null) {
                            if (AssigneesList[0]["Quantity"] == null || AssigneesList[0]["Quantity"] <= 0) {
                                success = false;
                                showErrorsForInput(this.refs.quantity, ["Quantity Required"]);
                                if (isSubmit) {
                                    this.refs.quantity.focus();
                                    isSubmit = false;
                                }
                            }
                            else {
                                //  if(this.state.PreviouslyWorkedQuantity!=null)
                                //   {
                                //     var maxQuantityToBeAssigned = parseInt(budgetedQuantity) - parseInt(this.state.PreviouslyWorkedQuantity)                       
                                //     if(parseInt(AssigneesList[0]["Quantity"]) > maxQuantityToBeAssigned || parseInt(AssigneesList[0]["Quantity"]) < maxQuantityToBeAssigned )
                                //     {
                                //         success= false;
                                //         showErrorsForInput(this.refs.quantity, ["Quantity should be equal to " + maxQuantityToBeAssigned]); 
                                //         if(isSubmit){
                                //           this.refs.quantity.focus();
                                //           isSubmit= false;
                                //          }
                                //     }
                                //    }
                                //   else{
                                //  if(AssigneesList[0]["Quantity"]<budgetedQuantity || AssigneesList[0]["Quantity"]>budgetedQuantity ){
                                if (AssigneesList[0]["Quantity"] > budgetedQuantity) {
                                    success = false;
                                    showErrorsForInput(this.refs.quantity, ["Budgeted quantity should not be more than " + budgetedQuantity]);
                                    if (isSubmit) {
                                        this.refs.quantity.focus();
                                        isSubmit = false;
                                    }
                                }
                                else {
                                    showErrorsForInput(this.refs.quantity, null);
                                }
                            }
                            //   }
                        }
                        else {
                            if (AssigneesList[0]["Quantity"] !== null && AssigneesList[0]["Quantity"] <= 0) {
                                success = false;
                                showErrorsForInput(this.refs.quantity, ["Quantity should be greater than 0"]);
                                if (isSubmit) {
                                    this.refs.quantity.focus();
                                    isSubmit = false;
                                }
                            }
                        }
                    }
                }
            }
            if (this.state.ActionType.value == "Pending" || this.state.ActionType.value == "InProcess") {

                if (!this.state.isAcknowledged) {
                    if (validate.single(this.refs.dos.value, { presence: true }) !== undefined) {
                        success = false;
                        showErrorsForInput(this.refs.dos, ["Select expected date of beginning"]);
                        if (isSubmit) {
                            this.refs.dos.focus();
                            isSubmit = false;
                        }
                    }
                    else {
                        if (this.state.ActionType.value == "Pending" && !this.state.isAcknowledged) {
                            if (moment(this.refs.dos.value).format("YYYY-MM-DD") <= moment().format("YYYY-MM-DD")) {
                                success = false;
                                showErrorsForInput(this.refs.dos, ["Should be greater than Current day"]);
                                this.refs.dos.focus();
                            }
                            else {
                                showErrorsForInput(this.refs.dos, null);
                            }
                        }
                        else {
                            if (this.state.ActionType.value == "InProcess" && !this.state.isAcknowledged) {
                                if (moment(this.refs.dos.value).format("YYYY-MM-DD") !== moment().format("YYYY-MM-DD")) {
                                    success = false;
                                    showErrorsForInput(this.refs.dos, ["Should be equal to current day"]);
                                    this.refs.dos.focus();
                                }
                                else {
                                    showErrorsForInput(this.refs.dos, null);
                                }
                            }
                        }
                    }
                    if (validate.single(this.refs.doc.value, { presence: true }) !== undefined) {
                        success = false;
                        showErrorsForInput(this.refs.doc, ["Select expected date of closure"]);
                        if (isSubmit) {
                            this.refs.doc.focus();
                            isSubmit = false;
                        }
                    }
                    else if (moment(this.refs.doc.value).isBefore(moment(this.refs.dos.value))) {
                        success = false;
                        showErrorsForInput(this.refs.doc, ["Date of closure should not be less that start date"]);
                        if (isSubmit) {
                            this.refs.doc.focus();
                            isSubmit = false;
                        }
                    }
                    else {
                        showErrorsForInput(this.refs.doc, []);
                    }

                }

                if (success) {
                    var hours = moment(this.refs.doc.value).diff(moment(this.refs.dos.value), 'days') * 8;
                    var maxBudgetedHours = hours;
                    if (hours > 0) {
                        maxBudgetedHours = hours;
                    }
                    else {
                        maxBudgetedHours = 8;
                    }

                    if (this.refs.budgetedhours.value === "" || this.refs.budgetedhours.value === "0") {
                        success = false;
                        showErrorsForInput(this.refs.budgetedhours, ["Please enter budgeted hours"]);
                        if (isSubmit) {
                            this.refs.budgetedhours.focus();
                            isSubmit = false;
                        }
                    }
                    else if (this.refs.budgetedhours.value > maxBudgetedHours) {
                        success = false;
                        showErrorsForInput(this.refs.budgetedhours, ["Budgeted hours should not be more than " + maxBudgetedHours]);
                        if (isSubmit) {
                            this.refs.budgetedhours.focus();
                            isSubmit = false;
                        }
                    }
                    else {
                        showErrorsForInput(this.refs.budgetedhours, []);
                    }

                    if (this.state.Task["Quantity"] != null && this.state.Task["Quantity"] != 0) {
                        if (this.refs.quantityWorked.value != "") {
                            if (parseFloat(this.refs.quantityWorked.value) < 0) {
                                showErrorsForInput(this.refs.quantityWorked, ["Quantity is not valid"]);
                                this.refs.quantityWorked.focus();
                                if (isSubmit) {
                                    isSubmit = false;
                                }
                            }
                            else {
                                showErrorsForInput(this.refs.quantityWorked, []);
                            }
                        }
                    }
                }

            }

            if (this.state.isAcknowledged) {
                if (this.state.ActionType.value == "Pending") {
                    if (this.refs.hoursWorked.value === "" || this.refs.hoursWorked.value == 0) {
                        success = false;
                        showErrorsForInput(this.refs.hoursWorked, ["Please enter number of hours worked"]);
                        if (isSubmit) {
                            this.refs.hoursWorked.focus();
                            isSubmit = false;
                        }
                    }
                    else if (this.refs.hoursWorked.value > 10) {
                        success = false;
                        showErrorsForInput(this.refs.hoursWorked, ["should be less than 10"]);
                        if (isSubmit) {
                            this.refs.hoursWorked.focus();
                            isSubmit = false;
                        }
                    }
                    else {
                        showErrorsForInput(this.refs.hoursWorked, []);
                    }

                    if (this.state.Task["Quantity"] != null && this.state.Task["Quantity"] != 0) {
                        if (this.refs.quantityWorked.value == "" || parseFloat(this.refs.quantityWorked.value) <= 0) {
                            success = false;
                            showErrorsForInput(this.refs.quantityWorked, ["Enter worked quantity"]);
                            if (isSubmit) {
                                this.refs.quantityWorked.focus();
                                isSubmit = false;
                            }
                        }
                        else if (parseInt(this.refs.quantityWorked.value) > this.state.Task["Quantity"]) {
                            success = false;
                            showErrorsForInput(this.refs.quantityWorked, ["Your budgeted quantity is " + this.state.Task["Quantity"]]);
                            if (isSubmit) {
                                this.refs.quantityWorked.focus();
                                isSubmit = false;
                            }
                        }
                        else {
                            showErrorsForInput(this.refs.quantityWorked, []);
                        }
                    }
                }
                else if (this.state.ActionType.value == "Resolved") {
                    if (this.state.Task["Quantity"] !== null) {
                        var currentWorkedQuantity = this.refs.quantityWorked.value;
                        var previoslyWorkedQuantity = this.state.PreviouslyWorkedQuantity;
                        if (currentWorkedQuantity == "") {
                            currentWorkedQuantity = 0;
                        }

                        if (parseInt(currentWorkedQuantity) > this.state.Task["Quantity"]) {
                            success = false;
                            showErrorsForInput(this.refs.quantityWorked, ["Is greater than budgeted quantity"]);
                            if (isSubmit) {
                                this.refs.quantityWorked.focus();
                                isSubmit = false;
                            }
                        }
                        else {
                            showErrorsForInput(this.refs.quantityWorked, []);
                        }

                        if (previoslyWorkedQuantity !== null && previoslyWorkedQuantity) {
                            var totalQuantityWorked = previoslyWorkedQuantity + parseInt(currentWorkedQuantity);
                            if (parseInt(totalQuantityWorked) < this.state.Task["Quantity"]) {
                                success = false;
                                showErrorsForInput(this.refs.quantityWorked, ["Budgeted quantity is not completed"]);
                                if (isSubmit) {
                                    this.refs.quantityWorked.focus();
                                    isSubmit = false;
                                }
                            }
                        }
                        else {
                            if (parseInt(currentWorkedQuantity) !== this.state.Task["Quantity"]) {
                                success = false;
                                showErrorsForInput(this.refs.quantityWorked, ["Enter quantity worked"]);
                                if (isSubmit) {
                                    this.refs.quantityWorked.focus();
                                    isSubmit = false;
                                }
                            }
                        }
                    }

                }

            }
        }

        var content = this.state.Description.getCurrentContent();

        if (success) {
            if (!content.getPlainText('').trim().length > 0) {
                showErrorsForInput(this.refs.description, ["Please enter action description"]);
                success = false;
                if (isSubmit) {
                    this.refs.editor.focusEditor();
                    isSubmit = false;
                }
            }
            else {
                showErrorsForInput(this.refs.description, []);
            }
        }

        return success;
    }

}

export default ViewTask;

//if(this.state.ActionType.value!=="Assign" ){
    // if (this.refs.hoursWorked.value === "") {
    //     success = false;
    //     showErrorsForInput(this.refs.hoursWorked, ["Please enter number of hours worked"]);
    //     if (isSubmit) {
    //         this.refs.hoursWorked.focus();
    //         isSubmit = false;
    //     }
    // }
    // else if (this.refs.hoursWorked.value == 0) {
    //     success = false;
    //     showErrorsForInput(this.refs.hoursWorked, ["should be greater than 0"]);
    //     if (isSubmit) {
    //         this.refs.hoursWorked.focus();
    //         isSubmit = false;
    //     }
    // }
    // else 
//     if (this.refs.hoursWorked.value > 10) {

//         success = false;
//         showErrorsForInput(this.refs.hoursWorked, ["should be less than 10"]);
//         if (isSubmit) {
//             this.refs.hoursWorked.focus();
//             isSubmit = false;
//         }
//     }
//     else {
//         showErrorsForInput(this.refs.hoursWorked, []);
//     }
//  }

//     if(this.state.ActionType.value!=="Assign" && this.state.ActionType.value !=="Resolved")
//     {
//         if(this.state.TaskInfo["Quantity"]!=null && this.state.TaskInfo["Quantity"]!=0 )
//         {
//            if ( this.refs.quantityWorked.value!="" && parseFloat(this.refs.quantityWorked.value)<=0){
//              success= false;
//              showErrorsForInput(this.refs.quantityWorked,["Should be greater than 0"]);
//              if(isSubmit){
//                this.refs.quantityWorked.focus();
//                isSubmit = false;
//              }
//         }

//         else{
//              showErrorsForInput(this.refs.quantityWorked,[]);
//           }
//         }
//     } 
//     else{
//          if(this.state.TaskInfo["Quantity"]!=null && this.state.TaskInfo["Quantity"]!=0 )
//          {

//             var quantityToBeWorked = (parseInt(budgetedQuantity) - parseInt(this.state.PreviouslyWorkedQuantity));                       

//              if ( this.refs.quantityWorked.value!="" && parseFloat(this.refs.quantityWorked.value)> this.state.TaskInfo["Quantity"]){
//                success= false;
//                showErrorsForInput(this.refs.quantityWorked,["Should not be greater than budgeted quantity"]);
//                if(isSubmit){
//                this.refs.quantityWorked.focus();
//                isSubmit = false;
//                }
//              }

//             if(parseInt(quantityToBeWorked)>0 && this.state.ActionType.value =="Resolved")
//             {
//                 var currentWorkedQuantity= this.refs.quantityWorked.value;
//                 if(currentWorkedQuantity==""|| currentWorkedQuantity < quantityToBeWorked) {
//                     success= false;
//                     showErrorsForInput(this.refs.quantityWorked,["You havent completed budgeted quantity"]);
//                     if(isSubmit){
//                     this.refs.quantityWorked.focus();
//                     isSubmit = false;
//                     }
//                 }
//                 else if(parseInt(currentWorkedQuantity)>this.state.TaskInfo["Quantity"]){
//                     success= false;
//                     showErrorsForInput(this.refs.quantityWorked,["Your budgeted quantity is " + this.state.TaskInfo["Quantity"]]);
//                     if(isSubmit){
//                     this.refs.quantityWorked.focus();
//                     isSubmit = false;
//                     }
//                 }
//                 else{
//                     showErrorsForInput(this.refs.quantityWorked,null);
//                 }
//             }
//            }
//     }




















// else if(AssigneesList[0]["Quantity"]!==null && AssigneesList[0]["Quantity"]<=0 ){
            //     showErrorsForInput(this.refs.quantity, ["Should be greater than 0"]);
            //     success = false;
            //     if(isSubmit){
            //         this.refs.quantity.focus();
            //         isSubmit= false;
            //     }
            // }
            // else{
            //     showErrorsForInput(this.refs.assignee.wrapper,null);
            //     showErrorsForInput(this.refs.quantity,null);
//  }


// else if(parseFloat(this.refs.quantityWorked.value) > this.state.TaskInfo["Quantity"]){
//     success = false;
//    showErrorsForInput(this.refs.quantityWorked, ["Quantity is greater than budgeted"]);
//        if (isSubmit) {
//      this.refs.quantityWorked.focus();
//      isSubmit = false;
//    }  
//  }


// if(this.refs.quantityWorked.value== ""){
//     success = false;
//     showErrorsForInput(this.refs.quantityWorked,["Enter quantity worked"])
//     if(isSubmit){
//        this.refs.quantityWorked.focus();
//        isSubmit = false;
//     }
//  }

//  else if(this.refs.quantityWorked.value>0)
//  {
//      if(this.state.PreviouslyWorkedQuantity!=null)
//      {
//          var currentWorkedQuantity= parseInt(this.refs.quantityWorked.value) + parseInt(this.state.PreviouslyWorkedQuantity);

//          if(this.state.ActionType.value == "Resolved" && this.state.PreviouslyWorkedQuantity==this.state.TaskInfo["Quantity"] )
//          {
//              showErrorsForInput(this.refs.quantityWorked,null);
//          }
//          else{
//              if( currentWorkedQuantity > this.state.TaskInfo["Quantity"])
//              {
//                  showErrorsForInput(this.refs.quantityWorked,["you have already worked " + this.state.PreviouslyWorkedQuantity + " quantity"]);
//                  success= false;
//                  if(isSubmit){
//                      this.refs.quantityWorked.focus();
//                      isSubmit = false;
//                   }
//              }
//          }

//      }
//      if(parseFloat(this.refs.quantityWorked.value) > this.state.TaskInfo["Quantity"]){
//          success = false;
//          showErrorsForInput(this.refs.quantityWorked,["Enter valid quantity"]);
//          if(isSubmit){
//             this.refs.quantityWorked.focus();
//             isSubmit = false;
//          }
//      }
//  }