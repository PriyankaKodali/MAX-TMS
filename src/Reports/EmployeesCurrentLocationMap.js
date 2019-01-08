import React, { Component } from "react";
import $ from "jquery";
import { MyAjax } from "../MyAjax";
import { ApiUrl } from "../Config.js";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import "./Report.css";

var moment = require("moment");

const google = window.google;

class EmployeesCurrentLocationMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EmployeesCurrentLocation:[],
      EmployeesLocation: [],
      showingInfoWindow: false,
      activeMarker: null,
      selectedEmployee: props,
      Employees: [],
      Employee: null,
      currentDate: moment().format("YYYY-MM-DD"),
      InitialCenter: { lat: 17.3850, lng: 78.4867 },
      LatestLocation:null,
      active:null,
      EmployeeClicked:false,
      ShortAddress:""
    };
  }

  componentWillMount() {
   this.GetAllEmployeesLocations();
  }

 

  GetAllEmployeesLocations(){

   
    $.ajax({
      url: ApiUrl + "/api/EmployeeLocation/GetAllEmployeesLatestLocation?currentDate=" + this.state.currentDate,
      type: "GET",
      success: data => {
        this.setState({ EmployeesLocation: data["EmployeesLatestLocation"] , Employees: data["EmployeesLatestLocation"]});
      }
    });
    this.state.active= null;
  }

  GetEmployeeLocations(empId,i) {
    this.toggle(i)

    
    var url =ApiUrl + "/api/EmployeeLocation/GetEmployeeLocationData?empId=" + empId +
      "&fromDate=" +moment(this.state.currentDate).format("YYYY-MM-DD") +
      "&toDate=" + moment(this.state.currentDate).format("YYYY-MM-DD")+
      "&page=" + 1 +"&count=" + 100;

    $.ajax({
      url: url,
      type: "get",
      success: data => {
        this.setState({ EmployeesLocation: data["employeeLocations"],
             LatestLocation: data["LatestLocation"],EmployeeClicked:true
        },()=>{
               if(this.state.LatestLocation!=null)
               {
                  var latitude= parseFloat(data["LatestLocation"]["Latitude"]);
                  var longitude=parseFloat(data["LatestLocation"]["Longitude"]);
                  this.setState({InitialCenter: {lat:latitude, lng: longitude }})
               } 
        });
      }
    });
  }

  toggle(position){
      this.setState({active : position})
  }

  myColor(position){
    if (this.state.active === position) {
      return "skyblue";
    }
    return "";
  }

  onMarkerClick = (props, marker, e) =>
    this.setState({
       selectedEmployee: props,
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

  render() {
    return (
      <div id="container">
        <div id="Employees">
         <div>
          <input className="form-control" style={{lineHeight:'1.5'}} type="date" ref="selectedDate" defaultValue={moment().format("YYYY-MM-DD")}  />
         </div>

           <button className="col-xs-12 btn btn-primary" style={{backgroundColor:'none !important'}} value="Search" onClick={this.searchClick.bind(this)} > Search </button>
           <button className="col-xs-12 btn btn-default" style={{textAlign:'center', background:'lightgray'}} value="Refresh" onClick={this.GetAllEmployeesLocations.bind(this)} > <b> REFRESH </b> </button>
         
          <div>
             {this.state.Employees.map((ele, i) => {
               return (
                  <div key={i} style={{backgroundColor: this.myColor(i)}}  className="employee-result-header" onClick={()=>this.GetEmployeeLocations(ele.Emp_Id,i)}>
                      <div className="employee-result-title ">{ele.Employee}</div>
                      <p>Last Updated : {moment(ele.Time).format("DD-MMM-YYYY h:mm a")}   </p>
                      <hr />
                  </div>
                );
               })}
            </div>
        </div>

        <div id="locations" >
          <div id="map" style={{ position: "absolute", width: "80%", height: "91%" }}  key={this.state.EmployeesLocation}  >
            <Map  key={this.state.InitialCenter}
              google={this.props.google}
              style={{ width: "100%", height: "100%", position: "absolute" }}
              initialCenter={{ lat:this.state.InitialCenter.lat, lng:this.state.InitialCenter.lng }}
              className={"map"}
              zoom={11}
            >
              {this.state.EmployeesLocation.map((ele, i) => {
                return (
                  <Marker
                    key={i}
                    onClick={this.onMarkerClick}
                    position={{ lat: ele["Latitude"], lng: ele["Longitude"] }}
                    onMouseover={this.onMouseoverMarker}
                    title={ele["Employee"]}
                    LastUpdated={ele["Time"]}
                  />
                );
              })}

              <InfoWindow 
                marker={this.state.activeMarker}
                visible={this.state.showingInfoWindow} >
                <div key={this.state.EmployeeClicked}>
                  <b>{this.state.selectedEmployee.title}</b> <br />
                  {
                    this.state.EmployeeClicked ?
                      <div>
                       <b> Time : </b> {moment(this.state.selectedEmployee.LastUpdated).format("h:mm a" )}  <br />
                       <b key={this.state.ShortAddress}> {this.state.ShortAddress}</b>
                      </div>
                    :
                     <div>
                      <b> Last Updated on : </b> {moment(this.state.selectedEmployee.LastUpdated).format("DD-MMM-YYYY h:mm a")} <br />
                      <b key={this.state.ShortAddress}> {this.state.ShortAddress}</b>
                      
                    </div>
                  }
                </div>
              </InfoWindow>
            </Map>

          </div>
        </div>
      </div>
    );
  }

  searchClick(){
    if(this.refs.selectedDate.value=="")
    {
      this.refs.selectedDate.value = moment().format("YYYY-MM-DD");
      this.setState({currentDate:moment().format("YYYY-MM-DD")},()=>{
        this.GetAllEmployeesLocations();
      })
    }
    else{
      this.setState({currentDate:this.refs.selectedDate.value},()=>{
        this.GetAllEmployeesLocations();
      })
    }
  
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o"
})(EmployeesCurrentLocationMap);
