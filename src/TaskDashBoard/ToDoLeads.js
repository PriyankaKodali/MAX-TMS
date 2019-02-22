import React,  {Component} from 'react';
import $ from 'jquery';
import { ApiUrl, remote } from '../Config';
import {MyAjax} from '../MyAjax.js';
import {toast} from 'react-toastify';
import { matchPath } from 'react-router'

var moment= require('moment');
var ReactBSTable= require('react-bootstrap-table');
var BootStrapTable= ReactBSTable.BootstrapTable;
var TableHeaderColumn= ReactBSTable.TableHeaderColumn;


function trClassFormat(row, rowIdx) {
    return "trStatusClosed pointer";
}

class ToDoLeads extends Component{
    constructor(props){
        super(props);
        this.state={
            ToDoLeads:[], currentPage:1, sizePerPage:50, dataTotalSize:0, IsDataAvailable:true,todo:false,
            TotalCount:0, Status:'', Client:'', Department: null,sortCol: 'CreatedDate', sortDir: 'desc',
            ViewToDoLeads:true,TaskFrom: '',
        }
    }
    componentWillMount(){
           this.GetToDoLeads(this.state.currentPage, this.state.sizePerPage);
    }

    GetToDoLeads(page, count){

       // var empId = this.props.match.params["id"] != null ? this.props.match.params["id"] : sessionStorage.getItem("EmpId")

        var url=ApiUrl + "/api/Opportunity/GetMyLeads?EmpId="+ this.props.EmpId + 
        "&clientId=" + this.state.Client +
        "&departmentId=" + this.state.Department +
        "&taskType=" + this.state.TaskFrom +
        "&status=" + this.state.Status +
        "&page=" + page + "&count=" + count +
        "&sortCol=" + this.state.sortCol +
        "&sortDir=" + this.state.sortDir

        MyAjax(
            url,
            (data) => {
                this.setState({
                    ToDoLeads: data["leads"], TotalCount: data["totalRecords"], IsDataAvailable: true,
                     currentPage: page, sizePerPage: count  })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }

    render(){
        return(
            <div key={this.state.ToDoLeads}>
                {
                    this.state.ToDoLeads.length>0 ?
                         this.state.IsDataAvailable ?
                              <div>
                                 <div className="col-xs-12" style={{ marginTop: '0.5%' }}>
                                      <a onClick={() => this.setState({ ViewToDoLeads: !this.state.ViewToDoLeads })} style={{ cursor: 'pointer' }} >
                                         <h3 className="col-xs-12 formheader">To Do leads
                                           <span className="job-summary-strip">
                                                <span> Total Tasks :  {this.state.TotalCount}  </span>
                                            </span>
                                            <span className={(this.state.ViewToDoLeads ? "up" : "down") + " fa fa-angle-down pull-right mhor10 f18 arrow"}>
                                            </span></h3> 
                                        </a>
                                    </div>
                                     
                                     {
                                        this.state.ViewToDoLeads ?
                                          <div className="col-xs-12">
                                              <BootStrapTable data={this.state.ToDoLeads} striped hover remote={remote} pagination={true} 
                                                  trClassName={trClassFormat}
                                                   fetchInfo={{dataTotalSize : this.state.TotalCount}}
                                                    options={{
                                                       sizePerPage: this.state.sizePerPage,
                                                       onPageChane: this.onPageChange.bind(this),
                                                       sizePerPageList: [{ text: '25', value: 25 },
                                                         { text: '50', value: 50 },
                                                         { text: 'ALL', value: this.state.TotalCount }],
                                                         page: this.state.currentPage,
                                                         onSizePerPageList: this.onSizePerPageList.bind(this),
                                                         paginationPosition:"bottom",
                                                         onSortChange: this.onSortChange.bind(this),
                                                         onRowClick: this.rowClicked.bind(this)
                                                  }}
                                                 >
                                                 <TableHeaderColumn dataField="OpportunityName" isKey={true} dataAlign="left" dataSort={true}> Project</TableHeaderColumn>
                                                 <TableHeaderColumn dataField="Client" dataAlign="left" dataSort={true} >Client</TableHeaderColumn>
                                                 <TableHeaderColumn dataField="CreatedDate" dataAlign="left" dataSort={true} dataFormat={this.CreatedDateFormat.bind(this)} >CreatedDate</TableHeaderColumn>
                                                 <TableHeaderColumn dataField="OppCreator"  dataAlign="left" dataSort={true} > Created By</TableHeaderColumn>
                                                 <TableHeaderColumn dataField="LastUpdated" dataAlign="left" dataSort={true} dataFormat={this.lastUpdateDateFormat.bind(this)} >Last Updated</TableHeaderColumn>
                                                 <TableHeaderColumn dataField="OppLastUpdate" dataAlign="left" dataSort={true} > Updated By </TableHeaderColumn>
                                                 <TableHeaderColumn dataField="OppOwner" dataAlign="left" dataSort={true} >Task Owner</TableHeaderColumn>
                                                 <TableHeaderColumn dataField="Status" dataAlign="left" dataSort={true} >Status</TableHeaderColumn>
                                                 <TableHeaderColumn dataField="TAT" dataAlign="left" dataSort={true} >TAT</TableHeaderColumn>
                                              
                                                </BootStrapTable>
 
                                            </div>
                                         :
                                         <div />
                                     }
                                </div>
                                :
                                <div className="loader visible"></div>
                         :
                         <div></div>
                        
                }
            </div>
        )
    }

    CreatedDateFormat(cell,row){
        return(
            <p>{moment(row["CreatedDate"]).format("DD-MMM-YYYY hh:mm A")}</p>
        )
    }

    lastUpdateDateFormat(cell,row){
        if(row["LastUpdated"]!=null)
        {
            return(
                <p> {moment(row["LastUpdated"]).format("DD-MMM-YYYY hh:mm A")}</p>
            )
        }
        
    }

    onPageChange(page, sizePerPage) {
        this.GetToDoLeads(page, sizePerPage)
    }

    onSizePerPageList(sizePerPage) {
        this.GetToDoLeads(this.state.currentPage, sizePerPage);
    }

    rowClicked(row){
        var url = "/OpportunityDetail/"+ row["Id"];
        this.props.history.push("/OpportunityDetail/" + row["Id"])    
    }

    onSortChange(sortCol, sortDir) {
        sortDir = this.state.sortCol === sortCol && this.state.sortDir === "asc" ? "desc" : "asc";
        this.setState({
            sortCol: sortCol,
            sortDir: sortDir
        }, () => {
            this.GetToDoLeads(this.state.currentPage, this.state.sizePerPage);
        });
    }


}

export default ToDoLeads;