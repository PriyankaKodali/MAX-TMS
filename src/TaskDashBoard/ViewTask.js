import React, { Component } from 'react';
import './TaskDashBoard.css';
//import RichTextEditor from 'react-rte';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '.././Config.js';
//import FroalaEditor from 'react-froala-wysiwyg';
import { toast } from 'react-toastify';
import { MyAjaxForAttachments } from '../MyAjax.js';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

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
            Description: EditorState.createEmpty(), IsDisabled: false, ActivityLog: [], EndDate: "",
            BudgetedHours: '', showHoursWorked: false

            // ActionTypes: [{ value: "Assign", label: "Assign" }, { value: "Pending", label: "Pending/Acknowledgement" },
            // { value: "Resolved", label: "Resolved" }]
        }
    }

    componentWillMount() {

        this.setState({
            TaskId: this.props.location.state["TaskId"],
            AssignedBy: this.props.location.state["AssignedBy"],
            TaskOwner: this.props.location.state["TaskOwner"]
        }, () => {

            if (this.props.location.state) {

                $.ajax({
                    url: ApiUrl + "/api/Activities/GetTaskBasicInfo?TaskId=" + this.props.location.state["TaskId"],
                    type: "get",
                    success: (data) => { this.setState({ TaskInfo: data["activity"] }) }
                })

                $.ajax({
                    url: ApiUrl + "/api/Activities/GetActivityLogOfTask?taskId=" + this.props.location.state["TaskId"],
                    type: "get",
                    success: (data) => {
                        this.setState({ TaskLog: data["taskLog"] })
                    }
                })
            }
            $.ajax({
                url: ApiUrl + "/api/MasterData/GetEmp?OrgId=" + sessionStorage.getItem("OrgId"),
                type: "get",
                success: (data) => { this.setState({ Assignees: data["employees"] }) }
            })
        })
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

            <div style={{ marginTop: '5%' }} key={this.state.ActionTypes} >

                <div className="myContainer">
                    <div class="col-xs-12">
                        <table className="mytable" style={{ borderColor: '1px solid blue' }}>
                            <tr >
                                <td colspan={2}> <label> Task </label> {this.state.TaskId} Details</td>
                                <td colspan={2}> <label> Creator : </label>  {this.state.TaskInfo["CreatedBy"]}  </td>
                                <td colSpan={2}> <label> Created On :</label> {this.state.TaskInfo["TaskDate"]}  </td>
                            </tr>

                            <tr>
                                <td > <label>Priority:</label>  {this.state.TaskInfo["Priority"]}  </td>
                                <td ><label> Status:</label> {this.state.TaskInfo["Status"]}  </td>
                                <td colspan={2}> <label> Assigned To: </label>  {this.state.TaskInfo["TaskOwner"]}  </td>
                                <td  > <label> AssignedDate: </label> {this.state.TaskInfo["TaskDate"]}  </td>
                            </tr>
                            <tr>
                                <td > <label>Description:</label></td>
                                <td colSpan={4}> <p> <label> Subject: </label> {this.state.TaskInfo["Subject"]}</p> <p>   {this.state.TaskInfo["Description"]} </p> </td>
                            </tr>
                        </table>

                    </div>

                    <div className="col-xs-12" style={{ marginTop: '1%', marginBottom: '1%' }}>
                        <table className="mytable" >
                            <tr >  <td colspan={9} style={{ backgroundColor: 'rgb(143, 146, 224);' }}> Action / Responses  </td> </tr>
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
                                                    ele["Attachments"].map((el, j) => {
                                                        return (
                                                            //  <a href = { el["url"]}></a>
                                                            el["url"]
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
                                                { ele["HoursWorked"] > 0 ?
                                                    ele["HoursWorked"]
                                                    :
                                                    ""
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                            }

                        </table>
                    </div>
                    <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)} >

                        {
                            sessionStorage.getItem("EmpId") === this.state.AssignedBy ?

                                <div className="col-xs-3">
                                    <label>Action Type </label>
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon">
                                                <span className="glyphicon glyphicon-user"></span>
                                            </span>
                                            <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.ActionType}
                                                options={[{ value: "AcceptToClose", label: "Accept To Close" }]} onChange={this.ActionTypeChanged.bind(this)} />
                                        </div>
                                    </div>
                                </div>

                                :
                                sessionStorage.getItem("EmpId") === this.state.TaskOwner ?

                                    <div className="col-xs-3">
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
                                    <div />

                        }

                        {
                            this.state.ActionType != null ?
                                this.state.ActionType.value === "Assign" ?
                                    <div>
                                        <div className="col-xs-3">
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

                                        <div className="col-xs-3">
                                            <label>No. Of Hours Worked</label>
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <span className="input-group-addon">
                                                        <span className="glyphicon glyphicon-time" ></span>
                                                    </span>
                                                    <input className="form-control" name="HoursWorked" type="number" min="0" ref="hoursWorked" />
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            this.state.showHoursWorked ?
                                                <div className="col-xs-2 form-group">
                                                    <label> Previously worked hours </label>
                                                    <input className="form-control" name="hoursWorked" ref="hoursWorked" value={this.state.HoursWorked} />
                                                </div>
                                                :
                                                <div />
                                        }
                                    </div>

                                    :
                                    this.state.ActionType.value === "Pending" ?
                                        <div key={this.state.ActivityLog}>
                                            <div className="col-md-3">
                                                <label>Expected/Start Date </label>
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <span className="input-group-addon">
                                                            <span className="glyphicon glyphicon-calendar"></span>
                                                        </span>
                                                        <input className="col-md-3 form-control" disabled={this.state.IsDisabled} style={{ lineHeight: '19px' }} type="date" name="DOS" ref="dos" autoComplete="off" defaultValue={this.state.StartDate} />
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
                                                        <input className="col-md-3 form-control" disabled={this.state.IsDisabled} style={{ lineHeight: '19px' }} type="date" name="DOC" ref="doc" autoComplete="off" defaultValue={this.state.EndDate} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-xs-3">
                                                <label>Planned Budgeted Hours</label>
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <span className="input-group-addon">
                                                            <span className="glyphicon glyphicon-time" ></span>
                                                        </span>
                                                        <input className="form-control" disabled={this.state.IsDisabled} name="BudgetedHours" type="number" min="0" ref="budgetedhours" defaultValue={this.state.BudgetedHours} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-xs-3">
                                                <label>No. Of Hours Worked</label>
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <span className="input-group-addon">
                                                            <span className="glyphicon glyphicon-time" ></span>
                                                        </span>
                                                        <input className="form-control" name="hoursWorked" type="number" min="0" ref="hoursWorked" />
                                                    </div>
                                                </div>
                                            </div>

                                            {
                                                this.state.showHoursWorked ?
                                                    <div className="col-xs-2 form-group">
                                                        <label> Previously worked hours </label>
                                                        <input className="form-control" name="hoursWorked" ref="hoursWorked" value={this.state.HoursWorked} />
                                                    </div>
                                                    :
                                                    <div />
                                            }

                                        </div>
                                        :

                                        this.state.ActionType.value === "Resolved" ?

                                            <div>

                                                <div className="col-xs-3">
                                                    <label>No. Of Hours Worked</label>
                                                    <div className="form-group">
                                                        <div className="input-group">
                                                            <span className="input-group-addon">
                                                                <span className="glyphicon glyphicon-time" ></span>
                                                            </span>
                                                            <input className="form-control" name="HoursWorked" type="number" min="0" ref="hoursWorked" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {
                                                    this.state.showHoursWorked ?
                                                        <div className="col-xs-2 form-group">
                                                            <label> Previously worked hours </label>
                                                            <input className="form-control" name="hoursWorked" ref="hoursWorked" value={this.state.HoursWorked} />
                                                        </div>
                                                        :
                                                        <div />
                                                }
                                            </div>

                                            :
                                            <div />
                                :
                                <div />
                        }

                        {
                            sessionStorage.getItem("EmpId") === this.state.TaskOwner || sessionStorage.getItem("EmpId") === this.state.AssignedBy ?
                                <div>
                                    <div className="col-xs-12 ">
                                        <h4 className="heading"> Action </h4>
                                        <div className="col-xs-12 actionLayout" >
                                            <div className="col-xs-12" style={{ paddingTop: '12px' }}>
                                                <label> Action  </label>
                                                <div className="form-group" style={{ height: "auto" }}>
                                                    <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor" toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }} editorState={this.state.Description} toolbarClassName="toolbarClassName" wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner" onEditorStateChange={this.messageBoxChange.bind(this)} />
                                                    <input hidden ref="actionResponse" name="forErrorShowing" />
                                                </div>
                                            </div>
                                            <div className="col-xs-12">
                                                <div className="form-group">
                                                    <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any" showUpload="false" multiple />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xs-12 text-center form-group">
                                        <button type="submit" name="submit" className="btn btn-primary" style={{ marginTop: '1%' }}>Submit</button>
                                        <div className="loader"></div>
                                    </div>
                                </div>
                                :
                                <div />
                        }

                    </form>
                </div>
            </div>

        )
    }

    uploadCallback() {

    }

    messageBoxChange(val) {
        this.setState({ Description: val, DescriptionHtml: draftToHtml(convertToRaw(val.getCurrentContent())) });
    }


    myNoteChanged(val) {
        this.setState({ myNote: val, myNoteHtml: val.toString('html') })

    }
    ActionTypeChanged(val) {
        if (val) {
            if (val.value != "AcceptToClose") {
                $.ajax({
                    url: ApiUrl + "/api/Activities/GetTaskInfo?taskId=" + this.props.location.state["TaskId"] +
                        "&actionType=" + val.value + "&userId=" + sessionStorage.getItem("EmpId"),
                    type: "get",
                    success: (data) => {
                        this.setState({ ActivityLog: data["activitylog"] }, () => {
                            if (this.state.ActivityLog != null && val.value == "Pending") {
                                this.setState({
                                    StartDate: moment(data["activitylog"]["StartDate"]).format("YYYY-MM-DD"),
                                    EndDate: moment(data["activitylog"]["EndDate"]).format("YYYY-MM-DD"),
                                    BudgetedHours: data["activitylog"]["BudgetedHours"], IsDisabled: true,
                                    HoursWorked: data["activitylog"]["HoursWorked"], showHoursWorked: true
                                }, () => {
                                    this.setState({ ActionType: val })
                                    showErrorsForInput(this.refs.action.wrapper, null)
                                    console.log(moment(data["activitylog"]["StartDate"]).format("YYYY-MM-DD"));
                                })
                            }

                            else if (val.value == "Assign" && this.state.ActivityLog != null) {
                                this.setState({ HoursWorked: data["activitylog"]["HoursWorked"], showHoursWorked: true })
                            }

                            else if (val.value == "Resolved" && this.state.ActivityLog != null) {
                                this.setState({ HoursWorked: data["activitylog"]["HoursWorked"], showHoursWorked: true })
                            }

                            else {
                                this.setState({ ActionType: val })
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
            this.setState({ Assignee: val })
            showErrorsForInput(this.refs.assignee.wrapper, null);
        }
        else {
            this.setState({ Assignee: '' })
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        $(".loaderActivity").show();
        $("button[name='submit']").hide();

        if (!this.validate(e)) {

            $(".loaderActivity").hide();
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
            data.append("hoursWorked", this.refs.hoursWorked.value);
        }

        if (this.state.ActionType.value === "Pending") {
            data.append("budgetedHours", this.refs.budgetedhours.value);
            data.append("edos", this.refs.dos.value);
            data.append("edoc", this.refs.doc.value);
            data.append("hoursWorked", this.refs.hoursWorked.value);
        }

        if (this.state.ActionType.value === "Resolved") {
            data.append("hoursWorked", this.refs.hoursWorked.value)
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


    validate(e) {
        var success = ValidateForm(e);

        if (!this.state.ActionType || !this.state.ActionType.value) {
            success = false;
            showErrorsForInput(this.refs.action.wrapper, ["Please select action type"])
        }

        if (this.state.ActionType != undefined) {
            if (this.state.ActionType.value == "Assign") {
                if (!this.state.Assignee || !this.state.Assignee.value) {
                    success = false;
                    showErrorsForInput(this.refs.assignee.wrapper, ["Please select Assignee"])
                }
            }
        }

        if (!this.state.Description.getCurrentContent().hasText()) {
            showErrorsForInput(this.refs.actionResponse, ["Please enter action description"]);
            success = false;
        }
        else {
            showErrorsForInput(this.refs.actionResponse, []);
        }

        return success;

    }
}
export default ViewTask;



// options={[{ value: "Assign", label: "Assign" }, { value: "Pending", label: "Pending/Acknowledgement" },
// { value: "Resolved", label: "Resolved" }]}



