import React, { Component } from 'react';
import './Task.css';
import Select from 'react-select';
import RichTextEditor from 'react-rte';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import $ from 'jquery';
import { ApiUrl } from '.././Config.js';
import {toast} from 'react-toastify';
import {MyAjaxForAttachments} from '../MyAjax.js';

import FroalaEditor from 'react-froala-wysiwyg';

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
            taskDescription: RichTextEditor.createEmptyValue(), taskDescriptionHtml: "",
            client: true, inOffc: false, typeOfTaskSelected: false, Client: null, Clients: [],
            Department: null, Departments: [], FroalaConfig: froalaConfig,

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
            url: ApiUrl + "/api/MasterData/GetClients?OrgId=" + sessionStorage.getItem("OrgId"),
            type: "get",
            success: (data) => { this.setState({ Clients: data["clientsclients"] }) }
        })
        $.ajax({
            url: ApiUrl + "/api/MasterDate/GetEmployees?OrgId=" + sessionStorage.getItem("OrgId"),
            type: "get",
            success:(data) =>{ this.setState({Employees: data["employees"]})} 
        })

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


        $("#froala-editor").froalaEditor({
            fontFamily: {
                "Roboto,sans-serif": 'Roboto',
                "Oswald,sans-serif": 'Oswald',
                "Montserrat,sans-serif": 'Montserrat',
                "'Open Sans Condensed',sans-serif": 'Open Sans Condensed'
            },
            fontFamilySelection: true
        });


    }


    render() {
        return (
            <div style={{ marginTop: '5%' }}>
                <div className="myContainer">

                    <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)} >
                        <div className="col-xs-12">
                            <div className="col-xs-3">
                                <div className="col-xs-2">
                                    <label className="col-xs-2 radiocontainer" >
                                        <label className="radiolabel">  Client </label>
                                        <input type="radio" name="taskfrom" className="fileChecked" checked={this.state.client} onClick={this.clientClicked.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                                <div className="col-xs-2" style={{ marginLeft: '14%' }}>
                                    <label className="radiocontainer" >
                                        <label className="radiolabel"> Office</label>
                                        <input type="radio" name="taskfrom" className="folderChecked" checked={this.state.inOffc} onClick={this.inOfficeClicked.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                            </div>
                            {
                                this.state.client ?

                                    <div className="col-xs-3">
                                        <label>Client Name </label>
                                        <div className="form-group">
                                            <div className="input-group">
                                                <span className="input-group-addon" >
                                                    <span className="glyphicon glyphicon-user"></span>
                                                </span>
                                                <Select className="form-control" name="client" ref="client" placeholder="Select Client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
                                            </div>
                                        </div>
                                    </div>

                                    :

                                    <div className="col-xs-3">
                                        <label>Department </label>
                                        <div className="form-group">
                                            <div className="input-group">
                                                <span className="input-group-addon" >
                                                    <span className="glyphicon glyphicon-user"></span>
                                                </span>
                                                <Select className="form-control" name="Department" ref="department" placeholder="Select Departmnet" value={this.state.Department} options={this.state.Departments} onChange={this.DepartmentChanged.bind(this)} />
                                            </div>
                                        </div>
                                    </div>
                            }

                            <div className="col-xs-3">
                                <label> Priority </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" name="priority" ref="priority" placeholder="Priority" value={this.state.Priority} onChange={this.PriorityChanged.bind(this)}
                                            options={[{ value: "1", label: "High" }, { value: "2", label: "Medium" }, { value: "3", label: "Low" }]}
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
                                        <Select className="form-control" name="AssignedTo" ref="assignee" placeholder="Select an Assignee" value={this.state.assignedTo} options={this.state.Assignees} onChange={this.AssignedToChanged.bind(this)} />
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
                                            <input className="col-md-3 form-control" style={{ lineHeight: '19px' }} type="date" name="DOC" ref="edoc" autoComplete="off" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xs-12">
                                <div className="col-xs-12">
                                    <label> Subject</label>
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon">
                                                <span className="glyphicon glyphicon-user"></span>
                                            </span>
                                            <input className="form-control" type="text" placeholder="Subject" ref="subject" name="Subject" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xs-12 ">
                                <h4 className="heading"> Action </h4>
                                <div className="col-xs-12 actionLayout" >
                                    <div className="col-xs-12" style={{ paddingTop: '12px' }}>
                                        <label> Action  </label>
                                        <div className="form-group">
                                            <FroalaEditor className="form-control" name="Description" ref="action" id="froala-editor" model={this.state.model} config={this.state.FroalaConfig} />
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

    clientClicked() {
        this.setState({ client: true, inOffc: false })
    }

    inOfficeClicked() {
        this.setState({ inOffc: true, client: false })
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val })
            showErrorsForInput(this.refs.client.wrapper, null);
        }
        else {
            this.setState({ Client: '' })
            showErrorsForInput(this.refs.client.wrapper, ["Please select client"]);
        }
    }

    DepartmentChanged(val) {
        if (val) {
            this.setState({ Department: val })
            showErrorsForInput(this.refs.department.wrapper, null);
        }
        else {
            this.setState({ Department: '' })
            showErrorsForInput(this.refs.department.wrapper, ["Please select department"]);
        }
    }

    CategoryChanged(val) {
        if (val) {
            this.setState({ Category: val })
            showErrorsForInput(this.refs.Category.wrapper, null);
        }
        else {
            this.setState({ Category: '' })
            showErrorsForInput(this.refs.category.wrapper, ["Please select Category"]);
        }
    }

    SubCategoryChanged(val) {
        if (val) {
            this.setState({ SubCategory: val })
            showErrorsForInput(this.refs.SubCategory.wrapper, null);
        }
        else {
            this.setState({ SubCategory: '' })
            showErrorsForInput(this.refs.subcategory.wrapper, ["Please select SubCategory"]);
        }
    }

    AssignedToChanged(val) {
        if (val) {
            this.setState({ AssignedTo: val })
            showErrorsForInput(this.refs.assignee.wrapper, null);
        }
        else {
            this.setState({ AssignedTo: '' })
            showErrorsForInput(this.refs.assignee.wrapper, ["Please select Assignee"]);
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

    // taskDescriptionChanged(val) {
    //     this.setState({ taskDescription: val, taskDescriptionHtml: val.toString('html') })
    // }

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

        data.append("taskName", this.refs.subject.value);
        data.append("description", this.state.model);
        data.append("categoryId", this.state.Category);
        data.append("subCategoryId", this.state.SubCategory);

        if (this.state.Client == true) {
            data.append("client", this.state.Client);
        }

        if (this.state.inOffc == true) {
            data.append("departmentId", this.state.Department);
        }

        data.append("assignedTo", this.state.assignedTo);

         // Gets the list of file selected for upload
        var files = $("#input-id").fileinput("getFileStack");

         for (var i = 0; i < files.length; i++) {
            if (files[i] != undefined) {
                data.append(files[i].filename, files[i]);
            }
        }

        data.append("EDOC", this.refs.edoc.value);

        let url= ApiUrl + "/api/Activity/AddActivity"

        try {

            MyAjaxForAttachments(
                url,
                (data) => {
                    toast(" Task assigned successfully!", {
                        type: toast.TYPE.SUCCESS
                    });
                    $("button[name='submit']").show();
                  //  this.props.history.push("/EmployeesList");
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

        if (!this.state.AssignedTo || !this.state.AssignedTo.value) {
            success = false;
            showErrorsForInput(this.refs.assignee.wrapper, ["Please select assignee"]);
        }

        if (this.state.client == true) {
            if (!this.state.Client || !this.state.Client.value) {
                success = false;
                showErrorsForInput(this.refs.client.wrapper, ["Please select client"]);
            }
        }

        if (this.state.inOffc) {
            if (!this.state.Department || !this.state.Department.value) {
                success = false;
                showErrorsForInput(this.refs.department.wrapper, ["Please select department"]);
            }
        }
        return success;
    }
}

export default Task;

// if(files.length>0)
// {
//     data.append("attachments", )
// } 