import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config';
import './Dashboard.css';
import { ValidateForm } from '../Validation';
import ClientSummary from './ClientSummary';
import CategorySummary from './CategorySummary';
import StatusSummary from './StatusSummary';

var moment = require('moment');

class EmployeeDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Holidays: [], Attendance: [], IsHoliday: false, EmployeesPoints: [], MyPoints: '',
            IsEmpReportAvailable: false, IsAttendanceAvailable: false, MonthlyPerformers: [],
            StatusSummary: [], ClientSummary: [], CategorySummary: []
        }
    }

    componentWillMount() {
        var empId = sessionStorage.getItem("EmpId");
        $.ajax({
            url: ApiUrl + "/api/Reports/GetDashBoardData?empId=" + empId,
            type: "get",
            success: (data) => {
                this.setState({
                    StatusSummary: data["statusSummary"], ClientSummary: data["clientSummary"],
                    EmployeesSummary: data["employeesSummary"], CategorySummary: data["categorySummary"],
                    Leads: data["leadsSummary"], IsEmpReportAvailable: true
                })
            }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetHolidays",
            type: "get",
            success: (data) => {
                this.setState({ Holidays: data["holidays"] }, () => {
                    var holidays = this.state.Holidays;
                    var isHoliday = holidays.findIndex(i => i.HolidayDate == moment().format("YYYY-MM-DD"));
                    var weekday = moment().isoWeekday();
                    if (isHoliday != -1 || weekday == 7) {
                        this.setState({ IsHoliday: true }, () => {
                            this.getTodaysAttendance()
                        });
                    }
                    else {
                        this.setState({ IsHoliday: false }, () => { this.getTodaysAttendance() });
                    }
                })
            }
        })

        $.ajax({
            url: ApiUrl + "/api/Reports/GetTopPerformances",
            type: "get",
            success: (data) => {
                this.setState({
                    MonthlyPerformers: data["monthPerformance"],
                    EmployeesPoints: data["topPerformances"]
                }, () => {
                    var empId = sessionStorage.getItem("EmpId");
                    var emp = this.state.EmployeesPoints.findIndex((i) => i.EmpId == empId);
                    if (emp != -1) {
                        var points = this.state.EmployeesPoints[emp].MonthPoints
                        this.setState({ MyPoints: points })
                    }
                    else {
                        this.setState({ MyPoints: 0 })
                    }
                })
            }
        })
    }

    getTodaysAttendance() {
        $.ajax({
            url: ApiUrl + "/api/EmployeeLocation/GetAttendanceReport?empId=" + '' +
                "&fromDate=" + moment().format("YYYY-MM-DD") +
                "&toDate=" + moment().format("YYYY-MM-DD"),
            type: "GET",
            success: (data) => {
                this.setState({ Attendance: data["attendanceReport"], IsAttendanceAvailable: true })
            }
        })
    }

    render() {
        return (
            <div style={{ marginBottom: '6px', marginTop: '1%', padding: '4px' }}>
                <div className="col-xs-12 globalTable">
                    <div className="col-md-4 p0 tableBoxShadow" >
                        <StatusSummary StatusSummary={this.state.StatusSummary} />
                    </div>
                    <div className="col-md-4 pl5 tableBoxShadow">
                        <div className="col-xs-12 clientReportHeading"> Holidays List </div>
                        <table className="fixed">
                            <thead>
                                <tr>
                                    <th>Holiday</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.Holidays.map((ele, i) => {
                                        return (
                                            <tr>
                                                <td> <b> {moment(ele["HolidayDate"]).format("DD-MMM-YYYY")} : </b> {ele["HolidayName"]}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-4" key={this.state.MonthlyPerformers}>
                        {
                            this.state.MonthlyPerformers != null ?
                                <div className="col-xs-12 pl5 tableBoxShadow" style={{ float: 'right' }}>
                                    <div className="col-xs-12 clientReportHeading"> Performers of the month </div>
                                    <table className="table table-condensed table-bordered headertable">
                                        <tbody>
                                            {
                                                this.state.MonthlyPerformers.map((ele, i) => {
                                                    if (ele["MonthPoints"] > 0 && i < 3) {
                                                        return (
                                                            <tr key={ele["EmpId"]}>
                                                                <td><img className="logo" src={ele["PhotoURL"] != null ? ele["PhotoURL"] : 'Images/Default.png'}></img> </td>
                                                                <td style={{ paddingTop: '18px' }}>  <b>{ele["Employee"]}</b>
                                                                    <span style={{ float: 'right' }}> <b> Points : </b>  {ele["MonthPoints"]} </span>
                                                                </td>
                                                            </tr>
                                                        )
                                                    }
                                                })
                                            }
                                        </tbody>
                                    </table>

                                    <div style={{marginTop:'10px'}}>
                                        <span> <b>Your Points :  {this.state.MyPoints} </b> </span>
                                    </div>
                                </div>
                                :
                                <div />
                        }
                    </div>
                </div>
                <ClientSummary ClientSummary={this.state.ClientSummary} />
                <CategorySummary CategorySummary={this.state.CategorySummary} />
            </div >
        )
    }
    getActivitiesReport() {
        this.props.history.push({
            state: {
                status: 'ALL',
                empId: sessionStorage.getItem("EmpId"),
                clientId: '',
                fromDate: '',
                toDate: '',
                catId: ''
            },
            pathname: "/ActivityReport"
        })
    }
}

export default EmployeeDashboard;
