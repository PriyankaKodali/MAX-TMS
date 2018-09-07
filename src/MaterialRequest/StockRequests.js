import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config';
import Select from 'react-select';
import { MyAjax } from '../MyAjax';
import { toast } from 'react-toastify';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;


function trClassFormat(row, rowIdx) {
    return "pointer";
}

class StockRequests extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Clients: [], Client: '', Projects: [], Project: null, ToDate: moment().format("YYYY-MM-DD"),
            FromDate: moment().startOf('week').format("YYYY-MM-DD"), SearchClick: true,
            dataTotalSize: 1, currentPage: 1, sizePerPage: 10, Status: '', IsDataAvailable: false

        }
    }

    componentWillMount() {

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })

        var url = ApiUrl + "/api/Stock/GetStockRequests?client=" + this.state.Client +
            "&project=" + this.state.Project + "&fromDate=" + this.state.FromDate +
            "&toDate=" + moment(this.state.ToDate).add(1, 'days').format("YYYY-MM-DD") +
            "&status=" + this.state.Status + "&page=" + this.state.currentPage +
            "&count=" + this.state.sizePerPage

        MyAjax(
            url,
            (data) => {
                this.setState({
                    StockRequestsList: data["stockRequests"], dataTotalSize: data["TotalCount"],
                    currentPage: this.state.currentPage, sizePerPage: this.state.sizePerPage,
                    IsDataAvailable: true
                })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )

    }

    GetStockRequests(page, count) {

        if (this.refs.fromDate.value == '') {
            this.setState({ FromDate: moment().startOf('week').format("YYYY-MM-DD") })
        }
        if (this.refs.toDate.value == '') {
            this.setState({ ToDate: moment().format("YYYY-MM-DD") })
        }

        var url = ApiUrl + "/api/Stock/GetStockRequests?client=" + this.state.Client +
            "&project=" + this.state.Project + "&fromDate=" + this.state.FromDate +
            "&toDate=" + moment(this.state.ToDate).add(1, 'days').format("YYYY-MM-DD") +
            "&status=" + this.state.Status + "&page=" + page + "&count=" + count

        MyAjax(
            url,
            (data) => {
                this.setState({
                    StockRequestsList: data["stockRequests"], dataTotalSize: data["TotalCount"],
                    currentPage: page, sizePerPage: count, IsDataAvailable: true
                })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )

    }

    render() {
        return (
            <div className="container">

                <div className="col-xs-12" style={{ marginTop: '0.5%' }}>
                    <a style={{ cursor: 'pointer' }} >
                        <h3 className="col-xs-12 formheader" style={{ paddingRight: '10px' }} >Stock Requests
                            <button type="button" className="pull-right" onClick={() => { this.setState({ SearchClick: !this.state.SearchClick }) }} >
                                <span className="glyphicon glyphicon-chevron-down pull-right f12" ></span>
                            </button>

                            <button type="button" className="pull-right" onClick={() => this.props.history.push("/Project")} >
                                <span className="glyphicon glyphicon-plus pull-right f12" ></span>
                            </button>
                        </h3>
                    </a>

                </div>

                {
                    this.state.SearchClick ?

                        <div className="col-xs-12" >
                            <div className="col-xs-12 SearchContainerStyle">
                                <div className="col-md-2">
                                    <label>Client </label>
                                    <Select className="form-control" ref="client" placeholder="Select Client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
                                </div>

                                <div className="col-md-3">
                                    <label>Project </label>
                                    <Select className="form-control" ref="project" placeholder="Select Project" value={this.state.Project} options={this.state.Projects} onChange={this.ProjectChanged.bind(this)} />
                                </div>

                                <div className="col-md-2">
                                    <label> From Date </label>
                                    <input className="form-control" type="date" ref="fromDate" defaultValue={this.state.FromDate} onChange={this.handleSearch.bind(this)} />
                                </div>

                                <div className="col-md-2">
                                    <label> To Date </label>
                                    <input className="form-control" type="date" ref="toDate" defaultValue={this.state.ToDate} onChange={this.handleSearch.bind(this)} />
                                </div>

                                <div className="col-md-2">
                                    <label>Status</label>
                                    <Select className="form-control" value={this.state.Status} name="status" ref="status" placeholder="Status"
                                        options={[{ label: "Approved", value: "Approved" }, { label: "Declined", value: "Declined" }, { label: "Dispatched", value: "Dispatched" }, { label: "Under Review", value: "Under Review" }]}
                                        onChange={this.StatusChanged.bind(this)} />
                                </div>

                                <div className="col-md-1" style={{ paddingTop: '25px' }}>
                                    <button type="submit" className="btn btn-default" name="clear" value="Clear" onClick={this.clearClick.bind(this)}> Clear</button>
                                </div>
                            </div>
                        </div>

                        :
                        ""
                }

                <div className="col-xs-12" key={this.state.IsDataAvailable}>
                    {this.state.IsDataAvailable ?
                        <BootstrapTable striped hover pagination={true}
                            data={this.state.StockRequestsList} trClassName={trClassFormat}
                            fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                            options={{
                                sizePerPage: this.state.sizePerPage,
                                sizePerPageList: [{ value: 10, text: "10" }, { value: 25, text: "25" },
                                { value: this.state.dataTotalSize, text: "ALL" }],
                                onPageChange: this.onPageChange.bind(this),
                                page: this.state.currentPage,
                                onSizePerPageList: this.onSizePerPageList.bind(this),
                                paginationPosition: 'bottom',
                                onRowClick: this.handleRowClick.bind(this)

                            }}
                        >
                            <TableHeaderColumn dataField="RequestDate" isKey={true} dataAlign="left" width="15" dataFormat={this.dateFormat.bind(this)}> Date</TableHeaderColumn>
                            <TableHeaderColumn dataField="ShortName" dataAlign="left" width="20" > Client</TableHeaderColumn>
                            <TableHeaderColumn dataField="ProjectName" dataAlign="left" width="45" >Project </TableHeaderColumn>
                            {
                                sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ?
                                    <TableHeaderColumn dataField="EmployeeName" dataAlign="left" width="20" > Request by</TableHeaderColumn>
                                    :
                                    <TableHeaderColumn dataField="x" width="0"></TableHeaderColumn>
                            }
                            <TableHeaderColumn dataField="Status" dataAlign="left" width="15" >Status</TableHeaderColumn>
                            <TableHeaderColumn dataAlign="center" width="5" dataFormat={this.editFormatter.bind(this)}></TableHeaderColumn>
                        </BootstrapTable>
                        :
                        <div className="loader visble"></div>
                    }
                </div>

            </div>
        )
    }



    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val.value, Project: null, Projects: [] }, () => {
                $.ajax({
                    url: ApiUrl + "/api/Client/GetClientProjects?clientId=" + val.value,
                    type: "get",
                    success: (data) => {
                        this.setState({ Projects: data["clientProjects"] }, () => {
                            this.GetStockRequests(this.state.currentPage, this.state.sizePerPage)
                        })
                    }
                })
            })
        }
        else {
            this.setState({ Client: '', Project: null, Projects: [] }, () => {
                this.GetStockRequests(this.state.currentPage, this.state.sizePerPage)
            });
        }
    }

    ProjectChanged(val) {
        if (val) {
            this.setState({ Project: val.value }, () => {
                this.GetStockRequests(this.state.currentPage, this.state.sizePerPage)
            })
        }
        else {
            this.setState({ Project: null }, () => {
                this.GetStockRequests(this.state.currentPage, this.state.sizePerPage)
            })
        }
    }

    StatusChanged(val) {
        if (val) {
            this.setState({ Status: val.value }, () => {
                this.GetStockRequests(this.state.currentPage, this.state.sizePerPage)
            })
        }
        else {
            this.setState({ Status: null }, () => {
                this.GetStockRequests(this.state.currentPage, this.state.sizePerPage)
            })
        }
    }

    handleSearch() {
        this.setState({ FromDate: this.refs.fromDate.value, ToDate: this.refs.toDate.value }, () => {
            this.GetStockRequests(this.state.currentPage, this.state.sizePerPage)
        })
    }

    clearClick() {
        this.refs.fromDate.value = moment().startOf('week').format("YYYY-MM-DD");
        this.refs.toDate.value = moment().format("YYYY-MM-DD");

        this.setState({
            Client: '', Project: null, FromDate: moment().startOf('week').format("YYYY-MM-DD"),
            ToDate: moment().format("YYYY-MM-DD"), Status: ''
        }, () => {
            this.GetStockRequests(this.state.currentPage, this.state.sizePerPage)
        })
    }


    handleRowClick(row) {
        this.props.history.push("/EditStockRequest/" + row["Id"]);
    }

    editFormatter(cell, row) {
        return (
            <a>
                <i className="glyphicon glyphicon-edit" style={{ fontSize: '14px', cursor: 'pointer' }} title="Edit" onClick={() => this.props.history.push("/EditStockRequest/" + row["Id"])} ></i>
            </a>
        )
    }
    dateFormat(cell, row) {
        return (
            <p> {moment(row["RequestDate"]).format("DD-MMM-YYYY")} </p>
        )
    }

    onPageChange(page, sizePerPage) {
        this.GetStockRequests(page, sizePerPage)
    }

    onSizePerPageList(sizePerPage) {
        this.GetStockRequests(this.state.currentPage, sizePerPage);
    }


}
export default StockRequests;

// $.ajax({
        //     url: url,
        //     type: "get",
        //     success: (data) => {
        //         this.setState({
        //             StockRequestsList: data["stockRequests"], dataTotalSize: data["TotalCount"],
        //             currentPage: page, sizePerPage: count
        //         })
        //     }
        // })