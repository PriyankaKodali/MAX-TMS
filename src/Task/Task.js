import React, { Component } from 'react';
import './Task.css';
import Select from 'react-select';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import $ from 'jquery';
import { ApiUrl } from '.././Config.js';
import { toast } from 'react-toastify';
import { MyAjaxForAttachments, MyAjax } from '../MyAjax.js';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { validate } from 'validate.js';
import { AssigneesList } from './AssigneesList.js';

var moment = require('moment');

window.jQuery = window.$ = require("jquery");
var bootstrap = require('bootstrap');

class Task extends Component {

    constructor(props) {
        super(props);

        var froalaConfig = {
            heightMin: 210
        }

        var assignees = [{ AssigneeId: null, AssigneeName: "", Quantity: null }]

        this.state = {
            Categories: [], Category: null, SubCategories: [], SubCategory: null,
            isClientTask: true, isOffcTask: false, Client: null, Clients: [],
            Department: null, Departments: [], Assignees: [],
            Assignee: null, Description: EditorState.createEmpty(), DescriptionHtml: "",
            Doc: moment().format("MM-DD-YYYY"), subject: '', hidden: true,
            TaskAssignees: assignees, OrgId: null, isProjectTask: true, isServiceTask: false,

            // taskDescription: RichTextEditor.createEmptyValue(), taskDescriptionHtml: "",
        }
    }

    componentWillMount() {

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")
        this.setState({ OrgId: orgId })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetDepartments",
            type: "get",
            success: (data) => { this.setState({ Departments: data["departments"] }) }
        })

        if (this.state.isClientTask == true) {
            $.ajax({
                url: ApiUrl + "/api/MasterData/GetCategories?deptId=" + 9,
                type: "get",
                success: (data) => { this.setState({ Categories: data["categories"] }) }
            })
        }

        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + '' + "&orgId=" + orgId,
            (data) => { this.setState({ Assignees: data["employees"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )

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
            <div style={{ overflow: 'hidden' }}>
                <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)}  >
                    <div className="taskContainer">
                        <div className="col-xs-12">
                            <div className="col-md-2 form-group">
                                <div className="col-md-2 form-group" >
                                    <label className="radiocontainer" >
                                        <label className="radiolabel"> Office</label>
                                        <input type="radio" name="taskfrom" className="form-control folderChecked" defaultChecked={this.state.isOffcTask} onClick={this.inOfficeClicked.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                                <div className="col-md-2 form-group" style={{ marginLeft: '27%' }}>
                                    <label className="col-md-2 radiocontainer" >
                                        <label className="radiolabel">  Client </label>
                                        <input type="radio" name="taskfrom" className="form-control fileChecked form-control" defaultChecked={this.state.isClientTask} onClick={this.clientClicked.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                            </div>
                            {
                                this.state.isClientTask === true ?
                                    <div>
                                        <div className="col-md-3">
                                            <label> Client</label>
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <span className="input-group-addon">
                                                        <span className="glyphicon glyphicon-user"></span>
                                                    </span>
                                                    <Select className="form-control" name="client" ref="clientName" placeholder="Select Client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <label> Project </label>
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <span className="input-group-addon">
                                                        <span className="glyphicon glyphicon-user"></span>
                                                    </span>
                                                    <Select className="form-control" name="project" ref="project" placeholder="Select Project" value={this.state.Project} options={this.state.Projects} onChange={this.ProjectChanged.bind(this)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div />
                            }
                            {
                                this.state.isOffcTask === true ?
                                    <div className="col-md-3">
                                        <label>Department </label>
                                        <div className="form-group">
                                            <div className="input-group">
                                                <span className="input-group-addon" >
                                                    <span className="glyphicon glyphicon-user"></span>
                                                </span>
                                                <Select className="form-control" name="Department" ref="departmentName" placeholder="Select Departmnet" value={this.state.Department} options={this.state.Departments} onChange={this.DepartmentChanged.bind(this)} />
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div />
                            }


                            <div className="col-md-3">
                                <label> Category </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon" >
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" name="category" ref="category" style={{ width: "100%" }} placeholder="Select Category" value={this.state.Category} options={this.state.Categories} onChange={this.CategoryChanged.bind(this)} />
                                    </div>
                                </div>
                            </div>

                            {
                                this.state.isOffcTask == true ?
                                    <div className="col-md-3">
                                        {/* {this.state.client ? <label> Category</label> : <label> SubCategory</label>} */}
                                        <label> SubCategory </label>
                                        <div className="form-group">
                                            <div className="input-group">
                                                <span className="input-group-addon" >
                                                    <span className="glyphicon glyphicon-user"></span>
                                                </span>
                                                <Select className="form-control" name="category" ref="subcategory" placeholder="Select SubCategory" value={this.state.SubCategory} options={this.state.SubCategories} onChange={this.SubCategoryChanged.bind(this)} />
                                            </div>
                                        </div>
                                    </div>
                                    : <div />
                            }

                        </div>

                        <div className="col-xs-12">
                            {
                                this.state.isClientTask ?
                                    <div className="col-md-2 form-group" >
                                        <div className="col-md-2 form-group" >
                                            <label className="radiocontainer" >
                                                <label className="radiolabel"> Service</label>
                                                <input type="radio" name="clientTaskType" className="form-control folderChecked" defaultChecked={this.state.isServiceTask} onClick={this.isServiceTaskClicked.bind(this)} />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                        <div className="col-md-2 form-group" key={this.state.isProjectTask} style={{ marginLeft: '27%' }} >
                                            <label className="col-md-2 radiocontainer" >
                                                <label className="radiolabel">  Project </label>
                                                <input type="radio" name="clientTaskType" className="form-control fileChecked form-control" defaultChecked={this.state.isProjectTask} onClick={this.isProjectTaskClicked.bind(this)} />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                    </div>
                                    :
                                    <div className="col-md-2" />
                            }
                            {
                                this.state.isOffcTask == false ?
                                    <div className="col-md-3">
                                        <label> SubCategory </label>
                                        <div className="form-group">
                                            <div className="input-group">
                                                <span className="input-group-addon" >
                                                    <span className="glyphicon glyphicon-user"></span>
                                                </span>
                                                <Select className="form-control" name="category" ref="subcategory" placeholder="Select SubCategory" value={this.state.SubCategory} options={this.state.SubCategories} onChange={this.SubCategoryChanged.bind(this)} />
                                            </div>
                                        </div>
                                    </div>
                                    : <div />
                            }


                            <div className="col-md-2">
                                <label> Priority </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" name="priority" ref="priority" placeholder="Priority" value={this.state.Priority} onChange={this.PriorityChanged.bind(this)}
                                            options={[{ value: "0", label: "High" }, { value: "1", label: "Medium" }, { value: "2", label: "Low" }]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <label>Expected Date of Closer </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-calendar"></span>
                                        </span>
                                        <input className="form-control" style={{ lineHeight: '19px' }} type="date" name="DOC" ref="edoc" autoComplete="off" min={moment().format("YYYY-MM-DD")} />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="col-xs-12" >
                            <div className="col-md-6">
                                <label>Subject</label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user" ></span>
                                        </span>
                                        <input className="form-control" name="Subject" type="text" placeholder="Subject" autoComplete="off" ref="subject" />
                                    </div>
                                </div>
                            </div>

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
                            <div className="col-md-2" >
                                <label>Quantity</label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                        </span>
                                        <input className="form-control" type="number" name="quantity" ref="quantity" placeholder="Quantity" defaultValue={this.state.TaskAssignees[0]["Quantity"]} onChange={this.QuantityChanged.bind(this)} />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-1" style={{ marginTop: '2%' }}>
                                <button className="btn btn-primary glyphicon glyphicon-plus" type="button" name="add" value="addAssignee" title="Add multiple assignnees" onClick={this.AddAssignees.bind(this)}></button>
                            </div>
                        </div>

                        <div className="col-xs-12" key={this.state.TaskAssignees}>
                            <div className="col-xs-12">
                                {
                                    this.state.TaskAssignees.map((ele, i) => {
                                        if (ele["AssigneeName"] !== '' && ele["Quantity"] != null && ele["Quantity"] != "") {
                                            return (
                                                <span key={i}>  <b>Assignee Name :  </b> {ele["AssigneeName"]}
                                                    <b>  Quantity : </b> {ele["Quantity"]}
                                                    {
                                                        (this.state.TaskAssignees.length) !== (i + 1) ? <b>,</b> : ""
                                                    }
                                                </span>
                                            )
                                        }
                                        else {
                                            if (ele["AssigneeName"] !== '') {
                                                return (
                                                    <span key={i}>
                                                        <b>Assignee Name :  </b> {ele["AssigneeName"]}
                                                        {
                                                            (this.state.TaskAssignees.length) !== (i + 1) ? <b>,</b> : ""
                                                        }
                                                    </span>
                                                )
                                            }
                                        }
                                    })
                                }
                            </div>
                        </div>

                        <div className="col-xs-12" >
                            <div className="col-xs-12 form-group" style={{ height: "auto", paddingTop: '5', paddingLeft: '15px' }}>
                                <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor"
                                    toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }}
                                    editorState={this.state.Description} toolbarClassName="toolbarClassName"
                                    wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner"
                                    onEditorStateChange={this.messageBoxChange.bind(this)} />

                                <input hidden ref="description" name="forErrorShowing" />
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="col-xs-12 form-group">
                                <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any" multiple />
                            </div>
                        </div>

                        <div className="col-xs-12 text-center form-group" style={{ marginTop: '1%' }}>
                            <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                            <button type="submit" name="submit" className="btn btn-primary">Submit</button>
                            <button className="btn btn-primary" type="reset" name="reset" style={{ marginLeft: '0.5%' }} onClick={this.ResetClick.bind(this)} > Reset </button>
                        </div>

                    </div>
                </form>

                <div className="modal fade" id="assigneesModal" role="dialog" data-backdrop="static" key={this.state.TaskAssignees}>
                    <div className="modal-dialog modal-lg" style={{ width: '728px' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" id="closeModal">&times;</button>
                                <h4 className="modal-title">Assignees List</h4>
                            </div>
                            <div className="modal-body">
                                <AssigneesList TaskId="" CreatorId="" QuantityWorked="" BudgetedQuantity="" SelectedAssigneesList={this.state.TaskAssignees} OrgId={this.state.OrgId} TaskAssigneesList={this.handleAssignees.bind(this)} />
                            </div>
                            <div className="modal-footer"> </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    isProjectTaskClicked() {
        this.setState({ isProjectTask: true, isServiceTask: false })
    }
    isServiceTaskClicked() {
        this.setState({ isServiceTask: true, isProjectTask: false }, () => {
            showErrorsForInput(this.refs.project.wrapper, null);
        });
    }

    AssigneeChanged(val) {
        var assignee = this.state.TaskAssignees;
        if (assignee.length == 1) {
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
        } else {
            assignee[0]["AssigneeId"] = '';
            assignee[0]["AssigneeName"] = '';
        }
    }

    QuantityChanged(val) {
        var assignee = this.state.TaskAssignees;
        assignee[0]["Quantity"] = this.refs.quantity.value;
        if (this.refs.quantity.value <= 0) {
            showErrorsForInput(this.refs.quantity, ["Should be greater than 0"]);
        } else {
            showErrorsForInput(this.refs.quantity, null);
        }
        this.setState({ TaskAssignees: assignee });
    }

    AddAssignees() {
        $("#assigneesModal").modal('show');
    }

    handleAssignees(val) {
        $("#closeModal").click();
        var assignee = this.state.TaskAssignees;
        // this.refs.quantity.value= val[0]["Quantity"];
        this.setState({ TaskAssignees: val })
    }

    uploadCallback() {

    }

    messageBoxChange(val) {
        this.setState({ Description: val, DescriptionHtml: draftToHtml(convertToRaw(val.getCurrentContent())) });
        showErrorsForInput(this.refs.description, []);
    }

    ResetClick() {

        var assignees = [{ AssigneeId: null, AssigneeName: "", Quantity: null }]

        this.state.Department = "";
        this.state.Client = "";
        this.state.Department = "";
        this.state.Priority = "";
        this.state.Category = "";
        this.state.SubCategory = "";
        this.refs.editor.value = "";
        this.refs.subject.value = '';
        this.state.isOffcTask = false;
        this.state.isClientTask = true;

        // this.state.DescriptionHtml=""

        this.setState({
            Assignee: this.state.Assignee,
            Department: this.state.Department,
            Client: this.state.Client,
            Priority: this.state.Priority,
            Category: this.state.Category,
            SubCategory: this.state.SubCategory,
            subject: this.refs.subject.value,
            TaskAssignees: assignees,
            Description: ""
        }, () => {
            this.inOfficeClicked.bind(this);
        })
    }

    clientClicked() {
        this.setState({ isClientTask: true, isOffcTask: false, Client: '', Project: '' }, () => {
            setUnTouched(document);
            $.ajax({
                url: ApiUrl + "/api/MasterData/GetCategories?deptId=" + 9,
                type: "get",
                success: (data) => { this.setState({ Categories: data["categories"] }) }
            })
        })
    }

    inOfficeClicked() {
        this.setState({ isOffcTask: true, isClientTask: false, Department: '', Category: '', SubCategory: '' }, () => {
            setUnTouched(document);
        })
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val, Project: null, Projects: [] }, () => {
                $.ajax({
                    url: ApiUrl + "/api/Client/GetClientProjects?clientId=" + val.value,
                    type: "get",
                    success: (data) => { this.setState({ Projects: data["clientProjects"] }) }
                })
            })
            showErrorsForInput(this.refs.clientName.wrapper, null);
        }
        else {
            this.setState({ Client: '' })
            showErrorsForInput(this.refs.clientName.wrapper, ["Please select client"]);
        }
    }

    DepartmentChanged(val) {
        if (val) {
            this.setState({ Department: val, Category: '', Categories: [], SubCategory: '', SubCategories: [] }, () => {
                $.ajax({
                    url: ApiUrl + "/api/MasterData/GetCategories?deptId=" + val.value,
                    type: "get",
                    success: (data) => { this.setState({ Categories: data["categories"] }) }
                })
            })
            showErrorsForInput(this.refs.departmentName.wrapper, null);
        }
        else {
            this.setState({ Department: '' })
            showErrorsForInput(this.refs.departmentName.wrapper, ["Please select department"]);
        }
    }

    ProjectChanged(val) {
        if (val) {
            this.setState({ Project: val });
            showErrorsForInput(this.refs.project.wrapper, []);
        }
        else {
            this.setState({ Project: '' })
            if (this.state.isProjectTask == true) {
                showErrorsForInput(this.refs.project.wrapper, ["Please select Project"]);
            }
            else {
                showErrorsForInput(this.refs.project.wrapper, null);
            }
        }
    }

    CategoryChanged(val) {
        if (val) {
            this.setState({ Category: val, SubCategory: null }, () => {
                if (this.state.Category && this.state.Category.value) {
                    $.ajax({
                        url: ApiUrl + "/api/MasterData/GetSubCategories?catId=" + this.state.Category.value,
                        type: "get",
                        success: (data) => { this.setState({ SubCategories: data["subCategories"] }) }
                    })
                    showErrorsForInput(this.refs.category.wrapper, null);
                }

                else {
                    this.setState({ SubCategories: [], SubCategory: null })
                    showErrorsForInput(this.refs.category.wrapper, ["Please select Category"]);
                    showErrorsForInput(this.refs.subcategory.wrapper, ["Please select SubCategory"]);

                }
            })
        }
        else {
            this.setState({ Category: '' })
            this.setState({ SubCategory: '' })
            showErrorsForInput(this.refs.category.wrapper, ["Please select Category"]);
            showErrorsForInput(this.refs.subcategory.wrapper, ["Please select SubCategory"]);
        }
    }

    SubCategoryChanged(val) {
        if (val) {
            this.setState({ SubCategory: val })
            showErrorsForInput(this.refs.subcategory.wrapper, null);
        }
        else {
            this.setState({ SubCategory: '' })
            showErrorsForInput(this.refs.subcategory.wrapper, ["Please select SubCategory"]);
        }
    }

    PriorityChanged(val) {
        if (val) {
            this.setState({ Priority: val })
            showErrorsForInput(this.refs.priority.wrapper, null);
        }
        else {
            this.setState({ Priority: '' })
            showErrorsForInput(this.refs.priority.wrapper, ["Please select Priority"]);
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        $(".loader").show();
        $("button[name='submit']").hide();
        $("button[name='reset']").hide();

        if (!this.validate(e)) {
            $(".loader").hide();
            $("button[name='submit']").show();
            $("button[name='reset']").show();
            return;
        }
        var AssigneesList = this.state.TaskAssignees;
        var assignees = [];

        if (AssigneesList.length == 1) {
            if (AssigneesList[0]["AssigneeId"] == null) {
                toast(" Add atleast one Assignee to create task!", {
                    type: toast.TYPE.INFO
                });
            }
        }

        AssigneesList.map((ele, i) => {
            assignees.push({ AssigneeId: ele["AssigneeId"], Quantity: AssigneesList[i]["Quantity"] })
        })

        var data = new FormData();
        var description = this.state.DescriptionHtml;

        data.append("task", this.refs.subject.value);
        data.append("description", description);
        data.append("subCategoryId", this.state.SubCategory.value);
        data.append("edoc", this.refs.edoc.value);
        data.append("priority", this.state.Priority.value);
        data.append("assigneeList", JSON.stringify(assignees));
        data.append("OrgId", sessionStorage.getItem("OrgId"));
        data.append("categoryId", this.state.Category.value);
        // data.append("quantity", this.refs.quantity.value);

        if (this.state.isOffcTask === true) {
            data.append("taskType", "Office");
            data.append("departmentId", this.state.Department.value);
        }

        if (this.state.isClientTask === true) {
            data.append("taskType", "Client");
            data.append("clientId", this.state.Client.value);
            if (this.state.Project != null) {
                data.append("projectId", this.state.Project.value);
            }
        } 
        // Gets the list of file selected for upload
        var files = $("#input-id").fileinput("getFileStack");

        for (var i = 0; i < files.length; i++) {
            if (files[i] != undefined) {
                data.append(files[i].filename, files[i]);
            }
        }

        let url = ApiUrl + "/api/Activities/AddActivity"

        try {

            MyAjaxForAttachments(
                url,
                (data) => {
                    toast(" Task assigned successfully!", {
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
                    $("button[name='reset']").show();
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
            $("button[name='reset']").show();
            return false;
        }

    }

    validate(e) {

        let errors = {};
        var success = true;
        var isSubmit = e.type === "submit";
        var subject = this.refs.subject.value.trim();
        var doc = this.refs.edoc.value;
        var desc = this.state.DescriptionHtml.trim();

        if (isSubmit) {
            $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
                el.classList.remove("un-touched");
            });
        }

        if (this.state.isClientTask) {
            if (!this.state.Client || !this.state.Client.value) {
                success = false;
                if (isSubmit) {
                    this.refs.clientName.focus();
                    showErrorsForInput(this.refs.clientName.wrapper, ["Please select client"]);
                    isSubmit = false;
                }
            }
            if (this.state.isProjectTask) {
                if (!this.state.Project || !this.state.Project.value) {
                    success = false;
                    if (isSubmit) {
                        this.refs.project.focus();
                        showErrorsForInput(this.refs.project.wrapper, ["Please select Project"]);
                        isSubmit = false;
                    }
                }
            }
            else {
                showErrorsForInput(this.refs.project.wrapper, null);
            }
        }

        if (this.state.isOffcTask) {
            if (!this.state.Department || !this.state.Department.value) {
                success = false;
                if (isSubmit) {
                    this.refs.departmentName.focus();
                    isSubmit = false;
                    showErrorsForInput(this.refs.departmentName.wrapper, ["Please select department"]);
                }
            }
        }

        if (!this.state.Category || !this.state.Category.value) {
            success = false;
            if (isSubmit) {
                showErrorsForInput(this.refs.category.wrapper, ["Please select category"]);
                this.refs.category.focus();
                isSubmit = false;
            }
        }

        if (!this.state.SubCategory || !this.state.SubCategory.value) {
            success = false;
            if (isSubmit) {
                showErrorsForInput(this.refs.subcategory.wrapper, ["Please select subcategory"]);
                this.refs.subcategory.focus();
                isSubmit = false;
            }
        }


        if (!this.state.Priority || !this.state.Priority.value) {
            success = false;
            if (isSubmit) {
                this.refs.priority.focus();
                showErrorsForInput(this.refs.priority.wrapper, ["Please select priority"]);
                isSubmit = false;
            }
        }

        if (validate.single(doc, { presence: true }) !== undefined) {
            success = false;
            if (isSubmit) {
                this.refs.edoc.focus();
                isSubmit = false;
                showErrorsForInput(this.refs.edoc, ["Select expected date of closer"]);
            }
        }
        else {
            showErrorsForInput(this.refs.edoc, []);
        }

        if (validate.single(subject, { presence: true }) !== undefined) {
            if (isSubmit) {
                this.refs.subject.focus();
                isSubmit = false;
                showErrorsForInput(this.refs.subject, ["Please enter subject of task"]);
            }
            success = false;
        }
        else {
            showErrorsForInput(this.refs.subject, []);
        }

        var AssigneesList = this.state.TaskAssignees;
        if (AssigneesList.length == 1) {
            if (AssigneesList[0]["AssigneeId"] == null) {
                success = false;
                if (isSubmit) {
                    isSubmit = false;
                    this.refs.assignee.focus();
                    showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
                }

            }
            else if (AssigneesList[0]["Quantity"] !== null && AssigneesList[0]["Quantity"] !== "" && AssigneesList[0]["Quantity"] <= 0) {
                success = false;
                if (isSubmit) {
                    isSubmit = false;
                    this.refs.quantity.focus();
                }
                showErrorsForInput(this.refs.quantity, ["Should be greater than 0"]);
            }
            else {
                showErrorsForInput(this.refs.assignee.wrapper, null);
                showErrorsForInput(this.refs.quantity, null);
            }
        }

        if (success) {
            var content = this.state.Description.getCurrentContent();

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

export default Task;




{/* <div className="col-xs-12">
                         <div className="col-md-6">
                            <div className="panel panel-default">
                                <div className="panel-heading"><b>Assignees</b>
                                <button  className="pull-right" type="button" onClick={this.AddAssignees.bind(this)}  >
                                <span className="glyphicon glyphicon-plus"></span>
                                </button>
                                </div>
                               
                               <div className="panel-body" ref="taskAssignees">
                                  {
                                   this.state.TaskAssignees.map((ele,i)=>{
                                      return(
                                     <div key={i}>
                                      <div className="col-md-5">
                                        <label> Assignee</label> 
                                        <div className="form-group">
                                           <div className="input-group">
                                               <span className="input-group-addon">
                                               <span className="glyphicon glyphicon-user"></span>
                                               </span>
                                              <Select className="form-control" name="AssignedTo" ref="assignee" placeholder="Select an Assignee" value={ele["AssigneeId"]} options={this.state.Assignees} onChange={this.AssigneeChanged.bind(this,i)} />
                                            </div>
                                          </div>
                                        </div>

                                       <div className="col-md-4">
                                         <label>Quantity</label>
                                          <div className="form-group">
                                            <div className="input-group">
                                                <span className="input-group-addon"> </span>
                                                <input className="form-control" type="number" name="quantity" ref="quantity"  placeholder="Quantity" onChange={this.QuantityChanged.bind(this,i)} />
                                             </div>
                                          </div>
                                        </div>

                                        <div className="col-xs-1" style={{marginTop: '6%'}}>
                                         <span style={{ width: '0.5%', color:'red'}} title="Remove" className="glyphicon glyphicon-trash" value="close" onClick={this.removeAssignee.bind(this,i)} ></span>
                                        </div>
                                        
                                     </div>
                                     )
                                    })
                                }
                             </div>
                           </div>
                         </div>
                      </div> */}


// AddAssignees(){
//     var newAssignee={AssigneeId: null,AssigneeName:"", Quantity: null}
//     var taskAssignees= this.state.TaskAssignees;
//     taskAssignees.push(newAssignee);
//     this.setState({TaskAssignees: taskAssignees})
// }

// removeAssignee(e, ele){
//     var taskAssignees = this.state.TaskAssignees;
//     if(taskAssignees.length>1)
//     {
//       taskAssignees.splice(e,1);
//     }
//    this.setState({TaskAssignees: taskAssignees});
// }

// QuantityChanged(e,ele){
//   var taskAssignees= this.state.TaskAssignees;
//        taskAssignees[e]["Quantity"] = ele.target.value;
// }

// AssigneeChanged(e,ele){
// var taskAssignees= this.state.TaskAssignees;
//     if(ele!=null)
//     {
//          taskAssignees[e]["AssigneeId"] = ele.value;
//          taskAssignees[e]["AssigneeName"] = ele.label;
//     }
//     else{
//          taskAssignees[e]["Assignee"] = null;
//     }
//     this.setState({TaskAssignees: taskAssignees});
// }

// if(this.refs.quantity && this.refs.quantity.value!=""){
//     if(parseFloat(this.refs.quantity.value)<= 0){
//         success= false;
//         showErrorsForInput(this.refs.quantity, ["Should be greater than 0"]);
//     }
//     else{
//     showErrorsForInput(this.refs.quantity, []);
//    }
// }


// if (!this.state.Assignee || !this.state.Assignee.value) {
//     success = false;
//     showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
//     if (isSubmit) {
//         this.refs.assignee.focus();
//         isSubmit = false;
//     }
// }

// AssigneeChanged(val) {
//     if (val) {
//         if (val.value != sessionStorage.getItem("EmpId")) {
//             this.setState({ Assignee: val })
//             showErrorsForInput(this.refs.assignee.wrapper, null);
//         }
//     }
//     else {
//         this.setState({ Assignee: '' })
//         showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
//     }
// }



{/* <div className="col-md-2">
                                  <label>Quantity</label>
                                   <div className="form-group">
                                   <div className="input-group">
                                   <span className="input-group-addon">
                                        </span>
                                        <input className="form-control" type="number" name="quantity" ref="quantity"  placeholder="Quantity" />
                                   </div>

                                   </div>
                                  </div> */}