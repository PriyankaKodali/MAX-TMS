import React, { Component } from "react";
import * as $ from "jquery";
import DatePicker from "react-datepicker";
import moment from "moment";

import "react-datepicker/dist/react-datepicker.css";
import "./Maps.css";
import { ApiUrl } from '../../Config';
import { MyAjax } from "../../MyAjax";
import { MyMapComponent } from "./MyMapComponent";

class Maps extends Component {
  constructor(props) {
    super(props);
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
      hoveredLocation: null
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

    this.getDataForDay();
  }

  clearClicked() {
    this.setState({ date: moment().toISOString() }, () => {
      this.getDataForDay();
    });
  }

  getDataForDay() {
    $(".map-loader").show();
    var url =
      ApiUrl +
      "/api/EmployeeLocation/GetAllEmployeesLatestLocation?currentDate=" +
      moment(this.state.date).format("YYYY-MM-DD");
    MyAjax(
      url,
      data => {
        this.setState(
          {
            dataForDay: data["EmployeesLatestLocation"],
            IsDataAvailable: true,
            mode: "All"
          },
          () => {
            var bounds = new window.google.maps.LatLngBounds();
            this.state.dataForDay.map(location => {
              bounds.extend(
                new window.google.maps.LatLng(
                  parseFloat(location.Latitude),
                  parseFloat(location.Longitude)
                )
              );
            });
          }
        );
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
    var url =
      ApiUrl +
      "/api/EmployeeLocation/GetEmployeeLocationData?Date=" +
      moment(this.state.date).format("YYYY-MM-DD") +
      "&EmployeeId=" +
      this.state.SelectedEmployee.EmployeeId;
    MyAjax(
      url,
      data => {
        this.setState(
          {
            SelectedEmployeeReport: data["employeeLocations"],
            IsDataAvailable: true
          },
          () => {
            // var bounds = new window.google.maps.LatLngBounds();
            // this.state.SelectedEmployeeReport.map((location) => {
            //     bounds.extend(new window.google.maps.LatLng(parseFloat(location.Latitude), parseFloat(location.Longitude)))
            // });

            var pathCoordinates = this.state.SelectedEmployeeReport.map(
              location => {
                return {
                  lat: parseFloat(location.Latitude),
                  lng: parseFloat(location.Longitude)
                };
              }
            );
            this.setState({ pathCoordinates: pathCoordinates });
          }
        );
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

  render() {
    return (
      <div className="maps-wrapper maps">
        <nav id="sidebar">
          <div className="sidebar-header">
            <div id="date-input-wrapper" className="d-flex align-items-center">
              <div style={{ flexGrow: "1" }}>
                <DatePicker
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="bottom-start"
                  selected={this.state.date}
                  onChange={this.dateChanged.bind(this)}
                />
              </div>

              <div style={{ width: "30px" }}>
                <span
                  title="search"
                  className="fa fa-search date-input-icons"
                  style={{ WebkitTextStroke: "1px white", fontSize: "23px" }}
                  onClick={() => this.getDataForDay()}
                />
              </div>
              <div
                style={{
                  borderLeft: "1pt solid #b7b7b7",
                  width: "1px",
                  height: "80%",
                  margin: "0 5px"
                }}
              />
              <div style={{ width: "30px" }}>

                <span
                  title="clear"
                  className="fa fa-times date-input-icons"
                  style={{ WebkitTextStroke: "4px white", fontSize: "30px" }}
                  onClick={() => this.clearClicked()}
                />
              </div>
            </div>
            {this.state.mode === "Employee" ? (
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "2px 8px",
                  fontSize: "14px"
                }}
              >
                <a
                  href="javascript:void(0)"
                  onClick={() => this.getDataForDay()}
                >

                  All Results
                </a>
              </div>
            ) : null}
          </div>

          {this.state.mode === "All" ? (
            <div id="dataForTheDay">
              {this.state.dataForDay.map(location => {
                var segment = (
                  <div
                    className={
                      "location-info " +
                      (this.state.hoveredEmployee === location.EmployeeId
                        ? "active"
                        : "")
                    }
                    key={location.EmployeeId}
                    onMouseEnter={() =>
                      this.onLocationMouseEnter(location.EmployeeId)
                    }
                    onMouseLeave={() => this.onLocationMouseLeave()}
                    onClick={() => this.onLocationInfoClick(location)}
                  >
                    <span className="location-info-employee">
                      {location.EmployeeName}
                    </span>

                    <span>{" "}
                      at {moment(location.LastReportedTime).format("hh:mm A")}
                    </span>

                    {moment(location.LastReportedTime).isBefore(
                      moment().subtract(45, "minute")
                    ) && location.ClockOutTime === null ? (
                        <span
                          className="text-danger fa fa-warning"
                          style={{ marginLeft: "5px" }}
                          title="No Location logged in last 45 minutes"
                        />
                      ) : null}
                    <span className="pull-right fa fa-file-text" style={{ color: "#4285f4" }}
                      title="Detailed Report"
                      onClick={() => this.employeeSelected(location)}
                    />

                    <br />

                    <div className="location-info-address">
                      {location.LastReportedAddress}
                    </div>

                    <div className="d-flex">
                      <div className="time-block">
                        In Time :
                        {moment(location.ClockInTime).isValid()
                          ? moment(location.ClockInTime).format("hh:mm A")
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
              })}
            </div>
          ) : (
              <div id="employeeData">
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
                      <div
                        key={location.Id}
                        onMouseEnter={() =>
                          this.onLocationLogMouseEnter(location)
                        }
                        onMouseLeave={() => this.onLocationLogMouseLeave()}
                        onClick={() => this.onLocationInfoClick(location)}
                        className={
                          "d-flex align-items-center location-log-item " +
                          (location.IsClockIn ? "enter" : "") +
                          (location.IsClockOut ? "leave" : "")
                        }
                        style={{ padding: "5px" }}
                      >
                        {location.IsClockIn ? (
                          <div>
                            <span className="fa fa-sign-out" />
                          </div>
                        ) : null}
                        <div className="location-log-time">
                          {moment(location.Time).format("hh:mm A")}
                        </div>
                        <div className="location-log-address">
                          {location.Address}
                        </div>
                        {location.IsClockOut ? (
                          <div>
                            <span className="fa fa-sign-out" />
                          </div>
                        ) : null}
                      </div>
                    );
                    return locationSegment;
                  })}
                </div>
              </div>
            )}
        </nav>

        <div id="sidebarCollapse">
          <span
            id="toggleIcon"
            className={
              "fa " +
              (this.state.sidebarOpen ? "fa-angle-left" : "fa-angle-right")
            }
            style={{ margin: "17px 8px" }}
          />
        </div>

        <div id="content" style={{ flexGrow: 1 }}>
          <MyMapComponent
            mode={this.state.mode}
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
      </div>
    );
  }
}

export default Maps;
