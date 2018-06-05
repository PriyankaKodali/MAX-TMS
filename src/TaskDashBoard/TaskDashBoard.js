import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl, remote } from '../Config';
import Select from 'react-select';
import './TaskDashBoard.css';
import { MyAjax } from '../MyAjax';
import { toast } from 'react-toastify';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';

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
    else {
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
            TasksThroughMe: [], toDoList: true, tasksByMe: true, showTaskThroughMe: false,
            TaskByMeSizePerPage: 10, TaskByMeCurrentPage: 1, TaskByMeDataTotalSize: 0,
            TaskThroughMeSizePerPage: 10, TaskThroughMeCurrentPage: 1, TaskThroughMeDataTotalSize: 0,
            ActivitiesSummary: [], TaskByMeSummary: [], TaskThroughMeSummary: [], EmployeeId: null


        }
    }

    componentWillMount() {

        this.setState({ EmployeeId: this.props.match.params["id"] }, () => {
            // alert(this.props.match.params["id"]);
        })

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId");

        MyAjax(
            ApiUrl + "/api/Activities/GetActivitiesSummary",
            (data) => { this.setState({ TasksSummary: data["activitiesSummary"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetDepartments",
            type: "get",
            success: (data) => { this.setState({ Departments: data["departments"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClients?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })

        this.GetMyTasks(this.state.currentPage, this.state.sizePerPage);
        this.GetTasksByMe(this.state.currentPage, this.state.sizePerPage);
        this.GetTaskThroughMe(this.state.currentPage, this.state.sizePerPage);
    }

    GetMyTasks(page, count) {

        var empId = this.props.match.params["id"] != null ? this.props.match.params["id"] : sessionStorage.getItem("EmpId")

        var url = ApiUrl + "/api/Activities/GetMyTasks?EmpId=" + empId +
            "&clientId=" + this.state.Client +
            "&departmentId=" + this.state.Department +
            "&taskType=" + this.state.TaskFrom +
            "&priority=" + this.state.Priority +
            "&status=" + this.state.Status +
            "&page=" + page + "&count=" + count +
            "&sortCol=" + this.state.sortCol +
            "&sortDir=" + this.state.sortDir

        MyAjax(
            url,
            (data) => {
                this.setState({
                    TasksOnMe: data["myTasks"], dataTotalSize: data["totalPages"], IsDataAvailable: true,
                    ActivitiesSummary: data["actSummary"], currentPage: page, sizePerPage: count

                })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }

    GetTasksByMe(page, count) {

        var empId = this.props.match.params["id"] != null ? this.props.match.params["id"] : sessionStorage.getItem("EmpId")

        var url = ApiUrl + "/api/Activities/GetTasksByMe?EmpId=" + empId +
            "&clientId=" + this.state.Client +
            "&departmentId=" + this.state.Department +
            "&taskType=" + this.state.TaskFrom +
            "&priority=" + this.state.Priority +
            "&status=" + this.state.Status +
            "&page=" + page + "&count=" + count +
            "&sortCol=" + this.state.sortCol +
            "&sortDir=" + this.state.sortDir

        MyAjax(
            url,
            (data) => {
                this.setState({
                    TasksByMe: data["tasksByMe"], TaskByMeDataTotalSize: data["totalPages"],
                    TaskByMeSummary: data["actSummary"],
                    TaskByMeCurrentPage: page, TaskByMeSizePerPage: count, IsDataAvailable: true
                })
            },

            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }

    GetTaskThroughMe(page, count) {

        var empId = this.props.match.params["id"] != null ? this.props.match.params["id"] : sessionStorage.getItem("EmpId")

        var url = ApiUrl + "/api/Activities/GetTasksThroughMe?EmpId=" + empId +
            "&clientId=" + this.state.Client +
            "&departmentId=" + this.state.Department +
            "&taskType=" + this.state.TaskFrom +
            "&priority=" + this.state.Priority +
            "&status=" + this.state.Status +
            "&page=" + page + "&count=" + count + "&sortCol=" + this.state.sortCol +
            "&sortDir=" + this.state.sortDir

        MyAjax(
            url,
            (data) => {
                this.setState({
                    TasksThroughMe: data["tasksThroughMe"], TaskThroughMeDataTotalSize: data["totalCount"],
                    TaskThroughMeCurrentPage: page, TaskThroughMeSizePerPage: count, IsDataAvailable: true,
                    TaskThroughMeSummary: data["actSummary"]
                })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }),
            "GET", null
        )
    }

    render() {

        return (
            <div className="myContainer" >
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
                                options={[{ value: 'all', label: 'All' }, { value: 'tasksOnMe', label: 'Tasks On Me' }, { value: 'tasksByMe', label: 'Tasks By Me' }, { value: 'tasksThroughMe', label: 'Tasks Through Me' }]}
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
                    <div className="col-md-1 button-block text-center">
                        <input type="button" className="btn btn-default clearBtn" value="Clear" onClick={this.ClearClick.bind(this)} />
                    </div>
                </div>
                <div className="clearfix"></div>
                <div className="col-xs-12">
                    {
                        this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksOnMe" ?
                            <div>
                                <div className="col-xs-12" >
                                    <a onClick={() => { this.setState({ toDoList: !this.state.toDoList }) }} style={{ cursor: 'pointer' }} >
                                        <h3 className="col-xs-12 formheader"> To Do List
                                        <span className="job-summary-strip">
                                                <span> Total Tasks :  {this.state.ActivitiesSummary["TotalJobs"]} |  </span>
                                                <span>High :  {this.state.ActivitiesSummary["PriorityHighJobs"]} |</span>
                                                <span> Medium :  {this.state.ActivitiesSummary["PriorityMediumJobs"]} | </span>
                                                <span> Low : {this.state.ActivitiesSummary["PriorityLowJobs"]} </span>
                                            </span>

                                            <span className={(this.state.toDoList ? "up" : "down") + " fa fa-angle-down pull-right mhor10 f18 arrow"}></span>
                                        </h3>
                                    </a>
                                </div>
                                {
                                    this.state.toDoList ?

                                        this.state.IsDataAvailable ?
                                            <div className="col-xs-12">
                                                <BootstrapTable striped hover remote={remote} pagination={true} key={this.state.TasksOnMe}
                                                    data={this.state.TasksOnMe} trClassName={trClassFormat} tdStyle={{ whiteSpace: 'normal' }}
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
                                                    <TableHeaderColumn dataField="TaskType" dataAlign="left" width="10" dataSort={true} columnTitle={true} dataFormat={this.DepatmentClientFormatter.bind(this)} >Department/Client</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="17" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CreatedByName" dataAlign="left" width="20" dataSort={true} >Created By</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Subject" dataAlign="left" width="50" dataSort={true} >Subject</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="14" dataSort={true} dataFormat={this.priorityFormatter.bind(this)} > Priority </TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="27" dataSort={true} >Category/ SubCategory</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="12" dataSort={true} >Status </TableHeaderColumn>
                                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="10" dataSort={true} >TAT </TableHeaderColumn>
                                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="5" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                                </BootstrapTable>
                                            </div>
                                            :
                                            <div className="loader visble"></div>
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
                                <div className="col-xs-12" style={{ marginTop: '0.5%' }}>
                                    <a onClick={() => this.setState({ tasksByMe: !this.state.tasksByMe })} style={{ cursor: 'pointer' }} >
                                        <h3 className="col-xs-12 formheader">Tasks Created By Me

                                         <span className="job-summary-strip">
                                                <span> Total Tasks :  {this.state.TaskByMeSummary["TotalJobs"]} |  </span>
                                                <span>High :  {this.state.TaskByMeSummary["PriorityHighJobs"]} |</span>
                                                <span> Medium :  {this.state.TaskByMeSummary["PriorityMediumJobs"]} | </span>
                                                <span> Low : {this.state.TaskByMeSummary["PriorityLowJobs"]} </span>
                                            </span>

                                            <span className={(this.state.tasksByMe ? "up" : "down") + " fa fa-angle-down pull-right mhor10 f18 arrow"}></span></h3>
                                    </a>
                                </div>

                                {
                                    this.state.tasksByMe ?

                                        this.state.IsDataAvailable ?
                                            <div className="col-xs-12">
                                                <BootstrapTable striped hover remote={true} pagination={true} trClassName={trClassFormat}
                                                    fetchInfo={{ dataTotalSize: this.state.TaskByMeDataTotalSize }}
                                                    data={this.state.TasksByMe}
                                                    options={{
                                                        sizePerPage: this.state.TaskByMeSizePerPage,
                                                        onPageChange: this.taskByMePageChange.bind(this),
                                                        sizePerPageList: [{ text: '10', value: 10 },
                                                        { text: '25', value: 25 },
                                                        { text: 'ALL', value: this.state.TaskByMeDataTotalSize }],
                                                        page: this.state.currentPage,
                                                        onSizePerPageList: this.onTaskByMeSizePerPageList.bind(this),
                                                        paginationPosition: 'bottom',
                                                        onSortChange: this.onTasksByMeSortChange.bind(this),
                                                        onRowClick: this.rowClicked.bind(this)
                                                    }}
                                                >
                                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="left" width="10" dataSort={true} > TicketId</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="TaskType" dataAlign="left" width="10" dataSort={true} dataFormat={this.DepatmentClientFormatter.bind(this)} >Department/Client</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="12" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Subject" dataAlign="left" width="35" dataSort={true} >Subject</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="9" dataSort={true} dataFormat={this.priorityFormatter.bind(this)}> Priority </TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="20" dataSort={true} > Category/SubCategory </TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="10" dataSort={true} >Status </TableHeaderColumn>
                                                    <TableHeaderColumn dataField="TaskOwnerName" dataAlign="left" width="13" dataSort={true} >Task Owner</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="6" dataSort={true} dataAlign="center" >TAT </TableHeaderColumn>
                                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="5" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                                </BootstrapTable>
                                            </div>
                                            :
                                            <div className="loader visble"></div>
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
                                <div className="col-xs-12" style={{ marginTop: '0.5%' }}>
                                    <a onClick={() => this.setState({ showTaskThroughMe: !this.state.showTaskThroughMe })} style={{ cursor: 'pointer' }}>
                                        <h3 className="col-xs-12 formheader"> Tasks Through Me

                                         <span className="job-summary-strip">
                                                <span> Total Tasks :  {this.state.TaskThroughMeSummary["TotalJobs"]} |  </span>
                                                <span>High :  {this.state.TaskThroughMeSummary["PriorityHighJobs"]} |</span>
                                                <span> Medium :  {this.state.TaskThroughMeSummary["PriorityMediumJobs"]} | </span>
                                                <span> Low : {this.state.TaskThroughMeSummary["PriorityLowJobs"]} </span>
                                            </span>

                                            <span className={(this.state.showTaskThroughMe ? "up" : "down") + " fa fa-angle-down pull-right mhor10 f18 arrow"}></span>  </h3>
                                    </a>

                                </div>

                                {
                                    this.state.showTaskThroughMe ?
                                        this.state.IsDataAvailable ?
                                            <div className="col-xs-12" >
                                                <BootstrapTable striped hover={false} remote={true} pagination={true}
                                                    data={this.state.TasksThroughMe} trClassName={trClassFormat}
                                                    fetchInfo={{ dataTotalSize: this.state.TaskThroughMeDataTotalSize }}
                                                    options={{
                                                        sizePerPage: this.state.sizePerPage,
                                                        onPageChange: this.onTaskThroughMePageChange.bind(this),
                                                        sizePerPageList: [{ text: '10', value: 10 },
                                                        { text: '25', value: 25 },
                                                        { text: 'ALL', value: this.state.TaskThroughMeDataTotalSize }],
                                                        page: this.state.currentPage,
                                                        onSizePerPageList: this.onTaskThroughMeSizePerPageList.bind(this),
                                                        paginationPosition: 'bottom',
                                                        onSortChange: this.onTaskThroughMeSortChange.bind(this),
                                                        onRowClick: this.rowClicked.bind(this)
                                                    }}>

                                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="center" width="12" dataSort={true} > TicketId</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="TaskType" dataAlign="left" width="10" dataSort={true} dataFormat={this.DepatmentClientFormatter.bind(this)} >Department/Client</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="17" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created Date</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="EmpCreatedBy" dataAlign="left" width="16" dataSort={true} >Created By</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Subject" dataAlign="left" width="45" dataSort={true} >Subject</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="14" dataSort={true} dataFormat={this.priorityFormatter.bind(this)}> Priority </TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="27" dataSort={true} >Category/ SubCategory</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="12" dataSort={true} >Status </TableHeaderColumn>
                                                    <TableHeaderColumn dataField="EmpTaskOwner" dataAlign="left" width="18" dataSort={true} >Task Owner </TableHeaderColumn>
                                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="8" dataSort={true} dataAlign="center" >TAT </TableHeaderColumn>
                                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="6" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                                </BootstrapTable>
                                            </div>
                                            :
                                            <div className="loader visble"></div>
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
        return <p> {moment(row["CreatedDate"]).format("MM-DD-YYYY")}</p>
    }

    editDataFormatter(cell, row) {
        return (
            <a> <i className='glyphicon glyphicon-edit' style={{ fontSize: '14px', cursor: 'pointer' }} onClick={() => this.gotoEditTask(row["TaskId"], row["CreatedBy"], row["TaskOwner"], row["Status"])}  ></i> </a>
        )
    }

    rowClicked(row) {
        this.gotoEditTask(row.TaskId, row.CreatedBy, row.TaskOwner, row.Status);
    }

    DepatmentClientFormatter(cell, row) {
        return <p >  {row["Department_Id"] == null ? row["ClientName"] : row["Department"]} </p>
    }


    gotoEditTask(TaskId, CreatedBy, TaskOwner, Status) {

        var empId = this.props.match.params["id"] != null ? this.props.match.params["id"] : sessionStorage.getItem("EmpId")

        this.props.history.push({
            state: {
                TaskId: TaskId,
                AssignedBy: CreatedBy,
                TaskOwner: TaskOwner,
                Status: Status,
                EmpId: empId
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
            this.setState({ TaskType: { value: 'all', label: 'All' } })
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


    taskByMePageChange(page, sizePerPage) {
        this.GetTasksByMe(page, sizePerPage);
    }

    onTaskByMeSizePerPageList(TaskByMeSizePerPage) {
        this.GetTasksByMe(this.state.TaskByMeCurrentPage, TaskByMeSizePerPage);
    }

    onTasksByMeSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        }, () => {
            this.GetTasksByMe(this.state.TaskByMeCurrentPage, this.state.TaskByMeSizePerPage);
        });
    }


    onTaskThroughMePageChange(page, sizePerPage) {
        this.GetTaskThroughMe(page, sizePerPage);
    }

    onTaskThroughMeSizePerPageList(TaskThroughMeSizePerPage) {
        this.GetTaskThroughMe(this.state.TaskThroughMeCurrentPage, TaskThroughMeSizePerPage);
    }

    onTaskThroughMeSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        }, () => {
            this.GetTaskThroughMe(this.state.TaskThroughMeCurrentPage, this.state.TaskThroughMeSizePerPage);
        })
    }
}

export default TaskDashBoard;
