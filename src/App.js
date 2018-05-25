import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';


class App extends Component {

    constructor(props) {
        super(props);
        var isLoggedIn = sessionStorage.getItem("access_token") != null;
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

    render() {
        var roles = sessionStorage.getItem("roles");
        return (
            <div >
                {
                    window.isLoggedIn ?
                        <nav className="navbar navbar-default">
                            <div className="container-fluid">
                                <div className="navbar-header">
                                    <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
                                        <span className="icon-bar"></span>
                                        <span className="icon-bar"></span>
                                        <span className="icon-bar"></span>
                                    </button>
                                </div>
                                <div className="collapse navbar-collapse" id="myNavbar">

                                    <ul className="nav navbar-nav navbar-right navbar-menu" >


                                        {
                                            window.isLoggedIn && roles.indexOf("Admin") != -1 || window.isLoggedIn && roles.indexOf("SuperAdmin") != -1 ?
                                                <li><a className="pointer navbar-menu-item" onClick={this.addNewClick.bind(this)} >Add New</a></li>
                                                :
                                                ""
                                        }

                                        <li className="dropdown pointer">
                                            <a className="navbar-menu-item dropdown-toggle" data-toggle="dropdown"> Task Tracker <span className="caret"></span> </a>
                                            <ul className="dropdown-menu">
                                                <li><a onClick={() => { this.props.history.push("/TaskDashBoard") }} > My Dashboard</a></li>
                                                {
                                                    window.isLoggedIn && roles.indexOf("SuperAdmin") != -1 ?
                                                       
                                                            <li> <a onClick={() => { this.props.history.push("/MIMICUser") }} > MIMIC User </a> 
                                                            <a onClick={() => { this.props.history.push("/Report") }} >Reports</a></li>
                                                      
                                                        :
                                                        <li />
                                                }

                                            </ul>
                                        </li>

                                        <li><a className="pointer navbar-menu-item" onClick={() => { this.props.history.push("/Task") }} > Create Task</a></li>
                                        <li className="dropdown pointer">
                                            <a className="navbar-menu-item dropdown-toggle" data-toggle="dropdown">{"Hi " + sessionStorage.getItem("displayName")}<span className="caret"></span></a>
                                            <ul className="dropdown-menu">
                                                <li><a onClick={() => this.props.history.push("/ChangePassword")}>Change Password</a></li>
                                                <li><a onClick={this.logoutClick.bind(this)}>Logout</a></li>
                                            </ul>
                                        </li>
                                    </ul>

                                </div>
                            </div>
                        </nav>
                        :
                        <div />
                }
                {this.props.children}
            </div>
        );
    }
}

export default withRouter(App);

// {
//     window.isLoggedIn ?
//         <div>
//             <div className="my-nav-bar" style={{ zIndex: '1000', fontSize: '17px' }}>
//                 <div className="container-fluid">

//                     <div className="navbar-header header headerimage">
//                         <img className="headerimage" src="Images/logo.png" alt="" />
//                     </div>

//                     <div id="navbar2" className="navbar-collapse collapse">
//                         <ul className="nav navbar-nav navbar-right">
//                             <li className="dropdown">
//                                 <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{"Hi " + sessionStorage.getItem("displayName")}</a>
//                                 <ul className="dropdown-menu">
//                                     <li> <Link to="/ChangePassword" > Change Password </Link> </li>
//                                     <li><a onClick={this.logoutClick.bind(this)} style={{ cursor: 'pointer' }} >Logout</a></li>
//                                 </ul>
//                             </li>
//                         </ul>

//                         <ul className="nav navbar-nav navbar-right">
//                             <li className="dropdown">
//                                 <Link className="dropdown-toggle" to="../Task"> Create Task </Link>
//                             </li>
//                         </ul>

//                         <ul className="nav navbar-nav navbar-right">
//                             <li className="dropdown">
//                                 <Link className="dropdown-toggle" to="../TaskDashBoard"> TaskDashBoard </Link>
//                             </li>
//                         </ul>
//                     </div>
//                 </div>
//             </div>

//         </div>
//         :
//         <div />
// }
