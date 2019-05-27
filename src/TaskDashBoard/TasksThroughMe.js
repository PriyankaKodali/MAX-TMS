import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl, remote } from '../Config';
import { MyAjax } from '../MyAjax.js';
import { toast } from 'react-toastify';
import { matchPath } from 'react-router'
import {SearchCriteria} from '../Globals';

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

class TasksThroughMe extends Component {

    constructor(props) {
        super(props);
         this.state = {
            TasksThroughMe: [], currentPage: 1, sizePerPage: 50, dataTotalSize: 1, isDataAvailable: true,
            TaskThroughMeSummary:[], sortCol: 'CreatedDate' , sortDir: 'desc',showTaskThroughMe: true,
            Client:'', Department:'',TaskFrom:'', Priority:null, Status:'', 
            SearchCriteria: this.props.SearchCriteria,
        }
    }
 componentWillMount() {
        this.setState({
            Client: this.props.SearchCriteria.client, Priority: this.props.SearchCriteria.priority,
            Department: this.props.SearchCriteria.department, Status: this.props.SearchCriteria.status,
            EmpId: this.props.SearchCriteria.empId, TaskFrom: this.props.SearchCriteria.taskFrom
        }, () => {
            this.GetTasksThroughMe(this.state.currentPage, this.state.sizePerPage)
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            Client: nextProps.SearchCriteria.client, Priority: nextProps.SearchCriteria.priority,
            Department: nextProps.SearchCriteria.department, Status: nextProps.SearchCriteria.status,
            EmpId: nextProps.SearchCriteria.empId, TaskFrom: nextProps.SearchCriteria.taskFrom
        }, () => {
            this.GetTasksThroughMe(this.state.currentPage, this.state.sizePerPage)
        })
    }


  
    GetTasksThroughMe(page, count) {
        var url = ApiUrl + "/api/Activities/GetTasksThroughMe?EmpId=" + this.state.EmpId +
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
            <div key={this.state.TasksThroughMe} >
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
                                        sizePerPageList: [{ text: '25', value: 25 },
                                        { text: '50', value: 50 },
                                        { text: 'ALL', value: this.state.TaskThroughMeDataTotalSize }],
                                        page: this.state.currentPage,
                                        onSizePerPageList: this.onTaskThroughMeSizePerPageList.bind(this),
                                        paginationPosition: 'bottom',
                                        onSortChange: this.onTaskThroughMeSortChange.bind(this),
                                        onRowClick: this.rowClicked.bind(this)
                                    }}>

                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="left" width="15" dataSort={true} dataFormat={this.TicketFormatter.bind(this)} > TicketId</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Department" dataAlign="left" width="11" dataSort={true} dataFormat={this.DepatmentClientFormatter.bind(this)} >Client/Department</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CategorySubCategory" dataAlign="left" width="27" dataSort={true} dataFormat={this.CategoryFormatter.bind(this)} >Category</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Subject" dataAlign="left" width="43" dataSort={true} >Subject</TableHeaderColumn>
                                    {/* <TableHeaderColumn dataField="Priority" dataAlign="left" width="14" dataSort={true} dataFormat={this.priorityFormatter.bind(this)}> Priority </TableHeaderColumn> */}
                                    <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="14" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)} > Created </TableHeaderColumn>
                                    <TableHeaderColumn dataField="EmpCreatedBy" dataAlign="left" width="16" dataSort={true} >Created By</TableHeaderColumn>
                                    <TableHeaderColumn dataField="LastUpdatedBy" dataAlign="left" width="18" dataSort={true} >Updated </TableHeaderColumn>
                                    <TableHeaderColumn dataField="LastUpdated" dataAlign="left" width="14" dataSort={true} dataFormat={this.LastUpdatedFormatter.bind(this)} > Last Updated </TableHeaderColumn>
                                    <TableHeaderColumn dataField="EmpTaskOwner" dataAlign="left" width="16" dataSort={true} >Owner </TableHeaderColumn>
                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="12" dataSort={true} >Status </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="8" dataSort={true} dataAlign="center" >TAT </TableHeaderColumn>
                                    {/* <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="6" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn> */}
                                </BootstrapTable>
                            </div>
                            :
                            <div className="loader visble"></div>
                        :
                        <div />
                }
            </div>
        )
    }

    
    rowClicked(row) {
        this.gotoEditTask(row.RowNum,row.TaskId, row.CreatedBy, row.TaskOwner, row.Status, row.Notifications);
    }

    gotoEditTask(RowId,TaskId, CreatedBy, TaskOwner, Status, Notification) {

       // var currentLogin = this.props.match.params["id"] != null ? this.props.match.params["id"] : sessionStorage.getItem("EmpId")
        var currentLogin = this.props.location.state != null ? this.props.location.state["EmpId"] : sessionStorage.getItem("EmpId")
        var EmployeeName= this.props.location.state!=null ? this.props.location.state["EmployeeName"]: ""
        var criteria= this.state.SearchCriteria;
        
        criteria.user= currentLogin;
        criteria.client= this.state.Client;
        criteria.department= this.state.Department;
        criteria.taskType= this.state.TaskFrom;
        criteria.priority= this.state.Priority;
        criteria.status = this.state.Status;
        criteria.sortCol= this.state.sortCol;
        criteria.sortDir= this.state.sortDir;
        criteria.taskCategory = "ThroughMe";
        criteria.screen = "Others";
          
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
                EmployeeName:EmployeeName
            },
            pathname: "/ViewTask"
        })

    }

    onTaskThroughMePageChange(page, sizePerPage) {
        this.GetTaskThroughMe(page, sizePerPage);
    }

    onTaskThroughMeSizePerPageList(sizePerPage) {
        this.GetTaskThroughMe(this.state.currentPage, sizePerPage);
    }

    onTaskThroughMeSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        }, () => {
            this.GetTasksThroughMe(this.state.currentPage, this.state.sizePerPage);
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

export default TasksThroughMe;