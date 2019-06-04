import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config.js';
import SubCategories from './SubCategories';

class Departments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Departments: [], subCategories: [], Department: '', category: '', CategoryName: '',
        }
    }
    componentWillMount() {
        $.ajax({
            url: ApiUrl + "/api/Category/GetDeptWiseCategories",
            type: "get",
            success: (data) => {
                this.setState({ Departments: data["departmentsInfo"] })
            }
        })
    }

    render() {
        return (
            <div className="container" style={{ marginTop: '0.5%' }} key={this.state.Departments}>
                <div className="col-xs-12">
                    <h4><b> Department Wise Categories</b>
                        <div className="col-md-5" style={{ float: "right" }}>
                            <div className="col-md-8">
                                <input className="form-control" placeholder="Category to be searched" ref="catgerory" />
                            </div>
                            <button className="col-md-2 btn btn-primary" name="search" value="search" onClick={this.handleCatSearchClick.bind(this)} > search </button> <span></span>
                            <button className="col-md-1 btn btn-primary glyphicon glyphicon-plus" title="Add Category" style={{ paddingLeft: '10px', float:'right' }} name="addCategory"  onClick={() => { this.props.history.push('./Category') }} >
                            </button>
                        </div>
                    </h4>
                </div>
                <div className="col-xs-12" style={{ paddingTop: '2px' }}>
                    {
                        this.state.Departments.map((ele, i) => {
                            return (
                                <div className="panel-group" id="accordion" key={ele["DepartmentId"]}>
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
                                            <h6 className="panel-title panelHeading" style={{ paddingTop: '6px' }}>
                                                <p data-toggle="collapse" data-target={"#collapse" + i} >
                                                    {ele["Department"].toUpperCase()}
                                                </p>
                                            </h6>
                                        </div>

                                        <div id={"collapse" + i} className="panel-collapse collapse">
                                            <div className="panel-body">
                                                <div>
                                                    {
                                                        ele["Categories"].map((e, j) => {
                                                            return (
                                                                <a style={{ cursor: 'pointer' }} onClick={() => { this.getSubCategories(e["CategoryId"], ele["Department"], e["SubCategories"], e["CategoryName"]) }}  >  <b>{e["CategoryName"]}</b>
                                                                    {
                                                                        (j + 1) != ele["Categories"].length ? ',' : ''
                                                                    }
                                                                </a>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>

                <div id="subCategories" className="modal fade" role="dialog" key={this.state.SubCategories} >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header" >
                                <p>
                                    <label> Department : </label> {this.state.Department}
                                    <label>Category : </label> {this.state.CategoryName}
                                    <button type="button" className="close tright" data-dismiss="modal" id="closeModal">&times;</button>
                                </p>
                            </div>
                            <div className="modal-body">
                                <SubCategories subCategories={this.state.subCategories} category={this.state.category} CloseModal={this.handleCloseClick.bind(this)} />
                            </div>
                            <div className="modal-footer">

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    handleCatSearchClick() {
        var category = this.refs.catgerory.value;
        var departments = this.state.Departments;
        var index = [];
        var exists = departments.map((ele, i) => {
            ele["Categories"].map((e, j) => {
                if (e["CategoryName"].toUpperCase() == category.toUpperCase()) {
                    index.push(i);
                }
            })
        })
        if (index.length === 0) {
            for (var i = 0; i < departments.length; i++) {
                $('#collapse' + i).collapse('hide');
            }
        }
        else {
            for (var j = 0; j < departments.length; j++) {
                var exists = index.findIndex(i => i == j);
                if (exists != -1) {
                    $('#collapse' + index[exists]).collapse('show');
                }
                else {
                    $('#collapse' + j).collapse('hide');
                }
            }
        }
    }

    getSubCategories(catId, department, subcategories, category) {
        this.setState({
            subCategories: subcategories, Department: department, category: catId, CategoryName: category
        }, () => { $("#subCategories").modal("show"); })
    }


    handleCloseClick() {
        window.location.reload();
        $("#closeModal").click();
    }

}


export default Departments;