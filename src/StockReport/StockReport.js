import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import { Ajax } from '../MyAjax';
import { ApiUrl } from '../Config';
import ProjectStockDetails from './ProjectStockDetails';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;


class StockReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Client: '', Project: null, SearchClick: true, Clients: [], Projects: [], dataTotalSize: 1,
            currentPage: 1, sizePerPage: 10, StockReport: [], StockDetails: [], GetStockDetails: false,
            ProjectName: '', ClientName: ''

        }
    }

    componentWillMount() {
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId");

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })

        this.GetStockReport(this.state.currentPage, this.state.sizePerPage);

    }


    GetStockReport(page, count) {
        $.ajax({
            url: ApiUrl + "/api/Stock/GetStockReport?clientId=" + this.state.Client +
                "&projectId=" + this.state.Project + "&page=" + this.state.currentPage + "&count=" + this.state.sizePerPage,
            type: "get",
            success: (data) => { this.setState({ StockReport: data["stockReport"] }) }
        })
    }

    render() {
        return (
            <div className="container">

                <div className="col-xs-12" style={{ marginTop: '0.5px' }}>
                    <h3 className="col-md-12 formheader" style={{ paddingRight: '10px' }}>  Stock Report
                            <button type="button" className="pull-right" onClick={() => { this.setState({ SearchClick: !this.state.SearchClick }) }} >
                            <span className="glyphicon glyphicon-chevron-down pull-right f12" ></span>
                        </button>
                    </h3>
                </div>

                {
                    this.state.SearchClick ?
                        <div className="col-xs-12">
                            <div className="col-xs-12 SearchContainerStyle">

                                <div className="col-md-3 form-group">
                                    <label> Client </label>
                                    <Select className="form-control" placeholder="Select Client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
                                </div>

                                <div className="col-md-3 form-group" key={this.state.Projects}>
                                    <label> Project </label>
                                    <Select className="form-control" placeholder="Select Project" value={this.state.Project} options={this.state.Projects} onChange={this.ProjectChanged.bind(this)} />
                                </div>

                                <div className="col-md-1 pTop25" >
                                    <button type="submit" className="btn btn-default" name="clear" value="Clear" onClick={this.clearClick.bind(this)} > Clear</button>
                                </div>

                            </div>
                        </div>
                        :
                        <div />
                }

                <div className="col-xs-12" key={this.state.StockReport}>
                    <BootstrapTable striped hover pagination={true}
                        data={this.state.StockReport}
                        fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                        options={{
                            sizePerPage: this.state.sizePerPage,
                            onPageChange: this.onPageChange.bind(this),
                            page: this.state.currentPage,
                            onSizePerPageList: this.onSizePerPageList.bind(this),
                            paginationPosition: "bottom"
                        }}
                    >

                        <TableHeaderColumn dataField="Client" dataSort={true} dataAlign="left" isKey={true} width="30px"> Client </TableHeaderColumn>
                        <TableHeaderColumn dataField="Project" dataSort={true} dataAlign="left" width="30px"> Project </TableHeaderColumn>
                        <TableHeaderColumn dataField="Status" dataAlign="left" dataSort={true} width="15"  > Project Status</TableHeaderColumn>
                        <TableHeaderColumn dataAlign="left" width="20" dataFormat={this.ViewStockDetailsFormat.bind(this)}>  Stock  </TableHeaderColumn>
                    </BootstrapTable>

                </div>

                <div className={this.state.GetStockDetails}>
                    {
                        this.state.GetStockDetails ?
                            <div className="modal fade" id="getProjectStock" role="dialog" data-keyboard="false" data-backdrop="static" key={this.state.AddNewModel}>
                                <div className="modal-dialog modal-lg"  >
                                    <div className="modal-content">

                                        <div className="modal-header " style={{ background: '#f5f3f3', borderBottom: '0px solid', padding: '6px' }}>
                                            <button type="button" className="modelClose btnClose" data-dismiss="modal" id="closeModal"> &times; </button>
                                            <h4 className="col-xs-11  modal-title">
                                                <label> Client : </label> {this.state.ClientName}
                                                <label style={{ paddingLeft: '10px' }}> Project :</label> {this.state.ProjectName}
                                            </h4>
                                        </div>

                                        <div className="modal-body col-xs-12" key={this.state.StockDetails}>
                                            <ProjectStockDetails StockDetails={this.state.StockDetails} ref={(ref) => "addnewModel"} />
                                        </div>

                                        <div className="modal-footer"> </div>

                                    </div>
                                </div>
                            </div>
                            :
                            <div> </div>
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
                            this.GetStockReport(this.state.currentPage, this.state.sizePerPage);
                        })
                    }
                })
            })
        }
        else {
            this.setState({ Client: '', Project: null, Projects: [] }, () => {
                this.GetStockReport(this.state.currentPage, this.state.sizePerPage);
            });
        }
    }

    ProjectChanged(val) {
        if (val) {
            this.setState({ Project: val.value }, () => {
                this.GetStockReport(this.state.currentPage, this.state.sizePerPage);
            })
        }
        else {
            this.setState({ Project: null }, () => {
                this.GetStockReport(this.state.currentPage, this.state.sizePerPage);
            })
        }
    }

    ViewStockDetailsFormat(cell, row) {
        var stock = row["Models"];
        return (
            <a onClick={() => { this.GetProjectStock(stock, row["Project"], row["Client"]) }} >  View Stock Details
            </a>
        );
    }

    clearClick() {
        this.setState({ Client: '', Project: null }, () => {
            this.GetStockReport(this.state.currentPage, this.state.sizePerPage)
        })
    }

    GetProjectStock(stock, project, client) {
        this.setState({
            StockDetails: stock, GetStockDetails: true, ClientName: client,
            ProjectName: project
        }, () => {
            $("#getProjectStock").modal('show');
        })
    }


    onPageChange(page, sizePerPage) {
        this.GetStockReport(page, sizePerPage);
    }
    onSizePerPageList(sizePerPage) {
        this.GetStockReport(this.state.currentPage, sizePerPage);
    }


}

export default StockReport;