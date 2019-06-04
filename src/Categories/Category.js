import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import './Category.css';
import { ApiUrl } from '../Config.js';
import { MyAjaxForAttachments } from '../MyAjax';
import validate from 'validate.js';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import { toast } from 'react-toastify';

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            SubCategories: [], Departments: [], Department: null, CategoryExists: false,
        }
    }

    componentWillMount() {
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetDepartments",
            type: "get",
            success: (data) => { this.setState({ Departments: data["departments"] }) }
        })
    }


    render() {
        return (
            <div className="container">
                <div className="col-xs-12" >
                    <div className="col-md-2"></div>
                    <div className="col-md-6">
                        <div className="col-md-3" style={{ float: 'right', width: '21%' }}>
                            <button className="btn btn-primary btnBack" value="back" name="back" onClick={()=>{this.props.history.push('/Departments')}}>
                                <span>Back To List</span>
                                {/* <span style={{ paddingLeft: '6px' }} className="glyphicon glyphicon-arrow-left"></span> */}
                            </button>
                        </div>
                        <div className="col-md-12 shadowBox">
                            <form onSubmit={this.handleSubmit.bind(this)}>
                                <div className="col-xs-12">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Department</label>
                                            <Select className="form-control" name="department" ref="department" placeholder="Select Department" value={this.state.Department} options={this.state.Departments} onChange={this.DeptChanged.bind(this)} />
                                        </div>

                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Category Name</label>
                                            <input className="form-control" name="category" placeholde="Category" type="text" ref="category" autoComplete="off" onBlur={this.CheckIfCategoryExists.bind(this)} />
                                        </div>

                                    </div>
                                </div>
                                <div className="col-xs-12 subheading"  >
                                    <a style={{ cursor: 'pointer' }} className="" onClick={this.addSubCat.bind(this)}>  Add SubCategory </a>
                                </div>

                                <div className="col-xs-12" key={this.state.SubCategories}>
                                    {
                                        this.state.SubCategories.map((ele, i) => {
                                            return (
                                                <div className="col-xs-12" key={i}>
                                                    <div className="col-md-6">
                                                        <label>SubCategory Name</label>
                                                        <input className="form-control" type="text" ref="subCategory" name="subCategory" autoComplete="off" defaultValue={ele["Name"]} onChange={this.subCatNameChanged.bind(this, i)} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label>Points</label>
                                                        <input className="form-control" type="number" ref="points" name="points" autoComplete="off" defaultValue={ele["Points"]} onChange={this.pointsChanged.bind(this, i)} />
                                                    </div>
                                                    <div className="col-md-2 removeBtn" >
                                                        <i className="fa fa-trash pointer" onClick={this.removeItem.bind(this, i)} aria-hidden="true"></i>
                                                    </div>

                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <div className="col-xs-12 mTop1 tcenter" >
                                    <button className="btn btn-primary" type="submit" name="submit" value="submit" >Save</button>
                                    <div className="loader"></div>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>

            </div>
        )
    }

    CheckIfCategoryExists() {
        var category = this.refs.category.value;
        if (this.state.Department) {
            var url = ApiUrl + "/api/Category/CheckIfCategoryExists?deptId=" + this.state.Department.value + "&name=" + category;
            $.get(url).then((data) => {
                if (data["Result"] == true) {
                    this.setState({ CategoryExists: true })
                    showErrorsForInput(this.refs.category, ["Category already exists"])
                }
            })
        }
        else {
            showErrorsForInput(this.refs.department.wrapper, ["Select department"])
        }
    }

    DeptChanged(val) {
        if (val) {
            this.setState({ Department: val }, () => {
                if (this.refs.category.value.trim() != "") {
                    this.CheckIfCategoryExists();
                }
            });

            showErrorsForInput(this.refs.department.wrapper, '');
        }
        else {
            this.setState({ Department: null })
            showErrorsForInput(this.refs.department.wrapper, ["Select Department"]);
        }
    }

    addSubCat() {
        var subcategories = this.state.SubCategories;
        var subCat = { Name: '', Points: '' }
        subcategories.push(subCat);

        this.setState({ SubCategories: subcategories })
    }

    subCatNameChanged(e, ele) {
        var subCategories = this.state.SubCategories;
        subCategories[e]["Name"] = ele.target.value;
        this.setState({ SubCategories: subCategories })
    }

    pointsChanged(e, ele) {
        var subCategories = this.state.SubCategories;
        subCategories[e]["Points"] = ele.target.value;
        this.setState({ SubCategories: subCategories })
    }

    removeItem(e, ele) {
        var subcategories = this.state.SubCategories;
        subcategories.splice(e, 1);
        this.setState({ SubCategories: subcategories });
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.validate(e) || this.state.CategoryExists) {
            return;
        }
        var data = new FormData();

        data.append("subCategories", JSON.stringify(this.state.SubCategories));
        data.append("category", this.refs.category.value);
        data.append("deptId", this.state.Department.value);

        var url = ApiUrl + "/api/Category/AddCategory"
        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Category created successfully!", {
                        type: toast.TYPE.SUCCESS
                    });
                    $("button[name='submit']").show();
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
            )
        }
        catch (e) {
            toast("An error occured, please try again later", {
                type: toast.TYPE.ERROR
            });
            return false;
        }
    }


    validate(e) {
        var success = true;
        var isSubmit = e.type == "submit" ? true : false;
        var subCategories = this.state.SubCategories;


        if (!this.state.Department || !this.state.Department.value) {
            success = false;
            showErrorsForInput(this.refs.department.wrapper, ["Select Department"])
            if (isSubmit) {
                isSubmit = false;
                this.refs.department.focus();
            }
        }

        if (validate.single(this.refs.category.value, { presence: true }) != undefined) {
            success = false;
            showErrorsForInput(this.refs.category, ["Category name is required"])
            if (isSubmit) {
                isSubmit = false;
                this.refs.category.focus();
            }
        }

        if (subCategories.length > 0) {

            var valid = subCategories.findIndex((i) => i.Name.trim() == "" || i.Points == '');
            var inValidRecord = subCategories.findIndex((i) => i.Points <= 0);
            if (valid !== -1) {
                toast("SubCategories list is incomplete", {
                    type: toast.TYPE.INFO
                });
            }

            if (inValidRecord !== -1) {
                toast("Points in the list is not valid", {
                    type: toast.TYPE.INFO
                });
            }
        }

        if (this.state.CategoryExists) {
            success = false;
            showErrorsForInput(this.refs.category, ["Category already exists"])
            if (isSubmit) {
                isSubmit = false;
                this.refs.category.focus();
            }
        }

        return success;

    }

}

export default Category;