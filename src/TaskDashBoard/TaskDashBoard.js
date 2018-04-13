import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config';
import Select from 'react-select';
import './TaskDashBoard.css';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;


class TaskDashBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ToDos: null, AssignedByMe: null, AssignedThroughMe: null,
            TaskType: { value: 'all', label: 'All' },
            ClientType: null, Status: '', Priority: '', Department: null, Departments: [],
            myTasks: 1, currentPage: 1, sizePerPage: 10, dataTotalSize: 0, sortCol: 'TaskId',
            TaskFrom: '', sortDir: 'asc', Clients: [], Client: '', TasksOnMe: [], TasksByMe: [],
            TasksThroughMe: []
        }
    }
    componentWillMount() {
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetDepartments",
            type: "get",
            success: (data) => { this.setState({ Departments: data["departments"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClients?OrgId=" + sessionStorage.getItem("OrgId"),
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })
        this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
        this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
        this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
    }

    GetMyTasks(page, count) {
        var url = ApiUrl + "/api/Activities/GetMyTasks?EmpId=" + sessionStorage.getItem("EmpId") +
            "&clientId=" + this.state.Client +
            "&departmentId=" + this.state.Department +
            "&taskType=" + this.state.TaskFrom +
            "&priority=" + this.state.Priority +
            "&status=" + this.state.Status +
            "&page=" + page + "&count=" + count +
            "&sortCol=" + this.state.sortCol +
            "&sortDir=" + this.state.sortDir
        $.ajax({
            url: url,
            type: "get",
            success: (data) => {
                this.setState({
                    TasksOnMe: data["myTasks"], dataTotalSize: data["totalCount"],
                    currentPage: page, sizePerPage: count, IsDataAvailable: true
                })
            }
        })
    }

    GetTasksByMe(page, count) {
        var url = ApiUrl + "/api/Activities/GetTasksByMe?EmpId=" + sessionStorage.getItem("EmpId") +
            "&clientId=" + this.state.Client +
            "&departmentId=" + this.state.Department +
            "&taskType=" + this.state.TaskFrom +
            "&priority=" + this.state.Priority +
            "&status=" + this.state.Status +
            "&page=" + page + "&count=" + count +
            "&sortCol=" + this.state.sortCol +
            "&sortDir=" + this.state.sortDir
        $.ajax({
            url: url,
            type: "get",
            success: (data) => {
                this.setState({
                    TasksByMe: data["tasksByMe"], dataTotalSize: data["totalCount"],
                    currentPage: page, sizePerPage: count, IsDataAvailable: true
                })
            }
        })
    }

    GetTaskThroughMe(page, count) {
        var url = ApiUrl + "/api/Activities/GetTasksThroughMe?EmpId=" + sessionStorage.getItem("EmpId") +
            "&clientId=" + this.state.Client +
            "&departmentId=" + this.state.Department +
            "&taskType=" + this.state.TaskFrom +
            "&priority=" + this.state.Priority +
            "&status=" + this.state.Status +
            "&page=" + page + "&count=" + count + "&sortCol=" + this.state.sortCol +
            "&sortDir=" + this.state.sortDir
        $.ajax({
            url: url,
            type: "get",
            success: (data) => {
                this.setState({
                    TasksThroughMe: data["tasksThroughMe"], dataTotalSize: data["totalCount"],
                    currentPage: page, sizePerPage: count, IsDataAvailable: true
                })
            }
        })
    }

    render() {
        return (
            <div className="myContainer" style={{ marginTop: '4.3%' }}>

                <div className="col-xs-12 taskSearch" >
                    {/* <div style={{ marginTop: '1%' }}> */}
                    <div className="col-md-2 form-group">
                        <label>Task from </label>
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
                                <div className="col-xs-2">
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
                                this.state.TaskFrom === "Office" ?

                                    <div className="col-xs-2">
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
                                    :
                                    <div />
                            : <div />

                    }
                    <div className="col-md-2 form-group">
                        <label>Task Type </label>
                        <div className="form-group">
                            <Select className="form-control" name="TaskType" placeholder="Task Type" value={this.state.TaskType}
                                options={[{ value: 'all', label: 'All' }, { value: 'tasksOnMe', label: 'Tasks On Me' }, { value: 'tasksByMe', label: 'Tasks By Me' }, { value: 'tasksThroughMe', label: 'Tasks Through Me' }]}
                                onChange={this.taskTypeChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2 form-group">
                        <label>Priority </label>
                        <div className="form-group">
                            <Select className="form-control" name="Priority" placeholder="Priority"
                                options={[{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }]}
                                value={this.state.Priority} onChange={this.PriorityChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2 form-group">
                        <label> Status </label>
                        <div className="form-group">
                            <Select className="form-control" name="Status" placeholder="Status" value={this.state.Status}
                                options={[{ value: 'Open', label: 'Open' }, { value: 'Closed', label: 'Closed' }]}
                                onChange={this.StatusChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2 button-block">
                        <input type="button" className="btn btn-default" style={{ marginTop: '12%' }} value="Clear" onClick={this.ClearClick.bind(this)} />
                    </div>
                </div>

                {
                    this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksOnMe" ?
                        <div>
                            <h4 className="col-xs-12 myContainerHeading" style={{ paddingTop: '10px' }}> To Do List</h4>
                            <div className="col-xs-12">
                                <BootstrapTable striped hover remote={true} pagination={true}
                                    data={this.state.TasksOnMe}
                                    fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                                    options={{
                                        sizePerPage: this.state.sizePerPage,
                                        onPageChange: this.onPageChange.bind(this),
                                        sizePerPageList: [{ text: '10', value: 10 },
                                        { text: '25', value: 25 },
                                        { text: 'ALL', value: this.state.dataTotalSize }],
                                        page: this.state.currentPage,
                                        onSizePerPageList: this.onSizePerPageList.bind(this),
                                        paginationPosition: 'bottom',
                                        onSortChange: this.onSortChange.bind(this)
                                    }}
                                >
                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="center" width="12" dataSort={true} > TicketId</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="20" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CreatedByName" dataAlign="left" width="25" dataSort={true} >Created By</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Subject" dataAlign="left" width="50" dataSort={true} >Subject</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="14" dataSort={true}> Priority </TableHeaderColumn>
                                    <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="30" dataSort={true} >Category/ SubCategory</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="12" dataSort={true} >Status </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="10" dataSort={true} >TAT </TableHeaderColumn>
                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="5" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                </BootstrapTable>
                            </div>
                        </div>
                        : <div />
                }

                {
                    this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksByMe" ?
                        <div>
                            <h4 className="col-xs-12 myContainerHeading" > Tasks Assigned by me</h4>
                            <div className="col-xs-12">
                                <BootstrapTable striped hover remote={true} pagination={true}
                                    fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                                    data={this.state.TasksByMe}
                                    options={{
                                        sizePerPage: this.state.sizePerPage,
                                        onPageChange: this.onTaskByMePageChange.bind(this),
                                        sizePerPageList: [{ text: '10', value: 10 },
                                        { text: '25', value: 25 },
                                        { text: 'ALL', value: this.state.dataTotalSize }],
                                        page: this.state.currentPage,
                                        onSizePerPageList: this.onTaskByMeSizePerPageList.bind(this),
                                        paginationPosition: 'bottom',
                                        onSortChange: this.onTasksByMeSortChange.bind(this)
                                    }}
                                >
                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="center" width="12" dataSort={true} > TicketId</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CratedDate" dataAlign="left" width="18" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                    {/* <TableHeaderColumn dataField="AssignedBy" dataAlign="left" width="15" dataSort={true} >Created By</TableHeaderColumn> */}
                                    <TableHeaderColumn dataField="Subject" dataAlign="left" width="35" dataSort={true} >Subject</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="12" dataSort={true}> Priority </TableHeaderColumn>
                                    <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="22" dataSort={true} > Category/SubCategory </TableHeaderColumn>
                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="12" dataSort={true} >Status </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskOwnerName" dataAlign="left" width="15" dataSort={true} >Task Owner</TableHeaderColumn>
                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="10" dataSort={true} >TAT </TableHeaderColumn>
                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="5" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                </BootstrapTable>
                            </div>
                        </div>
                        : <div />
                }

                {
                    this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksThroughMe" ?
                        <div>
                            <h4 className="col-xs-12 myContainerHeading"> Assigned through me</h4>
                            <div className="col-xs-12">
                                <BootstrapTable striped hover remote={true} pagination={true}
                                    data={this.state.TasksThroughMe}
                                    fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}

                                    options={{
                                        sizePerPage: this.state.sizePerPage,
                                        onPageChange: this.onTaskThroughMePageChange.bind(this),
                                        sizePerPageList: [{ text: '10', value: 10 },
                                        { text: '25', value: 25 },
                                        { text: 'ALL', value: this.state.dataTotalSize }],
                                        page: this.state.currentPage,
                                        onSizePerPageList: this.onTaskThroughSizePerPageList.bind(this),
                                        paginationPosition: 'bottom',
                                        onSortChange: this.onTasksThroughMeSortChange.bind(this)
                                    }}>

                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="center" width="12" dataSort={true} > TicketId</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CratedDate" dataAlign="left" width="18" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                    <TableHeaderColumn dataField="EmpCreatedBy" dataAlign="left" width="16" dataSort={true} >Created By</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Subject" dataAlign="left" width="45" dataSort={true} >Subject</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="14" dataSort={true}> Priority </TableHeaderColumn>
                                    <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="27" dataSort={true} >Category/ SubCategory</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="12" dataSort={true} >Status </TableHeaderColumn>
                                    <TableHeaderColumn dataField="EmpTaskOwner" dataAlign="left" width="22" dataSort={true} >Task Owner </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="10" dataSort={true} >TAT </TableHeaderColumn>
                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="5" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                </BootstrapTable>
                            </div>
                        </div>
                        :
                        <div />
                }

            </div>

        )
    }

    CreatedDateFormatter(cell, row) {
        return <p> {moment(row["CreatedDate"]).format("DD-MM-YYYY")}</p>
    }

    editDataFormatter(cell, row) {
        return (
            <a> <i className='glyphicon glyphicon-edit' style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => this.gotoEditTask(row["TaskId"], row["CreatedBy"], row["TaskOwner"])}  ></i> </a>
        )
    }

    gotoEditTask(TaskId, CreatedBy, TaskOwner, ) {
        this.props.history.push({
            state: {
                TaskId: TaskId,
                AssignedBy: CreatedBy,
                TaskOwner: TaskOwner
            },
            pathname: "/ViewTask"
        })
    }

    ClearClick() {

        this.state.Priority = "";
        this.state.TaskType = { value: 'all', label: 'All' };
        this.state.TaskFrom = "";
        this.state.Status = "";

        this.setState({
            Priority: this.state.Priority,
            TaskType: this.state.TaskType,
            Status: this.state.Status,
            TaskFrom: this.state.TaskFrom
        }, () => {
            this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
            this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
            this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
        })
    }

    StatusChanged(val) {

        if (val) {
            this.setState({ Status: val.value }, () => {
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
        else {
            this.setState({ Status: '' }, () => {
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
    }

    PriorityChanged(val) {
        if (val) {
            this.setState({ Priority: val.value }, () => {
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
        else {
            this.setState({ Priority: '' }, () => {
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val }, () => {
                this.state.Client = val.value;
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
        else {
            this.setState({ Client: '' }, () => {
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
    }

    DepartmentChanged(val) {
        if (val) {
            this.setState({ Department: val}, () => {
                this.state.Department = val.value; 
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }

        else {
            this.setState({ Department: '' }, () => {
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
    }

    taskTypeChanged(val) {
        if (val) {
            this.setState({ TaskType: val }, () => {
                if (val.value == "tasksOnMe") {
                    this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                }
                else if (val.value == "tasksThroughMe") {
                    this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
                }
                else {
                    this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                }
            })
        }
        else {
            this.setState({ TaskType: 'all' })
        }
    }

    taskFromChanged(val) {
        if (val) {
            this.setState({ TaskFrom: val.value }, () => {
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
        else {
            this.setState({ TaskFrom: '' }, () => {
                this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
                this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
                this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
            })
        }
    }

    onSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        }, () => {
            this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
        });
    }

    onPageChange(page, sizePerPage) {
        this.GetMyTasks(page, sizePerPage)
    }

    onSizePerPageList(sizePerPage) {
        this.GetMyTasks(this.state.currentPage, sizePerPage)
    }

    onTasksByMeSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        }, () => {
            this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
        });
    }

    onTaskByMePageChange(page, sizePerPage) {
        this.GetTasksByMe(page, sizePerPage)
    }

    onTaskByMeSizePerPageList(sizePerPage) {
        this.GetTasksByMe(this.state.currentPage, sizePerPage)
    }

    onTasksThroughMeSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        }, () => {
            this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
        });
    }

    onTaskThroughMePageChange(page, sizePerPage) {
        this.GetTaskThroughMe(page, sizePerPage)
    }

    onTaskThroughSizePerPageList(sizePerPage) {
        this.GetTaskThroughMe(this.state.currentPage, sizePerPage);
    }

}

export default TaskDashBoard;
