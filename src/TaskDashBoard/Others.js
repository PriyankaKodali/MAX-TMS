import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import './TaskDashBoard.css';
import { ApiUrl } from '../Config';
import TasksThroughMe from './TasksThroughMe';
import CreatedByMe from './CreatedByMe';
import { user, employeeName } from '../Globals';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;


class Others extends Component {
    constructor(props) {
        super(props);

        var searchCriteria = { empId: '', taskFrom: '', client: '', department: '', priority: '', status: '', sortCol: '', sortDir: '' }

        this.state = {
            clientTask: false, offcTasks: false, SearchCriteria: searchCriteria, Departments: [],
            Clients: [], Client: '', Department: null, TaskFrom: '', Priority: '', EmpId: '',
            Status: '', TaskType: { value: 'All', label: 'All' }
        }
    }

    componentWillMount() {
        //  var User = this.props.location.state != null ? this.props.location.state["EmpId"] : sessionStorage.getItem("EmpId")
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId");
        //  var employeeName = this.props.location.state != null ? this.props.location.state["EmployeeName"] :
        //      sessionStorage.getItem("displayName");

        var User = user != "" ? user : sessionStorage.getItem("EmpId");
        var empName = employeeName != "" ? employeeName : sessionStorage.getItem("displayName");

        var criteria = this.state.SearchCriteria;
        criteria.empId = User;
        criteria.employeeName = empName;

        if (this.props.location.state) {
            this.setState({
                EmployeeId: User, EmployeeName: this.props.location.state["EmployeeName"],
                SearchCriteria: criteria
            })
        }
        else {
            this.setState({ EmployeeId: User, EmployeeName: '', SearchCriteria: criteria })
        }

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetDepartments",
            type: "get",
            success: (data) => { this.setState({ Departments: data["departments"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })
    }


    render() {
        return (
            <div className="myContainer" key={this.state.SearchCriteria} >
                <div className="col-xs-12 taskSearch">
                    <div className="col-md-2 form-group">

                        <div className="form-group">
                            <Select className="form-control" name="TaskType" placeholder="Task From" value={this.state.TaskFrom}
                                options={[{ value: 'Client', label: 'Client' }, { value: 'Office', label: 'Office' }]}
                                onChange={this.taskFromChanged.bind(this)}
                            />
                        </div>
                    </div>
                    {
                        this.state.TaskFrom != null ?

                            this.state.TaskFrom === "Client" ?
                                <div className="col-md-2">
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
                                this.state.TaskFrom === "Office" ?

                                    <div className="col-md-2">
                                        <div className="form-group">
                                            <div className="input-group">
                                                <span className="input-group-addon" >
                                                    <span className="glyphicon glyphicon-user"></span>
                                                </span>
                                                <Select className="form-control" name="Department" ref="department" placeholder="Select Departmnet" value={this.state.Department} options={this.state.Departments} onChange={this.DepartmentChanged.bind(this)} />
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div />
                            : <div />

                    }
                    <div className="col-md-2 form-group">
                        <div className="form-group">
                            <Select className="form-control" name="TaskType" placeholder="Task Type" value={this.state.TaskType}
                                options={[{ value: 'all', label: 'All' },
                                { value: 'tasksByMe', label: 'Tasks By Me' },
                                { value: 'tasksThroughMe', label: 'Tasks Through Me' }
                                ]}
                                onChange={this.taskTypeChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2 form-group">
                        <div className="form-group">
                            <Select className="form-control" name="Priority" placeholder="Priority"
                                options={[{ value: '0', label: 'High' }, { value: '1', label: 'Medium' }, { value: '2', label: 'Low' }]}
                                value={this.state.Priority} onChange={this.PriorityChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2 form-group">
                        <div className="form-group">
                            <Select className="form-control" name="Status" placeholder="Status" value={this.state.Status}
                                options={[{ value: 'Open', label: 'Open' }, { value: 'Pending', label: 'Pending' }, { value: 'Reopened', label: 'Reopened' }]}
                                onChange={this.StatusChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2 button-block text-center">
                        <input type="button" className="btn btn-primary" value="submit" onClick={this.handleSearchClick.bind(this)} />
                        <input type="button" className="btn btn-default clearBtn" value="Clear" onClick={this.handleClearClick.bind(this)} />
                    </div>
                </div>

                {
                    this.props.location.state ?
                        <div className="col-xs-12">
                            {
                                //this.state.EmployeeName != '' ?

                                this.state.EmployeeId !== sessionStorage.getItem("Emp_Id") ?
                                    <p>
                                        You are in <b style={{ color: 'green' }} > {this.state.EmployeeName}  </b>   's screen
                   </p>
                                    : <div />}
                        </div>
                        :
                        <div />
                }
                <div key={this.state.SearchCriteria}>
                    {
                        this.state.TaskType.value == 'All' || this.state.TaskType.value == 'tasksByMe' ?
                            <div >
                                <CreatedByMe SearchCriteria={this.state.SearchCriteria} history={this.props.history} location={this.props.location} match={this.props.match} />
                            </div>
                            :
                            <div></div>
                    }

                    {
                        this.state.TaskType.value == 'All' || this.state.TaskType.value == 'tasksThroughMe' ?
                            <div>
                                <TasksThroughMe SearchCriteria={this.state.SearchCriteria} history={this.props.history} location={this.props.location} match={this.props.match} />
                            </div>
                            : <div />
                    }
                </div>
            </div>

        )
    }


    taskTypeChanged(val) {
        if (val) {
            this.setState({ TaskType: val, NeedUpdate: true }, () => {
                if (val.value == "tasksOnMe") {
                }
                if (val.value == "")
                    if (val.value == 'toDoPendingList') {
                    }
            })
        }
        else {
            this.setState({ TaskType: { value: 'all', label: 'All' } })
        }
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val })
        }
        else {
            this.setState({ Client: '' })
        }
    }

    DepartmentChanged(val) {
        if (val) {
            this.setState({ Department: val })
        }

        else {
            this.setState({ Department: '' })
        }
    }

    taskFromChanged(val) {

        if (val) {
            if (val.value == "Client") {
                this.setState({ TaskFrom: val, clientTask: true, offcTasks: false, Client: '' })
            }
            else if (val.value == "Office") {
                this.setState({ TaskFrom: val, offcTasks: true, clientTask: false, Department: '' })
            }
            else {
                this.setState({ TaskFrom: '', offcTasks: false, clientTask: false })
            }
        }
    }

    PriorityChanged(val) {
        if (val) {
            this.setState({ Priority: val })
        }
        else {
            this.setState({ Priority: '' })
        }
    }

    StatusChanged(val) {
        if (val) {
            this.setState({ Status: val })
        }
        else {
            this.setState({ Status: '' })
        }
    }

    handleSearchClick() {
        var searchCriteria = this.state.SearchCriteria;
        var empId = this.props.location.state != null ? this.props.location.state["EmpId"] : sessionStorage.getItem("EmpId");
        var client = this.state.Client != '' ? this.state.Client.value : '';
        var department = this.state.Department != null ? this.state.Department.value : '';
        var priority = this.state.Priority != '' ? this.state.Priority.value : '';
        var status = this.state.Status != '' ? this.state.Status.value : '';
        var taskFrom = this.state.TaskFrom != '' ? this.state.TaskFrom.value : '';

        searchCriteria.empId = empId;
        searchCriteria.client = client;
        searchCriteria.department = department;
        searchCriteria.priority = priority;
        searchCriteria.status = status;
        searchCriteria.taskFrom = taskFrom;

        this.setState({ SearchCriteria: searchCriteria });

    }

    handleClearClick() {

        var searchCriteria = this.state.SearchCriteria;
        var empId = this.props.location.state != null ? this.props.location.state["EmpId"] : sessionStorage.getItem("EmpId");

        searchCriteria.empId = empId;
        searchCriteria.client = '';
        searchCriteria.department = null;
        searchCriteria.priority = '';
        searchCriteria.status = '';
        searchCriteria.taskFrom = '';

        this.setState({
            Client: '', Depatment: '', Status: '', Priority: '', TaskFrom: '',
            TaskType: { value: 'All', label: 'All' }, clientTask: false, offcTasks: false,
            SearchCriteria: searchCriteria
        })
    }

}

export default Others;