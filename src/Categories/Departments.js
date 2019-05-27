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
                    <h4><b> Department Wise Categories</b>  </h4> 
                </div>
                <div className="col-xs-12">
                    {
                        this.state.Departments.map((ele, i) => {
                            return (
                                <div className="panel-group" id="accordion" key={ele["DepartmentId"]}>
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
                                            <h6 className="panel-title panelHeading" style={{ paddingTop: '6px' }}>
                                                <p data-toggle="collapse" data-parent="#accordion" href={"#collapse" + i}>
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