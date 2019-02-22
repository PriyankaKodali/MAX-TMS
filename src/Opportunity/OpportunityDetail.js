import React, {Component} from 'react';
import Select from 'react-select';
import $ from 'jquery';
import './Opportunity.css';
import { ApiUrl } from '../Config';
import { toast } from 'react-toastify';
import { MyAjaxForAttachments, MyAjax } from '../MyAjax';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { validate } from 'validate.js';

var moment= require('moment');

class OpportunityDetail extends Component{
    constructor(props){
        super(props);

        var statuses= [{value:"Assign",label:"Assign" }, {value:"In Process", label:"Work In Process"}, {value:"Accepted", label:"Accepted"}, {value:"QuotationSent", label:"Quotation Sent"},  {value: "Declined", label:"Declined"}]
        this.state={
           LeadContacts:[], OpportunityLog:[], Status:'',  Assignees:[],LeadInfo:{},Assignee:'',
           Description: EditorState.createEmpty(), DescriptionHtml: "", Statuses:statuses
        } 
    }

    componentWillMount(){
         var oppId= this.props.match.params["id"];
         var orgId = sessionStorage.getItem("roles").indexOf("Admin") !== -1 ? null : sessionStorage.getItem("OrgId")
        $.ajax({
            url: ApiUrl + "/api/Opportunity/GetLeadDetails?leadId=" +  this.props.match.params["id"],
            type: "get",
            success: (data) => {
                this.setState({LeadInfo: data["leadDetails"]},()=>{
                    var leadDetail=this.state.LeadInfo;
                    if(leadDetail.OppStatus == "Accepted"){
                         var statuses= [{value:"Assign",label:"Assign" }, {value:"In Process", label:"Work In Process"}, {value:"Completed", label:"Completed"}]
                         this.setState({Statuses: statuses})
                    }
                    var oppLog= leadDetail.oppLog;
                     var isAccepted= oppLog.findIndex(i=>i.LogStatus == "Accepted");
                     if(isAccepted !==-1){
                        var statuses= [{value:"Assign",label:"Assign" },  {value:"In Process", label:"Work In Process"},{value:"Completed", label:"Completed"}]
                        this.setState({Statuses: statuses})
                     }
                })
            }
        })

        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + '' + "&OrgId=" + orgId,
            (data) => { this.setState({ Assignees: data["employees"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )
    }

    componentDidMount() {
        setUnTouched(document);

        $("#input-id").fileinput({
            theme: "explorer",
            hideThumbnailContent: true,
            uploadUrl: ApiUrl + "/api/Task/UploadFiles",
            uploadAsync: true,
            overwriteInitial: false,
            initialPreviewAsData: true,
            showCancel: false,
            showRemove: false,
            showUpload: false,
            minFileCount: 1,
            fileActionSettings: {
                showUpload: false,
                showRemove: true,
            }
        })
    }

    render(){
        return(
            <div className="col-xs-12" style={{marginTop: '1%'}} key={this.state.LeadInfo}>
                <div className="col-xs-12 " >
                    <h3 className="col-md-12 formheader"> Opportunity/Project
                        <span className="glyphicon glyphicon-th-list pull-right spanborder" onClick={() => this.props.history.push("/LeadsList")}></span>
                    </h3>
                </div>

                <div className="col-md-6 col-xs-12" style={{ marginTop: '0.5%' }} >
                    <table className="table table-condensed table-bordered headertable">
                        <tbody>
                            <tr>
                                <th>Created By</th>
                                <td>{this.state.LeadInfo["CreatedBy"]}</td>
                            </tr>
                            <tr>
                                <th>Created On</th>
                                <td>{moment(this.state.LeadInfo["CreatedDate"]).format("DD-MMM-YYYY hh:mm A")}</td>
                            </tr>
                            <tr>
                                <th>Assigned To </th>
                                <td>{this.state.LeadInfo["OppTaskOwner"]}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="col-md-6 col-xs-12" style={{ marginTop: '0.5%' }} >
                    <table className="table table-condensed table-bordered headertable">
                        <tbody>
                            <tr>
                                <th> Client </th>
                                <td>{this.state.LeadInfo["Client"]} </td>
                            </tr>
                            <tr>
                                <th> Status </th>
                                <td>{this.state.LeadInfo["OppStatus"]} </td>
                            </tr>
                            <tr>
                                <th> Assigned Date </th>
                                <td> {moment(this.state.LeadInfo["CreatedDate"]).format("DD-MMM-YYYY hh:mm A")} </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="col-md-12">
                    <table className="table table-condensed table-bordered headertable" key={this.state.OppInfo}>
                        <tbody>
                            <tr>
                                <th> Location</th>
                                <td> {this.state.LeadInfo["LeadLocation"]} </td>
                            </tr>
                            <tr>
                                <th style={{ width: '20px' }} >Comments</th>
                                <td >
                                    <Editor name="actionResponse" readonly={true} id="actionResponse"
                                        editorState={this.gotoChangeContent(this.state.LeadInfo["Description"])} toolbarClassName="hide-toolbar"
                                        wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                 
                <h4 className="col-md-12 Empheading" style={{ paddingLeft: '10px' }}> <b>Lead Contacts</b>  </h4>
           
                <div className="col-md-12">
                    <table className="table table-condensed table-bordered headertable" key={this.state.LeadInfo} >
                        <tbody>
                            <tr>
                                <th> First Name </th>
                                <th> Last Name </th>
                                <th> Email</th>
                                <th> Phone Number </th>
                                <th> Department</th>
                            </tr>
                            {
                                this.state.LeadInfo !=null && JSON.stringify(this.state.LeadInfo) !=='{}'?
                                 this.state.LeadInfo.clientContacts.map((ele,i)=>{
                                        return (
                                        <tr key={i}>
                                            <td > {(ele["FirstName"])} </td>
                                            <td> {ele["LastName"]} </td>
                                            <td> {ele["Email"]} </td>
                                            <td> {ele["PhoneNumber"]} </td>
                                            <td> {ele["Department"]} </td>
                                        </tr>
                                    )
                                })
                                :
                                    <div/>
                            }
                        </tbody>
                    </table>
                </div>

                <h4 className="col-md-12 Empheading" style={{ paddingLeft: '10px' }}> <b>Previous Actions</b>  </h4>
              
                <div className="col-md-12">
                    <table className="table table-condensed table-bordered headertable">
                        <tbody>
                            <tr>
                                <th style={{ width: '15%' }} > Created Date</th>
                                <th>CreatedBy</th>
                                <th ></th>
                                <th colSpan={2} style={{ width: '50%' }}> Action/ Response</th>
                                <th className="width12"> Assigned To</th>
                                <th className="width12"> Status </th>
                            </tr>
                            {
                              this.state.LeadInfo !==null && JSON.stringify(this.state.LeadInfo) !=='{}'?
                                 this.state.LeadInfo.oppLog.map((ele, i) => {
                                    return (
                                        <tr key={ele["oppLogId"]}>
                                            <td style={{ width: '15%' }}> {moment(ele["LogDate"]).format("DD-MMM-YYYY hh:mm A") }</td>
                                            <td> {ele["OppLogCreatedBy"]}</td>
                                            <td>  {
                                                ele["Attachments"] != null ?
                                                    ele["Attachments"].map((el) => {
                                                        return (
                                                            el["FileAttachment"]!==null ?
                                                            <a key={el["AttachmentId"]} href={el} target="blank"> <i className='fa fa-paperclip' style={{ fontSize: '18px', cursor: 'pointer' }}  ></i> </a>
                                                            :
                                                            <a></a>
                                                        )
                                                    })
                                                    :
                                                    ""
                                            }
                                            </td>
                                            <td colSpan={2}>
                                                <Editor name="actionResponse" readonly={true} id="actionResponse" addLineBreaks={false}
                                                    editorState={this.gotoChangeContent(ele["OppLogComments"])} toolbarClassName="hide-toolbar"
                                                    wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                />
                                            </td>
                                            <td className="width12"> {ele["OppLogAssignedTo"]}</td>
                                            <td className="width12"> {ele["LogStatus"]}</td>
                                        </tr>
                                     )
                                })
                                :
                                <div />
                            }
                        </tbody>
                    </table>
                </div> 
                
                 {
                    this.state.LeadInfo["OppStatus"] !=="Completed" && this.state.LeadInfo["OppStatus"] !=="Declined" ?  
                    <form onSubmit={this.handleSubmit.bind(this)} >
                    <div>
                         <div className="col-xs-12">
                           <div className="col-md-3">
                              <label>Status</label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" ref="status" placeholder="Select Action Type" options={this.state.Statuses} value={this.state.Status} onChange={this.StatusChanged.bind(this)} />
                                    </div>
                                 </div>
                            </div>
                            {
                                 this.state.Status !== "Completed" ?
                                 <div>
                                 <div className="col-md-3">
                                        <label> Assign To  </label>
                                           <div className="form-group">
                                                  <div className="input-group">
                                                       <span className="input-group-addon">
                                                               <span className="glyphicon glyphicon-user"></span>
                                                            </span>
                                                           <Select className="form-control" name="assignTo" ref="assignee" placeholder="Select Assignee" value={this.state.Assignee} options={this.state.Assignees} onChange={this.AssigneeChanged.bind(this)} />
                                                  </div>
                                            </div>
                                  </div>
     
                                   <div className="col-md-3"> 
                                       <label>FollowUp on</label>
                                           <div className="form-group">
                                              <div className="input-group">
                                                    <span className="input-group-addon">
                                                       <span className="glyphicon glyphicon-calendar"></span>
                                                     </span>
                                                    <input className="form-control" style={{ lineHeight: '19px' }} type="date" name="followup" ref="followup" />
                                               </div>
                                           </div>
                                     </div>
                                     </div>
                                     :
                                     <div/>

                            }
                           
                           
                            <div key={this.state.Status}>
                            {
                                this.state.Status == "Accepted"  || this.state.Status == "Assign"  ?
                                       <div >
                                           <div className="col-md-3">
                                            <label> Expected Date of Start</label>
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <span className="input-group-addon">
                                                        <span className="glyphicon glyphicon-calendar"></span>
                                                    </span>
                                                    <input className="form-control" name="StartDate" style={{ lineHeight: '19px' }} type="date" ref="edos" min={moment().format("YYYY-MM-DD")} />
                                                </div>
                                            </div>
                                         </div>

                                        <div className="col-md-3">
                                            <label> Expected Date of Closure </label>
                                            <div className="form-group">
                                                <div className="input-group" >
                                                    <span className="input-group-addon">
                                                        <span className="glyphicon glyphicon-calendar"></span>
                                                    </span>
                                                    <input className="form-control" name="EndDate" style={{ lineHeight: '19px' }} type="date" ref="edoc" defaultValue={this.state.EDOC} />
                                                </div>
                                            </div>
                                        </div>
                                       </div>  
                                     :
                                this.state.Status == "Completed" ?
                                    <div className="col-md-3">
                                        <label>Completed Date</label>
                                         <div className="form-group">
                                                <div className="input-group" >
                                                    <span className="input-group-addon">
                                                        <span className="glyphicon glyphicon-calendar"></span>
                                                    </span>
                                                    <input className="form-control" name="EndDate" style={{ lineHeight: '19px' }} type="date" ref="completedDate"  />
                                                </div>
                                      </div>
                                 </div>
                                :
                                <div />
                            }

                          
                         </div>
                        
                         </div>
                         <div className="col-xs-12" style={{marginTop: '1%'}} >
                         <div className="col-xs-12 form-group" style={{ height: "auto", paddingTop: '5', paddingLeft: '15px' }}>
                               <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor"
                                    toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }}
                                     toolbarClassName="toolbarClassName"
                                     wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner"
                                    onEditorStateChange={this.messageBoxChange.bind(this)}    />


                                <input hidden ref="description" name="forErrorShowing" />
                              </div>
                         </div>
                       <div className="col-xs-12">
                         <div className="col-xs-12 form-group">
                            <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any"  multiple />
                          </div>
                      </div>
                      <div className="col-xs-12  text-center form-group">
                          <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                         <button type="submit" name="submit" className="btn btn-success btnsavesuccess" style={{ marginTop: '1%', marginLeft: '0.5%' }} >Submit</button>
                      </div>
                    </div>
                    </form>
                    :
                    <div  className="col-xs-12">
                          <h4> <b> Completed Date : </b> 
                           {moment(this.state.LeadInfo["CompletedDate"]).format("DD-MMM-YYYY")}
                          </h4>
                    </div>
                }
           
            </div>
        )
    }

    gotoChangeContent(content) {
        if (content !== undefined) {
            const contentBlock = convertFromHTML(content);
            if (contentBlock.contentBlocks != null) {
                const contentState = ContentState.createFromBlockArray(contentBlock);
                const editorState = EditorState.createWithContent(contentState);
                return editorState;
            }
            else {
                const editor = EditorState.createEmpty();
                return editor;
            }
        }
        else {
            const editor = EditorState.createEmpty();
            return editor;
        }

    }

    AssigneeChanged(val){
        if(val){
            this.setState({Assignee: val})
        }
        else{
            this.setState({Assignee: ''})
        }
    }

    uploadCallback(){
    }

    messageBoxChange(val){
        this.setState({ Description: val, DescriptionHtml: draftToHtml(convertToRaw(val.getCurrentContent())) });
        showErrorsForInput(this.refs.description, []);
    }

    StatusChanged(val){
         if(val!==null){
             this.setState({Status: val.value})
             showErrorsForInput(this.refs.status.wrapper, null);
         }
         else{
             this.setState({Status:''})
             showErrorsForInput(this.refs.status.wrapper, ["Status is required"]);
         }
    }

    handleSubmit(e){
        e.preventDefault();

        $(".loader").show();
        $("button[name='submit']").hide();

        if(!this.validate(e)){
            $(".loader").hide();
            $("button[name='submit']").show();

            return;
        }

        var data = new FormData();

        data.append("status", this.state.Status);
        data.append("comments", this.state.DescriptionHtml);
        data.append("oppId", this.props.match.params["id"]);
        data.append("followupon", this.refs.followup.value);

        if (this.state.Status == "Accepted") {
            data.append("edos", this.refs.edos.value);
            data.append("edoc", this.refs.edoc.value);
        }
        
        if(this.state.Assignee !== "")  {
            data.append("assignee", this.state.Assignee.value);
        }

        if (this.state.Status=="Completed") {
            data.append("completedDate", this.refs.completedDate.value);
        }

        var files = $("#input-id").fileinput("getFileStack");

        for (var i = 0; i < files.length; i++) {
            if (files[i] != undefined) {
                data.append(files[i].filename, files[i]);
            }
        }
          
        var url=ApiUrl + "/api/Opportunity/EditOpportunity?oppId=" +this.props.match.params["id"];
        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Opportunity updated successfully!", {
                        type: toast.TYPE.SUCCESS
                    });
                   $(".loader").hide();
                   $("button[name='submit']").show();
                    
                   this.props.history.push("/LeadsList");
                      
                    return true;
                },
                (error) => {
                    toast(error.responseText, {
                        type: toast.TYPE.ERROR,
                        autoClose: false
                    });
                    $(".loader").hide();
                    $("button[name='submit']").show();
                    return false;
                },
                "POST",
                data
            )
        }
        catch (e) {
            toast("An error occured, please try again later!",
                { type: toast.TYPE.error }
            )

            $(".loader").hide();
            $("button[name='submit']").show();
             
        }

    }

    validate(e){
        var success= true;
        var isSubmit= e.type === "submit"

        if(this.state.LeadInfo["Status"]!=="Completed"){
              if(this.state.Status==""){
                  success= false;
                  showErrorsForInput(this.refs.status.wrapper, ["Status required"]);
                  if (isSubmit) {
                    this.refs.status.focus();
                     isSubmit = false;
                   }
                }
               if(this.state.Status == "Accepted" || this.state.Status == "Assign"){
                 if(this.state.Status == "Assign"){
                     if(!this.state.Assignee || !this.state.Assignee.value){
                         success= false;
                         if(isSubmit){
                             this.refs.assignee.focus();
                             isSubmit = false;
                         }
                         showErrorsForInput(this.refs.assignee.wrapper, ["Select Assignee"]);
                     }
                 }
                 if (validate.single(this.refs.edos.value, { presence: true }) !== undefined) {
                       if (isSubmit) {
                          this.refs.edos.focus();
                           isSubmit = false;
                         }
                      success = false;
                     showErrorsForInput(this.refs.edos, ["Select expected date of start"])
                   }
                  else {
                      showErrorsForInput(this.refs.edos, []);
                    }
 
                 if (validate.single(this.refs.edoc.value, { presence: true }) !== undefined) {
                       if (isSubmit) {
                          this.refs.edoc.focus();
                           isSubmit = false;
                       }
                       success = false;
                     showErrorsForInput(this.refs.edoc, ["Select expected date of closure"]);
                    }
                  else {
                     showErrorsForInput(this.refs.edoc, []);
                   }
                }
                if(this.state.Status == "Completed"){
                    if(this.refs.completedDate.value==""){
                        success = false;
                        if(isSubmit){
                            this.refs.completedDate.focus();
                            isSubmit = false;
                        }
                        showErrorsForInput(this.refs.completedDate, ["Completed date is required"]);
                    }
                    else{
                        showErrorsForInput(this.refs.completedDate, null);
                    }
                }
               if (!this.state.Description.getCurrentContent().hasText()) {
                showErrorsForInput(this.refs.description, ["Please enter comments"]);
                success = false;
                if (isSubmit) {
                    this.refs.editor.focusEditor();
                    isSubmit = false;
                }
              }
              else {
                showErrorsForInput(this.refs.description, null);
              }
            }
        
        return success;
     }

}

export default OpportunityDetail;