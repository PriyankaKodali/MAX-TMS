import React, { Component } from "react";
import * as $ from "jquery";
import DatePicker from "react-datepicker";
import moment from "moment";

import "react-datepicker/dist/react-datepicker.css";
import "./Maps.css";
import { ApiUrl } from '../../Config';
import { MyAjax, MyAjaxForAttachments } from "../../MyAjax";
import { MyMapComponent } from "./MyMapComponent";
import { toast } from "react-toastify";

class Maps extends Component {
  constructor(props) {
    super(props);
    var unloggedEmployees = [{ employeeId: '', isAbsent: false, onLeave: false }]
    this.state = {
      sidebarOpen: true,
      date: moment().toISOString(),
      dataForDay: [],
      hoveredEmployee: null,
      centerLat: 17.4275,
      centerLng: 78.414125,
      zoom: 8,
      refName: "mainMapRef",
      IsDataAvailable: false,
      SelectedEmployee: {},
      SelectedEmployeeReport: [],
      pathCoordinates: [],
      mode: "All",
      hoveredLocation: null,
      EmployeesTobeLoggedIn: [],
      showUnLoggedEmployees: false,
      isDisabled: true, LeaveType: ''
    };
  }

  componentDidMount() {
    var mainThis = this;
    $("#sidebarCollapse").on("click", function () {
      mainThis.setState({ sidebarOpen: !mainThis.state.sidebarOpen }, () => {
        if (mainThis.state.sidebarOpen) {
          $(this).css({ left: "400px" });
        } else {
          $(this).css({ left: "0" });
        }
      });
      $("#sidebar").toggleClass("active");
    });
    $(".location-info").hover(function () {
      this.setState({ hoveredEmployee: $(this).attr("id") });
    });

    if (this.props.location.state) {
      var view = this.props.location.state["view"];
      if (view == "UnLogged") {
        this.GetEmployees();
      }
      if (view == "EmpLocationDetail") {
        var empId = {
          EmployeeId: this.props.location.state["EmpId"],
          EmployeeName: this.props.location.state["EmpName"],
          LastReportedAddress: this.props.location.state["Address"],
          ClockInTime: this.props.location.state["ClockInTime"],
          ClockOutTime: this.props.location.state["ClockOutTime"]
        }
        this.employeeSelected(empId);
      }
    }
    else {
      this.getDataForDay();
    }
  }

  clearClicked() {
    this.setState({ date: moment().toISOString() }, () => {
      this.getDataForDay();
    });
  }

  getDataForDay() {
    $(".map-loader").show();
    var url = ApiUrl + "/api/EmployeeLocation/GetAllEmployeesLatestLocation?currentDate=" + moment(this.state.date).format("YYYY-MM-DD");
    MyAjax(url,
      data => {
        this.setState({
          dataForDay: data["EmployeesLatestLocation"], IsDataAvailable: true,
          mode: "All", showUnLoggedEmployees: false
        }, () => {
          var bounds = new window.google.maps.LatLngBounds();
          this.state.dataForDay.map(location => {
            bounds.extend(
              new window.google.maps.LatLng(
                parseFloat(location.Latitude),
                parseFloat(location.Longitude)
              )
            );
          });
        });
        $(".map-loader").hide();
      },
      error => {
        alert("Error Occoured!");
        $(".map-loader").hide();
      },
      "GET",
      null
    );
  }

  employeeSelected(location) {
    this.setState(
      {
        mode: "Employee",
        SelectedEmployee: location
      },
      () => {
        this.getEmployeeDayReport();
      }
    );
  }

  getEmployeeDayReport() {
    this.setState({ pathCoordinates: [], SelectedEmployeeReport: [] });
    $(".map-loader").show();

    var url = ApiUrl + "/api/EmployeeLocation/GetEmployeeLocationData?Date=" +
      moment(this.state.date).format("YYYY-MM-DD") + "&EmployeeId=" + this.state.SelectedEmployee.EmployeeId;
    MyAjax(
      url,
      data => {
        this.setState({ SelectedEmployeeReport: data["employeeLocations"], IsDataAvailable: true },
          () => {
            // var bounds = new window.google.maps.LatLngBounds();
            // this.state.SelectedEmployeeReport.map((location) => {
            //     bounds.extend(new window.google.maps.LatLng(parseFloat(location.Latitude), parseFloat(location.Longitude)))
            // });
            var last = this.state.SelectedEmployeeReport.length - 1;
            var lastRecord = this.state.SelectedEmployeeReport[last];

            var pathCoordinates = this.state.SelectedEmployeeReport.map(
              location => {
                return {
                  lat: parseFloat(location.Latitude),
                  lng: parseFloat(location.Longitude)
                };
              });
            this.setState({ pathCoordinates: pathCoordinates, });
          });
        $(".map-loader").hide();
      },
      error => {
        alert("Error Occoured!");
        $(".map-loader").hide();
      },
      "GET",
      null
    );
  }

  dateChanged(date) {
    if (date === null) {
      date = moment().toISOString();
    }
    this.setState({
      date: date
    });
  }

  onLocationMouseEnter(employeeId) {
    this.setState({ hoveredEmployee: employeeId });
  }

  onLocationMouseLeave() {
    this.setState({ hoveredEmployee: null });
  }

  onLocationInfoClick(location) {
    this.setState({
      centerLat: parseFloat(location.Latitude),
      centerLng: parseFloat(location.Longitude),
      zoom: 15
    });
  }

  onLocationLogMouseEnter(location) {
    this.setState({
      hoveredLocation: {
        lat: parseFloat(location.Latitude),
        lng: parseFloat(location.Longitude)
      }
    });
  }

  onLocationLogMouseLeave() {
    this.setState({ hoveredLocation: null });
  }

  GetEmployees() {
    $(".map-loader").show();
    $.ajax({
      url: ApiUrl + "/api/EmployeeLocation/GetEmployeesToBeLoggedIN?date=" +
        moment(this.state.date).format("YYYY-MM-DD"),
      type: "GET",
      success: (data) => {
        this.setState({ EmployeesTobeLoggedIn: data["employees"], showUnLoggedEmployees: true }, () => {
          $(".map-loader").hide();
        })
      }
    });

  }

  render() {
    return (
      <div className="maps-wrapper maps">
        <nav id="sidebar">
          <div className="sidebar-header">
            <div id="date-input-wrapper" className="d-flex align-items-center">
              <div style={{ flexGrow: "1" }}>
                <DatePicker className="form-control" dateFormat="dd/MM/yyyy" popperPlacement="bottom-start"
                  selected={this.state.date} onChange={this.dateChanged.bind(this)} />
              </div>

              <div style={{ width: "30px" }}>
                <span title="search" className="fa fa-search date-input-icons"
                  style={{ WebkitTextStroke: "1px white", fontSize: "23px" }}
                  onClick={() => this.getDataForDay()} />
              </div>
              <div style={{ borderLeft: "1pt solid #b7b7b7", width: "1px", height: "80%", margin: "0 5px" }} />
              <div style={{ width: "30px" }}>
                <span title="clear" className="fa fa-times date-input-icons"
                  style={{ WebkitTextStroke: "4px white", fontSize: "30px" }}
                  onClick={() => this.clearClicked()}
                />
              </div>
            </div>
            {this.state.mode === "Employee" ? (
              <div style={{ backgroundColor: "#fff", padding: "2px 8px", fontSize: "14px" }} >
                <b> <a href="javascript:void(0)" onClick={() => this.getDataForDay()} >  All Results  </a> </b>
                <b style={{ float: 'right' }} > <a href="javascript:void(0)" onClick={() => this.GetEmployees()}> Not Yet Logged </a> </b>
              </div>
            ) :
              <div style={{ backgroundColor: "#fff", padding: "2px 8px", fontSize: "14px" }}  >
                <a href="javascript:void(0)" onClick={() => this.GetEmployees()}>  <b  > Not Yet Logged </b> </a>
                {
                  this.state.showUnLoggedEmployees ?
                    <b style={{ float: 'right' }}> <a href="javascript:void(0)" onClick={() => this.getDataForDay()} >  All Results  </a> </b>
                    :
                    <span />
                }
              </div>
            }
          </div>

          {
            this.state.mode === "All" && !this.state.showUnLoggedEmployees ? (
              <div id="dataForTheDay">
                {this.state.dataForDay.map(location => {
                  var segment = (
                    <div className={"location-info " + (this.state.hoveredEmployee === location.EmployeeId ? "active" : "")}
                      key={location.EmployeeId}
                      onMouseEnter={() => this.onLocationMouseEnter(location.EmployeeId)}
                      onMouseLeave={() => this.onLocationMouseLeave()}
                      onClick={() => this.onLocationInfoClick(location)}
                    >
                      <span className="location-info-employee"> {location.EmployeeName} </span>
                      <span>{" "}  at {moment(location.LastReportedTime).format("hh:mm A")} </span>

                      {moment(location.LastReportedTime).isBefore(
                        moment().subtract(45, "minute")) && location.ClockOutTime === null ? (
                          <span className="text-danger fa fa-warning" style={{ marginLeft: "5px" }}
                            title="No Location logged in last 45 minutes" />
                        ) : null}
                      <span className="pull-right fa fa-file-text" style={{ color: "#4285f4" }}
                        title="Detailed Report"
                        onClick={() => this.employeeSelected(location)}
                      />
                      <br />
                      <div className="location-info-address"> {location.LastReportedAddress}  </div>
                      <div className="d-flex">
                        <div className="time-block">
                          In Time : {moment(location.ClockInTime).isValid() ? moment(location.ClockInTime).format("hh:mm A")
                            : " N/A "}
                        </div>
                        <div className="time-block">
                          Out Time :
                        {moment(location.ClockOutTime).isValid()
                            ? moment(location.ClockOutTime).format("hh:mm A")
                            : " N/A "}
                        </div>
                      </div>
                    </div>
                  );
                  return segment;
                })
                }
              </div>
            ) :
              !this.state.showUnLoggedEmployees ?
                (
                  <div id="dataForTheDay">
                    <div className="employee-data-header">
                      <div className="header-employee">
                        {this.state.SelectedEmployee.EmployeeName}
                        {moment(this.state.SelectedEmployee.LastReportedTime).isBefore(moment().subtract(45, "minute")) &&
                          this.state.SelectedEmployee.ClockOutTime === null ? (
                            <span
                              className="text-danger fa fa-warning"
                              style={{ marginLeft: "5px" }}
                              title="No Location logged in last 45 minutes"
                            />
                          ) : null}
                      </div>
                      <div className="location-info-address">
                        {this.state.SelectedEmployee.LastReportedAddress}
                      </div>

                      <div className="d-flex">
                        <div className="time-block">
                          In Time :
                        {moment(this.state.SelectedEmployee.ClockInTime).isValid()
                            ? moment(this.state.SelectedEmployee.ClockInTime).format(
                              "hh:mm A"
                            )
                            : " N/A "}
                        </div>
                        <div className="time-block">
                          Out Time :
                            {moment(this.state.SelectedEmployee.ClockOutTime).isValid()
                            ? moment(this.state.SelectedEmployee.ClockOutTime).format(
                              "hh:mm A"
                            )
                            : " N/A "}
                        </div>
                      </div>
                    </div>
                    <div className="text-center location-log-header">
                      Location Log
                      </div>
                    <div className="employee-location-log">
                      {this.state.SelectedEmployeeReport.map(location => {
                        var locationSegment = (
                          <div key={location.Id}
                            onMouseEnter={() => this.onLocationLogMouseEnter(location)}
                            onMouseLeave={() => this.onLocationLogMouseLeave()}
                            onClick={() => this.onLocationInfoClick(location)}
                            className={"d-flex align-items-center location-log-item " +
                              (location.IsClockIn ? "enter" : "") + (location.IsClockOut ? "leave" : "")}
                            style={{ padding: "5px" }}   >
                            {location.IsClockIn ? (
                              <div> <span className="fa fa-sign-out" /> </div>) : null}
                            <div className="location-log-time"> {moment(location.Time).format("hh:mm A")} </div>
                            <div className="location-log-address"> {location.Address}  </div>
                            {location.IsClockOut ? (
                              <div> <span className="fa fa-sign-out" />  </div>
                            ) : null}
                          </div>
                        );
                        return locationSegment;
                      })}
                    </div>
                  </div>
                )
                : <div />
          }

          {
            this.state.showUnLoggedEmployees ?
              <div id="dataForTheDay" key={this.state.EmployeesTobeLoggedIn} >
                {
                  this.state.EmployeesTobeLoggedIn.map((ele, i) => {
                    var employeeData = (
                      <div className="location-info">
                        <span className="location-info-employee"> {ele["EmployeeName"]} </span>
                        <div className="location-info-address" style={{ float: 'right' }}>
                          {
                            ele["LeaveType"] == null ?
                              <div>
                                <label className="Radio">
                                  <input type="radio" id="leave" name="reasonForUnlog" value="leave" onClick={this.ComOffClicked.bind(this, i)} />
                                  Comp Off
                                 </label>
                                <label className="Radio" style={{ paddingLeft: '4px' }}>
                                  <input type="radio" id="leave" name="reasonForUnlog" value="leave" onClick={this.LeaveClicked.bind(this, i)} />
                                  Leave
                                 </label>
                                <label className="Radio" style={{ paddingLeft: '11px' }}>
                                  <input type="radio" id="absent" name="reasonForUnlog" value="absent" onClick={this.AbsentClicked.bind(this)} />
                                  Absent
                                </label>
                                <span style={{ paddingLeft: '4px' }}>
                                  <button style={{ paddingLeft: '5px' }} type="button" name="leaveType" className="btnSave btn-success" onClick={() => { this.UpdateAttendance(this, i) }}  > Save </button>
                                </span>
                              </div>

                              :
                              <span className={ele["LeaveType"] == "CompOff" ? "compOff" : "leaveType"} > {ele["LeaveType"]} </span>
                          }
                        </div>
                      </div>
                    )
                    return employeeData;
                  })
                }
              </div>
              :
              <div />
          }
        </nav>

        <div id="sidebarCollapse">
          <span id="toggleIcon" style={{ margin: "17px 8px" }}
            className={"fa " + (this.state.sidebarOpen ? "fa-angle-left" : "fa-angle-right")} />
        </div>

        <div id="content" style={{ flexGrow: 1 }}>
          <MyMapComponent mode={this.state.mode}
            dataForDay={this.state.dataForDay}
            pathCoordinates={this.state.pathCoordinates}
            hoveredEmployee={this.state.hoveredEmployee}
            onLocationMouseEnter={this.onLocationMouseEnter.bind(this)}
            onLocationMouseLeave={this.onLocationMouseLeave.bind(this)}
            centerLat={this.state.centerLat}
            centerLng={this.state.centerLng}
            zoom={this.state.zoom}
            hoveredLocation={this.state.hoveredLocation}
          />
        </div>
        {
          this.state.showUnLoggedEmployees ?
            <div className="modal fade" id="employees" role="dialog" key={this.state.EmployeesTobeLoggedIn} >
              <div className="modal-dialog modal-lg" style={{ marginTop: '10%', zIndex: '1' }}>
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" id="closeModal">&times;</button>
                    <h4 className="modal-title">Employees</h4>
                  </div>
                  <div className="modal-body">
                    {
                      this.state.EmployeesTobeLoggedIn.map((ele, i) => {
                        return (
                          <p key={i}> {ele["EmployeeName"]} </p>
                        )
                      })
                    }
                  </div>
                  <div className="modal-footer"> </div>
                </div>
              </div>
            </div>
            :
            <div></div>
        }

      </div>
    )
  }

  ComOffClicked(e, ele) {
    this.setState({ LeaveType: "CompOff" })
  }

  LeaveClicked(e, ele) {
    this.setState({ LeaveType: "Leave" })
  }

  AbsentClicked(e, ele) {
    this.setState({ LeaveType: "Absent" })
  }

  UpdateAttendance(e, ele) {
    var employees = this.state.EmployeesTobeLoggedIn;


    var data = new FormData();
    data.append("empId", employees[ele]["AspNetUserId"]);
    data.append("leaveDate", moment(this.state.date).format("YYYY-MM-DD"));
    data.append("leaveType", this.state.LeaveType);

    var url = ApiUrl + "/api/EmployeeLocation/UpdateEmployeeLeave"
    try {
      MyAjaxForAttachments(
        url,
        (data) => {
          this.setState({ showUnLoggedEmployees: false }, () => {
            this.GetEmployees();
          })
        },
        (error) => {
          toast(error.responseText, {
            type: toast.TYPE.ERROR,
            autoClose: false
          });
          this.setState({ showUnLoggedEmployees: false }, () => { this.GetEmployees(); })

          return false;
        },
        "POST",
        data
      )
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

}

export default Maps;
