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

var moment = require('moment');

class ViewTask extends Component {

    constructor(props) {
        super(props);
        var froalaConfig = {
            heightMin: 210
        }
        this.state = {
            Status: null, Statuses: [], Model: "", model: "", FroalaConfig: froalaConfig,
            CreatedOn: moment(), CreatedBy: '', Action: null, StartDate: moment().format("YYYY-MM-DD"),
            ActionTypes: [], ActionType: null, TaskInfo: [], TaskLog: [], user: "", DescriptionHtml: "",
            Description: EditorState.createEmpty(), IsDisabled: false, budgetedHoursDisabled: true, ActivityLog: [], EndDate: "",
            BudgetedHours: '', showHoursWorked: false, maxBudgetedHours: '', isAcknowledged: false,
            AssignedBy: null, TaskOwner: null, TaskId: null, Status: null, EmpId: null, TimeUnit: null,
            PreviouslyWorkedQuantity:null
        }
    }

    componentWillMount() {
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")
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
                        ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + this.props.location.state["AssignedBy"] + "&OrgId=" + orgId,
                        (data) => { this.setState({ Assignees: data["employees"] }) },
                        (error) => toast(error.responseText, {
                            type: toast.TYPE.ERROR
                        })
                    )
                    $.ajax({
                        url: ApiUrl + "/api/Activities/GetTaskHoursWorkedInfo?taskId=" + this.props.location.state["TaskId"] +
                            "&userId=" + this.props.location.state["EmpId"],
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
                                        if(data["activitylog"]["TotalQuantityWorked"] > 0) {
                                            this.setState({PreviouslyWorkedQuantity: data["activitylog"]["TotalQuantityWorked"] })
                                        }
                                       // if (data["activitylog"]["StartDate"] !== null) {
                                          if (data["activitylog"]["EndDate"] !== null) {
                                            this.setState({
                                                StartDate: moment(data["activitylog"]["StartDate"]).format("YYYY-MM-DD"),
                                                EndDate: moment(data["activitylog"]["EndDate"]).format("YYYY-MM-DD"),
                                                BudgetedHours: data["activitylog"]["BudgetedHours"], IsDisabled: true, 
                                                budgetedHoursDisabled: true, isAcknowledged: true
                                            })
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

            })
        }
        else {
            this.props.history.push("/TaskDashBoard");
        }


        $(document).ready(function () {
            $("input, textarea").on("keypress", function (e) {
                if (e.which === 32)
                    e.preventDefault();
            });
        });
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
                <div className="col-xs-12" style={{ marginTop: '1%' }}>
                    <h4 className="col-md-11"> <label>Task Details : {this.state.TaskId}</label><span className="pull-right" /> </h4>
                    <button className="col-md-1 btn btn-default backBtn" onClick={() => { this.props.history.push("/TaskDashboard/" + this.props.location.state["EmpId"]) }}  > Back </button>
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
                                <td>{moment(this.state.TaskInfo["CreatedDate"]).format("DD-MMM-YYYY h:mm a")}</td>
                            </tr>
                            <tr>
                                <th>Assigned To </th>
                                <td>{this.state.TaskInfo["TaskOwner"]}</td>
                            </tr>
                            <tr>
                                <th>Category</th>
                                <td>{this.state.TaskInfo["Category"]}</td>
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
                                <td> {moment(this.state.TaskInfo["CreatedDate"]).format("DD-MMM-YYYY h:mm a")}  </td>
                            </tr>
                            <tr>
                                <th>SubCategory</th>
                                <td>{this.state.TaskInfo["SubCategory"]}</td>
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
                                {/* <td>  {this.state.TaskInfo["Description"]}  </td> */}

                                <td>
                                    <Editor name="actionResponse" readonly={true} id="actionResponse"
                                        editorState={this.getDescription(this.state.TaskInfo["Description"])} toolbarClassName="hide-toolbar"
                                        wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                    />
                                </td>
                            </tr>

                              {
                                     this.state.TaskInfo["TaskType"] === "Client" ?
                                    <tr>
                                         <th style={{ width: '20px' }}> Client </th>
                                         <td> {this.state.TaskInfo["Client"]}</td>
                                         </tr>
                                         :
                                         ""
                                }

                                {
                                    this.state.TaskInfo["TaskType"] === "Client" ?
                                          <tr >
                                            <th style={{ width: '20px' }}> Location </th>
                                            <td > {this.state.TaskInfo["Location"]} </td>
                                          </tr>
                                        :
                                        ""
                                }
                              
                        </tbody>
                    </table>
                </div>

                <h4 className="col-xs-12" > <label>  Action/Responses </label> </h4>

                <div className="col-xs-12">
                    <table className="table table-condensed table-bordered actionTable mytable">
                        <tbody>
                            <tr>
                                <th > Task Date</th>
                                <th> Assigned By</th>
                                <th ></th>
                                <th colspan={2} style={{ width: '40%' }}> Action/ Response</th>
                                <th  >Assigned To</th>
                                <th > Status </th>
                                <th >Hours Worked </th>
                                {this.state.TaskInfo["Quantity"]!=null && this.state.TaskInfo["Quantity"]!=0?
                                  <th>Quantity Worked</th>
                                :
                                ""}
                            </tr>
                            {
                                this.state.TaskLog.map((ele, i) => {
                                    return (
                                        <tr key={i}>
                                            <td > <p> {moment(ele["TaskDate"]).format("DD-MMM-YYYY h:mm a")} </p>  </td>
                                            <td > {ele["AssignedBy"]} </td>
                                            <td >  {
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
                                            {/* <td colspan={2}>{ele["Description"]}</td> */}
                                            <td colspan={2} style={{ paddingTop: '1px' }}>
                                                <Editor name="actionResponse" readonly={true} id="actionResponse"
                                                    editorState={this.gotoChangeContent(ele["Description"])} toolbarClassName="hide-toolbar"
                                                    wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                />
                                            </td>

                                            <td > {ele["AssignedTo"]}</td>
                                            <td> {ele["Status"]}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {ele["HoursWorked"] > 0 ?
                                                    ele["HoursWorked"]
                                                    :
                                                    ""
                                                }
                                            </td>
                                            {this.state.TaskInfo["Quantity"]!=null && this.state.TaskInfo["Quantity"]!=0 ?
                                               <td style={{ textAlign: 'center' }}> 
                                                 {ele["QuantityWorked"]>0 ? ele["QuantityWorked"] : ""}
                                              </td>
                                            :
                                            ""
                                            }
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>

                <div className="col-xs-12" style={{ marginTop: '1%' }}>

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
                                                                    this.state.Status === "Resolved" || this.state.Status == "Reopened" ?
                                                                        <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.ActionType}
                                                                            options={[{ value: "AcceptToClose", label: "Accept To Close" }, { value: "Reopen", label: "Reopen" }]} onChange={this.ActionTypeChanged.bind(this)} />
                                                                        :
                                                                        ""
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                :

                                                this.state.EmpId == sessionStorage.getItem("EmpId") ?

                                                    this.state.EmpId == this.state.TaskOwner && this.state.Status != "Closed" && this.state.isAcknowledged ?
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
                                                        <div className="col-md-3">
                                                            <label>Action Type </label>
                                                            <div className="form-group">
                                                                <div className="input-group">
                                                                    <span className="input-group-addon">
                                                                        <span className="glyphicon glyphicon-user"></span>
                                                                    </span>
                                                                    <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.ActionType}
                                                                        options={[{ value: "Assign", label: "Assign" }, { value: "Pending", label: "Pending/Acknowledgement" }]} onChange={this.ActionTypeChanged.bind(this)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    :
                                                    <div className="col-md-3">
                                                        <label>Action Type </label>
                                                        <div className="form-group">
                                                            <div className="input-group">
                                                                <span className="input-group-addon">
                                                                    <span className="glyphicon glyphicon-user"></span>
                                                                </span>
                                                                <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.ActionType}
                                                                    options={[{ value: "Assign", label: "Assign" }]} onChange={this.ActionTypeChanged.bind(this)} />
                                                            </div>
                                                        </div>
                                                    </div>
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
                                                        this.state.showHoursWorked ?
                                                            <div className="col-md-3 form-group" style={{ width: '20%' }}>
                                                                <label> Previously worked hours </label>
                                                                <input className="form-control" disabled="true" name="previouslyWorkedHours" value={this.state.HoursWorked} />
                                                            </div>
                                                            :
                                                            ""
                                                    }

                                                      {this.state.TaskInfo["Quantity"] ?

                                                     <div className="col-md-2 form-group">
                                                      <label>Budgeted Quantity</label>
                                                       <input className="form-control" name="budgetedHours" disabled="true" value={this.state.TaskInfo["Quantity"]}  />
                                                      </div>
                                                     :
                                                     <div />
                                                      }
                                                    {
                                                        this.state.PreviouslyWorkedQuantity !==null ?
                                                        <div className="col-md-2 form-group" >
                                                        <label>Worked quantity </label>
                                                        <input className="form-control" name="previousQuantity" disabled="true" value={this.state.PreviouslyWorkedQuantity} />
                                                        </div>
                                                        :
                                                        <div />
                                                     }

                                                     {
                                                         this.state.TaskInfo["Quantity"] &&  this.state.EmpId != this.state.AssignedBy ?
                                                         <div className="col-md-2 form-group">
                                                             <label>Qunatity Worked</label> 
                                                           <input className="form-control" type="number" placeholder="Quantity worked" name="quantityWorked" ref="quantityWorked"  />
                                                         </div>
                                                         :<div />
                                                    }

                                                   </div>
                                                  :
                                                 <div />
                                        }

                                        {
                                            this.state.EmpId == this.state.TaskOwner || this.state.EmpId == this.state.AssignedBy ?
                                                <div>
                                                    <div className="col-xs-12" style={{ paddingTop: '12px' }}>
                                                        <label> Action  </label>
                                                        <div className="form-group" style={{ height: "auto" }}>
                                                            <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor" toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }} editorState={this.state.Description} toolbarClassName="toolbarClassName" wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner" onEditorStateChange={this.messageBoxChange.bind(this)} />
                                                            <input type="hidden" id="desc" ref="description" name="forErrorShowing" />
                                                        </div>
                                                    </div>
                                                    <div className="col-xs-12">
                                                        <div className="form-group">
                                                            <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any"  multiple />

                                                            {/* showUpload="false" */}
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
    getDescription(desc) {
        if (this.state.TaskInfo.Description !== undefined) {
            var contentBlock = this.state.TaskInfo["Description"];
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

    AssignedToChanged(val) {
        if (val) {
            this.setState({ Assignee: val })
            showErrorsForInput(this.refs.assignee.wrapper, null);
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

        if(this.state.TaskInfo["Quantity"]!=null){
           data.append("quantityWorked",  this.refs.quantityWorked.value);
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

                    if (this.refs.budgetedhours.value === "" || this.refs.budgetedhours.value ==="0") {
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
                     
                     if(this.state.TaskInfo["Quantity"]!=null && this.state.TaskInfo["Quantity"]!=0)
                     {
                        if(this.refs.quantityWorked.value!=""){
                            if(parseFloat(this.refs.quantityWorked.value) <0){
                             showErrorsForInput(this.refs.quantityWorked, ["Quantity is not valid"]);
                              this.refs.quantityWorked.focus();
                              if (isSubmit) {
                               isSubmit = false;
                              }
                            }
                            else if(parseFloat(this.refs.quantityWorked.value) > this.state.TaskInfo["Quantity"]){
                              success = false;
                             showErrorsForInput(this.refs.quantityWorked, ["Quantity is greater than budgeted"]);
                                 if (isSubmit) {
                               this.refs.quantityWorked.focus();
                               isSubmit = false;
                             }  
                           }
                           else{
                               showErrorsForInput(this.refs.quantityWorked, []);
                           }
                     
                       }
   
                     }
                    
                }

            }

            if (this.state.isAcknowledged) {

                if (this.refs.hoursWorked.value === "") {
                    success = false;
                    showErrorsForInput(this.refs.hoursWorked, ["Please enter number of hours worked"]);
                    if (isSubmit) {
                        this.refs.hoursWorked.focus();
                        isSubmit = false;
                    }
                }
                else if (this.refs.hoursWorked.value == 0) {
                    success = false;
                    showErrorsForInput(this.refs.hoursWorked, ["should be greater than 0"]);
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

                if(this.state.TaskInfo["Quantity"]!=null && this.state.TaskInfo["Quantity"]!=0) 
                {
                  if(this.refs.quantityWorked.value== ""){
                    success = false;
                    showErrorsForInput(this.refs.quantityWorked,["Enter quantity worked"])
                    if(isSubmit){
                       this.refs.quantityWorked.focus();
                       isSubmit = false;
                    }
                 }
                  else if(parseFloat(this.refs.quantityWorked.value)<=0){
                     success= false;
                     showErrorsForInput(this.refs.quantityWorked,["Should be greater than 0"]);
                     if(isSubmit){
                       this.refs.quantityWorked.focus();
                       isSubmit = false;
                     }
                 }
                  else if(parseFloat(this.refs.quantityWorked.value) > this.state.TaskInfo["Quantity"]){
                    success = false;
                    showErrorsForInput(this.refs.quantityWorked,["Enter valid quantity"]);
                    if(isSubmit){
                       this.refs.quantityWorked.focus();
                       isSubmit = false;
                    }
                 }
                 else{
                     showErrorsForInput(this.refs.quantityWorked,[]);
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
export default ViewTask1;



// if (this.state.isAcknowledged) {
//     if (this.refs.hours.value === "" && this.refs.minutes.value === "") {
//         success = false;
//         showErrorsForInput(this.refs.errorInfo, ["Enter the duration worked in hours or minutes"]);
//         if (isSubmit) {
//             isSubmit = false;
//         }
//     }

//     else if (this.refs.hours.value !== "" && this.refs.hours.value > 10) {
//         success = false;
//         showErrorsForInput(this.refs.hours, ["Hours should be less than 10 "])
//         if (isSubmit) {
//             this.refs.hours.focus();
//             isSubmit = false;
//         }
//     }

//     else if (this.refs.minutes.value !== "" && this.refs.minutes.value > 60) {
//         success = false;
//         showErrorsForInput(this.refs.minutes, ["Minutes should be less than 60 "])
//         if (isSubmit) {
//             this.refs.minutes.focus();
//             isSubmit = false;
//         }
//     }

//     else {
//         showErrorsForInput(this.refs.errorInfo, []);
//         showErrorsForInput(this.refs.hours, []);
//         showErrorsForInput(this.refs.minutes, []);
//     }

// }

 {/* <div className="col-md-4 form-group" style={{ width: '28%' }} >
                                                        <div className="col-md-6">
                                                            <label> Hours(worked) </label>
                                                            <input className="col-md-5 form-control" name="HrsWorked" type="number" min="0" max="10" ref="hours" autoComplete="off" />
                                                          
                                                        </div>


                                                        <div className="col-md-6" >
                                                            <label> Minutes(worked) </label>
                                                            <input className="form-control" name="MinWorked" type="number" min="0" max="60" ref="minutes" autoComplete="off" />
                                                        </div>

                                                        <p type="hidden" id="workedhours" ref="errorInfo" name="errorInfo" />
                                                    </div> */}