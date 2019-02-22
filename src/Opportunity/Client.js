import React, {Component} from 'react';
import $ from 'jquery';
import {ApiUrl} from '../Config.js';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import Select from 'react-select';
import { validate } from 'validate.js';
import { MyAjaxForAttachments, MyAjax } from '../MyAjax.js';
import {toast} from 'react-toastify';

class Client extends Component{
    constructor(props){
        super(props);
        this.state={
            Countries:[], Country:null, States:[], State:null, Cities:[], City:null, TimeZones:[],
            TimeZone:null,
        }
    }

    componentWillMount(){
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetCountries",
            type: "get",
            success: (data) => { this.setState({ Countries: data["countries"], Country: {value:101, label:'India'} },()=>{
                $.ajax({
                    url: ApiUrl + "/api/MasterData/GetStates?countryId=" + 101,
                    success: (data) => { this.setState({ States: data["states"] }) }
                 })
              }) }
        });
        
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetTimeZones",
            type: "get",
            success: (data) => { this.setState({ TimeZones: data["timeZones"], 
                  TimeZone: {value:104, label: "Indian Standard Time ( UTC+05:30) ( IST )" }  }) }
        })
    }

    render(){
        return(
            <div style={{ marginTop: '0%' }}>
               <form onSubmit={this.handleSubmit.bind(this)} >
                  <div className="col-xs-12">
                        <div className="col-md-3">
                            <label> Name </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon" >
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <input className="form-control" type="text" name="ClientName" placeholder="Client Name" autoComplete="off" ref="clientname"  />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label> Short Name </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon" >
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <input className="form-control" type="text" name="ShortName" placeholder="Short Name" autoComplete="off" ref="shortname" />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label> Primary Phone Number </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="	glyphicon glyphicon-phone"></span>
                                    </span>
                                    <input className="form-control" type="text" name="PhoneNumber" placeholder="Primary Phone Number" autoComplete="off" ref="primaryNumber" />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label> Email </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-envelope"></span>
                                    </span>
                                    <input className="form-control" type="text" name="email" placeholder="Email" autoComplete="off" ref="email"  />
                                </div>
                            </div>
                        </div>
                   </div>
                   <div className="col-xs-12">
                      <div className="col-md-6">
                           <label>Address Line 1 </label>
                           <div className="form-group">
                              <div className="input-group">
                                   <span className="input-group-addon">
                                      <span className="glyphicon glyphicon-map-marker"></span>
                                   </span>
                                  <input className="col-md-5 form-control" name="AddressLine1" type="text" ref="addressLine1" placeholder="Address " autoComplete="off"  />
                               </div>
                            </div>
                       </div>
                       <div className="col-md-3">
                           <label> Country </label>
                            <div className="form-group">
                              <div className="input-group">
                                  <span className="input-group-addon">
                                      <span className="glyphicon glyphicon-map-marker"></span>
                                  </span>
                                 <Select className="form-control" name="Country" placeholder="Select Country" ref="country" value={this.state.Country} options={this.state.Countries} onChange={this.CountryChanged.bind(this)} />
                              </div>
                           </div>
                       </div>
                        <div className="col-md-3">
                           <label> State </label>
                           <div className="form-group">
                              <div className="input-group">
                                <span className="input-group-addon">
                                    <span className="glyphicon glyphicon-map-marker"></span>
                                </span>
                                <Select className="form-control" name="State" placeholder="Select State" ref="state" value={this.state.State} options={this.state.States} onChange={this.StateChanged.bind(this)} />
                              </div>
                           </div>
                       </div>
                   </div>
                   <div className="col-xs-12">
                      <div className="col-md-3">
                          <label> City </label>
                           <div className="form-group">
                               <div className="input-group">
                                  <span className="input-group-addon">
                                      <span className="glyphicon glyphicon-map-marker"></span>
                                   </span>
                                  <Select className="form-control" name="City" placeholder="Select city" ref="city" value={this.state.City} options={this.state.Cities} onChange={this.CityChanged.bind(this)} />
                               </div>
                           </div>
                       </div>
                       <div className="col-md-3">
                          <label> ZIP </label>
                           <div className="form-group">
                              <div className="input-group">
                                   <span className="input-group-addon">
                                      <span className="glyphicon glyphicon-home"></span>
                                   </span>
                                  <input className="form-control" name="ZIP" type="text" ref="zip" placeholder="Postal code" autoComplete="off" />
                               </div>
                           </div>
                       </div>
                       <div className="col-md-3">
                          <label> Time Zone </label>
                          <div className="form-group">
                              <div className="input-group">
                                   <span className="input-group-addon">
                                      <span className="glyphicon glyphicon-time"></span>
                                   </span>
                                  <Select className="form-control" name="TimeZone" ref="timezone" placeholder="Select TimeZone" value={this.state.TimeZone} options={this.state.TimeZones} onChange={this.timeZoneChanged.bind(this)} />
                              </div>
                           </div>
                       </div>
                    </div>
                   <div className="col-xs-12  text-center form-group">
                        <div className="loader " style={{ marginLeft: '20%', marginBottom: '2%' }} ></div>
                        <button className="submit btn btn-success mleft10 btnsavesuccess" type="submit" name="submit" > Save </button>
                    </div>
               </form>
            </div>
        )
    }

    CountryChanged(val) {
        if (val) {
            this.setState({ Country: val }, () => {
                if (this.state.Country && this.state.Country.value) {

                    $.ajax({
                        url: ApiUrl + "/api/MasterData/GetStates?countryId=" + this.state.Country.value,
                        success: (data) => { this.setState({ States: data["states"] }) }
                    })
                    showErrorsForInput(this.refs.country.wrapper, null);
                }
                else {
                    this.setState({ States: [], State: null });
                    showErrorsForInput(this.refs.country.wrapper, ["Please select a valid country"]);
                    showErrorsForInput(this.refs.state.wrapper, ["Please select a valid state"]);
                    showErrorsForInput(this.refs.city.wrapper, ["Please select a valid city"]);
                }
            });
        }
        else {
            this.setState({ Country: '' })
            showErrorsForInput(this.refs.country.wrapper, ["Please select valid country"]);
        }

    }

    StateChanged(val) {
        if (val) {
            this.setState({ State: val }, () => {
                if (this.state.State && this.state.State.value) {
                    $.ajax({
                        url: ApiUrl + "/api/MasterData/GetCities?stateId=" + this.state.State.value,
                        success: (data) => { this.setState({ Cities: data["cities"] }) }
                    })
                    showErrorsForInput(this.refs.state.wrapper, null);
                }
                else {
                    this.setState({ Cities: [], City: null });
                    showErrorsForInput(this.refs.state.wrapper, ["Please select a valid state"]);
                    showErrorsForInput(this.refs.city.wrapper, ["Please select a valid city"]);
                }
            });
        }
        else {
            this.setState({ State: '' })
            showErrorsForInput(this.refs.state.wrapper, ["Please select valid state"]);
        }

    }

    CityChanged(val) {
        if (val) {
            this.setState({ City: val })
            showErrorsForInput(this.refs.city.wrapper, null);
        }
        else {
            this.setState({ City: '' })
            showErrorsForInput(this.refs.city.wrapper, ["Please select valid city"]);
        }

    }

    timeZoneChanged(val) {
        this.setState({ TimeZone: val || '' })
        showErrorsForInput(this.refs.timezone.wrapper, null);
    }

    resetForm(){

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

        var location=[];
        var clientLoc={
            addressLine1: this.refs.addressLine1.value.trim(),
            country:this.state.Country.value,
            state: this.state.State.value,
            city:this.state.City.value,
            zip: this.refs.zip.value,
            timeZone: this.state.TimeZone.value,
        }
        location.push(clientLoc);

        var clientVertical=[{value:7, label:'IT & Networking'}]

        var data= new FormData();

        data.append("Name", this.refs.clientname.value);
        data.append("ShortName", this.refs.shortname.value);
        data.append("PrimaryPhone", this.refs.primaryNumber.value);
        data.append("ClientLocations", JSON.stringify(location));
        data.append("Email", this.refs.email.value);
        data.append("ClientVerticals", JSON.stringify(clientVertical));
        data.append("Organisation", 1003);
        data.append("ClientType", "Direct Client");
         
        var url  = ApiUrl + "/api/Client/AddClient"
        try {

            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Client saved successfully!", {
                        type: toast.TYPE.SUCCESS
                    });
                    $(".loader").hide();
                    $("button[name='submit']").show();
                    this.resetForm();
                    this.props.closeClientModel();
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
            );
        }
        catch (e) {
            toast("An error occured, please try again later", {
                type: toast.TYPE.ERROR
            });
            $(".loader").hide();
            $("button[name='submit']").show();
            return false;
        }
    }

    validate(e){
        var success = true;
        var isSubmit = e.type === "submit";
        var clientName = this.refs.clientname.value;
        var shortname = this.refs.shortname.value;
        var primaryNum = this.refs.primaryNumber.value;

       //validate client name
           var nameConstraints = {
                presence: true,
                format: {
                     pattern: "[a-zA-Z0-9_]+.*$",
                     message: "is not valid"
                    },
                 length: {
                    minimum: 3,
                    maximum: 150,
                    tooShort: "is too short",
                    tooLong: "is too long"
                    }
            }
        
            if (validate.single(clientName, nameConstraints) !== undefined) {
                    success = false;
                    showErrorsForInput(this.refs.clientname, ["Please enter valid name"]);
                    if (isSubmit) {
                        this.refs.clientname.focus();
                        isSubmit = false;
                    }
                }
                else {
                    showErrorsForInput(this.refs.clientname, []);
                }
        
                // short name
        
                if (validate.single(shortname, nameConstraints) !== undefined) {
                    success = false;
                    showErrorsForInput(this.refs.shortname, ["Please enter valid short name"]);
                    if (isSubmit) {
                        this.refs.shortname.focus();
                        isSubmit = false;
                    }
                }
                else {
                    showErrorsForInput(this.refs.shortname, []);
                }
        
        
                // validation for primary phone
        
        var phoneConstraints = {
           presence: true,
           format: {
                      pattern: /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
                     flags: "g"
                 }
        }
        if (validate.single(primaryNum, phoneConstraints) !== undefined) {
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

        // validate email
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

        if (validate.single(this.refs.addressLine1.value, { presence: true }) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.addressLine1, ["Addressline 1 should not be empty"])
            if (isSubmit) {
                this.refs.addressLine1.focus();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.addressLine1, []);
        }

        if (!this.state.Country || !this.state.Country.value) {
            success = false;
            showErrorsForInput(this.refs.country.wrapper, ["Please select a country"]);
            if (isSubmit) {
                this.refs.country.focus();
                isSubmit = false;
            }
        }
        if (!this.state.State || !this.state.State.value) {
            success = false;
            showErrorsForInput(this.refs.state.wrapper, ["Please select a valid state"]);
            if (isSubmit) {
                this.refs.state.focus();
                isSubmit = false;
            }
        }
        if (!this.state.City || !this.state.City.value) {
            success = false;
            showErrorsForInput(this.refs.city.wrapper, ["Please select a valid city"]);
            if (isSubmit) {
                this.refs.city.focus();
                isSubmit = false;
            }
        }

        return success;
        
    }

}

export default Client;