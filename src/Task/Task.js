import React, { Component } from 'react';
import './Task.css';
import Select from 'react-select';
//import RichTextEditor from 'react-rte';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import $ from 'jquery';
import { ApiUrl } from '.././Config.js';
import { toast } from 'react-toastify';
import { MyAjaxForAttachments } from '../MyAjax.js';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

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
            client: false, inOffc: true, typeOfTaskSelected: false, Client: null, Clients: [],
            Department: null, Departments: [], FroalaConfig: froalaConfig, Assignees: [],
            Assignee: null, Description: EditorState.createEmpty(), DescriptionHtml: "",
            Doc: moment().format("MM-DD-YYYY")

            // taskDescription: RichTextEditor.createEmptyValue(), taskDescriptionHtml: "",
        }
    }

    componentWillMount() {

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetCategories",
            type: "get",
            success: (data) => { this.setState({ Categories: data["categories"] }) }
        })
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetSubCategories",
            type: "get",
            success: (data) => { this.setState({ SubCategories: data["subcategories"] }) }
        })
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetDepartments",
            type: "get",
            success: (data) => { this.setState({ Departments: data["departments"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetAllClients",
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        }),

            $.ajax({
                url: ApiUrl + "/api/MasterData/GetEmployees",
                type: "get",
                success: (data) => { this.setState({ Assignees: data["employees"] }) }
            })

        // $.ajax({
        //     url: ApiUrl + "/api/MasterData/GetClients?OrgId=" + sessionStorage.getItem("OrgId"),
        //     type: "get",
        //     success: (data) => { this.setState({ Clients: data["clients"] }) }
        // })

        // $.ajax({
        //     url: ApiUrl + "/api/MasterData/GetEmp?OrgId=" + sessionStorage.getItem("OrgId"),
        //     type: "get",
        //     success: (data) => { this.setState({ Assignees: data["employees"] }) }
        // })
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
            <div style={{ marginTop: '5%' }}>
                <div className="myContainer">

                    <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)} >
                        <div className="col-xs-12">
                            <div className="col-xs-3 form-group">

                                <div className="col-xs-2 form-group" >
                                    <label className="radiocontainer" >
                                        <label className="radiolabel"> Office</label>
                                        <input type="radio" name="taskfrom" className="form-control folderChecked" checked={this.state.inOffc} onClick={this.inOfficeClicked.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                                <div className="col-xs-2 form-group" style={{ marginLeft: '14%' }}>
                                    <label className="col-xs-2 radiocontainer" >
                                        <label className="radiolabel">  Client </label>
                                        <input type="radio" name="taskfrom" className="form-control fileChecked form-control" checked={this.state.client} onClick={this.clientClicked.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                            </div>
                            {
                                this.state.client === true ?


                                    <div className="col-xs-3">
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

                                    :

                                    this.state.inOffc === true ?

                                        <div className="col-xs-3">
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

                            <div className="col-xs-3">
                                <label> Priority </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" name="priority" ref="priority" placeholder="Priority" value={this.state.Priority} onChange={this.PriorityChanged.bind(this)}
                                            options={[{ value: "High", label: "High" }, { value: "Medium", label: "Medium" }, { value: "Low", label: "Low" }]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-xs-3">
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

                        <div>
                            <div className="col-xs-12">
                                <div className="col-xs-3">
                                    <label> Category </label>
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon" >
                                                <span className="glyphicon glyphicon-user"></span>
                                            </span>
                                            <Select className="form-control" name="category" ref="category" placeholder="Select Category" value={this.state.Category} options={this.state.Categories} onChange={this.CategoryChanged.bind(this)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xs-3">
                                    <label> Sub Category </label>
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon" >
                                                <span className="glyphicon glyphicon-user"></span>
                                            </span>
                                            <Select className="form-control" name="category" ref="subcategory" placeholder="Select SubCategory" value={this.state.SubCategory} options={this.state.SubCategories} onChange={this.SubCategoryChanged.bind(this)} />
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
                                <div className="col-xs-12">
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
                            </div>

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
                                <button type="submit" name="submit" className="btn btn-primary">Submit</button>
                                <div className="loader"></div>
                            </div>

                        </div>
                    </form>

                </div>
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
        showErrorsForInput(this.refs.actionResponse, []);
    }


    // handleModelChange(model) {
    //     this.setState({ model: model }, ()=>{
    //         console.log(this.state.model);  
    //     })

    //   $("froala-editor").editable('getText')
    // }

    clientClicked() {
        this.setState({ client: true, inOffc: false })
    }

    inOfficeClicked() {
        this.setState({ inOffc: true, client: false })
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val })
            showErrorsForInput(this.refs.clientName.wrapper, null);
        }
        else {
            this.setState({ Client: '' })
            showErrorsForInput(this.refs.clientName.wrapper, ["Please select client"]);
        }
    }

    DepartmentChanged(val) {
        if (val) {
            this.setState({ Department: val })
            showErrorsForInput(this.refs.departmentName.wrapper, null);
        }
        else {
            this.setState({ Department: '' })
            showErrorsForInput(this.refs.departmentName.wrapper, ["Please select department"]);
        }
    }

    CategoryChanged(val) {
        if (val) {
            this.setState({ Category: val })
            showErrorsForInput(this.refs.category.wrapper, null);
        }
        else {
            this.setState({ Category: '' })
            showErrorsForInput(this.refs.category.wrapper, ["Please select Category"]);
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
            this.setState({ Assignee: val })
            showErrorsForInput(this.refs.assignee.wrapper, null);
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

        $(".loaderActivity").show();
        $("button[name='submit']").hide();


        if (!this.validate(e)) {

            $(".loaderActivity").hide();
            $("button[name='submit']").show();
            return;
        }

        var data = new FormData();

        data.append("task", this.refs.subject.value);
        //data.append("description", this.state.model);

        data.append("description", this.state.DescriptionHtml);
        data.append("categoryId", this.state.Category.value);
        data.append("subCategoryId", this.state.SubCategory.value);
        data.append("edoc", this.refs.edoc.value);
        data.append("priority", this.state.Priority.value);
        data.append("assignedTo", this.state.Assignee.value);
        data.append("OrgId", sessionStorage.getItem("OrgId"));

        if (this.state.client === true) {
            data.append("taskType", "Client");
            data.append("clientId", this.state.Client.value);
        }

        if (this.state.inOffc === true) {
            data.append("taskType", "Office");
            data.append("departmentId", this.state.Department.value);
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

        let errors = {};
        var success = ValidateForm(e);

        if (this.state.client) {
            if (!this.state.Client || !this.state.Client.value) {
                success = false;
                showErrorsForInput(this.refs.clientName.wrapper, ["Please select client"]);
            }
        }

        if (this.state.inOffc) {
            if (!this.state.Department || !this.state.Department.value) {
                success = false;
                showErrorsForInput(this.refs.departmentName.wrapper, ["Please select department"]);
            }
        }

        if (!this.state.Category || !this.state.Category.value) {
            success = false;
            showErrorsForInput(this.refs.category.wrapper, ["Please select category"])
        }

        if (!this.state.SubCategory || !this.state.SubCategory.value) {
            success = false;
            showErrorsForInput(this.refs.subcategory.wrapper, ["Please select subcategory"]);
        }

        if (!this.state.Priority || !this.state.Priority.value) {
            success = false;
            showErrorsForInput(this.refs.priority.wrapper, ["Please select priority"]);
        }

        if (!this.state.Assignee || !this.state.Assignee.value) {
            success = false;
            showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
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
                                        </div> */}
