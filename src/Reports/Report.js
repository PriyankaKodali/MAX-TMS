import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '../Config';
import { showErrorsForInput } from '../Validation';
import { toast } from 'react-toastify';
import { MyAjax } from '.././MyAjax.js';
import validate from 'validate.js';
import './Report.css';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;

class Report extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Employee: '', Employees: [], EmployeeReport: false, dataTotalSize: null, Client: '',
            Clients: [], EmployeesList: [], EmployeeTaskReport: [], 
            Priority: null, 
           Status:'NotResolved',
             SearchClick: false,
            EmpTasksReport: [], EmployeeName: null, RecordsAvailable: true, TotalCount: null, TaskPriority: null,
            TaskId: '', ToDate:null,  FromDate: null,  ReportData:[],EmployeeTaskData:[],
            isEmployeeChecked:true,
             isClientChecked:false
        }
    }

    componentWillMount() {
 
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")

        // MyAjax(
        //     ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + '' + "&orgId=" + orgId,
        //     (data) => { this.setState({ Employees: data["employees"] }) },
        //     (error) => toast(error.responseText, {
        //         type: toast.TYPE.ERROR
        //     })
        // )

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetAllEmployeesWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Employees: data["employees"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })

    var url = ApiUrl + "/api/Activities/GetEmployeesReport?empId=" + this.state.Employee +
            "&fromDate=" + this.state.FromDate + "&toDate=" + this.state.ToDate + "&clientId=" + this.state.Client +
            "&priority=" + this.state.Priority + "&status=" + this.state.Status + "&taskId="+ this.state.TaskId
        MyAjax(
            url,
            (data) => {
                this.setState({ReportData:data["reportData"], SearchClick: true, IsDataAvailable: true
                })
            },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }


    GetEmployeeReport() {
        var url=""

        if(this.state.isEmployeeChecked)
        {
            url = ApiUrl + "/api/Activities/GetEmployeesReport?empId=" + this.state.Employee +
            "&fromDate=" + this.state.FromDate + "&toDate=" + this.state.ToDate + "&clientId=" + this.state.Client +
            "&priority=" + this.state.Priority + "&status=" + this.state.Status + "&taskId=" + this.state.TaskId;
        }
        else{
            url = ApiUrl + "/api/Activities/GetClientWiseReport?empId=" + this.state.Employee +
            "&fromDate=" + this.state.FromDate + "&toDate=" + this.state.ToDate + "&clientId=" + this.state.Client +
            "&priority=" + this.state.Priority + "&status=" + this.state.Status + "&taskId=" + this.state.TaskId;
        }

        MyAjax(
            url,
            (data) => {
                this.setState({ReportData:data["reportData"], SearchClick: true, IsDataAvailable:true },()=>{
                    $("employeeTasksReportModal").modal("show");
                })
            },
           
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }


    render() {
        return (
            <div className="myContainer">

                <form onSubmit={this.handleSearchClick.bind(this)} onChange={this.validate.bind(this)}>
                   <div className= "SearchContainerStyle"> 
                   <div className="col-xs-12">
                    <h4  className="reportHeader">Activities Report</h4>
                   </div>
                      <div className="col-xs-12 ">
                        <div className="col-md-2">
                            <label> Employee </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" ref="employee" placeholder="Select Employee" name="Employee" value={this.state.Employee} options={this.state.Employees} onChange={this.EmployeeChanged.bind(this)} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> Task From Date </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-calendar" ></span>
                                    </span>
                                    <input className="form-control" type="date" style={{ lineHeight: '19px' }} name="fromDate" ref="fromDate" defaultValue={this.state.FromDate}  />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> Task To Date </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-calendar" ></span>
                                    </span>
                                    <input className="form-control" type="date" style={{ lineHeight: '19px' }} name="toDate" ref="toDate" defaultValue={this.state.ToDate}  />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> Client </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" ref="client" placeholder="Select Client" name="Client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label> Status </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" ref="client" placeholder="Select Status" name="Status" value={this.state.Status}
                                        options={[ {value:'ALL', label:'All'}, { value: 'Closed', label: 'Closed' },{value: 'Open', label: 'Open' },
                                        { value: 'Pending', label: 'Pending' }, {value:'NotResolved', label:'Not Resolved'},
                                        {value:'NotClosed', label:'Not Closed'},
                                         {value:'Resolved', label:'Resolved' }, { value: 'Reopened', label: 'Reopened' }]}
                                        onChange={this.StatusChanged.bind(this)} />
                                </div>
                            </div>
                        </div> 
                  
                        <div className="col-md-2">
                            <label> Priority </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" ref="priority" placeholder="Select Priority" name="Priority" value={this.state.Priority}
                                        options={[{ value: '0', label: 'High' }, { value: '1', label: 'Medium' },
                                        { value: '2', label: 'Low' }]}
                                        onChange={this.PriorityChanged.bind(this)} />
                                </div>
                            </div>
                        </div>
                    </div>
                      <div className="col-xs-12">

                         <div className="col-md-2">
                            <div className="form-group">
                               <div className="input-group">
                                  <span className="input-group-addon"> </span>
                                  <input className="form-control" type="text" placeholder="Task Id"  ref="taskId"  />
                                </div>
                            </div>  
                         </div>

                            <div className="col-md-2 form-group" key ={this.state.isEmployeeChecked}  >
                              <div className="col-md-2 form-group" key={this.state.isEmployeeChecked} >
                                    <label className="radiocontainer"  style={{marginBottom: '-35px',marginTop: '10px'}}  >
                                        <label className="radiolabel" > Employee </label>
                                        <input type="radio" name="reportType" className="form-control folderChecked" defaultChecked={this.state.isEmployeeChecked} onClick={this.EmployeeWiseReportClick.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                               <div className="col-md-2 form-group" key={this.state.isClientChecked} style={{ marginLeft: '41%' ,marginTop: '-17px'}}   >
                                    <label className="col-md-2 radiocontainer"  >
                                        <label className="radiolabel">  Client </label>
                                        <input type="radio" name="reportType" className="form-control fileChecked form-control" defaultChecked={this.state.isClientChecked} onClick={this.ClientWiseReportClick.bind(this)} />
                                        <span className="checkmark"></span>
                                    </label>
                                </div>
                           </div>

                         <div className="col-md-2" style={{ marginTop: '0%', marginBottom: '1%' }} >
                            <button type="submit" name="submit" className="btn btn-primary" value="Search" > Search </button>
                            <button type="button" name="clear" className="btn btn-default mleft10" value="Clear" onClick={this.clearClick.bind(this)}> Clear </button>
                         </div>
                      </div>
                   </div>
                </form>

                {
                    this.state.IsDataAvailable == true ?
                    this.state.ReportData.length > 0 ?
                        <div className="col-xs-12" key={this.state.EmployeesList}>
                            {
                                this.state.ReportData.map((ele, i) => {
                                    return (
                                        <div className="panel panel-primary" key={ele["Task"]}>

                                            <div className="panel-heading" >
                                                <h6 className="panel-title panelHeading" >
                                                    {/* <a onClick={() => { 
                                                        this.gotoEmployeeActivitiesReport(ele["TaskOwnerId"], ele["TaskOwner"], ele["Task"], "") }}> {ele["TaskOwner"].toUpperCase()
                                                        } </a> */}

                                                         { ele["Client"]!=null  ? 
                                                         <a onClick={() => { this.gotoEmployeeActivitiesReport(ele["Client_Id"], ele["Client"], ele["Task"], "") }}> {ele["Client"].toUpperCase() } </a>
                                                         :
                                                         <a onClick={() => {this.gotoEmployeeActivitiesReport(ele["TaskOwnerId"], ele["TaskOwner"], ele["Task"], "") }}> {ele["TaskOwner"].toUpperCase() } </a>
                                                         }
                                                         
                                                </h6>
                                            </div>

                                            <div id={this.state.EmployeesList} className="panel-collapse collapse in" >
                                                <div className="panel-body Reportpanel-body" key={ele["Task"]}>
                                                    {
                                                        <table className="table table-condensed table-bordered actionTable mytable">
                                                            <tbody>
                                                                <tr >
                                                                    <th style={{ width: '7%' }} > TaskId</th>
                                                                    <th style={{ width: '7%' }}> TaskDate </th>
                                                                    <th title="Client/Department">Client/Dept</th>
                                                                    <th> AssignedBy </th>
                                                                    <th> Priority </th>
                                                                    <th> Subject</th>
                                                                    <th data-toggle="tooltip" title="Expected Date Of Closure" style={{ width: '7%' }}> EDOC </th>
                                                                    <th> Task Owner </th>
                                                                    <th> Pending With</th>
                                                                    <th> Status </th>
                                                                    <th style={{ textAlign: 'center' }} data-toggle="tooltip" title="Hours Worked"> HW </th>
                                                                    <th data-toggle="tooltip" title="Completed Date" style={{ width: '7%' }}> CD </th>
                                                                    <th style={{ textAlign: 'center' }} title="TAT(in Days)"> TAT </th>
                                                                </tr>
                                                                  {  ele["Task"].map((e,y)=>{
                                                                    return(
                                                                         <tr style={{ paddingLeft: '2%' }} className={this.getTaskStyle(e["EDOC"], e["CompletedDate"], e["Status"])} key={y} onClick={() => { this.handleClick(ele["TaskOwnerId"], ele["TaskOwner"], ele["Task"], e["TaskId"],) }}>
                                                                          <td style={{ width: '6%' }}> {e["TaskId"]} </td>
                                                                            <td style={{ width: '7%' }}> {moment(e["CreatedDate"]).format("DD-MMM-YYYY")} </td>
                                                                          <td> {e["Department"] !== null ? e["Department"] : e["Client"]}</td>
                                                                         <td> {e["CreatedBy"]} </td>
                                                                        <td> {e["Priority"]} </td>
                                                                       <td > {e["Subject"]} </td>
                                                                        <td style={{ width: '7%' }}> {moment(e["EDOC"]).format("DD-MMM-YYYY")} </td>  
                                                                        <td>  {e["Status"] == "Closed" ? "": e["TaskOwner"]} </td>
                                                                      <td> {e["Status"] == "Closed" ? "" : e["TaskOwner"]} </td>
                                                                     <td> {e["Status"]}</td>
                                                                     <td style={{ textAlign: 'center' }}> {e["HoursWorked"] > 0 ? e["HoursWorked"] : " "}</td>
                                                                     <td style={{ width: '7%' }}> {e["CompletedDate"] != null ? moment(e["CompletedDate"]).format("DD-MMM-YYYY") : " "}   </td>
                                                                     <td style={{ color: 'red', textAlign: 'center' }}>
                                                                    {/* {this.DelayInDaysCount(e["EDOC"], e["CompletedDate"], e["TaskResolvedDate"], e["Status"])}    */}
                                                                     </td>
                                                                   </tr>
                                                                    )
                                                                })
                                                                }
                                                            
                                                            </tbody>

                                                        </table>
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                    )
                                })
                            }

                        </div>
                        :
                        <div className="col-xs-12 messageStyle">
                            <h4> No records found </h4>
                        </div>
                        :
                        <div className="loader visible" style={{ marginTop: '12%' }}></div>
                }

                <div id="employeeTasksReportModal" className="modal fade" role="dialog" ref="employeeTasksReportModal">
                    <div className="modal-dialog modal-lg" style={{ width: '1250px' }}>
                        <div className="modal-content">
                            <div className="modal-header" >
                                <label> Employee Name : </label> {this.state.EmployeeName}
                               {
                                   this.state.FromDate !=null ?
                                   <span>
                                   <label className="mleft1"> From Date : </label>  <span> {moment(this.state.FromDate).format("MMM-DD-YYYY")}</span>
                                   </span>
                                   :<span />
                               }
                               {
                                   this.state.ToDate !=null ?
                                   <span>
                                   <label className="mleft1"> To Date :</label> <span>  {moment(this.state.ToDate).format("MMM-DD-YYYY")} </span> 
                                   </span>
                                  
                                   :
                                   <label/>
                               }
                                <label className="mleft1"> Status : </label> {this.state.Status !== "" ? this.state.Status : "All"}
                                <label className="mleft1"> Priority : </label>{this.state.Priority !== null ? this.state.TaskPriority.label : "All"}
                                <button type="button" className="close" data-dismiss="modal">&times;</button>
                                <hr />
                                <div className="col-xs-12" key={this.state.EmpTasksReport}>
                                    {
                                        this.state.EmployeeTaskData.map((ele, i) => {
                                            return (
                                                <div >
                                                    <h4 className="col-xs-12"> Task {ele["TaskId"]} Details : </h4>

                                                    <table className="table table-condensed table-bordered actionTable mytable">
                                                        <tbody>
                                                            <tr >
                                                                <th style={{ width: '10%' }}> Created By</th>
                                                                <th style={{ width: '15%' }}> Created date</th>
                                                                <th title="Client / Department "> Client/Dept</th>
                                                                <th> Subject</th>
                                                                <th> Description</th>
                                                            </tr>
                                                            <tr>
                                                                <td> {ele["CreatedBy"]} </td>
                                                                <td>  {moment(ele["CreatedDate"]).format("DD-MMM-YYYY")} </td>
                                                                <td> {ele["Department"] !== null ? ele["Department"] : ele["Client"]} </td>
                                                                <td> {ele["Subject"]} </td>
                                                                 <td>
                                                                    <Editor name="actionDescription" readonly={true} id="actionDescription"
                                                                        editorState={this.gotoChangeDescription(ele["Description"])} toolbarClassName="hide-toolbar"
                                                                        wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                                    />
                                                                </td> 
                                                            </tr>

                                                            {/* {
                                                                ele["TaskType"] === "Client" ?
                                                                    <tr>
                                                                        <th style={{ width: '15%' }}> Location </th>
                                                                        <td colspan={4}> {ele["Location"]} </td>
                                                                    </tr>

                                                                    :
                                                                    ""
                                                            } */}

                                                        </tbody>
                                                    </table>
                                                    <div className="col-xs-12" />
                                                    <table className="table table-condensed table-bordered actionTable mytable">
                                                        <tbody>
                                                            <tr>
                                                                <th style={{ width: '12.5%' }}> TaskDate</th>
                                                                <th> Assigned by</th>
                                                                <th> Description</th>
                                                                <th> Assigned To </th>
                                                                <th> Status</th>
                                                                <th> HoursWorked</th>
                                                            </tr>

                                                             {
                                                                 ele["TaskLog"].map((el, j) => {
                                                                     return (
                                                                       <tr key={el["Id"]} >
                                                                             <td> {moment(el["TaskLogDate"]).format("DD-MMM-YYYY hh:mm a")}</td>
                                                                            <td> {el["TaskLogAssignedBy"]}</td>
                                                                             <td style={{ width: '50%', paddingTop: '0px' }}>
                                                                                 <Editor name="actionResponse" readonly={true} id="actionResponse"
                                                                                     editorState={this.gotoChangeContent(el["TaskLogDescription"])} toolbarClassName="hide-toolbar"
                                                                                     wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                                                />
                                                                             </td>
                                                                             <td>  {el["TaskLogStatus"] == "Closed by assignee" ? " " : el["TaskLogAssignedTo"]} </td>
                                                                             <td> {el["TaskLogStatus"]}</td>
                                                                             <td style={{ textAlign: 'center' }}> {el["TaskLogHoursWorked"] > 0 ? el["TaskLogHoursWorked"] : ""} </td>
                                                                         </tr>
                                                                     )

                                                                 })
                                                             }
                                                        </tbody>
                                                    </table>

                                                    <div className="col-xs-12" style={{ paddingTop: '2%' }} >

                                                        <div className="col-md-6 col-xs-12 " key={i}>
                                                            <table className="table table-condensed table-bordered headertable">
                                                                <tbody>
                                                                    <tr>
                                                                        <th> Expected start Date </th>
                                                                        {/* <td>{ele["ExpectedStartDate"] !== null ? moment(ele["ExpectedStartDate"]["TaskLogStartDate"]).format("DD-MMM-YYYY") : ""}</td> */}
                                                                        <td>{ele["ExpectedStartDate"] !== null ? moment(ele["ActualStartDate"]["TaskLogStartDate"]).format("DD-MMM-YYYY") : ""}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Expected Date of Closure</th>
                                                                        {/* <td> {moment(ele["EDOC"]).format("DD-MMM-YYYY")}</td> */}
                                                                        <td>{ele["ExpectedEndDate"] != null ? moment(ele["ExpectedEndDate"]["TaskLogEndDate"]).format("DD-MMM-YYYY") : ""}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Budgeted Hours </th>
                                                                        <td>{ele["BudgetedHours"] !== null ? ele["BudgetedHours"]["TaskLogBudgetedHours"] : ""}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="col-md-6 col-xs-12 ">
                                                            <table className="table table-condensed table-bordered headertable">
                                                                <tbody>
                                                                    <tr>
                                                                        <th> Actual Start Date </th>
                                                                        {/* <td>{ele["ExpectedStartDate"] !== null ? moment(ele["ExpectedStartDate"]["TaskLogStartDate"]).format("DD-MMM-YYYY") : "Not yet started"}</td> */}
                                                                        <td>{ele["ActualStartDate"] !== null ? moment(ele["ActualStartDate"]["TaskLogStartDate"]).format("DD-MMM-YYYY") : "Not yet started"}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th> Actual closed date </th>
                                                                        <td>{ele["CompletedDate"] !== null ? moment(ele["CompletedDate"]).format("DD-MMM-YYYY") : "Not yet completed"}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Hours Worked </th>
                                                                        <td> {ele["HoursWorked"] !== null ? ele["HoursWorked"] : ""}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="col-xs-12">
                                                        <hr />
                                                    </div>

                                                </div>
                                            )
                                        })
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    ClientWiseReportClick(){
        this.setState({isEmployeeChecked: false, isClientChecked: true})
    }

    EmployeeWiseReportClick(){
      this.setState({isEmployeeChecked: true, isClientChecked: false})
    }

    // FromDateChanged(){
    //     if(this.refs.fromDate.value!=""){
    //         this.setState({FromDate: moment.format(this.refs.fromDate.value).format("YYYY-MM-DD") })
    //     }
    //     else{
    //         this.setState({FromDate:null})
    //     }
    // }

    // ToDateChanged(){
    //     if(this.refs.toDate.value!=""){
    //         this.setState({ToDate: moment.format(this.refs.toDate.value).format("YYYY-MM-DD") })
    //     }
    //     else{
    //         this.setState({ToDate:null})
    //     }
    // }

    gotoChangeContent(content) {

        const contentBlock = convertFromHTML(content);
        if (contentBlock.contentBlocks !== null) {
            const contentState = ContentState.createFromBlockArray(contentBlock);
            const editorState = EditorState.createWithContent(contentState);
            return editorState;
        }
        else {
            const editor = EditorState.createEmpty();
            return editor;
        }

    }

    gotoChangeDescription(description) {
        const contentBlock = convertFromHTML(description);
        if (contentBlock.contentBlocks !== null) {
            const contentState = ContentState.createFromBlockArray(contentBlock);
            const editorState = EditorState.createWithContent(contentState);
            return editorState;
        }
    }

    handleClick(empId, empName, Task,TaskId) {
        this.gotoEmployeeActivitiesReport(empId, empName,Task, TaskId);
        EmployeeTaskData:this.state.EmployeeTaskData;
    }

    getTaskStyle(edoc, cd, status) {
        var EDOC = moment(edoc);
        var CD = moment(cd);

        if (status !== "Closed" && (EDOC < CD || EDOC < moment())) {
            return "trStyleDelay pointer";
        }
        else if (EDOC > CD) {
            return "trStyleSuccess pointer";
        }
        else {
            return "pointer";
        }
    }

    createdDateFormatter(cell, row) {
        return (
            <p> {row["CreatedDate"].format("DD-MMM-YYYY")}</p>
        )
    }

    PriorityFormatter(cell, row) {
        return (
            row["Priority"] == 0 ? "High" : row["Priority"] == 1 ? "Medium" : "Low"
        )
    }

    edocFormatter(cell, row) {
        return (
            moment(row["EDOC"]).format("DD-MMM-YYYY")
        )
    }

    DelayInDaysCount(edoc, completedDate, resolvedDate, status) {

        if (resolvedDate != null || status == "Resolved") {
            if (edoc < resolvedDate) {
                var days = moment(resolvedDate).diff(moment(edoc), 'days');
                if (days > 0) {
                    return days;
                }
                else {
                    return "";
                }
            }
        }
        else {
            if (status == "Closed" && completedDate != null) {
                if (edoc < completedDate) {
                    var days = moment(completedDate).diff(moment(edoc), 'days');
                    if (days > 0) {
                        return days;
                    }
                    return "";
                }
            }
            else if (edoc > moment()) {
                return "";
            }
            else {
                var days = moment().diff(moment(edoc), 'days');
                if (days > 0) {
                    return days;
                }
            }
        }
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val.value })
        }
        else {
            this.setState({ Client: '' })
        }

    }

    TaskDateFormatter(cell, row) {
        return (
            <p> {moment(row["TaskDate"]).format("MM-DD-YYYY")}  </p>
        )
    }

    categorySubCategory(cell, row) {
        return (
            <p> {row["Category"]} {"/"} {row["SubCategory"]}</p>
        )
    }

    PriorityFormat(cell, row) {
        if (row["Priority"] == 0) {
            return (  <p> High</p>  )
        }
        else if (row["Priority"] == 1) {
            return (  <p> Medium</p>   )
        }
        else {
            return ( <p> Low </p>   )
        }
    }

    completedDateFormat(cell, row) {
        if (row["CompletedDate"] != null) {
            return (  <p> {moment(row["CompletedDate"]).format("MM-DD-YYYY")}</p>  )
        }
        else {
            return (  <p> </p> )
        }

    }

    EmployeeChanged(val) {
        if (val) {
            this.setState({ Employee: val.value })
        }
        else {
            this.setState({ Employee: '' })
        }
    }

    PriorityChanged(val) {
        if (val) {
            this.setState({ Priority: val.value, TaskPriority: val })
        }
        else {
            this.setState({ Priority: '' })
        }
    }

    StatusChanged(val) {
        if (val) {
            this.setState({ Status: val.value})
        }
        else {
            this.setState({ Status: 'NotResolved' })
        }
    }

    clearClick() {
        this.state.Priority = null;
        this.state.Status = "NotResolved";
        this.state.Client = '';
        this.state.Employee = '';
        this.refs.fromDate.value = null;
        this.refs.toDate.value = null;
        this.refs.taskId.value='';
        this.setState({
            Priority: null, Status: 'NotResolved', Client: '', Employee: ''
        }, () => {
            showErrorsForInput(this.refs.fromDate,null);
            showErrorsForInput(this.refs.toDate,null);
            showErrorsForInput(this.refs.taskId,null);
            
            this.GetEmployeeReport();
        })
    }

    gotoEmployeeActivitiesReport(empId, empName, Task,TaskId) {
        
        this.setState({
            EmployeeName: empName, FromDate: this.state.FromDate,
            ToDate: this.state.ToDate, EmployeeTaskData:Task
        },()=>{
            if(TaskId!=="")
            {
              var TaskLogIndex=  Task.findIndex((k)=>k.TaskId==TaskId);
               if(TaskLogIndex!==-1)
               {
                   var taskLog= [];
                    taskLog.push(Task[TaskLogIndex]);
                   this.setState({EmployeeTaskData:taskLog })
               }
            }
            else{
                 this.setState({EmployeeTaskData:Task})
            }
            $("#employeeTasksReportModal").modal("show");
        })
    }

    handleSearchClick(e) {
        e.preventDefault();
        if(!this.validate(e)){
            return;
        }
        else{
            this.setState({
                Employee:this.state.Employee,
                FromDate:this.refs.fromDate.value,
                ToDate:this.refs.toDate.value,
                Status: this.state.Status,
                Priority: this.state.Priority,
                IsDataAvailable: false,
                TaskId: this.refs.taskId.value
            },()=>{
                this.GetEmployeeReport();
            })
        }
    }

    validate(e) {
        let errors = {};
        var success = true;
        var isSubmit = e.type === "submit";

        if (isSubmit) {
            $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
                el.classList.remove("un-touched");
            });
        }
        
        if(this.refs.toDate.value!="" && this.refs.fromDate.value!="") {
            if (moment(this.refs.toDate.value).isBefore(moment(this.refs.fromDate.value))) {
                success = false;
                showErrorsForInput(this.refs.toDate, ["To Date should not be less that from date"]);
                if (isSubmit) {
                    this.refs.toDate.focus();
                    isSubmit = false;
                }
            }
            else{
                showErrorsForInput(this.refs.toDate, null); 
            }
        }
        else{
            showErrorsForInput(this.refs.toDate, null); 
        }

        if(this.state.Status == "Closed" || this.state.Status =="Resolved")
        {
            if(validate.single(this.refs.fromDate.value, {presence: true}) !== undefined) {
                 success = false;
                 showErrorsForInput(this.refs.fromDate, ["From date is required"]);
                 this.refs.fromDate.focus();
            }
            else{
                showErrorsForInput(this.refs.fromDate, null);
            }
            if(validate.single(this.refs.toDate.value, {presence: true}) !== undefined) {
                 success = false;
                 showErrorsForInput(this.refs.toDate, ["To date is required"]);
                 this.refs.toDate.focus();
            }
            else{
                showErrorsForInput(this.refs.toDate, null);
            }
        }

        if(this.refs.taskId.value !=="")
        {
           var TaskIdConstraints={
             length: {
                maximum: 10
              }
            }

          if(validate.single(this.refs.taskId.value, TaskIdConstraints)!==undefined){
              success= false;
              showErrorsForInput(this.refs.taskId, ["Enter valid task id"]);
              this.refs.taskId.focus();
          }
          else{
            showErrorsForInput(this.refs.taskId, null);
          }
        }
       
        return success;
    }
    
}

export default Report;


