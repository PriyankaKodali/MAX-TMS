import React, { Component } from "react";
import $ from "jquery";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import {ApiUrl} from '../Config';
import "./Report.css";

var moment= require('moment');

<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o&callback=initMap"></script>;

class LocationsMap extends Component {
  constructor(props) {
      super(props);
    this.state = {
      EmployeesLocations: [],
      Employees: [],
      Employee: null,
      InitialCenter: { lat: 17.3850, lng: 78.4867 },
      showingInfoWindow: false,
      activeMarker: null,
      selectedEmployee:props, ShortAddress:""
    };
  }

  componentWillMount() {
    this.GetAllEmployeesLocations();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({Employee: nextProps.Employee, FromDate:nextProps.FromDate, ToDate: nextProps.ToDate},()=>{
      this.GetAllEmployeesLocations();
    })
  }

  GetAllEmployeesLocations(){
   // this.toggle(i)
    var url =ApiUrl +"/api/EmployeeLocation/GetEmployeeLocationData?empId=" +
    this.props.Employee +"&fromDate=" +this.props.FromDate +"&toDate=" +this.props.ToDate +
    "&page=" +this.props.Page +"&count=" + this.props.Count;
  $.ajax({
    url: url,
    type: "get",
    success: data => {
      this.setState({ EmployeesLocations: data["employeeLocations"],Employees: data["employees"] });
    }
   });
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
        <div id="locationsMap" key={this.state.EmployeesLocations}>
          <Map
            key={this.state.InitialCenter}
            google={this.props.google}
            style={{ width: "95%", height: "90%", position: "absolute" }}
            initialCenter={{
              lat: this.state.InitialCenter.lat,
              lng: this.state.InitialCenter.lng
            }}
            className={"map"}
            zoom={11}
           >
            {this.state.EmployeesLocations.map((ele, i) => {
              return (
                <Marker  key={i}  onClick={this.onMarkerClick}
                  position={{ lat: ele["Latitude"], lng: ele["Longitude"] }}
                  onMouseover={this.onMouseoverMarker} title={ele["Employee"]}
                  LastUpdated={ele["Time"]}
                />
              );
            })}
            
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow} >
              <div key={this.state.EmployeeClicked}>
                <b>{this.state.selectedEmployee.title}</b> <br />
                 <div>
                    <b> Time : </b> { moment(this.state.selectedEmployee.LastUpdated).format("DD-MMM-YYYY h:mm a")} <br />
                    <b>Location :  </b>  {this.state.ShortAddress}
                  </div>
              </div>
            </InfoWindow>

          </Map>
     </div>
    </div>
    );
  }

  
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o"
})(LocationsMap);



// <div id="Employees">
// <button className="col-xs-12 btn btn-default" style={{ textAlign: "center", background: "lightgray" }}
//   value="Refresh" onClick={this.GetAllEmployeesLocations.bind(this)} >
//   <b> REFRESH </b>
// </button>
// <div>
//   {this.state.Employees.map((ele, i) => {
//     return (
//       <div key={i} style={{ backgroundColor: this.myColor(i) }}
//         className="employee-result-header" 
//         onClick={() => this.GetEmployeeLocations(ele.Emp_Id, i)}
//       >
//         <div className="employee-result-title ">{ele.Employee}</div>
//         {/* <p>
//           Last Updated :{" "}
//           {moment(ele.Time).format("DD-MMM-YYYY h:mm a")}{" "}
//         </p> */}
//         <hr />
//       </div>
//     );
//   })}
// </div>

// </div>
{/* {this.state.EmployeeClicked ? (
                  <div>
                    <b> Time : </b> { moment(this.state.selectedEmployee.LastUpdated).format("h:mm a")}
                  </div>
                ) : (
                  <div>
                    <b> Last Updated on : </b>
                    <p>
                      {moment(this.state.selectedEmployee.LastUpdated).format( "DD-MMM-YYYY h:mm a")}
                    </p> 
                    
                  </div>
                )} */}

              //  toggle(position){
                    //     this.setState({active : position})
                    //  }
                    
                    //  myColor(position){
                    //   if (this.state.active === position) {
                    //     return "skyblue";
                    //   }
                    //   return "";
                    //  }
                    