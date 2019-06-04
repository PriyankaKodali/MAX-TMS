
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import $ from 'jquery';

class App extends Component {
    constructor(props) {
        super(props);
        var isLoggedIn = sessionStorage.getItem("access_token") != null;
        this.state = {
            sidebarOpen: true
        }
        window.isLoggedIn = isLoggedIn;
    }

    logoutClick(e) {
        e.preventDefault();
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("roles");
        window.isLoggedIn = false;
        window.open("/", "_self")
    }

    addNewClick(e) {
        e.preventDefault();
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("roles");
        window.isLoggedIn = false;
        window.open("http://maxmaster.azurewebsites.net", "_self")
    }

    componentDidMount() {
        var mainThis = this;
        $("#sideMenubarCollapse").on("click", function () {
            mainThis.setState({ sidebarOpen: !mainThis.state.sidebarOpen }, () => {
                if (mainThis.state.sidebarOpen) {
                    $(".main-sidebar").css({ left: '0px' })
                } else {
                    $(".main-sidebar").css({ left: '-230px' })
                }
            });
            $("#sidemenu").toggleClass("active");
        });
    }

    render() {
        var roles = sessionStorage.getItem("roles");
        return (
            <div>
                {
                    window.isLoggedIn ?
                        <div id="sidemenu">
                            <div className="main-header">
                                <span id="sideMenubarCollapse" className="sidebar-toggle" data-toggle="push-menu" data-target="fullMenu" role="button"  >
                                    <i className="fa fa-bars f20"></i>
                                </span>
                                <nav className="navbar navbar-default">
                                    <nav className="navbar navbar-default">
                                        <div className="collapse navbar-collapse" id="myNavbar">
                                            <ul className="nav navbar-nav navbar-right navbar-menu" >
                                                <li className="dropdown pointer">
                                                    <a className="navbar-menu-item dropdown-toggle" data-toggle="dropdown"> <b>{"Hi " + sessionStorage.getItem("displayName")}</b><span className="caret"></span></a>
                                                    <ul className="dropdown-menu">
                                                        <li><a onClick={() => this.props.history.push("/ChangePassword")}>Change Password</a></li>
                                                        <li><a onClick={this.logoutClick.bind(this)}>Logout</a></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>
                                    </nav>
                                </nav>

                            </div>
                            <div className="main-sidebar">
                                <div className="sidebar">
                                    <ul className="sidebar-menu" data-widget="tree">
                                        {
                                            sessionStorage.getItem("roles").indexOf("SuperAdmin") !== -1 ?
                                                <li className="treeview">

                                                    <a className="linkcursor">
                                                        <i className="fa fa-bars"></i>
                                                        <span> Reports</span>
                                                        <span className="pull-right-container">
                                                            <span className="label label-primary pull-right">5</span>
                                                        </span>
                                                    </a>
                                                    <ul className="treeview-menu">
                                                        <li><a className="linkcursor" onClick={() => this.props.history.push("/ActivityReport")} ><i className="fa fa-sticky-note-o"></i> Activity Report</a></li>
                                                        <li><a className="linkcursor" onClick={() => { this.props.history.push("/LogReport") }} > <i className="fa fa-sticky-note-o"></i> Activities Log Report</a></li>
                                                        <li><a className="linkcursor" onClick={() => { this.props.history.push("/AttendanceReport") }}>  <i className="fa fa-sticky-note-o"></i> Attendance Report </a></li>
                                                        <li><a className="linkcursor" onClick={() => { this.props.history.push("/DayReport") }}> <i className="fa fa-sticky-note-o"></i>  Day Report </a> </li>
                                                        <li><a className="linkcursor" onClick={() => { this.props.history.push("/EmployeesLocationMap") }} > <i className="fa fa-sticky-note-o"></i>  Employee Location Report</a> </li>
                                                        <li><a className="linkcursor" onClick={() => { this.props.history.push("/Notification") }}> <i className="fa fa-sticky-note-o"></i> Send Notification</a></li>
                                                    </ul>
                                                </li>
                                                :
                                                ""
                                        }
                                        {
                                            sessionStorage.getItem("roles").indexOf("SuperAdmin") !== -1 ?
                                                <li className="treeview">
                                                    <a className="linkcursor" >
                                                        <i className="fa fa-list" aria-hidden="true"></i>
                                                        <span> Category </span>
                                                        <span className="pull-right-container">
                                                            <span className="label label-primary pull-right">2</span>
                                                        </span>
                                                    </a>
                                                    <ul className="treeview-menu">
                                                        <li><a className="linkcursor" onClick={() => { this.props.history.push("/Category") }}> <i className="fa fa-plus"></i> Add Category </a></li>
                                                        <li><a className="linkcursor" onClick={() => { this.props.history.push("/Departments") }}> <i className="fa fa-list"></i> Categories </a></li>
                                                    </ul>
                                                </li>
                                                :
                                                ""
                                        }

                                        {
                                            sessionStorage.getItem("roles").indexOf("SuperAdmin") !== -1 ?
                                                <li>


                                                    <a className="linkcursor" onClick={() => { this.props.history.push("/Dashboard") }}  >
                                                        <i className="fa fa-bars"></i> <span>Dashboard</span>
                                                    </a>
                                                </li>
                                                :
                                                <li>
                                                    <a className="linkcursor" onClick={() => { this.props.history.push("/EmployeeDashboard") }}  >
                                                        <i className="fa fa-bars"></i> <span>Dashboard</span>
                                                    </a>
                                                </li>

                                        }
                                        {
                                            sessionStorage.getItem("roles").indexOf("SuperAdmin") !== -1 ?
                                                <li>
                                                    <a className="linkcursor" onClick={() => { this.props.history.push("/MIMICUser") }}  >
                                                        <i className="fa fa-user"></i> <span> MIMIC User </span>
                                                    </a>
                                                </li>
                                                :
                                                ""
                                        }

                                        <li className="treeview">
                                            <a className="linkcursor" >
                                                <i className="fa fa-tasks" aria-hidden="true"></i>
                                                <span> Tasks Dashboard</span>
                                                <span className="pull-right-container">
                                                    <i className="fa fa-angle-left pull-right"></i>
                                                </span>
                                            </a>
                                            <ul className="treeview-menu">
                                                <li>
                                                    <a className="linkcursor" onClick={() => {
                                                        this.props.history.push("/TaskDashboard")
                                                        window.location.reload();
                                                    }}><i className="fa fa-bars"></i> <span> Tasks Dashboard </span>
                                                    </a>
                                                </li>

                                                {/* <li><a className="linkcursor" onClick={() => { 
                                                    this.props.history.push("/ToDos")
                                                }}>
                                                    <i className="fa fa-bars"></i>  ToDos </a>  </li>

                                                <li><a className="linkcursor" onClick={() => { 
                                                    this.props.history.push("/Others")
                                                }}>
                                                    <i className="fa fa-bars"></i>  Others </a>  </li> */}

                                                <li><a className="linkcursor" onClick={() => {
                                                    this.props.history.push("/MyReport")
                                                }}>
                                                    <i className="fa fa-sticky-note-o"></i>  My Report </a>  </li>
                                            </ul>
                                        </li>

                                        <li>
                                            <a className="linkcursor" onClick={() => { this.props.history.push("/Task") }} >
                                                <i className="fa fa-plus"></i> <span> Task</span>
                                                <span className="pull-right-container">
                                                    <small className="label pull-right bg-green">new</small>
                                                </span>
                                            </a>
                                        </li>

                                        <li className="treeview">
                                            <a className="linkcursor" >
                                                <i className="fa fa-tasks" aria-hidden="true"></i>
                                                <span> Leads</span>
                                                <span className="pull-right-container">
                                                    <i className="fa fa-angle-left pull-right"></i>
                                                </span>
                                            </a>
                                            <ul className="treeview-menu">
                                                <li><a className="linkcursor" onClick={() => this.props.history.push("/Opportunity")}><i className="fa fa-user-plus"></i> <span> Lead</span>
                                                    <span className="pull-right-container">
                                                        <small className="label pull-right bg-green">new</small>
                                                    </span>
                                                </a></li>
                                                <li><a className="linkcursor" onClick={() => { this.props.history.push("/LeadsList") }}><i className="fa fa-bars"></i> Leads List</a></li>
                                            </ul>
                                        </li>

                                        <li style={{ cursor: 'pointer' }} >
                                            <a className="linkcursor" onClick={this.logoutClick.bind(this)} >
                                                <i className="fa fa-sign-out"></i> <span>Logout</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        :
                        <div />
                }
                {this.props.children}
            </div>
        );
    }
}

export default withRouter(App);






// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';
// import { Link } from 'react-router-dom';
// import { withRouter } from 'react-router';
// import $ from 'jquery';

// class App extends Component {
//     constructor(props) {
//         super(props);
//         var isLoggedIn = sessionStorage.getItem("access_token") != null;
//         this.state = {
//             sidebarOpen: true
//         }
//         window.isLoggedIn = isLoggedIn;
//     }

//     logoutClick(e) {
//         e.preventDefault();
//         sessionStorage.removeItem("access_token");
//         sessionStorage.removeItem("roles");
//         window.isLoggedIn = false;
//         window.open("/", "_self")
//     }

//     addNewClick(e) {
//         e.preventDefault();
//         sessionStorage.removeItem("access_token");
//         sessionStorage.removeItem("roles");
//         window.isLoggedIn = false;
//         window.open("http://maxmaster.azurewebsites.net", "_self")
//     }

//     componentDidMount() {
//         var mainThis = this;
//         $("#sideMenubarCollapse").on("click", function () {
//             mainThis.setState({ sidebarOpen: !mainThis.state.sidebarOpen }, () => {
//                 if (mainThis.state.sidebarOpen) {
//                     $(".main-sidebar").css({ left: '0px' })
//                 } else {
//                     $(".main-sidebar").css({ left: '-230px' })
//                 }
//             });
//             $("#sidemenu").toggleClass("active");
//         });
//     }

//     render() {
//         var roles = sessionStorage.getItem("roles");
//         return (
//             <div>
//                 {
//                     window.isLoggedIn ?
//                         <nav className="navbar navbar-default">
//                             <nav className="navbar navbar-default">
//                                 <div className="container-fluid">
//                                     <div className="navbar-header">
//                                         <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
//                                             <span className="icon-bar"></span>
//                                             <span className="icon-bar"></span>
//                                             <span className="icon-bar"></span>
//                                         </button>
//                                     </div>
//                                     <div className="collapse navbar-collapse" id="myNavbar">

//                                         <ul className="nav navbar-nav navbar-right navbar-menu" >
//                                             {
//                                                 window.isLoggedIn && roles.indexOf("Admin") != -1 || window.isLoggedIn && roles.indexOf("SuperAdmin") != -1 ?
//                                                     <li><a className="pointer navbar-menu-item" onClick={this.addNewClick.bind(this)} >Add New</a></li>
//                                                     :
//                                                     ""
//                                             }

//                                             {
//                                                 window.isLoggedIn && roles.indexOf("Admin") != -1 || window.isLoggedIn && roles.indexOf("SuperAdmin") != -1 ?
//                                                     <li><a className="pointer navbar-menu-item" onClick={() => { this.props.history.push("/LeadsList") }} >Lead</a></li>
//                                                     :
//                                                     ""
//                                             }
//                                          {/* 
//                                             <li className="dropdown pointer">
//                                                 <a className="navbar-menu-item dropdown-toggle" data-toggle="dropdown" > Material Request <span className="caret"></span></a>
//                                                 <ul className="dropdown-menu">
//                                                     {
//                                                         <li>
//                                                             <a onClick={() => { this.props.history.push("/StockRequests") }}> Project </a>
//                                                         </li>
//                                                     }
//                                                 </ul>
//                                             </li> */}

//                                             <li className="dropdown pointer">
//                                                 <a className="navbar-menu-item dropdown-toggle" data-toggle="dropdown"> Task Tracker <span className="caret"></span> </a>
//                                                 <ul className="dropdown-menu">
//                                                     {
//                                                         window.isLoggedIn && roles.indexOf("SuperAdmin") != -1 || window.isLoggedIn && roles.indexOf("Admin") != -1 ?
//                                                             <li>
//                                                                 <a onClick={() => { this.props.history.push("/ActivityReport") }} >Activities Report</a>
//                                                                 <a onClick={() => { this.props.history.push("/LogReport") }} > Activities Log Report</a>
//                                                                 <a onClick={() => { this.props.history.push("/AttendanceReport") }}> Attendance Report </a>
//                                                                 <a onClick={() => { this.props.history.push("/DayReport") }}> Day Report </a>
//                                                                 <a onClick={() => { this.props.history.push("/EmployeesLocationMap") }} >Employee Location Report</a>
//                                                                 <a onClick={() => { this.props.history.push("/MIMICUser") }} > MIMIC User </a>
//                                                                 <a onClick={() => { this.props.history.push("/Notification") }}> Send Notification</a>
//                                                             </li>
//                                                             :
//                                                             <li />
//                                                     }
//                                                     <li><a onClick={() => { 
//                                                         this.props.history.push("/TaskDashboard");
//                                                         window.location.reload();
//                                                     }} > My Dashboard</a></li>
//                                                     <li>  <a onClick={() => { this.props.history.push("/MyReport") }}> My Report </a>  </li>
//                                                 </ul>
//                                             </li>

//                                             <li><a className="pointer navbar-menu-item" onClick={() => { this.props.history.push("/Task") }} > Create Task</a></li>
//                                             <li className="dropdown pointer">
//                                                 <a className="navbar-menu-item dropdown-toggle" data-toggle="dropdown">{"Hi " + sessionStorage.getItem("displayName")}<span className="caret"></span></a>
//                                                 <ul className="dropdown-menu">
//                                                     <li><a onClick={() => this.props.history.push("/ChangePassword")}>Change Password</a></li>
//                                                     <li><a onClick={this.logoutClick.bind(this)}>Logout</a></li>
//                                                 </ul>
//                                             </li>
//                                         </ul>

//                                     </div>
//                                 </div>

//                             </nav>
//                         </nav>
//                         :
//                         <div />
//                 }
//                 {this.props.children}
//             </div>
//         )
//     }
// }

// export default withRouter(App);