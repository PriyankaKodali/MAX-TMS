import React, { Component } from 'react';
import './Task.css';
import Select from 'react-select';
//import RichTextEditor from 'react-rte';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import $ from 'jquery';
import { ApiUrl } from '.././Config.js';
import { toast } from 'react-toastify';
import { MyAjaxForAttachments, MyAjax } from '../MyAjax.js';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { validate } from 'validate.js'

//import FroalaEditor from 'react-froala-wysiwyg';

var moment = require('moment');

window.jQuery = window.$ = require("jquery");
var bootstrap = require('bootstrap');



class Task extends Component {

    constructor(props) {
        super(props);

        var froalaConfig = {
            heightMin: 210
        }

        this.state = {
            Categories: [], Category: null, SubCategories: [], SubCategory: null,
            client: false, isOffcTask: true, typeOfTaskSelected: false, Client: null, Clients: [],
            Department: null, Departments: [], FroalaConfig: froalaConfig, Assignees: [],
            Assignee: null, Description: EditorState.createEmpty(), DescriptionHtml: "",
            Doc: moment().format("MM-DD-YYYY"), subject: '', hidden: true

            // taskDescription: RichTextEditor.createEmptyValue(), taskDescriptionHtml: "",
        }
    }

    componentWillMount() {

        // var role = sessionStorage.getItem("roles").indexOf("Admin") != -1 ? true : false

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")


        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClients?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }

        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetDepartments",
            type: "get",
            success: (data) => { this.setState({ Departments: data["departments"] }) }
        })


        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + '' + "&orgId=" + orgId,
            (data) => { this.setState({ Assignees: data["employees"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )
    }

    componentDidMount() {

        setUnTouched(document);

        $("#input-id").fileinput({
            theme: "explorer",
            hideThumbnailContent: true,
            uploadUrl: ApiUrl + "/api/Task/UploadFiles",
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
            .on("filebatchpreupload", function (event, data) {
                var form = data.form, files = data.files
                this.uploadFile(files)

            }.bind(this))
    }


    render() {
        return (
            <div style={{ overflow: 'hidden' }}>
                <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)} >

                    <div className="taskContainer" >

                        <div className="col-xs-12">
                            <div className="col-md-2 form-group">
                                <div className="col-md-2 form-group" >
                                    <label className="radiocontainer" >
                                        <label className="radiolabel"> Office</label>
                                        <input type="radio" name="taskfrom" className="form-control folderChecked" checked={this.state.isOffcTask} onClick={this.inOfficeClicked.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                                <div className="col-md-2 form-group" style={{ marginLeft: '27%' }}>
                                    <label className="col-md-2 radiocontainer" >
                                        <label className="radiolabel">  Client </label>
                                        <input type="radio" name="taskfrom" className="form-control fileChecked form-control" checked={this.state.client} onClick={this.clientClicked.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                            </div>

                            {
                                this.state.client === true ?

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

                                        <div className="col-md-3">
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
                            <div className="col-md-2">
                            </div>
                            {
                                this.state.isOffcTask == false ?
                                    <div className="col-md-3">
                                        {/* {this.state.client ? <label> Category</label> : <label> SubCategory</label>} */}
                                        <label> SubCategory </label>
                                        <div className="form-group">
                                            <div className="input-group">
                                                <span className="input-group-addon" >
                                                    <span className="glyphicon glyphicon-user"></span>
                                                </span>
                                                <Select className="form-control" name="category" ref="subcategory" placeholder="please select SubCategory" value={this.state.SubCategory} options={this.state.SubCategories} onChange={this.SubCategoryChanged.bind(this)} />
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

                        <div className="col-xs-12">
                            <div className="col-md-9">
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
                                <label> Assign to</label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" name="AssignedTo" ref="assignee" placeholder="Select an Assignee" value={this.state.Assignee} options={this.state.Assignees} onChange={this.AssigneeChanged.bind(this)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="col-xs-12 ">
                            <h4 className="heading"> Action </h4>
                                <div className="col-xs-12 actionLayout" > */}
                        <div className="col-xs-12" style={{ paddingTop: '12px' }}>
                            <div className="col-xs-12 form-group" style={{ height: "auto" }}>
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
                                <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any" showUpload="false" multiple />
                            </div>
                            {/* </div> */}
                        </div>

                        {/* </div> */}

                        <div className="col-xs-12 text-center form-group" style={{ marginTop: '1%' }}>
                            <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                            <button type="submit" name="submit" className="btn btn-primary">Submit</button>
                            <button className="btn btn-primary" type="reset" name="reset" style={{ marginLeft: '0.5%' }} onClick={this.ResetClick.bind(this)} > Reset </button>
                        </div>

                    </div>

                </form>
            </div>
        )
    }

    uploadCallback(file) {
        var formData = new FormData();
        formData.append("file", file);

        var url = ApiUrl + "/api/Activities/UploadImage"
        return new Promise(
            (resolve, reject) => {
                MyAjaxForAttachments(
                    url,
                    (data1) => {
                        resolve({ data: { link: data1["link"] } });
                    },
                    (error) => {
                        toast(error.responseText, {
                            type: toast.TYPE.ERROR
                        });
                        reject(error.responseText);
                    },
                    "POST", formData
                );
            });
    }

    messageBoxChange(val) {
        this.setState({ Description: val, DescriptionHtml: draftToHtml(convertToRaw(val.getCurrentContent())) });
        showErrorsForInput(this.refs.description, []);
    }


    ResetClick() {

        this.state.Department = "";
        this.state.Client = "";
        this.state.Department = "";
        this.state.Assignee = "";
        this.state.Priority = "";
        this.state.Category = "";
        this.state.SubCategory = "";
        this.refs.editor.value = "";
        this.refs.subject.value = '';
        this.state.isOffcTask = true
        this.state.client = false;
        // this.state.DescriptionHtml=""

        this.setState({
            Assignee: this.state.Assignee,
            Department: this.state.Department,
            Client: this.state.Client,
            Priority: this.state.Priority,
            Category: this.state.Category,
            SubCategory: this.state.SubCategory,
            subject: this.refs.subject.value,
            Description: ""
        }, () => {
            this.inOfficeClicked.bind(this);
        })

    }

    // handleModelChange(model) {
    //     this.setState({ model: model }, ()=>{
    //         console.log(this.state.model);  
    //     })

    //   $("froala-editor").editable('getText')
    // }

    clientClicked() {
        this.setState({ client: true, isOffcTask: false, Client: '', Project: '' }, () => {
            setUnTouched(document);
            $.ajax({
                url: ApiUrl + "/api/MasterData/GetCategories?deptId=" + '',
                type: "get",
                success: (data) => { this.setState({ Categories: data["categories"] }) }
            })
        })
    }

    inOfficeClicked() {
        this.setState({ isOffcTask: true, client: false, Department: '', Category: '', SubCategory: '' }, () => {
            setUnTouched(document);
        })
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val }, () => {
                $.ajax({
                    url: ApiUrl + "/api/MasterData/GetProjects?clientId=" + val.value,
                    type: "get",
                    success: (data) => { this.setState({ Projects: data["projects"] }) }
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
            showErrorsForInput(this.refs.project.wrapper, ["Please select Project"]);
        }
    }

    CategoryChanged(val) {
        if (val) {
            this.setState({ Category: val }, () => {
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

    AssigneeChanged(val) {
        if (val) {
            if (val.value != sessionStorage.getItem("EmpId")) {
                this.setState({ Assignee: val })
                showErrorsForInput(this.refs.assignee.wrapper, null);
            }
        }
        else {
            this.setState({ Assignee: '' })
            showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
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

        var data = new FormData();

        data.append("task", this.refs.subject.value);
        //data.append("description", this.state.model);

        data.append("description", this.state.DescriptionHtml);

        data.append("subCategoryId", this.state.SubCategory.value);
        data.append("edoc", this.refs.edoc.value);
        data.append("priority", this.state.Priority.value);
        data.append("assignedTo", this.state.Assignee.value);
        data.append("OrgId", sessionStorage.getItem("OrgId"));
        data.append("categoryId", this.state.Category.value);

        if (this.state.isOffcTask === true) {
            data.append("taskType", "Office");
            data.append("departmentId", this.state.Department.value);
        }

        if (this.state.client === true) {
            data.append("taskType", "Client");
            data.append("clientId", this.state.Client.value);
            data.append("projectId", this.state.Project.value);
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
        var desc = this.state.DescriptionHtml;

        if (isSubmit) {
            $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
                el.classList.remove("un-touched");
            });
        }

        if (this.state.client === true) {
            if (!this.state.Client || !this.state.Client.value) {
                success = false;
                showErrorsForInput(this.refs.clientName.wrapper, ["Please select client"]);
                if (isSubmit) {
                    this.refs.clientName.focus();
                    isSubmit = false;
                }
            }
            if (!this.state.Project || !this.state.Project.value) {
                success = false;
                showErrorsForInput(this.refs.project.wrapper, ["Please select Project"]);
                if (isSubmit) {
                    this.refs.project.focus();
                    isSubmit = false;
                }
            }
        }

        if (this.state.isOffcTask === true) {
            if (!this.state.Department || !this.state.Department.value) {
                success = false;
                showErrorsForInput(this.refs.departmentName.wrapper, ["Please select department"]);
                if (isSubmit) {
                    this.refs.departmentName.focus();
                    isSubmit = false;
                }
            }
        }

        if (!this.state.Category || !this.state.Category.value) {
            success = false;
            showErrorsForInput(this.refs.category.wrapper, ["Please select category"]);
            if (isSubmit) {
                this.refs.category.focus();
                isSubmit = false;
            }
        }

        if (!this.state.SubCategory || !this.state.SubCategory.value) {
            success = false;
            showErrorsForInput(this.refs.subcategory.wrapper, ["Please select subcategory"]);
            if (isSubmit) {
                this.refs.subcategory.focus();
                isSubmit = false;
            }
        }

        if (!this.state.Priority || !this.state.Priority.value) {
            success = false;
            showErrorsForInput(this.refs.priority.wrapper, ["Please select priority"]);
            if (isSubmit) {
                this.refs.priority.focus();
                isSubmit = false;
            }
        }

        if (!this.state.Assignee || !this.state.Assignee.value) {
            success = false;
            showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
            if (isSubmit) {
                this.refs.assignee.focus();
                isSubmit = false;
            }
        }



        if (validate.single(doc, { presence: true }) !== undefined) {
            if (isSubmit) {
                this.refs.edoc.focus();
                isSubmit = false;
            }
            success = false;
            showErrorsForInput(this.refs.edoc, ["Select expected date of closer"]);
        }
        else {
            showErrorsForInput(this.refs.edoc, []);
        }

        if (validate.single(subject, { presence: true }) !== undefined) {
            if (isSubmit) {
                this.refs.subject.focus();
                isSubmit = false;
            }
            success = false;
            showErrorsForInput(this.refs.subject, ["Please enter subject of task"]);
        }
        else {
            showErrorsForInput(this.refs.subject, []);
        }

        if (desc === "") {
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
        return success;
    }
}

export default Task;




{/* <div className="col-xs-12">
    <label> Subject</label>
    <div className="form-group">
        <div className="input-group">
            <span className="input-group-addon">
                <span className="glyphicon glyphicon-user"></span>
            </span>
            <input className="form-control" type="text" placeholder="Subject" ref="subject" name="Subject" autoComplete="off" />
        </div>
    </div>
</div> */}

{/* <div className="form-group">
        <FroalaEditor  id="froala-editor" tag="textarea" name="Description" ref="action" model={this.state.model} config={this.state.FroalaConfig} onModelChange={this.handleModelChange.bind(this)}  />
        <input id= "jkl" type="hidden" value={this.state.model} />
        </div>
*/}
