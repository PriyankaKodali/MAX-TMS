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
            ToDos: null, AssignedByMe: null, AssignedThroughMe: null, TaskType: { value: 'all', label: 'All' },
            ClientType: null, Status: null, Priority: null, Department: null, Departments: [],
            currentPage: 1,
            sizePerPage: 10,
            dataTotalSize: 0, sortCol: 'Name',
            sortDir: 'asc',
            TaskFrom: { value: 'all', label: 'All' },
            Clients:[], Client:null, Departmnets:[], Department:null
        }
    }
    componentWillMount() {
    }

    render() {
        return (
            <div style={{ marginTop: '5.5%' }}>

                <div className="col-xs-12 taskLayout">
                    <div style={{ marginTop: '1%' }}>

                        <div className="col-md-2 form-group">
                            <label>Task from </label>
                            <div className="form-group">
                                <Select className="form-control" name="TaskType" placeholder="Task Type" value={this.state.TaskFrom}
                                    options={[{ value: 'all', label: 'All' }, { value: 'Client', label: 'Client' }, { value: 'Offc', label: 'Office' }]}
                                    onChange={this.taskFromChanged.bind(this)}
                                />
                            </div>
                        </div>

                        {
                            this.state.TaskFrom.value === "Client" ?
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

                                this.state.TaskFrom.value === "Offc" ?

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
                                    options={[{ value: 'Pending', label: 'Pending' }, { value: 'Open', label: 'Open' }, { value: 'Closed', label: 'Closed' }]}
                                    onChange={this.StatusChanged.bind(this)}
                                />
                            </div>
                        </div>

                        <div className="col-md-2 button-block text-center">
                            <input type="button" className="btn btn-default" style={{ marginTop: '14%' }} value="Clear" onClick={this.ClearClick.bind(this)} />
                        </div>
                    </div>
                </div>

                {
                    this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksOnMe" ?
                        <div>
                            <div className="col-xs-12 myContainerHeading" style={{ paddingTop: '10px' }}>
                                <h4> Tasks on me</h4>
                            </div>
                            <div style={{ marginTop: '1%' }}>
                                <BootstrapTable striped hover remote={true} pagination={true}
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
                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="left" width="12" dataSort={true} > Ticket Number</TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskName" dataAlign="left" width="35" dataSort={true} > Subject</TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskName" dataAlign="left" width="15" dataSort={true}> Created Date</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CreatedBy" dataAlign="left" width="20" dataSort={true} >Created By</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="15" dataSort={true} > Priority </TableHeaderColumn>
                                    <TableHeaderColumn dataField="Category" dataAlign="left" width="20" dataSort={true} >Category/SubCategory</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="25" dataSort={true} >Status </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="10" dataSort={true} >TAT </TableHeaderColumn>
                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="10" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                </BootstrapTable>
                            </div>
                        </div>
                        : <div />

                }

                {
                    this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksByMe" ?
                        <div>
                            <div className="col-xs-12 myContainerHeading" style={{ paddingTop: '10px' }}>
                                <h4> Tasks Assigned by me</h4>
                            </div>
                            <div style={{ marginTop: '1%' }}>
                                <BootstrapTable striped hover remote={true} pagination={true}
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
                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="left" width="12" dataSort={true} > Ticket Number</TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskName" dataAlign="left" width="14" dataSort={true} > Task Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CratedDate" dataAlign="left" width="12" dataSort={true} > Created Date</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CreatedBy" dataAlign="left" width="20" dataSort={true} >Created By</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="12" dataSort={true}> Priority </TableHeaderColumn>
                                    <TableHeaderColumn dataField="Category" dataAlign="left" width="22" dataSort={true} >Catogory/ SubCategory</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="25" dataSort={true} >Status </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="15" dataSort={true} >TAT </TableHeaderColumn>
                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="10" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                </BootstrapTable>
                            </div>

                        </div>
                        : <div />
                }

                {
                    this.state.TaskType.value == "all" || this.state.TaskType.value === "tasksThroughMe" ?
                        <div>
                            <div className="col-xs-12 myContainerHeading" style={{ paddingTop: '10px' }}>
                                <h4> Assigned through me</h4>
                            </div>

                            <div style={{ marginTop: '1%' }}>
                                <BootstrapTable striped hover remote={true} pagination={true}
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
                                    }}>

                                    <TableHeaderColumn dataField="TaskId" isKey={true} dataAlign="left" width="15" > Ticket Number</TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskName" dataAlign="left" width="15" > Task Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField="TaskName" dataAlign="left" width="15"  > Created Date</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CreatedBy" dataAlign="left" width="20"  >Created By</TableHeaderColumn>
                                    <TableHeaderColumn dataField="Priority" dataAlign="left" width="15" > Priority </TableHeaderColumn>
                                    <TableHeaderColumn dataField="Category" dataAlign="left" width="22"  >Catogory/SubCategory</TableHeaderColumn>
                                    {/* <TableHeaderColumn dataField="ExpectedDateOfClouser" dataAlign="center" width="25"  >Expected DOC</TableHeaderColumn> */}
                                    <TableHeaderColumn dataField="Status" dataAlign="left" width="25" >Status </TableHeaderColumn>
                                    <TableHeaderColumn dataField="TAT" dataAlign="left" width="15"  >TAT </TableHeaderColumn>
                                    <TableHeaderColumn columnClassName="edit" dataField="Edit" dataAlign="center" width="10" dataFormat={this.editDataFormatter.bind(this)} ></TableHeaderColumn>
                                </BootstrapTable>
                            </div>
                        </div>
                        :
                        <div />
                }

            </div>

        )
    }
    editDataFormatter(cell, row) {

    }

    ClearClick() {

        this.state.Priority = "";
        this.state.TaskType = { value: 'all', label: 'All' };
        this.state.TaskFrom = { value: 'all', label: 'All' };
        this.state.Status = "";

        this.setState({
            Priority: this.state.Priority,
            TaskType: this.state.TaskType,
            Status: this.state.Status,
            TaskFrom: this.state.TaskFrom
        })
    }

    StatusChanged(val) {

        if (val) {
            this.setState({ Status: val })
        }
        else {
            this.setState({ Status: '' })
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

    taskTypeChanged(val) {
        if (val) {
            this.setState({ TaskType: val })
        }
        else {
            this.setState({ TaskType: '' })
        }
    }

    taskFromChanged(val) {
        if (val) {
            this.setState({ TaskFrom: val })
        }
        else {
            this.setState({ TaskFrom: val })
        }
    }

    onSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        });
    }

    onPageChange(page, sizePerPage) {

    }

    onSizePerPageList(sizePerPage) {

    }


}

export default TaskDashBoard;

{/* <div className="col-xs-3">
<label>Department </label>
<div className="form-group">
    <div className="input-group">
        <span className="input-group-addon" >
            <span className="glyphicon glyphicon-user"></span>
        </span>
        <Select className="form-control" name="Department" ref="department" placeholder="Select Departmnet" value={this.state.Department} options={this.state.Departments} onChange={this.DepartmentChanged.bind(this)} />
    </div>
</div>
</div> */}