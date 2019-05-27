import React, { Component } from 'react';
import Select from 'react-select';
import $ from 'jquery';
import { ApiUrl } from '../Config';
import { toast } from 'react-toastify';
import { MyAjax, MyAjaxForAttachments } from '../MyAjax.js';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import { SearchCriteria } from '../Globals';


class MIMICUser extends Component {

    constructor(props) {
        super(props);
        var searchCriteria = { user: '', client: '', department: '', taskType: '', priority: null, status: '', sortCol: '', sortDir: '', taskCategory: '', employeeName: '' }

        this.state = {
            Employees: [], Employee: null, SearchCriteria: searchCriteria
        }
    }

    componentWillMount() {

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId");

        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + '' + "&OrgId=" + orgId,
            (data) => { this.setState({ Employees: data["employees"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )
    }

    render() {
        return (
            <div className="container mimicUser">
                <div className="col-xs-12" >
                    <div className="col-md-6" >
                        <label> Employee </label>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon">
                                    <span className="glyphicon glyphicon-user"></span>
                                </span>
                                <Select className="form-control" name="employee" ref="employee" placeholder="Select Employee"
                                    value={this.state.Employee} options={this.state.Employees} onChange={this.EmployeeChanged.bind(this)}
                                />
                            </div>

                        </div>
                    </div>
                    <div className="col-md-2" style={{ marginTop: '2%' }}>
                        <input type="button" className="btn btn-default" value="View" onClick={this.ViewClick.bind(this)} />
                    </div>
                </div>
            </div>
        )
    }

    EmployeeChanged(val) {
        if (val) {
            this.setState({ Employee: val })
            showErrorsForInput(this.refs.employee.wrapper, null);
        }
        else {
            this.setState({ Employee: '' })
            showErrorsForInput(this.refs.employee.wrapper, ["Please select employee"]);
        }

    }
    ViewClick() {

        if (!this.state.Employee || !this.state.Employee.value) {
            showErrorsForInput(this.refs.employee.wrapper, ["Please select employee"]);
        }
        else {
            showErrorsForInput(this.refs.employee.wrapper, null);
            this.props.history.push("/TaskDashboard/" + this.state.Employee.value);
            var criteria = this.state.SearchCriteria;
            criteria.user = this.state.Employee.value;
            criteria.employeeName = this.state.Employee.label;

            SearchCriteria(criteria);

            this.props.history.push({
                state: {
                    EmpId: this.state.Employee.value,
                    EmployeeName: this.state.Employee.label
                },
                pathname: "/TaskDashboard"
                // pathname: "/ToDos"
            })


            // alert(this.state.Employee.value);
        }

    }
}

export default MIMICUser;