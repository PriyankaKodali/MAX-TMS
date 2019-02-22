import React, {Component} from 'react';
import $ from 'jquery';
import { MyAjaxForAttachments, MyAjax } from '../MyAjax.js';
import {ApiUrl} from '../Config';
import {toast} from 'react-toastify';
import Select from 'react-select';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { validate } from 'validate.js';
import draftToHtml from 'draftjs-to-html';
import './Opportunity.css';
import Client from './Client';
import ClientContact from './ClientContact';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;

function trClassFormat(row, rowIdx) {
    return "pointer"
}

class Opportunity extends Component{
    constructor(props){
        super(props);

        var selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            bgColor: (row, isSelect) => {
                if (isSelect) {
                    return '#D4EFDF';
                }
                return null;
            },

            onSelectAll: (row, isSelect, e) => {
                this.setState({ Contacts: row });
            }
        };
        var froalaConfig = {
            heightMin: 210
        }

        this.state={
           Clients:[], Client:'',Categories:[],Category:[],Assignees:[], Assignee:null,Locations:[],
           Location:null, Description: EditorState.createEmpty(), DescriptionHtml: "",Organisations:[],
           Organisation:null,AddNewClient: false, ProjectAccepted: false,  AddClientContact: false,
           ContactPersons:[], Contacts: [], selectRowProp: selectRowProp, checkedContacts: [],
           Status:{ value: "ShowingInterest", label: "Showing Interest" }
        }
    }

    componentWillMount() {
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") !== -1 ? null : sessionStorage.getItem("OrgId")

        if (orgId != null) {
            this.setState({
                Organisation: { value: sessionStorage.getItem("OrgId"), label: sessionStorage.getItem("OrgName") }
            })
        }
        else {
            $.ajax({
                url: ApiUrl + "/api/MasterData/GetOrganisations",
                type: "get",
                success: (data) => { this.setState({ Organisations: data["organisations"] }) }
            })
        }

            // $.ajax({
            //     url: ApiUrl + "/api/Client/GetClientEmployees?clientId=" + this.props.match.params["id"] + "&firstName=" + '' +
            //         "&lastName=" + "" + "&email=" + "" + "&primaryPhone=" + "" + "&department=" + "" +
            //         "&orgId=" + orgId + "&page=" + this.state.Page + "&count=" + this.state.Count,
            //     type: "get",
            //     success: (data) => { this.setState({ ContactPersons: data["clientEmployees"] }) }
            // })

            $.ajax({
                url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
                type: "get",
                success: (data) => { this.setState({ Clients: data["clients"] },()=>{
                    this.state.Clients.push({ label: "+ Add New Client", value: "AddNew", className: 'addNew' })
                })}
            })

        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + '' + "&OrgId=" + orgId,
            (data) => { this.setState({ Assignees: data["employees"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetOpportunityCategories",
            type: "get",
            success: (data) => { this.setState({ Categories: data["categories"] }) }
        })
    }

    componentDidUpdate() {
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
            <div style={{ overflow: 'hidden' }} >
               <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)}>
                  <div className="taskContainer"> 
                        <div className="col-xs-12">
                           <div className="col-md-3">
                                <label>Project Name</label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user" ></span>
                                        </span>
                                        <input className="form-control" type="text" name="Opportunity" ref="opportunity" autoComplete="off" placeholder="Opportunity or Project Name" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label>Client</label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user" ></span>
                                        </span>
                                        <Select className="form-control" ref="client" disabled={this.state.disableClient} placeholder="Select Client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                            <label> Categories</label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon" >
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" placeholder="Select Categories" ref="categories" value={this.state.Category} options={this.state.Categories} onChange={this.CategoriesChanged.bind(this)} multi />
                                  </div>
                               </div>
                            </div>
                            <div className="col-md-3">
                                <label>Reffered By</label> 
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                           <span className="glyphicon glyphicon-user"></span>
                                         </span>
                                        <input  className="form-control" type="refferedby" placeholder="Reffered By"  />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12">
                            
                        <div className="col-md-3">
                            <label> Organisation </label>
                            <div className="form-group">
                                <Select className="form-control" placeholder="Select Organisation" ref="organisation" value={this.state.Organisation}
                                    options={this.state.Organisations} onChange={this.OrganisationChanged.bind(this)} />
                            </div>
                        </div>

                        <div className="col-md-3">
                            <label> Location </label>
                            <div className="form-group">
                                <Select className="form-control" placeholder="Select Location" ref="location" value={this.state.Location}
                                    options={this.state.Locations} onChange={this.LocationChanged.bind(this)} />
                            </div>
                        </div>
                            <div className="col-md-3">
                                <label> Status </label>
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon" >
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" name="status" ref="status" placeholder="Status" value={this.state.Status}
                                            options={[{ value: "ShowingInterest", label: "Showing Interest" }, { value: "Accepted", label: "Accepted" },
                                            { value: "InProcess", label: "In Process" }]}
                                            onChange={this.StatusChanged.bind(this)}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Accepted to contact, contacted, not contacted */}
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
                        </div>
                         
                        <div className="col-xs-12"> 
                         {
                              this.state.ProjectAccepted ?

                              <div key={this.state.ProjectAccepted}>
                                  <div className="col-md-3">
                                      <label> Expected Date of Start</label>
                                      <div className="form-group">
                                          <div className="input-group">
                                              <span className="input-group-addon">
                                                  <span classNBame="glyphicon glyphicon-calendar"></span>
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
                                              <input className="form-control" name="EndDate" style={{ lineHeight: '19px' }} type="date" ref="edoc"  />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              :
                              <div />
                         }

                         </div>

                        <div className="col-xs-12">
                             <div className="col-md-3">
                                 <a style={{cursor:'pointer'}} onClick={this.AddClientContact.bind(this)}> Add Client Contact </a>
                             </div> 
                        </div>
                        <div className="col-xs-12" key={this.state.ContactPersons}>
                             {
                                 this.state.ContactPersons.length>0 ?
                                    <div className="col-xs-12">
                                        <BootstrapTable striped hover ref="contactsList" data={this.state.ContactPersons} selectRow={this.state.selectRowProp} trClassName={trClassFormat} >
                                        {/* <TableHeaderColumn dataField="Id" isKey={true} ></TableHeaderColumn> */}
                                            <TableHeaderColumn dataField="Id" isKey={true}  dataSort={true} dataFormat={this.FirstNameFormatter.bind(this)} > First Name </TableHeaderColumn>
                                            <TableHeaderColumn dataField="LastName"  dataSort={true} > Last Name  </TableHeaderColumn>
                                            <TableHeaderColumn dataField="Phone" dataSort={true} dataAlign="left"> Contact Number </TableHeaderColumn>
                                            <TableHeaderColumn dataField="Email" dataSort={true} dataAlign="left"> Email </TableHeaderColumn>
                                            <TableHeaderColumn dataField="Department" dataSort={true} dataAlign="left"> Department </TableHeaderColumn>
                                        </BootstrapTable>
                                     </div>
                                 :
                                 <div />
                             }

                        </div>

                        <div className="col-xs-12" style={{marginTop: '1%'}} >
                            <div className="col-xs-12 form-group" style={{ height: "auto", paddingTop: '5', paddingLeft: '15px' }}>
                                <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor"
                                    toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }}
                                    editorState={this.state.Description} toolbarClassName="toolbarClassName"
                                    wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner"
                                    onEditorStateChange={this.messageBoxChange.bind(this)} />

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
                            <button type="submit" name="submit" className="btn btn-success btnsavesuccess" style={{ marginTop: '1%', marginLeft: '0.5%' }}>Submit</button>
                        </div>
                   </div>
               </form>

               {
                   this.state.AddNewClient ?
                    <div className="modal fade"  id="addClient" role="dialog" data-keyboard="false" data-backdrop="static" key={this.state.AddNewClient}>
                      <div className="modal-dialog modal-lg" style={{ width: '1080px' }} >
                          <div className="modal-content">
                               <div className="modal-header" style={{ background: '#f5f3f3', borderBottom: '0px solid' }}>
                                   <button type="button" className="modelClose btnClose" data-dismiss="modal" id="closeClientModal"> &times; </button>
                                   <h4 className="modal-title">
                                      <p className="modalHeading"> Client</p>
                                    </h4>
                                </div>
                              <div className="modal-body col-xs-12" key={this.state.AddNewModel}>
                                   <Client closeClientModel={this.CloseClientModel.bind(this)} ref={(ref) => "addnewClient"} />
                               </div>
                             <div className="modal-footer"> </div>
                          </div>
                      </div>
                   </div>
                   :
                   <div />
               }

               {
                   this.state.AddClientContact ?
                   <div className="modal fade" id="addClientContact"  role="dialog" data-keyboard="false" data-backdrop="static" key={this.state.AddClientContact}>
                        <div className="modal-dialog modal-lg" style={{ width: '1080px' }} >
                          <div className="modal-content">
                               <div className="modal-header" style={{ background: '#f5f3f3', borderBottom: '0px solid' }}>
                                      <button type="button" className="modelClose btnClose" data-dismiss="modal" id="closeClientContactModal"> &times; </button>
                                      <h4 className="modal-title">
                                         <p className="modalHeading"> Client Contact </p>
                                      </h4>
                                </div>
                                <div className="modal-body col-xs-12" key={this.state.AddClientContact}>
                                   <ClientContact Client={this.state.Client} closeClientContact= {this.CloseClientContactModal.bind(this)} ref={(ref)=>"addNewContact"} />
                                </div>
                                <div className="modal-footer"></div>
                            </div>
                        </div>
                   </div>
                   :
                   <div></div>
               }
               
            </div>
        )

        
    }

    FirstNameFormatter(cell, row){
        return(
            <p>{row["FirstName"]}</p>
        )
    }

    ClientChanged(val){
       if(val){
           if(val.value=="AddNew"){
                this.setState({AddNewClient: true},()=>{
                    $("#addClient").modal('show');
                })
           }
           else{
                this.setState({Client: val,Locations:[], Location:null},()=>{
                var orgId = sessionStorage.getItem("OrgId");
                 $.ajax({
                    url: ApiUrl + "/api/Client/GetClientLocations?clientId=" + this.state.Client.Id,
                    type: "get",
                    success: (data) => { this.setState({ Locations: data["locations"] }) }
                    })
                    $.ajax({
                        url: ApiUrl + "/api/Client/GetClientEmployees?clientId=" + this.state.Client.Id + "&firstName=" + " " +
                            "&lastName=" + " " + "&email=" + " " + "&primaryPhone=" + " " + "&department=" + " " +
                            "&orgId=" + null + "&page=" + 1 + "&count=" + 20,
                        type: "get",
                        success: (data) => { this.setState({ ContactPersons: data["clientEmployees"] }) }
                    })
                });
              showErrorsForInput(this.refs.client.wrapper, []);
           }
       }
       else{
        this.setState({Client: '',ContactPersons:[]})
           showErrorsForInput(this.refs.client.wrapper, ["Select client"]);
       }
    }

    CategoriesChanged(val){
        if (val) {
            this.setState({ Category: val })
            showErrorsForInput(this.refs.categories.wrapper, [])
        }
        else {
            this.setState({ Category: '' })
            if (this.state.Category.length == 0) {
                showErrorsForInput(this.refs.categories.wrapper, ["Please select Categories"])
            }
        }
    }

    OrganisationChanged(val){
        if(val){
            this.setState({Organisation:val})
            showErrorsForInput(this.refs.organisation.wrapper, null);
        }
        else{
            this.setState({Organisation:null});
            showErrorsForInput(this.refs.organisation.wrapper, ["Please select organisation"]);
        }
    }

    LocationChanged(val){
        if(val){
            this.setState({Location: val})
            showErrorsForInput(this.refs.location.wrapper, null);
        }
        else{
            this.setState({Location:null});
            showErrorsForInput(this.refs.location.wrapper, ["Location required"]);
        }
    }
    
    StatusChanged(val){ 
          if(val){
              if(val.value== "Accepted"){
               this.setState({ProjectAccepted: true,Status: val})  
              }
              else{
                this.setState({Status: val,ProjectAccepted: false});
              }
              showErrorsForInput(this.refs.status.wrapper, [])
          }
          else{
            this.setState({Status: val});
            showErrorsForInput(this.refs.status.wrapper, ["Status required"])
          }
    }

    AssigneeChanged(val){
        if(val){
            this.setState({Assignee: val.value})
        }
        else{
            this.setState({Assignee: ''})
        }
    }

    AddClientContact(){
        this.setState({AddClientContact: true}, ()=>{
            $("#addClientContact").modal('show');
        })
    }

    CloseClientModel(){
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") !== -1 ? null : sessionStorage.getItem("OrgId")
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] },()=>{
                this.state.Clients.push({ label: "+ Add New Client", value: "AddNew", className: 'addNew' })
            })}
        },()=>{
            $("#closeClientModal").click();
        })
    }

    CloseClientContactModal(){
        if(this.state.Client!==null){
            $.ajax({
                url: ApiUrl + "/api/Client/GetClientEmployees?clientId=" + this.state.Client.Id + "&firstName=" + " " +
                    "&lastName=" + " " + "&email=" + " " + "&primaryPhone=" + " " + "&department=" + " " +
                    "&orgId=" + null + "&page=" + 1 + "&count=" + 20,
                type: "get",
                success: (data) => { this.setState({ ContactPersons: data["clientEmployees"] , AddClientContact: false},()=>{
                    $("#closeClientContactModal").click();
                  }) }
            })
            $("#closeClientContactModal").click();
        }
        else{
            this.setState({AddClientContact: false,ContactPersons:[]},()=>{ 
                $("#closeClientContactModal").click();
            })
            $("#closeClientContactModal").click();
        }
    }

    uploadCallback(){
    }

    messageBoxChange(val){
        this.setState({ Description: val, DescriptionHtml: draftToHtml(convertToRaw(val.getCurrentContent())) });
        showErrorsForInput(this.refs.description, []);
    }

    handleSubmit(e){

        e.preventDefault();

        $(".loaderActivity").show();
        $("button[name='submit']").hide();

        if(!this.validate(e)){
            $(".loaderActivity").hide();
            $("button[name='submit']").show();

            return;
        }

        var data = new FormData();
       
        data.append("opportunity", this.refs.opportunity.value);
        data.append("client", this.state.Client.value);
        data.append("Categories", JSON.stringify(this.state.Category));
        data.append("orgId", this.state.Organisation.value);
        data.append("status", this.state.Status.value);
        if(this.state.Assignee!=null){
            data.append("assignTo", this.state.Assignee );
        }
        if (this.state.ProjectAccepted) {
            data.append("edos", this.refs.edos.value);
            data.append("edoc", this.refs.edoc.value);
        }

        // Gets the list of file selected for upload
        var files = $("#input-id").fileinput("getFileStack");

        for (var i = 0; i < files.length; i++) {
            if (files[i] != undefined) {
                data.append(files[i].filename, files[i]);
            }
        }
      
        data.append("contactPersons", JSON.stringify(this.refs.contactsList.state.selectedRowKeys));
        data.append("comments", this.state.DescriptionHtml);
        data.append("location", this.state.Location.value);

        
     let url = ApiUrl + "/api/Opportunity/AddOpportunity"
        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Opportunity saved successfully!", {
                        type: toast.TYPE.SUCCESS
                    });
                    $("button[name='submit']").show();
                     this.props.history.push("/LeadsList");
                    return true;
                },
                (error) => {
                    toast(error.responseText, {
                        type: toast.TYPE.ERROR,
                        autoClose: false
                    });
                    $(".loaderActivity").hide();
                    $("button[name='submit']").show();
                    return false;
                },
                "POST",
                data
            )
        }

        catch (e) {
            toast("An error occured, please try again later!",
                { type: toast.TYPE.error } )
        }
    }

    validate(e){

        var isSubmit = e.type === "submit";
        var success = true;
        var opportunityName = this.refs.opportunity.value.trim();

        if (validate.single(opportunityName, { presence: true }) !== undefined) {
            if (isSubmit) {
                this.refs.opportunity.focus();
                isSubmit = false;
            }
            success = false;
            showErrorsForInput(this.refs.opportunity, ["Please enter opportunity name "]);
        }
        else {
            showErrorsForInput(this.refs.opportunity, []);
        }

        if (!this.state.Client || !this.state.Client.value) {
            success = false;
            showErrorsForInput(this.refs.client.wrapper, ["Please select Client"]);

            if (isSubmit) {
                this.refs.client.focus();
                isSubmit = false;
            }
        }

        if (this.state.Category.length == 0) {
            success = false;
            showErrorsForInput(this.refs.categories.wrapper, ["Please select Categories"])

            if (isSubmit) {
                this.refs.categories.focus();
                isSubmit = false;
            }
        }

        if (!this.state.Organisation || !this.state.Organisation.value) {
            success = false;
            showErrorsForInput(this.refs.organisation.wrapper, ["Please select Organisation"])
            if (isSubmit) {
                this.refs.organisation.focus();
                isSubmit = false;
            }
        }

        if (!this.state.Location || !this.state.Location.value) {
            success = false;
            showErrorsForInput(this.refs.location.wrapper, ["Please select location"])
            if (isSubmit) {
                this.refs.location.focus();
                isSubmit = false;
            }
        }

        if (!this.state.Status || !this.state.Status.value) {
            success = false;
            showErrorsForInput(this.refs.status.wrapper, ["Please select Status"])
            if (isSubmit) {
                this.refs.status.focus();
                isSubmit = false;
            }
        }

        if (this.state.ProjectAccepted) {
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

        if (!this.state.Description.getCurrentContent().hasText()) {
            showErrorsForInput(this.refs.description, ["Please enter comments"]);
            success = false;
            if (isSubmit) {
                this.refs.comment.focusEditor();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.description, null);
        }

        if(isSubmit && success){
            if(this.state.ContactPersons.length>0) {
                if(this.refs.contactsList.state.selectedRowKeys.length === 0){
                    success= false;
                    toast("Select client contact person",{
                        type: toast.TYPE.INFO
                    })
                    if(isSubmit){
                        isSubmit = false;
                    }
                }
            }
            else{
                    success= false;
                    toast(" Atleast one contact person is required",{
                        type: toast.TYPE.INFO
                    })
                    if(isSubmit){
                        isSubmit = false;
                    }
            }
        }

        return success;

    }
    
}

export default Opportunity;