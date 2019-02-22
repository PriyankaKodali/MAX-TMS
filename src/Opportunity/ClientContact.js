import React, {Component} from 'react';
import $ from 'jquery';
import Select from 'react-select';
import { showErrorsForInput, setUnTouched } from '../Validation';
import {toast} from 'react-toastify';
import {MyAjaxForAttachments, MyAjax} from '../MyAjax';
import {ApiUrl} from '../Config.js';
import { validate } from 'validate.js';

class ClientContact extends Component{

    constructor(props){
        super(props);
        this.state={
            Clients:[], Client:this.props.Client
        }
    }

    componentWillMount(){
         var client= this.props.Client;
         var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") !== -1 ? null : sessionStorage.getItem("OrgId");

        if(client!==""){
            this.setState({Client: {value: this.props.Client.value, label:this.props.Client.label, Id: this.props.Client.Id}})
        }
        else{
            $.ajax({
                url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
                type: "get",
                success: (data) => { this.setState({ Clients: data["clients"] })}
            })
        }

    }

    componentWillReceiveProps(nextProps) {
        setUnTouched(document);
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") !== -1 ? null : sessionStorage.getItem("OrgId");

        if(nextProps.Client!==null) {
            this.setState({Client: {value: nextProps.Client.value, label:nextProps.Client.label, Id: nextProps.Client.Id}})
        }
        else{
            $.ajax({
                url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
                type: "get",
                success: (data) => { this.setState({ Clients: data["clients"] }) }
            })
        }
    }

    render(){
        return(
            <div style={{ marginTop: '0%' }}>
              <form onSubmit={this.handleSubmit.bind(this)} key={this.state.Clients} >
                    <div className="col-xs-12">
                       <div className="col-md-3">
                            <label>Client</label>
                            <div className="form-group">
                                <div className="input-group">
                                   <span className="input-group-addon">
                                       <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" placeholder="Select Client" ref="client" name="client" options={this.state.Clients} value={this.state.Client} onChange={this.ClientChanged.bind(this)} />
                                </div>
                            </div>
                       </div>
                       <div className="col-md-3">
                            <label> First Name </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon" >
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <input className="form-control" type="text" name="FirstName" placeholder="First Name" autoComplete="off" ref="firstname"  />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label> Last Name </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon" >
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <input className="form-control" type="text" name="LastName" placeholder="Last Name" autoComplete="off" ref="lastname"  />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label> Email </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon" >
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <input className="form-control" type="text" name="email" placeholder="example@example.com" autoComplete="off" ref="email"  />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-12">
                       <div className="col-md-3">
                            <label> Primary Phone Number </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="	glyphicon glyphicon-phone"></span>
                                    </span>
                                    <input className="col-md-3 form-control" name="PhoneNumber" type="text" placeholder="Primary Phone Number" autoComplete="off" ref="primaryNumber" />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <label> Secondary Phone Number </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="	glyphicon glyphicon-phone"></span>
                                    </span>
                                    <input className="col-md-3 form-control" type="text" placeholder="Secondary Phone Number" autoComplete="off" ref="secondaryNum" />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <label> Department </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <input className="col-md-3 form-control" type="text" name="department" placeholder="Department" autoComplete="off" ref="department" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xs-12  text-center form-group">
                         <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                        <button className="submit btn btn-success mleft10 btnsavesuccess" type="submit" name="submit" > Save </button>
                    </div>

              </form>
            </div>
        )
    }

    ClientChanged(val){
        if(val!==null){
            this.setState({Client: val})
            showErrorsForInput(this.refs.client.wrapper, null);
        }
        else{
            this.setState({Client: null})
            showErrorsForInput(this.refs.client.wrapper, ["Please select client"]);
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

        data.append("FirstName", this.refs.firstname.value);
        data.append("LastName", this.refs.lastname.value);
        data.append("PrimaryPhoneNum", this.refs.primaryNumber.value);
        data.append("SecondaryPhoneNumber", this.refs.secondaryNum.value);
        data.append("Email", this.refs.email.value);
        data.append("Department", this.refs.department.value);
        data.append("ClientId", this.state.Client.Id);

        //data.append("OrgId", sessionStorage.getItem("OrgId"));

        let url = ApiUrl + "/api/Client/AddClientEmployee";

        try{
            MyAjaxForAttachments(
                url,
                (data)=>{
                    toast("Client contact added successfully",{
                        type:toast.TYPE.SUCCESS
                    })
                    $("button[name='submit']").show();
                    $(".loader").hide();
                    this.props.closeClientContact();
                    return true;
                },
                (error)=>{
                    toast("An error occured, please try again later",{
                        type:toast.TYPE.ERROR
                    })
                    $(".loader").hide();
                    $("button[name='submit']").show();
                    return false;
                },
                "POST",
                data
            )
        }
        catch(e){
            toast("An error occured, please try again later", {
                type: toast.TYPE.ERROR
            });
            $(".loader").hide();
            $("button[name='submit']").show();
            return false;
        }
    }

    validate(e){
        e.preventDefault();
        var success = true;
        var isSubmit = e.type === "submit";
        
        if (isSubmit) {
            $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
                el.classList.remove("un-touched");
            });
        }

        if (!this.state.Client || !this.state.Client.value) {
            success = false;
            showErrorsForInput(this.refs.client.wrapper, ["Please select a valid client"]);
            if(isSubmit){
                this.refs.client.focus();
                isSubmit= false;
            }
        }

        var nameConstraints = {
            presence: true,
            format: {
                pattern: "[a-zA-Z0-9_]+.*$",
                message: "is not valid"
            },
            length: {
                minimum: 3,
                maximum: 34,
                tooShort: "is too short",
                tooLong: "is too long"
            }
        }

        if (validate.single(this.refs.firstname.value, nameConstraints) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.firstname, ["Please enter valid name"]);
            if (isSubmit) {
                this.refs.firstname.focus();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.firstname, []);
        }

        var lastNameConstraints = {
            presence: true,
            format: {
                pattern: "[a-zA-Z0-9_]+.*$",
                message: "is not valid"
            },
            length: {
                minimum: 1,
                maximum: 20,
                tooShort: "is too short",
                tooLong: "is too long"
            }
        }

        if (validate.single(this.refs.lastname.value, lastNameConstraints) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.lastname, ["Please enter valid name"]);
            if (isSubmit) {
                this.refs.lastname.focus();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.lastname, []);
        }

        var emailConstraints = {
            presence: true,
            email: true
        }

        if (validate.single(this.refs.email.value, emailConstraints) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.email, ["Please enter a valid mail"]);
            if (isSubmit) {
                this.refs.email.focus();
                success = false;
            }
        }
        else {
            showErrorsForInput(this.refs.email, []);
        }

        var phoneConstraints = {
            presence: true,
            format: {
                pattern: /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
                flags: "g"
            }
        }
        if (validate.single(this.refs.primaryNumber.value, phoneConstraints) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.primaryNumber, ["Please enter a valid phone number"]);
            if (isSubmit) {
                this.refs.primaryNumber.focus();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.primaryNumber, []);
        }


        // validation for secondary phone

        var SecondaryPhoneNumber = {
            format: {
                pattern: /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?|^$\s*$/,
                flags: "g",
                message: "is not valid"
            }
        }

        if (validate.single(this.refs.secondaryNum.value, SecondaryPhoneNumber) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.secondaryNum, ["Please enter valid secondary number"])
            if (isSubmit) {
                this.refs.secondaryNum.focus();
                success = false;
            }
        }
        else {
            showErrorsForInput(this.refs.secondaryNum, []);
        }
        var emailConstraints = {
            presence: true,
            email: true
        }

        return success;
    }
}

export default ClientContact;
