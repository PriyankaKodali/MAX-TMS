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

    render() {
        var roles = sessionStorage.getItem("roles");
        return (
            <div >
                {
                    window.isLoggedIn ?
                        <div>
                            <div className="my-nav-bar" style={{ zIndex: '1000', fontSize: '17px' }}>
                                <div className="container-fluid">
                                
                                    <div className="navbar-header header headerimage">
                                        <img className="headerimage" src="Images/logo.png" alt="" />
                                    </div>
                                    
                                    <div id="navbar2" className="navbar-collapse collapse">
                                        <ul className="nav navbar-nav navbar-right">
                                            <li className="dropdown">
                                                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{"Hi " + sessionStorage.getItem("displayName")}</a>
                                                <ul className="dropdown-menu">
                                                    <li> <Link to="/ChangePassword" > Change Password </Link> </li>
                                                    <li><a onClick={this.logoutClick.bind(this)} style={{ cursor: 'pointer' }} >Logout</a></li>
                                                </ul>
                                            </li>
                                        </ul>

                                        <ul className="nav navbar-nav navbar-right">
                                            <li className="dropdown">
                                                <Link className="dropdown-toggle" to="../Task"> Create Task </Link>
                                            </li>
                                        </ul>

                                        <ul className="nav navbar-nav navbar-right">
                                            <li className="dropdown">
                                                <Link className="dropdown-toggle" to="../TaskDashBoard"> TaskDashBoard </Link>
                                            </li>
                                        </ul>
                                    </div>
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
