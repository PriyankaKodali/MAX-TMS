import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '../Config';
import { MyAjax } from '../MyAjax';
import { toast } from 'react-toastify';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { showErrorsForInput } from '../Validation';
import validate from 'validate.js'; 

var moment = require('moment');

class MyReport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Clients: [], Client: '', FromDate: moment().startOf('week').format("YYYY-MM-DD"), Statuses: [], Status: 'ALL',
            Priority: null, ToDate: moment().format("YYYY-MM-DD"), MyReport: [], TaskId: '',
            IsDataAvailable: false, Categories: [], Category: null
        }
    }

    componentWillMount() {
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })
        if (this.props.location.state) { 
            var clientId = this.props.location.state["clientId"];
            var status = this.props.location.state["status"]; 
            var category = this.props.location.state["catId"];  
        
            this.setState({ 
                Client: clientId, FromDate: this.props.location.state["fromDate"],
                ToDate: this.props.location.state["toDate"], Status: status, Category: category
            }, () => {
                this.getMyReport();
            })
        }
        else{
            this.getMyReport();
        }
       
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetCategories?deptId=" + 9,
            type: "get",
            success: (data) => { this.setState({ Categories: data["categories"] }) }
        }) 
    }

    getMyReport() {
        var url = ApiUrl + "/api/Reports/GetMyReport?fromDate=" + this.state.FromDate +
            "&toDate=" + this.state.ToDate + "&client=" + this.state.Client +
            "&status=" + this.state.Status + "&priority=" + this.state.Priority +
            "&taskId=" + this.state.TaskId+ "&catId=" + this.state.Category

        MyAjax(
            url,
            (data) => { this.setState({ MyReport: data["myActivityReport"], IsDataAvailable: true }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }),
            "GET",
            null
        )
    }

    render() {
        return (
            <div className="col-xs-12">
                <div className=" SearchContainerStyle">
                    <div className="col-xs-12">
                        <div className="col-md-2">
                            <label>From Date</label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-calendar" ></span>
                                    </span>
                                    <input style={{ lineHeight: '19px' }} className="form-control" type="date" ref="fromDate" defaultValue={this.state.FromDate} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <label>To Date</label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-calendar" ></span>
                                    </span>
                                    <input style={{ lineHeight: '19px' }} className="form-control" type="date" ref="toDate" defaultValue={this.state.ToDate} />
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
                                        options={[{ value: 'ALL', label: 'All' }, { value: 'Closed', label: 'Closed' }, { value: 'InProcess', label: 'InProcess' }, { value: 'Open', label: 'Open' },
                                        { value: 'Pending', label: 'Pending' }, { value: 'NotResolved', label: 'Not Resolved' },
                                        { value: 'NotClosed', label: 'Not Closed' },
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
                        <div className="col-md-2">
                            <label> Task Id </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon"> </span>
                                    <input className="form-control" type="text" placeholder="Task Id" ref="taskId" />
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
                        <div className="col-md-2" style={{ marginLeft: '10%', marginTop: '0%', marginBottom: '1%' }} >
                            <button type="button" name="submit" className="btn btn-primary" value="Search" onClick={this.handleSearchClick.bind(this)} > Search </button>
                            <button type="button" name="clear" className="btn btn-default mleft10" value="Clear" onClick={this.clearClick.bind(this)}> Clear </button>
                        </div>
                    </div>
                </div>
                {
                    this.state.IsDataAvailable == true ?
                        <div className="col-xs-12" key={this.state.MyReport}>
                            {
                                this.state.MyReport.length > 0 ?
                                    <div>
                                        {this.state.MyReport.map((ele, i) => {
                                            return (
                                                <div className="panel-group" id="accordion" key={i}>
                                                    <div className="panel panel-default">
                                                        <div className="panel-heading">
                                                            <h6 className="panel-title panelHeading" style={{ paddingTop: '6px' }}>
                                                                <p data-toggle="collapse" data-parent="#accordion" href={"#collapse" + i}>
                                                                    {ele["TaskId"].toUpperCase()}
                                                                    <span> <b className="spanheading" > Created Date : </b> {moment(ele["CreatedDate"]).format("DD-MMM-YYYY")} </span>
                                                                    <span> <b className="spanheading"> Client/Dept : </b> {ele["Department"] != null ? ele["Department"] : <b> {ele["Client"]}</b>}  </span>
                                                                    {ele["Project"] != null ? <span> <b className="spanheading">  Project : </b> {ele["Project"]}  </span> : ""}
                                                                    <span><b className="spanheading">Subject : </b> {ele["Subject"]} </span>
                                                                </p>
                                                            </h6>
                                                        </div>

                                                        <div id={"collapse" + i} className="panel-collapse collapse">
                                                            <div className="panel-body">
                                                                <div>
                                                                    <div>
                                                                        <table className="table table-condensed table-bordered actionTable mytable">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <th>Task Id</th>
                                                                                    <th>Created By</th>
                                                                                    <th>Created Date</th>
                                                                                    <th>Client/Dept</th>
                                                                                    {ele["Project"] != null ? <th>Project</th> : ""}
                                                                                    {ele["ProjectLocation"] != null ? <th>Location</th> : ""}
                                                                                    <th>Category/SubCategory</th>
                                                                                    <th>Status</th>
                                                                                </tr>

                                                                                <tr>
                                                                                    <td>{ele["TaskId"]}</td>
                                                                                    <td>{ele["Creator"]}</td>
                                                                                    <td>{moment(ele["CreatedDate"]).format("DD-MMM-YYYY")} </td>
                                                                                    <td> {ele["Department"] != null ? ele["Department"] : <b> {ele["Client"]}</b>} <span /></td>
                                                                                    {ele["Project"] != null ? <td> <span> {ele["Project"]} </span> </td> : ""}
                                                                                    {ele["ProjectLocation"] != null ?
                                                                                        <td> {ele["ProjectLocation"] != null ? <span> {ele["ProjectLocation"]} </span> : ""}</td> : ""}
                                                                                    <td>{ele["Category"] + "/" + ele["SubCategory"]}</td>
                                                                                    <td>{ele["Status"]}</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        <p> <b> Subject :</b>  <b>  {ele["Subject"]}  </b> </p>
                                                                        <div>
                                                                            <b >Description : </b>
                                                                            <Editor name="actionDescription" readonly={true} id="actionDescription"
                                                                                editorState={this.gotoChangeDescription(ele["Description"])} toolbarClassName="hide-toolbar"
                                                                                wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                                            />
                                                                        </div>
                                                                        <p>
                                                                            <b> Expected Start Date : </b>  {ele["ExpectedStartDate"] != null ? moment(ele["ExpectedStartDate"]["TaskLogStartDate"]).format("DD-MMM-YYYY") : ""} <span />
                                                                            <b> Expected End Date : </b> {ele["ExpectedStartDate"] != null ? moment(ele["ExpectedStartDate"]["TaskLogEndDate"]).format("DD-MMM-YYYY") : ""} <span />
                                                                            <b> Budgeted Hours : </b> {ele["BudgetedHours"] != null ? ele["ExpectedStartDate"]["TaskLogBudgetedHours"] : ""} <span />
                                                                            <b> Hours worked : </b> {ele["HoursWorked"]} <span />
                                                                            <b> Actual Close Date : </b> {ele["CompletedDate"] != null ? moment(ele["CompletedDate"]).format("DD-MMM-YYYY") : ""}
                                                                        </p>

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

                                                                                ele["TaskLog"].map((el, j) => {
                                                                                    return (
                                                                                        //   <tr className= { moment(this.state.FromDate).format("DD-MM-YYYY") >= moment(el["TaskLogDate"]).format("DD-MM-YYYY") || moment(this.state.ToDate).format("DD-MM-YYYY") == moment(el["TaskLogDate"]).format("DD-MM-YYYY") ? "selectedDateRow": ""} >
                                                                                        <tr className={this.setRowStyle(el["TaskLogDate"], el["TaskLogAssignedById"])}>
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
                                                                    <div className="col-xs-12">
                                                                        <hr style={{ marginTop: '14px', marginBottom: '14px' }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            )
                                        })
                                        }
                                    </div>
                                    :
                                    <div className="col-xs-12 messageStyle">
                                        <h4> No records found </h4>
                                    </div>
                            }
                        </div>
                        :
                        <div className="loader visible" style={{ marginTop: '12%' }}></div>
                }

            </div>
        )
    }

    ClientChanged(val) {
        if (val != null) {
            this.setState({ Client: val.value })
        }
        else {
            this.setState({ Client: '' })
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

    StatusChanged(val) {
        if (val != null) {
            this.setState({ Status: val.value })
        }
        else {
            this.setState({ Status: '' })
        }
    }

    PriorityChanged(val) {
        if (val != null) {
            this.setState({ Priority: val.value })
        }
        else {
            this.setState({ Priority: null })
        }
    }

    setRowStyle(logDate, assignedBy) {
        var fromDate = this.state.FromDate;
        var toDate = this.state.ToDate;
        var user = sessionStorage.getItem("EmpId");
        if (moment(logDate).isSameOrAfter(moment(fromDate))) {
            if ((moment(logDate)) <= (moment(toDate)) || moment(logDate).format("DD-MM-YYYY") == moment(toDate).format("DD-MM-YYYY")) {
                if (user == assignedBy) {
                    return "selectedDateRow";
                }
            }
            else {
                return "";
            } 
        }
        else {
            return "";
        }
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

    clearClick() {
        this.refs.fromDate.value = moment().startOf('week').format("YYYY-MM-DD");
        this.refs.toDate.value = moment().format("YYYY-MM-DD");
        this.refs.taskId.value = '',
            this.setState({
                Status: 'ALL',
                FromDate: moment().format("YYYY-MM-DD"),
                ToDate: moment().format("YYYY-MM-DD"),
                Priority: null,
                Client: '',
                TaskId: '',
                IsDataAvailable: false
            }, () => {
                this.getMyReport();
            })
    }

    handleSearchClick(e) {
        e.preventDefault();

        if (!this.validate()) {
            return;
        }

        this.setState({
            FromDate: this.refs.fromDate.value,
            ToDate: this.refs.toDate.value,
            Client: this.state.Client,
            Status: this.state.Status,
            Priority: this.state.Priority,
            TaskId: this.refs.taskId.value,
            IsDataAvailable: false
        }, () => {
            this.getMyReport();
        })
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

export default MyReport;