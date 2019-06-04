import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl, remote } from '../Config';
import { MyAjax } from '../MyAjax.js';
import { toast } from 'react-toastify';
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

class ToDoInHold extends Component {

    constructor(props) {
        super(props); 
        var searchCriteria = { user: '', client: '', department: '', taskType: '', priority: null, status: '', sortCol: '', sortDir: '', taskCategory: '' }

        this.state = {
            ToDoInHold: [], currentPage: 1, sizePerPage: 50, dataTotalSize: 1, isDataAvailable: true,
            ToDoInHoldSummary: [], sortCol: 'TaskId', sortDir: 'desc', showHoldTasks: true,
            SearchCriteria: this.props.SearchCriteria, showToDoInHold: true
        }
    }

    componentWillMount() { 
        this.setState({
            Client: this.props.SearchCriteria.client, Priority: this.props.SearchCriteria.priority,
            Department: this.props.SearchCriteria.department, Status: this.props.SearchCriteria.status,
            EmpId: this.props.SearchCriteria.empId, TaskFrom: this.props.SearchCriteria.taskFrom
        }, () => {
            this.GetToDosInHold(this.state.currentPage, this.state.sizePerPage)
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            Client: nextProps.SearchCriteria.client, Department: nextProps.SearchCriteria.department,
            TaskFrom: nextProps.SearchCriteria.taskFrom, Priority: nextProps.SearchCriteria.priority,
            Status: nextProps.SearchCriteria.status, EmpId: nextProps.SearchCriteria.empId,
        }, () => {
            this.GetToDosInHold(this.state.currentPage, this.state.sizePerPage)
        })
    }

    GetToDosInHold(page, count) {

        var url = ApiUrl + "/api/Activities/GetToDosInHold?EmpId=" + this.state.EmpId +
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
                    ToDoInHold: data["ToDosInHold"], dataTotalSize: data["totalPages"],
                    currentPage: page, sizePerPage: count, IsDataAvailable: true,
                    ToDoInHoldSummary: data["actSummary"]
                })
            },

            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }

    render() {
        return (
            <div key={this.state.ToDoInHold} >
                {
                    this.state.ToDoInHold.length > 0 ?
                        <div>
                            <div className="col-xs-12" style={{ marginTop: '0.5%' }}>
                                <a onClick={() => { this.setState({ showToDoInHold: !this.state.showToDoInHold }) }} style={{ cursor: 'pointer' }} >
                                    <h3 className="col-xs-12 formheader"> To Do In Hold
                                        <span className="job-summary-strip">
                                            <span> Total Tasks :  {this.state.ToDoInHoldSummary["TotalJobs"]} |  </span>
                                            <span>High :  {this.state.ToDoInHoldSummary["PriorityHighJobs"]} |</span>
                                            <span> Medium :  {this.state.ToDoInHoldSummary["PriorityMediumJobs"]} | </span>
                                            <span> Low : {this.state.ToDoInHoldSummary["PriorityLowJobs"]} </span>
                                        </span>
                                        <span className={(this.state.showToDoInHold ? "up" : "down") + " fa fa-angle-down pull-right mhor10 f18 arrow"}></span>
                                    </h3>
                                </a>
                            </div>
                            {
                                this.state.showToDoInHold ?
                                    this.state.IsDataAvailable ?
                                        <div className="col-xs-12">
                                            <BootstrapTable striped hover remote={true} pagination={true} key={this.state.ToDoInHold}
                                                data={this.state.ToDoInHold} trClassName={trClassFormat} tdStyle={{ whiteSpace: 'normal' }}
                                                fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                                                // selectRow={this.selectRowProp}
                                                options={{
                                                    sizePerPage: this.state.sizePerPage,
                                                    onPageChange: this.onPageChange.bind(this),
                                                    sizePerPageList: [{ text: '25', value: 25 },
                                                    { text: '50', value: 50 },
                                                    { text: 'ALL', value: this.state.dataTotalSize }],
                                                    page: this.state.currentPage,
                                                    onSizePerPageList: this.onSizePerPageList.bind(this),
                                                    paginationPosition: 'bottom',
                                                    onSortChange: this.onSortChange.bind(this),
                                                    onRowClick: this.rowClicked.bind(this)
                                                }}
                                            >
                                                <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="center" width="13" dataSort={true} dataFormat={this.TicketFormatter.bind(this)}> TicketId</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Department" dataAlign="left" width="10" dataSort={true} columnTitle={true} dataFormat={this.DepatmentClientFormatter.bind(this)} >Client/Department</TableHeaderColumn>
                                                <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="27" dataSort={true} dataFormat={this.CategoryFormatter.bind(this)} >Category</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Subject" dataAlign="left" width="34" dataSort={true} >Subject</TableHeaderColumn>
                                                {/* <TableHeaderColumn dataField="Priority" dataAlign="left" width="12" dataSort={true} dataFormat={this.priorityFormatter.bind(this)} > Priority </TableHeaderColumn> */}
                                                <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="13" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created</TableHeaderColumn>
                                                <TableHeaderColumn dataField="CreatedByName" dataAlign="left" width="20" dataSort={true} >Created By</TableHeaderColumn>
                                                <TableHeaderColumn dataField="LastUpdated" dataAlign="left" width="13" dataSort={true} dataFormat={this.LastUpdatedFormatter.bind(this)} >Updated </TableHeaderColumn>
                                                <TableHeaderColumn dataField="LastUpdatedBy" dataAlign="left" width="17" dataSort={true} >Updated By</TableHeaderColumn>
                                                <TableHeaderColumn dataField="Status" dataAlign="left" width="11" dataSort={true} >Status </TableHeaderColumn>
                                                <TableHeaderColumn dataField="TAT" dataAlign="left" width="7" dataSort={true} >TAT </TableHeaderColumn>
                                                {/* <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="5" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn> */}
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
        )
    }
 
    rowClicked(row) {
        this.gotoEditTask(row.RowNum, row.TaskId, row.CreatedBy, row.TaskOwner, row.Status, row.Notifications);
    }

    gotoEditTask(RowId, TaskId, CreatedBy, TaskOwner, Status, Notification, TotalCount) {

        //  var currentLogin = this.props.match.params["id"] != null ? this.props.match.params["id"] : sessionStorage.getItem("EmpId")
        var currentLogin = this.props.location.state != null ? this.props.location.state["EmpId"] : sessionStorage.getItem("EmpId")
        var EmployeeName = this.props.location.state != null ? this.props.location.state["EmployeeName"] : ""
        var criteria = this.state.SearchCriteria;

        criteria.user = currentLogin;
        criteria.client = this.state.Client;
        criteria.department = this.state.Department;
        criteria.taskType = this.state.TaskFrom;
        criteria.priority = this.state.Priority;
        criteria.status = this.state.Status;
        criteria.sortCol = this.state.sortCol;
        criteria.sortDir = this.state.sortDir;
        criteria.taskCategory = "ToDoInHold";
        criteria.screen = "ToDoInHold";

        SearchCriteria(criteria);

        this.props.history.push({
            state: {
                RowId: RowId,
                TaskId: TaskId,
                CreatedBy: CreatedBy,
                TaskOwner: TaskOwner,
                Status: Status,
                EmpId: currentLogin,
                Notifications: Notification,
                EmployeeName: EmployeeName
            },
            pathname: "/ViewTask"
        })

    }

    onPageChange(page, sizePerPage) {
        this.GetToDosInHold(page, sizePerPage);
    }

    onSizePerPageList(sizePerPage) {
        this.GetToDosInHold(this.state.currentPage, sizePerPage);
    }

    onSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        }, () => {
            this.GetToDosInHold(this.state.currentPage, this.state.sizePerPage);
        })
    }

    TicketFormatter(cell, row) {
        return (
            <span>
                <span className={"glyphicon glyphicon-star"} style={row["Priority"] == 0 ? { color: 'red' } : row["Priority"] == 1 ? { color: 'orange' } : { color: 'green' }}
                    name="star" active="true" />
                <span style={{ color: 'none' }} >  {row["TaskId"]} </span>
            </span> 
        )
    }

    LastUpdatedFormatter(cell, row) {
        if (row["LastUpdated"] != null) {
            return (
                <p>{moment(row["LastUpdated"]).format("DD-MM-YYYY h:mm a")}</p>
            )
        }
    }

    CategoryFormatter(cell, row) {
        if (row["Quantity"] != null) {
            return (
                <p>{row["CategorySubCategory"]} <b> : </b> {row["Quantity"]} </p>
            )
        }
        else {
            return (
                <p>{row["CategorySubCategory"]} </p>
            )
        }
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

    DepatmentClientFormatter(cell, row) {
        return <p >  {row["Department_Id"] == null ? row["ClientName"] : row["Department"]} </p>
    }  
}

export default ToDoInHold;