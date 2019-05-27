import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config';
import './Dashboard.css';
import ClientSummary from './ClientSummary';
import CategorySummary from './CategorySummary';
import EmployeesSummary from './EmployeeSummary';
import StatusSummary from './StatusSummary';

var moment = require('moment');

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            StatusSummary: [], ClientSummary: [], EmployeesSummary: [], Leads: [], CategoryReport: [], Employee: '',
            SendNotification: false, Holidays: [], Attendance: [], IsHoliday: false,
            IsEmpReportAvailable: false, IsAttendanceAvailable: false,
            MonthlyPerformers: [], PerformerOfweek: [], PerformerOfDay: [], WeekPoints: {}, DayPoints: {}
        }
    }

    componentWillMount() {
        var empId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? '' : sessionStorage.getItem("EmpId");
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
            url: ApiUrl + "/api/Reports/GetDashBoardData?empId=" + empId,
            type: "get",
            success: (data) => {
                this.setState({
                    StatusSummary: data["statusSummary"], ClientSummary: data["clientSummary"],
                    EmployeesSummary: data["employeesSummary"], CategoryReport: data["categorySummary"],
                    Leads: data["leadsSummary"], IsEmpReportAvailable: true
                })
            }
        })

        $.ajax({
            url: ApiUrl + "/api/Reports/GetTopPerformances",
            type: "get",
            success: (data) => {
                this.setState({
                    MonthlyPerformers: data["monthPerformance"],
                    WeekPoints: data["pointsInWeek"],
                    DayPoints: data["pointsinaDay"]
                }, () => {
                    if (this.state.WeekPoints != null && this.state.WeekPoints.WeekPoints > 0) {
                        this.setState({ PerformerOfweek: data["performerOftheWeek"] })
                    }
                    else {
                        this.setState({ WeekPoints: null })
                    }
                    if (this.state.DayPoints != null && this.state.DayPoints.DayPoints > 0) {
                        this.setState({ PerformerOfDay: data["performerOftheDay"] })
                    }
                    else {
                        this.setState({ DayPoints: null })
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
                    <div className="col-md-3 p0 tableBoxShadow" >
                        <StatusSummary StatusSummary={this.state.StatusSummary} />
                    </div>
                    <div className="col-md-3 pl5 tableBoxShadow">
                        <div className="col-xs-12 clientReportHeading"> Leads Summary </div>
                        {this.state.Leads.length > 0 ?
                            <table className="table table-condensed table-bordered headertable">
                                <tbody>
                                    <tr>
                                        <th>Status</th>
                                        <th className="alignRight"> Week </th>
                                        <th className="alignRight"> Month </th>
                                        <th className="alignRight"> Total </th>
                                    </tr>

                                    <tr className="tdOpen">
                                        <th style={{ backgroundColor: '#f7e7e7' }}>Showing Interest</th>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurWeekAccepted("ShowingInterest") }} >{this.state.Leads[0].CurWeekShowingInterest}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurMonthAccepted("ShowingInterest") }}>{this.state.Leads[0].CurMonthShowingInterest}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsTotal("ShowingInterest") }}>{this.state.Leads[0].ShowingInterest}   </td>
                                    </tr>

                                    <tr className="tdPending">
                                        <th style={{ backgroundColor: ' #f3f1d0' }}> In Process</th>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurWeekAccepted("In Process") }}>{this.state.Leads[0].CurWeekInProcess}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurMonthAccepted("In Process") }}>{this.state.Leads[0].CurMonthInProcess}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsTotal("In Process") }}>{this.state.Leads[0].InProcess} </td>
                                    </tr>

                                    <tr className="tdResolved">
                                        <th style={{ backgroundColor: '#d8f1e3' }}>Accepted</th>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurWeekAccepted("Accepted") }}>{this.state.Leads[0].CurWeekAcc}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurMonthAccepted("Accepted") }} >{this.state.Leads[0].CurMonthAcc}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsTotal("Accepted") }}> {this.state.Leads[0].Accepted}  </td>
                                    </tr>

                                    <tr className="tdResolved">
                                        <th style={{ backgroundColor: '#d8f1e3' }}>Quotation Sent </th>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurWeekAccepted("QuotationSent") }} >{this.state.Leads[0].CurWeekQuotationSent}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurMonthAccepted("QuotationSent") }}>{this.state.Leads[0].CurMonthQuotationSent}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsTotal("QuotationSent") }}>{this.state.Leads[0].QuotationSent} </td>
                                    </tr>

                                    <tr className="tdClosed">
                                        <th style={{ backgroundColor: '#c1f1d6' }}>Closed</th>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurWeekAccepted("Closed") }}>{this.state.Leads[0].CurWeekCompleted}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsCurMonthAccepted("Closed") }}>{this.state.Leads[0].CurMonthCompleted}</td>
                                        <td className="pointer alignRight" onClick={() => { this.leadsTotal("QuotationSent") }}> {this.state.Leads[0].Closed}</td>
                                    </tr>
                                    <tr>
                                        <th colSpan="3" className="alignRight"> Total</th>
                                        <td colSpan="4" className="pointer alignRight" onClick={() => { this.getLeads() }}>{this.state.Leads[0].Total} </td>
                                    </tr>
                                </tbody>
                            </table>
                            :
                            <div />
                        }
                    </div>
                    <div className="col-md-3 pl5 tableBoxShadow" key={this.state.IsHoliday}>
                        <div>
                            <div className="col-xs-12 reportHeading"> Attendance ( Not Logged In)  </div>
                            {
                                this.state.IsAttendanceAvailable ?
                                    this.state.IsHoliday ?
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <h5 style={{ color: 'green', textAlign: 'center' }}> Today is holiday </h5>
                                                </tr>
                                            </tbody>
                                        </table>
                                        :
                                        <table className="fixed">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                </tr>
                                            </thead>
                                            <tbody >
                                                {
                                                    this.state.Attendance.map((ele, i) => {
                                                        return (
                                                            ele["ClockInTime"] == null ?
                                                                <tr className="pointer" key={i} onClick={() => { this.handleUnloggedEmp(ele["EmployeeId"]) }}>
                                                                    <td>{ele["EmployeeName"]}</td>
                                                                </tr>
                                                                :
                                                                ""
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    :
                                    <div className="loader visible" style={{ marginTop: '11%', marginLeft: '58%' }} ></div>
                            }
                        </div>
                    </div>
                    <div className="col-md-3">
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
                                </div>
                                :
                                <div />
                        }
                        {
                            this.state.WeekPoints != null ?
                                <div className="col-xs-12  pl5 tableBoxShadow" style={{ paddingTop: '1%', float: 'right' }}>
                                    <div className="col-xs-12 reportHeading"> Performer of the week</div>
                                    <table className="table table-condensed table-bordered headertable">
                                        <tbody>
                                            {
                                                this.state.PerformerOfweek.map((ele, i) => {
                                                    return (
                                                        <tr>
                                                            <td>   <img className="logo" src={ele["PhotoURL"] != null ? ele["PhotoURL"] : 'Images/Default.png'}></img></td>
                                                            <td style={{ paddingTop: '18px' }}>
                                                                <span> <b> {ele["Employee"]}</b> </span>
                                                                <span style={{ float: 'right' }}> <b> Points : </b>
                                                                    {ele["WeekPoints"]} </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }

                                        </tbody>
                                    </table>
                                </div>
                                :
                                <div ></div>
                        }
                        {
                            this.state.DayPoints != null ?
                                <div className="col-xs-12  pl5 tableBoxShadow" style={{ paddingTop: '1%', float: 'right' }}>
                                    <div className="col-xs-12 clientReportHeading"> Performer of the Day</div>
                                    <table className="table table-condensed table-bordered headertable">
                                        <tbody>
                                            {
                                                this.state.PerformerOfDay.map((ele, i) => {
                                                    return (
                                                        <tr key="day">
                                                            <td>  <img className="logo" src={ele["PhotoURL"] != null ? ele["PhotoURL"] : 'Images/Default.png'} ></img></td>
                                                            <td style={{ paddingTop: '18px' }}>
                                                                <span><b>{ele["Employee"]}</b></span>
                                                                <span style={{ float: 'right' }}> <b> Points : </b>{ele["DayPoints"]} </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                :
                                <div></div>
                        }
                    </div>
                </div>
                <EmployeesSummary EmployeesSummary={this.state.EmployeesSummary} />
                <ClientSummary ClientSummary={this.state.ClientSummary} />
                <CategorySummary CategorySummary={this.state.CategoryReport} />
                <div className="col-xs-12 table-responsive globalTable mTop1" style={{ marginBottom: '1%' }}>
                    <div className="col-md-6 pl5" key={this.state.IsHoliday}>
                        <div className="col-xs-12 clientReportHeading"> Attendance Report</div>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th className="name">Name</th>
                                    <th>Login</th>
                                    <th>Delay</th>
                                    <th className="address" >Login Address</th>
                                    <th>LogOut</th>
                                    <th>Delay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.IsHoliday ?
                                        <tr>
                                            <h5 style={{ color: 'green', textAlign: 'center' }}> Today is holiday </h5>
                                        </tr>
                                        : <tr></tr>
                                }
                                {
                                    this.state.Attendance.map((ele, i) => {
                                        return (
                                            ele["ClockInTime"] != null ?
                                                <tr className="pointer" onClick={() => { this.getLocationDetail(ele["EmployeeId"], ele["EmployeeName"], ele["ClockInTime"], ele["ClockInAddress"], ele["ClockOutTime"]) }}>
                                                    <td style={{ width: '24%' }}>{ele["EmployeeName"]}</td>
                                                    <td style={{ width: '12%' }}> {ele["ClockInTime"] != null ? moment(ele["ClockInTime"]).format("h:mm A") : ""}  </td>
                                                    <td style={{ width: '10%' }}>{ele["ClockInDelay"] != null && ele["ClockInDelay"] > 0 ?
                                                        Math.floor(ele["ClockInDelay"] / 60) + ':' + ele["ClockInDelay"] % 60
                                                        :
                                                        ""} </td>
                                                    <td >{ele["ClockInAddress"]}</td>
                                                    <td style={{ width: '12%' }}>{ele["ClockOutTime"] != null ? moment(ele["ClockOutTime"]).format("h:mm A") : ""} </td>
                                                    <td style={{ width: '10%' }}> {ele["ClockOutDelay"] != null ?
                                                        Math.floor(ele["ClockOutDelay"] / 60) + ':' + ele["ClockOutDelay"] % 60
                                                        : ""}</td>
                                                </tr>
                                                :
                                                ""
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        )
    }

    getLocationDetail(empId, empName, clockInTime, address, clockOutTime) {
        this.props.history.push({
            state: {
                view: "EmpLocationDetail",
                EmpId: empId,
                EmpName: empName,
                ClockInTime: clockInTime,
                Address: address,
                ClockOutTime: clockOutTime
            },
            pathname: "/EmployeesLocationMap"
        })
    }

    handleUnloggedEmp(empId) {
        this.props.history.push({
            state: {
                view: "UnLogged",
                EmpId: empId
            },
            pathname: '/EmployeesLocationMap'
        })
    }

    leadsCurWeekAccepted(status) {
        this.props.history.push({
            state: {
                status: status,
                fromDate: moment().startOf('week').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/LeadsList"
        })
    }

    leadsCurMonthAccepted(status) {
        this.props.history.push({
            state: {
                status: status,
                fromDate: moment().startOf('month').format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
                catId: ''
            },
            pathname: "/LeadsList"
        })
    }

    leadsTotal(status) {
        this.props.history.push({
            state: {
                status: status,
                fromDate: '',
                toDate: ''
            },
            pathname: "/LeadsList"
        })
    }

    getLeads() {
        this.props.history.push({
            state: {
                status: '',
                fromDate: '',
                toDate: '',
                catId: ''
            },
            pathname: "/LeadsList"
        })
    }

    handleNotify(empId) {
        this.setState({ Employee: empId, SendNotification: true }, () => {
            $("#sendNotification").modal('show');
        })
    }

    CloseNotificationModel() {
        $("#closeNotificationModal").click();
    }
}

export default Dashboard;

