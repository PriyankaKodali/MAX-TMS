import React, { Component } from 'react';
import './TaskDashBoard.css';
//import RichTextEditor from 'react-rte';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '.././Config.js';
//import FroalaEditor from 'react-froala-wysiwyg';
import { toast } from 'react-toastify';
import { MyAjaxForAttachments, MyAjax } from '../MyAjax.js';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { validate } from 'validate.js'

var moment = require('moment');

// Require Editor CSS files.
//import 'froala-editor/css/froala_style.min.css';
//import 'froala-editor/css/froala_editor.pkgd.min.css';


class ViewTask extends Component {

    constructor(props) {
        super(props);
        var froalaConfig = {
            heightMin: 210
        }
        var actTypes = [{ value: "", label: "" }]
        this.state = {
            Status: null, Statuss: [], Model: "", model: "", FroalaConfig: froalaConfig,
            CreatedOn: moment(), CreatedBy: '', Action: null, StartDate: moment().format("YYYY-MM-DD"),
            ActionTypes: [], ActionType: null, TaskInfo: [], TaskLog: [], user: "", DescriptionHtml: "",
            Description: EditorState.createEmpty(), IsDisabled: false, budgetedHoursDisabled: true, ActivityLog: [], EndDate: "",
            BudgetedHours: '', showHoursWorked: false, maxBudgetedHours: '',
            AssignedBy: null, TaskOwner: null, TaskId: null, Status: null, EmpId: null
        }
    }

    componentWillMount() {

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")

        //  console.log(this.props.location.state)

        if (this.props.location.state !== undefined) {
            this.setState({
                TaskId: this.props.location.state["TaskId"],
                AssignedBy: this.props.location.state["AssignedBy"],
                TaskOwner: this.props.location.state["TaskOwner"],
                Status: this.props.location.state["Status"],
                EmpId: this.props.location.state["EmpId"]
            }, () => {

                if (this.props.location.state) {

                    $.ajax({
                        url: ApiUrl + "/api/Activities/GetTaskBasicInfo?TaskId=" + this.props.location.state["TaskId"],
                        type: "get",
                        success: (data) => { this.setState({ TaskInfo: data["activity"] }) }
                    })

                    $.ajax({
                        url: ApiUrl + "/api/Activities/GetTaskLog?taskId=" + this.props.location.state["TaskId"],
                        type: "get",
                        success: (data) => {
                            this.setState({ TaskLog: data["taskLog"] })
                        }
                    })

                    MyAjax(
                        ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?UserId=" + this.props.location.state["AssignedBy"] + "&OrgId=" + orgId,
                        (data) => { this.setState({ Assignees: data["employees"] }) },
                        (error) => toast(error.responseText, {
                            type: toast.TYPE.ERROR
                        })
                    )
                }

            })
        }
        else {
            this.props.history.push("/TaskDashBoard");
        }

    }

    componentDidMount() {

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
        }).on("filebatchpreupload", function (event, data) {
            var form = data.form, files = data.files
            this.uploadFile(files)
        }.bind(this))
    }

    componentDidUpdate() {
        setUnTouched(document);
    }

    render() {
        return (

            <div className="container" key={this.props.location.state} >
                <div className="col-xs-12" style={{marginTop: '1%'}}>
                    <h4 className="col-md-11"> <label>Task Details : {this.state.TaskId}</label><span className="pull-right" /> </h4>
                    <button className="col-md-1 btn btn-default backBtn" onClick={() => { this.props.history.push("/TaskDashboard") }}  > Back </button>
                </div>

                <div className="col-md-6 col-xs-12 ">
                    <table className="table table-condensed table-bordered headertable">
                        <tbody>
                            <tr>
                                <th>Created By</th>
                                <td>{this.state.TaskInfo["CreatedBy"]}</td>
                            </tr>
                            <tr>
                                <th>Created On</th>
                                <td>{this.state.TaskInfo["TaskDate"]}</td>
                            </tr>
                            <tr>
                                <th>Assigned To </th>
                                <td>{this.state.TaskInfo["TaskOwner"]}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="col-md-6 col-xs-12 ">
                    <table className="table table-condensed table-bordered headertable">
                        <tbody>
                            <tr>
                                <th>Priority </th>
                                <td>{this.state.TaskInfo["Priority"]}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td> {this.state.TaskInfo["Status"]} </td>
                            </tr>

                            <tr>
                                <th>Assigned Date</th>
                                <td> {this.state.TaskInfo["TaskDate"]}  </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

                <div className="col-xs-12">
                    <table className="table table-condensed table-bordered headertable">
                        <tbody>
                            <tr>
                                <th style={{ width: '20px' }}>Subject </th>
                                <td>{this.state.TaskInfo["Subject"]}</td>
                            </tr>
                            <tr>
                                <th style={{ width: '20px' }} >Description</th>
                                <td>  {this.state.TaskInfo["Description"]}  </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h4 className="col-xs-12" > <label>  Action/Responses </label> </h4>

                <div className="col-xs-12">
                    <table className="table table-condensed table-bordered actionTable mytable">
                        <tbody>
                            <tr>
                                <th> Task Date</th>
                                <th > Assigned By</th>
                                <th ></th>
                                <th colspan={2}> Action/ Response</th>
                                <th>Assigned To</th>
                                <th > Status </th>
                                <th >Hours Worked </th>
                            </tr>
                            {
                                this.state.TaskLog.map((ele, i) => {
                                    return (
                                        <tr key={i}>
                                            <td> {(ele["TaskDate"])}</td>
                                            <td> {ele["AssignedBy"]} </td>
                                            <td>  {
                                                ele["Attachments"] != null ?
                                                    ele["Attachments"].map((el) => {
                                                        return (
                                                            <a href={el} target="blank"> <i className='fa fa-paperclip' style={{ fontSize: '18px', cursor: 'pointer' }}  ></i> </a>
                                                        )
                                                    })
                                                    :
                                                    ""
                                            }
                                            </td>
                                            <td colspan={2}>{ele["Description"]}</td>
                                            <td> {ele["AssignedTo"]}</td>
                                            <td> {ele["Status"]}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {ele["HoursWorked"] > 0 ?
                                                    ele["HoursWorked"]
                                                    :
                                                    ""
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>

                </div>

                <div className="col-xs-12">

                    {
                        // this.state.Status != "Closed" && this.state.EmpId == this.props.location.state["TaskOwner"] || this.state.EmpId == this.props.location.state["AssignedBy"] ?
                        this.state.Status != "Closed" && this.state.EmpId == this.state.TaskOwner || this.state.EmpId == this.state.AssignedBy ?
                            <div className="panel panel-default">
                                <div className="panel-heading">
                                    <h4>Action</h4>
                                </div>
                                <div className="panel-body pver10 p0">
                                    <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)} key={this.state.EmployeeId} >

                                        {
                                            // this.state.EmpId == this.props.location.state["AssignedBy"] && this.state.Status != "Closed" ?
                                            this.state.EmpId == this.state.AssignedBy && this.state.Status != "Closed" ?

                                                <div className="col-md-3">
                                                    <label>Action Type </label>
                                                    <div className="form-group">
                                                        <div className="input-group">
                                                            <span className="input-group-addon">
                                                                <span className="glyphicon glyphicon-user"></span>
                                                            </span>
                                                            {
                                                                this.state.Status === "Open" || this.state.Status === "Pending" ?
                                                                    <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.ActionType}
                                                                        options={[{ value: "AcceptToClose", label: "Accept To Close" }]} onChange={this.ActionTypeChanged.bind(this)} />
                                                                    :
                                                                    this.state.Status === "Resolved" ?
                                                                        <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.ActionType}
                                                                            options={[{ value: "AcceptToClose", label: "Accept To Close" }, { value: "Reopen", label: "Reopen" }]} onChange={this.ActionTypeChanged.bind(this)} />
                                                                        :
                                                                        ""
                                                            }

                                                        </div>
                                                    </div>
                                                </div>

                                                :
                                                //   this.state.EmpId == this.props.location.state["TaskOwner"] && this.state.Status != "Closed" ?
                                                this.state.EmpId == this.state.TaskOwner && this.state.Status != "Closed" ?
                                                    <div className="col-md-3">
                                                        <label>Action Type </label>
                                                        <div className="form-group">
                                                            <div className="input-group">
                                                                <span className="input-group-addon">
                                                                    <span className="glyphicon glyphicon-user"></span>
                                                                </span>
                                                                <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.ActionType}
                                                                    options={[{ value: "Assign", label: "Assign" }, { value: "Pending", label: "Pending/Acknowledgement" }, { value: "Resolved", label: "Resolved" }]} onChange={this.ActionTypeChanged.bind(this)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    :
                                                    ""
                                        }

                                        {
                                            this.state.ActionType != null ?
                                                <div>
                                                    {
                                                        this.state.ActionType.value === "Assign" ?

                                                            <div className="col-md-3">
                                                                <label> Assign to</label>
                                                                <div className="form-group">
                                                                    <div className="input-group">
                                                                        <span className="input-group-addon">
                                                                            <span className="glyphicon glyphicon-user"></span>
                                                                        </span>
                                                                        <Select className="form-control" name="AssignedTo" ref="assignee" placeholder="Select an Assignee" value={this.state.Assignee} options={this.state.Assignees} onChange={this.AssignedToChanged.bind(this)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            :
                                                            ""
                                                    }

                                                    {
                                                        this.state.ActionType.value === "Pending" ?

                                                            <div >
                                                                <div className="col-md-3">
                                                                    <label>Expected/Start Date </label>
                                                                    <div className="form-group">
                                                                        <div className="input-group">
                                                                            <span className="input-group-addon">
                                                                                <span className="glyphicon glyphicon-calendar"></span>
                                                                            </span>
                                                                            <input className="form-control" disabled={this.state.IsDisabled} style={{ lineHeight: '19px' }} type="date" name="DOS" ref="dos" autoComplete="off" defaultValue={this.state.StartDate} min={moment().format("YYYY-MM-DD")} />
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
                                                                            <input className="form-control" disabled={this.state.IsDisabled} style={{ lineHeight: '19px' }} type="date" name="DOC" ref="doc" autoComplete="off" defaultValue={this.state.EndDate} min={moment().format("YYYY-MM-DD")} onChange={this.EdocChanged.bind(this)} />
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
                                                            :
                                                            ""
                                                    }

                                                    <div className="col-xs-3" style={{ width: '26%' }} >
                                                        <label>No. Of Hours Worked</label>
                                                        <div className="form-group">
                                                            <div className="input-group">
                                                                <span className="input-group-addon">
                                                                    <span className="glyphicon glyphicon-time" ></span>
                                                                </span>
                                                                <input className="form-control" name="HoursWorked" type="number" min="0" max="10" ref="workedHours" autoComplete="off" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {
                                                        this.state.showHoursWorked ?
                                                            <div className="col-xs-3 form-group" style={{ width: '26%' }}>
                                                                <label> Previously worked hours </label>
                                                                <input className="form-control" disabled="true" name="previouslyWorkedHours" value={this.state.HoursWorked} />
                                                            </div>
                                                            :
                                                            ""
                                                    }
                                                </div>
                                                :
                                                <div />
                                        }
                                        {
                                            //  this.state.EmpId == this.props.location.state["TaskOwner"] || this.state.EmpId == this.props.location.state["AssignedBy"] ?

                                            this.state.EmpId == this.state.TaskOwner || this.state.EmpId == this.state.AssignedBy ?
                                                <div>
                                                    <div className="col-xs-12" style={{ paddingTop: '12px' }}>
                                                        <label> Action  </label>
                                                        <div className="form-group" style={{ height: "auto" }}>
                                                            <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor" toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }} editorState={this.state.Description} toolbarClassName="toolbarClassName" wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner" onEditorStateChange={this.messageBoxChange.bind(this)} />
                                                            <input hidden ref="description" name="forErrorShowing" />
                                                        </div>
                                                    </div>
                                                    <div className="col-xs-12">
                                                        <div className="form-group">
                                                            <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any" showUpload="false" multiple />
                                                        </div>
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
                            : <div />
                    }
                </div>
            </div>
        )
    }

    uploadCallback(file) {
    }

    messageBoxChange(val) {
        this.setState({ Description: val, DescriptionHtml: draftToHtml(convertToRaw(val.getCurrentContent())) });
    }

    // myNoteChanged(val) {
    //     this.setState({ myNote: val, myNoteHtml: val.toString('html') })
    // }

    ActionTypeChanged(val) {
        if (val) {
            if (val.value != "AcceptToClose" || val.value != "Reopen") {
                $.ajax({
                    url: ApiUrl + "/api/Activities/GetTaskHoursWorkedInfo?taskId=" + this.props.location.state["TaskId"] +
                        "&actionType=" + val.value + "&userId=" + sessionStorage.getItem("EmpId"),
                    type: "get",
                    success: (data) => {
                        this.setState({ ActivityLog: data["activitylog"] }, () => {
                            if (this.state.ActivityLog != null && val.value == "Pending") {
                                this.setState({
                                    StartDate: moment(data["activitylog"]["StartDate"]).format("YYYY-MM-DD"),
                                    EndDate: moment(data["activitylog"]["EndDate"]).format("YYYY-MM-DD"),
                                    BudgetedHours: data["activitylog"]["BudgetedHours"], IsDisabled: true, budgetedHoursDisabled: true,
                                    HoursWorked: data["activitylog"]["TotalHoursWorked"], showHoursWorked: true
                                }, () => {
                                    this.setState({ ActionType: val })
                                    showErrorsForInput(this.refs.action.wrapper, null)
                                    // console.log(moment(data["activitylog"]["StartDate"]).format("YYYY-MM-DD"));
                                })
                            }

                            else if (val.value == "Assign" && this.state.ActivityLog != null) {
                                this.setState({ ActionType: val, HoursWorked: data["activitylog"]["TotalHoursWorked"], showHoursWorked: true })
                            }

                            else if (val.value == "Resolved" && this.state.ActivityLog != null) {
                                this.setState({ ActionType: val, HoursWorked: data["activitylog"]["TotalHoursWorked"], showHoursWorked: true })
                            }

                            else {
                                this.setState({ ActionType: val, showHoursWorked: false })
                                showErrorsForInput(this.refs.action.wrapper, null)
                            }
                        })
                    }
                })
            }
            else {
                this.setState({ ActionType: val })
                showErrorsForInput(this.refs.action.wrapper, null)
            }
        }
        else {
            this.setState({ ActionType: '' })
            showErrorsForInput(this.refs.action.wrapper, ["Please select action type"]);
        }
    }

    handleModelChange(model) {
        this.setState({ model: model });
    }

    AssignedToChanged(val) {
        if (val) {
            if (val.value != sessionStorage.getItem("EmpId") && val.value != this.state.TaskInfo["Creator"]) {
                this.setState({ Assignee: val })
                showErrorsForInput(this.refs.assignee.wrapper, null);
            }
        }
        else {
            this.setState({ Assignee: '' });
            showErrorsForInput(this.refs.assignee.wrapper, ["Select Assignee"]);
        }
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

        data.append("taskId", this.props.location.state["TaskId"])
        data.append("actionType", this.state.ActionType.value);
        data.append("description", this.state.DescriptionHtml);
        data.append("OrgId", sessionStorage.getItem("OrgId"));

        if (this.state.ActionType.value === "Assign") {
            data.append("assignee", this.state.Assignee.value);
            data.append("hoursWorked", this.refs.workedHours.value);
        }

        if (this.state.ActionType.value === "Pending") {
            data.append("budgetedHours", this.refs.budgetedhours.value);
            data.append("edos", this.refs.dos.value);
            data.append("edoc", this.refs.doc.value);
            data.append("hoursWorked", this.refs.workedHours.value);
        }

        if (this.state.ActionType.value === "Resolved") {
            data.append("hoursWorked", this.refs.workedHours.value)
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
                    this.state.EmpId != sessionStorage.getItem("EmpId") ? this.props.history.push("/TaskDashBoard/" + this.state.EmpId) : this.props.history.push("/TaskDashBoard");
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


    validate(e) {
        // var success = ValidateForm(e);
        let errors = {};
        var success = true;
        var isSubmit = e.type === "submit";


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

        if (this.state.ActionType != undefined && this.state.ActionType.value != "Reopen" && this.state.ActionType.value != "AcceptToClose") {
            if (this.state.ActionType.value == "Assign" && (!this.state.Assignee || !this.state.Assignee.value)) {
                success = false;
                showErrorsForInput(this.refs.assignee.wrapper, ["Please select Assignee"]);
                if (isSubmit) {
                    this.refs.assignee.focus();
                    isSubmit = false;
                }
            }

            if (this.state.ActionType.value == "Pending") {
                if (validate.single(this.refs.dos.value, { presence: true }) !== undefined) {
                    success = false;
                    showErrorsForInput(this.refs.dos, ["Select expected date of beginning"]);
                    if (isSubmit) {
                        this.refs.dos.focus();
                        isSubmit = false;
                    }
                }
                else {
                    showErrorsForInput(this.refs.dos, []);
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

                if (success) {
                    var hours = moment(this.refs.doc.value).diff(moment(this.refs.dos.value), 'days') * 8;
                    var maxBudgetedHours = hours;
                    if (hours > 0) {
                        maxBudgetedHours = hours;
                    }
                    else {
                        maxBudgetedHours = 8;
                    }

                    if (this.refs.budgetedhours.value === "") {
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
                }

            }

            if (this.refs.workedHours.value === "") {
                success = false;
                showErrorsForInput(this.refs.workedHours, ["Please enter worked hours"]);
                if (isSubmit) {
                    this.refs.workedHours.focus();
                    isSubmit = false;
                }
            }
            else if (this.refs.workedHours.value > 10) {
                success = false;
                showErrorsForInput(this.refs.workedHours, ["should be less than 10"]);
                if (isSubmit) {
                    this.refs.workedHours.focus();
                    isSubmit = false;
                }
            }
            else {
                showErrorsForInput(this.refs.workedHours, []);
            }

            if (!this.state.Description.getCurrentContent().hasText()) {
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