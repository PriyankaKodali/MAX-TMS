import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config';
import Select from 'react-select';
import './TaskDashBoard.css';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;


function trClassFormat(row, rowIdx) {
    if (row["Status"] === "Open" || row["Status"] === "Reopened") {
        return "trStatusOpen pointer"
    }

    else if (row["Status"] === "Pending") {
        return "trStatusPending pointer";
    }
    else if (row["Status"] === "Closed") {
        return "trStatusClosed pointer";
    }

}



class TaskDashBoard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ToDos: null, AssignedByMe: null, AssignedThroughMe: null,
            TaskType: { value: 'all', label: 'All' },
            ClientType: null, Status: '', Priority: '', Department: null, Departments: [],
            myTasks: 1, currentPage: 1, sizePerPage: 10, dataTotalSize: 0, sortCol: 'CreatedDate',
            TaskFrom: '', sortDir: 'desc', Clients: [], Client: '', TasksOnMe: [], TasksByMe: [],
            TasksThroughMe: [], toDoList: true, tasksByMe: false, showTaskThroughMe: false,

        }
    }

    // selectRowProp = {
    //     mode: 'checkbox',
    //     hideSelectColumn: true,
    //     clickToSelect: true,
    //     onSelect: this.onRowSelect.bind(this),
    // };


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
                {/* <div className="col-md-12 taskSearch"> */}
                <div className="taskSearch">
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
                                <div className="col-md-2">
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

                                    <div className="col-md-2">
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
                                options={[{ value: '0', label: 'High' }, { value: '1', label: 'Medium' }, { value: '2', label: 'Low' }]}
                                value={this.state.Priority} onChange={this.PriorityChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2 form-group">
                        <label> Status </label>
                        <div className="form-group">
                            <Select className="form-control" name="Status" placeholder="Status" value={this.state.Status}
                                options={[{ value: 'Open', label: 'Open' }, { value: 'Pending', label: 'Pending' }, { value: 'Reopened', label: 'Reopened' }]}
                                onChange={this.StatusChanged.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2 button-block">
                        <input type="button" className="btn btn-default" style={{ marginTop: '12%' }} value="Clear" onClick={this.ClearClick.bind(this)} />
                    </div>
                </div>

                <div className="col-xs-12">
                    {
                        this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksOnMe" ?
                            <div>
                                <div className="col-md-12" >
                                    <a onClick={() => { this.setState({ toDoList: !this.state.toDoList }) }} style={{ cursor: 'pointer' }} >
                                        <h3 className="col-xs-12 formheader"> To Do List <span className={(this.state.toDoList ? "up" : "down") + " fa fa-angle-down pull-right mhor10 f18 arrow"}></span></h3>
                                    </a>
                                </div>
                                {
                                    this.state.toDoList ?
                                        <div className="col-md-12">
                                            <BootstrapTable striped hover remote={true} pagination={true}
                                                data={this.state.TasksOnMe} trClassName={trClassFormat}
                                                fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                                                // selectRow={this.selectRowProp}
                                                options={{
                                                    sizePerPage: this.state.sizePerPage,
                                                    onPageChange: this.onPageChange.bind(this),
                                                    sizePerPageList: [{ text: '10', value: 10 },
                                                    { text: '25', value: 25 },
                                                    { text: 'ALL', value: this.state.dataTotalSize }],
                                                    page: this.state.currentPage,
                                                    onSizePerPageList: this.onSizePerPageList.bind(this),
                                                    paginationPosition: 'bottom',
                                                    onSortChange: this.onSortChange.bind(this),
                                                    onRowClick: this.rowClicked.bind(this)
                                                }}
                                            >
                                                <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="center" width="12" dataSort={true} > TicketId</TableHeaderColumn>
                                                <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="21" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                                <TableHeaderColumn dataField="CreatedByName" dataAlign="left" width="25" dataSort={true} >Created By</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Subject" dataAlign="left" width="50" dataSort={true} >Subject</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Priority" dataAlign="left" width="14" dataSort={true} dataFormat={this.priorityFormatter.bind(this)} > Priority </TableHeaderColumn>
                                                <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="30" dataSort={true} >Category/ SubCategory</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Status" dataAlign="left" width="12" dataSort={true} >Status </TableHeaderColumn>
                                                <TableHeaderColumn dataField="TAT" dataAlign="left" width="10" dataSort={true} >TAT </TableHeaderColumn>
                                                <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="5" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                            </BootstrapTable>
                                        </div>
                                        :
                                        <div />
                                }
                            </div>
                            : <div />
                    }
                </div>

                <div className="col-xs-12">
                    {
                        this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksByMe" ?
                            <div >
                                <div className="col-md-12" style={{ marginTop: '0.5%' }}>
                                    <a onClick={() => this.setState({ tasksByMe: !this.state.tasksByMe })} style={{ cursor: 'pointer' }} >
                                        <h3 className="col-md-12 formheader">Tasks Created By Me <span className={(this.state.tasksByMe ? "up" : "down") + " fa fa-angle-down pull-right mhor10 f18 arrow"}></span></h3>
                                    </a>
                                </div>

                                {
                                    this.state.tasksByMe ?
                                        <div className="col-md-12">
                                            <BootstrapTable striped hover remote={true} pagination={true} trClassName={trClassFormat}
                                                fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                                                data={this.state.TasksByMe}
                                                options={{
                                                    sizePerPage: this.state.sizePerPage,
                                                    onPageChange: this.onTaskCreatedByMePageChange.bind(this),
                                                    sizePerPageList: [{ text: '5', value: 5 },
                                                    { text: '10', value: 10 },
                                                    { text: 'ALL', value: this.state.dataTotalSize }],
                                                    page: this.state.currentPage,
                                                    onSizePerPageList: this.onTaskByMeSizePerPageList.bind(this),
                                                    paginationPosition: 'bottom',
                                                    onSortChange: this.onTasksByMeSortChange.bind(this),
                                                    onRowClick: this.rowClicked.bind(this)
                                                }}
                                            >
                                                <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="left" width="12" dataSort={true} > TicketId</TableHeaderColumn>
                                                <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="15" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                                {/* <TableHeaderColumn dataField="AssignedBy" dataAlign="left" width="15" dataSort={true} >Created By</TableHeaderColumn> */}
                                                <TableHeaderColumn dataField="Subject" dataAlign="left" width="35" dataSort={true} >Subject</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Priority" dataAlign="left" width="9" dataSort={true} dataFormat={this.priorityFormatter.bind(this)}> Priority </TableHeaderColumn>
                                                <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="20" dataSort={true} > Category/SubCategory </TableHeaderColumn>
                                                <TableHeaderColumn dataField="Status" dataAlign="left" width="10" dataSort={true} >Status </TableHeaderColumn>
                                                <TableHeaderColumn dataField="TaskOwnerName" dataAlign="left" width="15" dataSort={true} >Task Owner</TableHeaderColumn>
                                                <TableHeaderColumn dataField="TAT" dataAlign="left" width="6" dataSort={true} dataAlign="center" >TAT </TableHeaderColumn>
                                                <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="5" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                            </BootstrapTable>
                                        </div>
                                        :
                                        <div />
                                }
                            </div>
                            : <div />
                    }
                </div>

                <div className="col-xs-12">
                    {
                        this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksThroughMe" ?
                            <div >
                                <div className="col-md-12" style={{ marginTop: '0.5%' }}>
                                    <a onClick={() => this.setState({ showTaskThroughMe: !this.state.showTaskThroughMe })} style={{ cursor: 'pointer' }}>
                                        <h3 className="col-md-12 formheader"> Tasks Through Me  <span className={(this.state.showTaskThroughMe ? "up" : "down") + " fa fa-angle-down pull-right mhor10 f18 arrow"}></span>  </h3>
                                    </a>

                                </div>

                                {
                                    this.state.showTaskThroughMe ?
                                        <div className="col-md-12" >
                                            <BootstrapTable striped hover={false} remote={true} pagination={true}
                                                data={this.state.TasksThroughMe} trClassName={trClassFormat}
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
                                                    onSortChange: this.onTasksThroughMeSortChange.bind(this),
                                                    onRowClick: this.rowClicked.bind(this)
                                                }}>

                                                <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="center" width="12" dataSort={true} > TicketId</TableHeaderColumn>
                                                <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="21" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                                <TableHeaderColumn dataField="EmpCreatedBy" dataAlign="left" width="16" dataSort={true} >Created By</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Subject" dataAlign="left" width="45" dataSort={true} >Subject</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Priority" dataAlign="left" width="14" dataSort={true} dataFormat={this.priorityFormatter.bind(this)}> Priority </TableHeaderColumn>
                                                <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="27" dataSort={true} >Category/ SubCategory</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Status" dataAlign="left" width="12" dataSort={true} >Status </TableHeaderColumn>
                                                <TableHeaderColumn dataField="EmpTaskOwner" dataAlign="left" width="22" dataSort={true} >Task Owner </TableHeaderColumn>
                                                <TableHeaderColumn dataField="TAT" dataAlign="left" width="8" dataSort={true} dataAlign="center" >TAT </TableHeaderColumn>
                                                <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="6" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                            </BootstrapTable>
                                        </div>
                                        :
                                        <div />
                                }
                            </div>
                            :
                            <div />
                    }
                </div>

            </div>

        )
    }

    rowClassNameFormat(row, rowIdx) {
        // row is whole row object
        // rowIdx is index of row
        return row["Status"] === "Open" ? "td-column-function-even-example" : "td-column-function-odd-example";
    }

    priorityFormatter(cell, row) {
        if (row["Priority"] === 0) {
            return <p style={{ color: 'red' }}> High </p>
        }

        else if (row["Priority"] === 1) {
            return <p style={{ color: 'orange' }}>  Medium </p>
        }
        else if (row["Priority"] === 2) {
            return <p style={{ color: 'green' }}> Low </p>
        }
    }

    CreatedDateFormatter(cell, row) {
        return <p> {moment(row["CreatedDate"]).format("MM-DD-YYYY h:mm A")}</p>
    }

    editDataFormatter(cell, row) {
        return (
            <a> <i className='glyphicon glyphicon-edit' style={{ fontSize: '14px', cursor: 'pointer' }} onClick={() => this.gotoEditTask(row["TaskId"], row["CreatedBy"], row["TaskOwner"], row["Status"])}  ></i> </a>
        )
    }

    rowClicked(row) {
        this.gotoEditTask(row.TaskId, row.CreatedBy, row.TaskOwner, row.Status);
    }

    // onRowSelect(row, isSelected, e) {
    //     if (isSelected) {
    //         this.gotoEditTask(row.TaskId, row.CreatedBy, row.TaskOwner, row.Status);
    //     }
    // }


    gotoEditTask(TaskId, CreatedBy, TaskOwner, Status) {
        this.props.history.push({
            state: {
                TaskId: TaskId,
                AssignedBy: CreatedBy,
                TaskOwner: TaskOwner,
                Status: Status
            },
            pathname: "/ViewTask"
        })
    }

    ClearClick() {

        this.state.Priority = "";
        this.state.TaskType = { value: 'all', label: 'All' };
        this.state.TaskFrom = "";
        this.state.Status = "";
        this.state.Department = "";
        this.state.Client = "";

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
            this.setState({ Department: val }, () => {
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

    onTaskCreatedByMePageChange(page, sizePerPage) {
        this.GetTasksByMe(page, sizePerPage)
    }

    onTaskByMeSizePerPageList(sizePerPage) {
        this.GetTasksByMe(this.state.taskBymePage, sizePerPage)
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
