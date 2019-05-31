import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl, remote } from '../Config';
import Select from 'react-select';
import './TaskDashBoard.css';
import { MyAjax } from '../MyAjax';
import { toast } from 'react-toastify';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';

import ToDoLeads from './ToDoLeads';
import TasksThroughMe from './TasksThroughMe';
import CreatedByMe from './CreatedByMe';
import ToDoPending from './ToDoPending';
import ToDo from './ToDo';

import { SearchCriteria } from '../Globals';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;


function trClassFormat(row, rowIdx) {
    if (row["Status"] === "Open" || row["Status"] === "Reopened") {
        if (row["Notifications"] > 0) {
            return "trStatusOpen tasknotification pointer"
        }
        else {
            return "trStatusOpen pointer"
        }
    }

    else if (row["Status"] === "Pending") {
        if (row["Notifications"] > 0) {
            return "trStatusPending pointer tasknotification";
        }
        else {
            return "trStatusPending pointer";
        }
    }
    else if (row["Status"] === "Closed") {
        return "trStatusClosed pointer";
    }
    else {
        if (row["Notifications"] > 0) {
            return "trStatusClosed pointer tasknotification";
        }
        else {
            return "trStatusClosed pointer ";
        }
    }
}

class TaskDashBoard extends Component {

    constructor(props) {
        super(props);
        var searchCriteria = { empId: '', taskFrom: '', client: '', department: '', priority: '', status: '', sortCol: '', sortDir: '' }

        this.state = {
            ToDos: null, AssignedByMe: null, AssignedThroughMe: null,
            TaskType: { value: 'all', label: 'All' }, ClientType: null, Status: '', Priority: '',
            Department: null, Departments: [], myTasks: 1, TaskFrom: '', Clients: [], Client: '',
            TasksOnMe: [], TasksByMe: [], TasksThroughMe: [], toDoList: true, tasksByMe: true,
            showTaskThroughMe: true, EmployeeId: '', NeedUpdate: false, User: '', EmployeeName: '',
            SearchCriteria: searchCriteria,
        }
    }

    componentWillMount() {
        // var User = this.props.match.params["id"] != null ? this.props.match.params["id"] : sessionStorage.getItem("EmpId")
        var User = this.props.location.state != null ? this.props.location.state["EmpId"] : sessionStorage.getItem("EmpId")
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId");
        var employeeName = this.props.location.state != null ? this.props.location.state["EmployeeName"] :
            sessionStorage.getItem("displayName");

        var criteria = this.state.SearchCriteria;
        criteria.empId = User;
        criteria.employeeName = employeeName;

        SearchCriteria(criteria);

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
                                options={[{ value: 'all', label: 'All' }, { value: 'tasksOnMe', label: 'Tasks On Me' }, { value: 'tasksByMe', label: 'Tasks By Me' }, { value: 'tasksThroughMe', label: 'Tasks Through Me' },
                                { value: 'pendingTasksOnMe', label: 'Pending Tasks' }]}
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
                        <input type="button" className="btn btn-default clearBtn mleft10" value="Clear" onClick={this.ClearClick.bind(this)} />
                    </div>
                </div>

                {
                    this.props.location.state ?
                        <div className="col-xs-12">
                            {this.state.EmployeeName && sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ?
                                <p>
                                    You are in <b style={{ color: 'green' }} > {this.state.EmployeeName}  </b>   's screen
                       </p>
                                : <div />}
                        </div>
                        :
                        <div />
                }
                <div className="col-xs-12">

                </div>
                <div className="clearfix"></div>

                <div className="col-xs-12" key={this.state.EmployeeId} >
                    {
                        this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksOnMe" ?
                            <div >
                                <ToDo SearchCriteria={this.state.SearchCriteria} history={this.props.history} location={this.props.location} match={this.props.match} />
                            </div>
                            : <div />
                    }
                </div>

                <div className="col-xs-12" >
                    {
                        this.state.TaskType.value == "all" || this.state.TaskType.value === "pendingTasksOnMe" ?
                            <div>
                                <ToDoPending SearchCriteria={this.state.SearchCriteria} history={this.props.history} location={this.props.location} match={this.props.match} />
                            </div>
                            : <div />
                    }
                </div>

                <div className="col-xs-12">
                    <ToDoLeads SearchCriteria={this.state.SearchCriteria} history={this.props.history} history={this.props.history} location={this.props.location} match={this.props.match} />
                </div>

                <div className="col-xs-12">
                    {
                        this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksByMe" ?
                            <div >
                                <CreatedByMe SearchCriteria={this.state.SearchCriteria} history={this.props.history} location={this.props.location} match={this.props.match} />
                            </div>
                            : <div />
                    }
                </div>

                <div className="col-xs-12">
                    {
                        this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksThroughMe" ?
                            <div>
                                <TasksThroughMe SearchCriteria={this.state.SearchCriteria} history={this.props.history} location={this.props.location} match={this.props.match} />
                            </div>
                            : <div />
                    }
                </div>

            </div>
        )
    }

    CreatedDateFormatter(cell, row) {
        return <p> {moment(row["CreatedDate"]).format("MM-DD-YYYY")}</p>
    }

    handleSearchClick() {
        var searchCriteria = this.state.SearchCriteria; 
        var empId = this.props.location.state != null ? this.props.location.state["EmpId"] : sessionStorage.getItem("EmpId");
        var client = this.state.Client != '' ? this.state.Client.value : '';
        var department = this.state.Department != null ? this.state.Department.value : '';
        var priority = this.state.Priority
        var status = this.state.Status != '' ? this.state.Status : '';
        var taskFrom = this.state.TaskFrom != '' ? this.state.TaskFrom.value : '';

        searchCriteria.empId = empId;
        searchCriteria.client = client;
        searchCriteria.department = department;
        searchCriteria.priority = priority;
        searchCriteria.status = status;
        searchCriteria.taskFrom = taskFrom;

        this.setState({ SearchCriteria: searchCriteria });

    }

    ClearClick() {

        var searchCriteria = this.state.SearchCriteria;
        var empId = this.props.location.state != null ? this.props.location.state["EmpId"] : sessionStorage.getItem("EmpId");

        searchCriteria.client = '';
        searchCriteria.department = null;
        searchCriteria.priority = '';
        searchCriteria.status = '';
        searchCriteria.taskFrom = '';

        this.setState({
            Client: '', Depatment: '', Status: '', Priority: '', TaskFrom: '',
            TaskType: { value: 'all', label: 'All' },
            clientTask: false, offcTasks: false, SearchCriteria: searchCriteria
        })
    }

    StatusChanged(val) { 
        if (val) { 
            this.setState({ Status: val.value  })
        }
        else {
            this.setState({ Status: '' })
        }
    }

    PriorityChanged(val) {
        if (val) {
            this.setState({ Priority: val.value })
        }
        else {
            this.setState({ Priority: '' })
        }
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val.value })
        }
        else {
            this.setState({ Client: '' })
        }
    }

    DepartmentChanged(val) {
        if (val) {
            this.setState({ Department: val.value })
        }

        else {
            this.setState({ Department: '' })
        }
    }

    taskTypeChanged(val) {
        if (val) {
            this.setState({ TaskType: val }, () => {
                if (val.value == "tasksOnMe") {
                }
                else if (val.value == "tasksThroughMe") {
                }
                else if (val.value == 'toDoPendingList') {
                }
                else {
                }
            })
        }
        else {
            this.setState({ TaskType: { value: 'all', label: 'All' } })
        }
    }

    taskFromChanged(val) {
        if (val) {
            this.setState({ TaskFrom: val.value })
        }
        else {
            this.setState({ TaskFrom: '' })
        }
    }
}

export default TaskDashBoard;
