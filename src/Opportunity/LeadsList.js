import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl, remote } from '../Config';
import Select from 'react-select';
import './Opportunity.css';
import { MyAjax } from '../MyAjax';
import { toast } from 'react-toastify';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;

function trClassFormat() {
    return "pointer";
}

class LeadsList extends Component {

    constructor(props) {
        super(props);
        var Statuses = [{ value: "ShowingInterest", label: "Showing Interest" }, { value: "Accepted", label: "Accepted" },
        { value: "In Process", label: "Work In Process" }, { value: "Completed", label: "Completed" },
        { value: "Declined", label: "Declined" }]
        this.state = {
            Leads: [], Statuses: Statuses, Status: '', currentPage: 1, sizePerPage: 25,
            dataTotalSize: 1, Opportunity: '', Client: '', AssignTo: '', searchClick: false,
            Organisations: [], Organisation: '', FromDate: '', ToDate: '',
        }
    }

    componentWillMount() {
        var orgId = sessionStorage.getItem("roles").indexOf("Admin") !== -1 ? null : sessionStorage.getItem("OrgId")

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetOrganisations",
            type: "get",
            success: (data) => { this.setState({ Organisations: data["organisations"] }) }
        })

        if (this.props.location.state) {
            var fromDate = this.props.location.state["fromDate"] != '' ? moment(this.props.location.state["fromDate"]).format("YYYY-MM-DD") : '';
            var toDate = this.props.location.state["toDate"] != '' ? moment(this.props.location.state["toDate"]).format("YYYY-MM-DD") : '';
            var status = this.props.location.state["status"];

            this.setState({
                FromDate: fromDate, ToDate: toDate, Status: status
            }, () => { this.getOpportunitiesList(this.state.currentPage, this.state.sizePerPage); })
        }
        else {
            this.getOpportunitiesList(this.state.currentPage, this.state.sizePerPage);
        }


    }

    getOpportunitiesList(page, count) {

        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")

        MyAjax(
            ApiUrl + "/api/Opportunity/GetLeadsList?fromDate=" + this.state.FromDate + "&toDate=" + this.state.ToDate +
            "&opportunity=" + this.state.Opportunity + "&client=" + this.state.Client +
            "&assignTo=" + this.state.AssignTo + "&status=" + this.state.Status +
            "&orgId=" + this.state.Organisation + "&page=" + page + "&count=" + count,
            (data) => this.setState({
                Leads: data["opportunities"],
                dataTotalSize: data["totalCount"], isDataAvailable: true
            }),
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }

    render() {
        return (
            <div className="container" style={{ marginTop: '1%' }}>
                <div className="col-xs-12 " >
                    <h3 className="col-md-12 formheader"> Leads
                        <span className="glyphicon glyphicon-chevron-down pull-right spanborder" onClick={() => this.setState({ searchClick: !this.state.searchClick })}></span>
                        <span className="glyphicon glyphicon-plus pull-right" onClick={() => this.props.history.push("/Opportunity")}></span>
                    </h3>
                </div>
                {
                    this.state.searchClick ?
                        <form >
                            <div className="col-xs-12">
                                <div className="SearchContainerStyle" style={{ paddingTop: '10px' }}>
                                    <div className="col-xs-12">
                                        <div className="col-md-2 form-group">
                                            <label>Created From Date </label>
                                            <input type="date" className="form-control" placeholder="From Date" defaultValue={this.state.FromDate} ref="fromDate" />
                                        </div>
                                        <div className="col-md-2 form-group">
                                            <label>Created To date</label>
                                            <input type="date" className="form-control" placeholder="To Date" defaultValue={this.state.ToDate} ref="toDate" />
                                        </div>
                                        <div className="col-md-2 form-group">
                                            <label>Opportunity</label>
                                            <input type="text" className="form-control" placeholder="Opportunity" ref="opportunity" />
                                        </div>
                                        <div className="col-md-2 form-group">
                                            <label>Client</label>
                                            <Select className="form-control" placeholder="select Client" ref="client" value={this.state.Client} options={this.state.Clients} onChange={this.clientChanged.bind(this)} />
                                        </div>
                                        <div className="col-md-2 form-group">
                                            <label>Assigned To</label>
                                            <input type="text" className="form-control" placeholder="Assigned To" ref="assignedTo" />
                                        </div>
                                        <div className="col-md-2 form-group">
                                            <label>Status</label>
                                            {/* <input type="text" className="form-control" placeholder="Status" ref="status" defaultValue={this.state.Status} /> */}
                                            <Select className="form-control" placeholder="select status" ref="client" value={this.state.Status} options={this.state.Statuses} onChange={this.statusChanged.bind(this)} />
                                        </div>
                                    </div>
                                    <div className="col-xs-12">
                                        <div className="col-md-3 form-group">
                                            <Select className="form-control" placeholder="Organisation" ref="client" value={this.state.Organisation} options={this.state.Organisations} onChange={this.orgChanged.bind(this)} />
                                        </div>
                                        <div className="col-md-9 button-block" style={{ textAlign: 'center' }}>
                                            <button type="button" className="btn btn-primary" name="button" value="Submit" onClick={this.handleSearchClick.bind(this)} > Submit </button>
                                            <input type="button" className="mleft10 btn btn-default" value="Clear" onClick={this.clearClick.bind(this)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        :
                        <div />
                }
                <div className="col-xs-12">
                    <BootstrapTable striped hover data={this.state.Leads}
                        selectRow={this.state.selectRowProp} pagination={true}
                        trClassName={trClassFormat} remote={remote}
                        fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                        options={{
                            sizePerPage: this.state.sizePerPage,
                            onPageChange: this.onPageChange.bind(this),
                            sizePerPageList: [{ text: '25', value: 25 },
                            { text: '50', value: 50 },
                            { text: 'ALL', value: this.state.dataTotalSize }],
                            page: this.state.currentPage,
                            onSizePerPageList: this.onSizePerPageList.bind(this),
                            paginationPosition: 'bottom',
                            onRowClick: this.rowClicked.bind(this)

                        }}
                    >
                        <TableHeaderColumn dataField="CreatedDate" dataSort={true} dataAlign="left" dataFormat={this.dateFormat.bind(this)} width="18" > Created Date  </TableHeaderColumn>
                        <TableHeaderColumn dataField="OpportunityName" isKey={true} dataSort={true} width="25"> Opportunity   </TableHeaderColumn>
                        <TableHeaderColumn dataField="Client" dataSort={true} dataAlign="left" width="35" > Client  </TableHeaderColumn>
                        <TableHeaderColumn dataField="AssignedTo" dataSort={true} dataAlign="left" width="30" > Assigned To  </TableHeaderColumn>
                        <TableHeaderColumn dataField="Status" dataSort={true} dataAlign="left" width="30" > Status </TableHeaderColumn>
                    </BootstrapTable>
                </div>

            </div>
        )
    }

    rowClicked(row) {
        this.props.history.push("OpportunityDetail/" + row["Id"]);
    }

    clientChanged(val) {
        if (val) {
            this.setState({ Client: val })
        }
        else {
            this.setState({ Client: '' })
        }
    }

    statusChanged(val) {
        this.setState({ Status: val })
    }

    orgChanged(val) {
        this.setState({ Organisation: val });
    }

    handleSearchClick(e) {
        e.preventDefault();
        var fromDate = this.refs.fromDate.value != "" ? moment(this.refs.fromDate.value).format("YYYY-MM-DD") : '';
        var toDate = this.refs.toDate.value != "" ? moment(this.refs.toDate.value).format("YYYY-MM-DD") : '';
        var opportunity = this.refs.opportunity.value;
        var assignTo = this.refs.assignedTo.value;
        var status = this.state.Status != '' ? this.Status.value : '';
        var organisation = this.state.Organisation != '' ? this.state.Organisation.value : "";
        var client = this.state.Client != '' ? this.state.Client.value : '';

        this.setState({
            Opportunity: opportunity, FromDate: fromDate, ToDate: toDate, AssignTo: assignTo,
            Status: status, Organisation: organisation, Client: client
        }, () => {
            this.getOpportunitiesList(this.state.currentPage, this.state.sizePerPage);
        })
    }

    // SearchClick() {
    //     this.setState({
    //         Opportunity: this.refs.opportunity.value,
    //         AssignTo: this.refs.assignedTo.value,
    //         Status: this.refs.status.value
    //     }, () => {
    //         if (this.state.Client !== '') {
    //             this.setState({ Client: this.state.Client.value }, () => {
    //                 this.getOpportunitiesList(this.state.currentPage, this.state.sizePerPage);
    //             })
    //         }
    //         else {
    //             this.getOpportunitiesList(this.state.currentPage, this.state.sizePerPage);
    //         }
    //     })

    // }

    clearClick() {
        this.refs.opportunity.value = '';
        this.refs.assignedTo.value = '';
        this.state.Client = null;

        this.setState({
            Opportunity: this.refs.opportunity.value, AssignTo: this.refs.assignedTo.value,
            Status: '', Client: ''
        }, () => {
            this.getOpportunitiesList(this.state.currentPage, this.state.sizePerPage);
        })
    }

    editDataFormatter(cell, row) {
        return (
            <a>
                <i className="glyphicon glyphicon-edit" style={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => this.props.history.push("/EditOpportunity/" + row["Id"])} > </i>
            </a>
        )
    }

    dateFormat(cell, row) {
        return (
            <p> {moment(row["CreatedDate"]).format("DD-MM-YYYY")} </p>
        )
    }

    onPageChange(page, sizePerPage) {
        this.getOpportunitiesList(page, sizePerPage)
    }

    onSizePerPageList(sizePerPage) {
        this.getOpportunitiesList(this.state.currentPage, sizePerPage)
    }
}

export default LeadsList;