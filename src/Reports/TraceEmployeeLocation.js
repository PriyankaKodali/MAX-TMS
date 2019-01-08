import React, { Component } from "react";
import $ from "jquery";
import Select from "react-select";
import { MyAjax } from "../MyAjax";
import { toast } from "react-toastify";
import { ApiUrl, remote } from '../Config';
import Geocode from "react-geocode";
import {showErrorsForInput, setUnTouched, ValidateForm } from ".././Validation";
import TimePicker from "react-time-picker";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import "./Report.css";
import LocationsMap from "./LocationsMap";

var moment = require("moment");
var ReactBSTable = require("react-bootstrap-table");
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;

<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o&callback=initMap"></script>;


function trClassFormat(row, rowIdx) {
  if (row["IsMin"] == 1 || row["IsMax"] == 1) {
      return "isMinOrMaxRow";
  }
  else{
    return "pointer";
  }
}

class TraceEmployeeLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      sizePerPage: 10,
      dataTotalSize: 0,
      EmployeeLocations: [],
      Employees: [],
      Employee: '',
      FromDate: moment().format("YYYY-MM-DD"),
      ToDate: moment().format("YYYY-MM-DD"),
      IsDataAvailable: false,
      Address: null,
      FromTime: "9:00",
      ToTime: "18:00",
      EmployeeLocationClick: false,
      Latitude: null,
      Longitude: null,
      showingInfoWindow: false,
      activeMarker: null,
      SelectedEmployee:'',
      SelectedTime: null,
      ViewOnMapClick:false,
      EmployeeName:'',
      ShortAddress:""
    };
  }

  componentWillMount() {
    Geocode.setApiKey("AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o");
    $.ajax({
      url: ApiUrl + "/api/MasterData/GetAllEmployeesWithAspNetUserId?orgId=" +null,
      type: "get",
      success: (data) => { this.setState({ Employees: data["employees"] }) }
  })
    this.GetEmployeeLocations(this.state.currentPage, this.state.sizePerPage);
  }

  GetEmployeeLocations(page, count) {
  
    var url =ApiUrl +"/api/EmployeeLocation/GetEmployeeLocationData?empId=" +this.state.Employee +
               "&fromDate=" + this.state.FromDate+ "&toDate=" +this.state.ToDate +
               "&page=" + page + "&count=" + count;

     $.ajax({
      url: url,
      type: "get",
      success: data => {
        this.setState({ EmployeeLocations: data["employeeLocations"], IsDataAvailable: true, 
                dataTotalSize: data["totalCount"],
                currentPage: page, sizePerPage: count
              });
         }
     });
  }

  render() {
    return (
      <div className="container">
        <div className="col-xs-12 search">
          <div className="col-md-3">
            <div className="form-group">
              <label>Employee</label>
              <Select className="form-control" ref="employee"
                placeholder="Select Employee" options={this.state.Employees}
                value={this.state.Employee} onChange={this.EmployeeChanged.bind(this)}
              />
            </div>
          </div>

          <div className="col-md-2">
             <label> From Date </label>
                <div className="form-group">
                  <input className="form-control" type="date" style={{ lineHeight: "19px" }} name="date" ref="fromDate" defaultValue={this.state.FromDate} />
                </div>
           </div>

          <div className="col-md-2">
             <label>To Date</label>
             <div className="form-group">
             <input className="form-control" type="date" name="toDate" ref="toDate" defaultValue={this.state.ToDate}  />
             </div>
          </div>

          <div className="col-md-4 mTop2" >
            <button className="btn btn-primary" type="submit" value="Search" onClick={this.handleSearchClick.bind(this)}  > Search </button>
            <button className="btn btn-default mleft10" value="Clear" onClick={this.clearClick.bind(this)} > Clear </button>
          </div>

          <div className="col-md-1" style={{marginTop: '1%'}}> 
              {/* <i className="glyphicon glyphicon-map-marker mapIcon" title="View on map" onClick={this.GoogleMapClick.bind(this)} ></i> */}
              <i title="View on map" onClick={this.GoogleMapClick.bind(this)}>  
                  <img className="logo" src="Images/google-maps.png" alt="" />
              </i>
          </div>
         </div>

        <div className="col-xs-12" style={{marginTop: '1%'}} key={this.state.IsDataAvailable}>
        {
          this.state.IsDataAvailable ?
          <BootstrapTable striped hover pagination={true} remote={remote} 
            data={this.state.EmployeeLocations}
            fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
            trClassName={trClassFormat}
            options={{
              sizePerPage: this.state.sizePerPage,
              onPageChange: this.onPageChange.bind(this),
              sizePerPageList: [{ text: '10', value: 10 },{ text: '25', value: 25 },
                             { text: 'ALL', value: this.state.dataTotalSize }],
              page: this.state.currentPage,
              onSizePerPageList: this.onSizePerPageList.bind(this),
              paginationPosition: 'bottom',
              onRowClick: this.rowClicked.bind(this)
            }}
          >
            <TableHeaderColumn dataField="Employee" dataAlign="left" dataSort={true} width="17%" > Employee </TableHeaderColumn>
             <TableHeaderColumn dataField="Designation" dataAlign="left" dataSort={true} width="13%"  > Designation </TableHeaderColumn>
             <TableHeaderColumn dataField="Department" dataAlign="left"  dataSort={true} width="13%" > Department </TableHeaderColumn>
            <TableHeaderColumn dataField="Time" dataAlign="left" dataSort={true} isKey={true} width="15%" dataFormat={this.viewDateFormat.bind(this)} > Time </TableHeaderColumn>
            <TableHeaderColumn dataField="Location" dataSort={true}  dataFormat={this.getGeoLocation.bind(this)}> Location  </TableHeaderColumn>
          </BootstrapTable>
          :
          <div className="loader visible" style={{ marginTop: '5%' }} ></div>
        }
          
        </div>

        {
          this.state.EmployeeLocationClick ? (
          <div  id="employeeLocation" className="modal fade"  role="dialog"  ref="employeeLocation" >
            <div className="modal-dialog modal-lg" >
              <div className="modal-content">
                <div className="modal-header">
                   <b> {this.state.SelectedEmployee } </b>  on  <b> {this.state.SelectedTime}</b>
                  <button type="button" className="close" data-dismiss="modal">
                    &times;
                  </button>
                </div>
                <div className="modal-body" style={{ height: '320px'}}>
                  <div id="map" style={{  position: "absolute", width: "93%",  height: "90%"  }}  >
                    <Map key={this.state.InitialCenter} google={this.props.google}
                      style={{  width: "100%",  height: "100%", position: "absolute" }}
                      initialCenter={{ lat: this.state.Latitude, lng: this.state.Longitude }}
                      className={"map"}  zoom={14}  >

                      <Marker onClick={this.onMarkerClick}
                        position={{ lat: this.state.Latitude, lng: this.state.Longitude  }}
                        onMouseover={this.onMouseoverMarker} title={this.state.Employee}
                      />
                    </Map>
                  </div>
                </div>
              
              </div>
            </div>
          </div>
        ) : (
          ""
        )}

        {
          this.state.ViewOnMapClick ?
          <div  id="viewLocationsOnMap" className="modal fade"  role="dialog"  ref="employeeLocation" >
            <div className="modal-dialog modal-lg" >
              <div className="modal-content">
                <div className="modal-header">
                   <b> {this.state.EmployeeName !='' ? this.state.EmployeeName : "All Employees " }</b>
                               from  <b> {moment(this.state.FromDate).format("DD-MMM-YYYY")} </b> 
                               to  <b> {moment(this.state.ToDate).format("DD-MMM-YYYY")} </b>
                  <button type="button" className="close" data-dismiss="modal">  &times; </button>
                </div>
                <div className="modal-body" style={{ height: '320px'}}>
                     <LocationsMap  Page={this.state.currentPage} Count={this.state.sizePerPage} FromDate={this.state.FromDate} ToDate={this.state.ToDate} Employee={this.state.Employee}  />
                </div>
              </div>
            </div>
          </div>
          :
          ""
        }

      </div>
    );
  }

  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedLocation: props,
      activeMarker: marker,
       showingInfoWindow: true
       },()=>{
        var latitude= props.position["lat"];
        var longitude= props.position["lng"];
        var url ="https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," +longitude + "&key=AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o";
        var data = $.parseJSON(
          $.ajax({
            url: url,
            dataType: "json",
            async: false
          }).responseText
        );
        var completeAddress = data.results[0]["formatted_address"];
        var shortAddress=data.results[0]["address_components"][1]["long_name"]
        this.setState({ShortAddress: shortAddress});
      });

  rowClicked(row) {
    var latitude = parseFloat(row["Latitude"]);
    var longitude = parseFloat(row["Longitude"]);
    this.setState({ EmployeeLocationClick: true, Latitude: latitude, Longitude: longitude,
          SelectedEmployee: row["Employee"], SelectedTime: moment(row["Time"]).format("DD-MMM-YYYY h:mm a")  }, () => {
        $("#employeeLocation").modal("show");
      }
    );
  }

  EmployeeChanged(val) {
    if (val !== null) {
      this.setState({ Employee: val.value, EmployeeName: val.label });
    }
    else{
      this.setState({Employee: ''});
    }
  }

  clearClick() {
    this.refs.fromDate.value=moment().format("YYYY-MM-DD");
    this.refs.toDate.value=moment().format("YYYY-MM-DD");
    this.setState({ Employee: '', FromDate: moment().format("YYYY-MM-DD"),ToDate: moment().format("YYYY-MM-DD") },()=>{
      this.GetEmployeeLocations(this.state.currentPage,this.state.sizePerPage);
    });
  }

  handleSearchClick() {
    this.setState({ Employee: this.state.Employee, FromDate: this.refs.fromDate.value, ToDate:this.refs.toDate.value },
        () => {
          this.GetEmployeeLocations(this.state.currentPage,this.state.sizePerPage);
      });
  }

  GoogleMapClick(){
    this.setState({ViewOnMapClick: true, Employee:this.state.Employee,
       FromDate:this.refs.fromDate.value, ToDate:this.refs.toDate.value},()=>{
      $("#viewLocationsOnMap").modal("show");
    })
  }

  viewDateFormat(cell, row) {
    return <p> {moment(row["Time"]).format("DD-MMM-YYYY h:mm a")} </p>;
  }

  getGeoLocation(cell, row) {
    var latitude = row["Latitude"];
    var longitude = row["Longitude"];
    var url ="https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," +longitude + "&key=AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o";

    var data = $.parseJSON(
      $.ajax({
        url: url,
        dataType: "json",
        async: false
      }).responseText
    );
    var completeAddress = data.results[0]["formatted_address"];
    return <p>{completeAddress}</p>;
  }

  onPageChange(page, sizePerPage) {
    this.GetEmployeeLocations(page, sizePerPage);
  }

  onSizePerPageList(sizePerPage) {
    this.GetEmployeeLocations(this.state.currentPage, sizePerPage);
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o"
})(TraceEmployeeLocation);
