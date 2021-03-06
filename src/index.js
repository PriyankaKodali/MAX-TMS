import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { Router, Route, IndexRoute } from 'react-router';
import { matchPath } from 'react-router'
import { HashRouter } from 'react-router-dom';
import 'react-select/dist/react-select.css';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import Task from './Task/Task';
import TaskDashBoard from './TaskDashBoard/TaskDashBoard';
import ViewTask from './TaskDashBoard/ViewTask';
import Login from './Login/Login';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import ChangePassword from './ChangePassword/ChangePassword';
import ResetPassword from './ResetPassword/ResetPassword';
import MIMICUser from './MIMICUser/MIMICUser';
import ActivityReport from './Reports/ActivityReport';
import Maps from './Reports/Maps/Maps'
import LogReport from './Reports/LogReport';
import MyReport from './Reports/MyReport';
import Opportunity from './Opportunity/Opportunity';
import LeadsList from './Opportunity/LeadsList';

import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'bootstrap-fileinput/js/plugins/piexif.min.js';
import 'bootstrap-fileinput/js/plugins/purify.min.js';
import 'bootstrap-fileinput/js/fileinput.js';
import 'bootstrap-fileinput/themes/explorer/theme.js';

import Project from './MaterialRequest/Project';
import StockRequests from './MaterialRequest/StockRequests';
import EditStockRequest from './MaterialRequest/EditStockRequest';
import StockReport from './StockReport/StockReport';
import OpportunityDetail from './Opportunity/OpportunityDetail';
import AttendanceReport from './Reports/AttendanceReport';
import DayReport from './Reports/DayReport';
import Notification from './Notification/Notification';
import Dashboard from './Dashboard/Dashboard';
import ToDos from './TaskDashBoard/ToDos';
import Others from './TaskDashBoard/Others';
import EmployeeDashboard from './Dashboard/EmployeeDashboard'; 

import Category from './Categories/Category';
import Departments from './Categories/Departments';

window.jQuery = window.$ = require("jquery");
var bootstrap = require('bootstrap');
window.isLoggedIn = sessionStorage.getItem("access_token") !== null;

ReactDOM.render((
    <HashRouter>
        <div>
            <ToastContainer autoClose={3000} position="top-center" />
            <App>
                <Route exact path="/" component={Login} />
                <Route exact path="/Login" component={Login} />
                <Route exact path="/ForgotPassword" component={ForgotPassword} />
                <Route exact path="/reset-password/:userId/:code" component={ResetPassword} />
                <Route exact path="/ChangePassword" render={(nextState) => requireAuth(nextState, <ChangePassword location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/Task" render={(nextState) => requireAuth(nextState, <Task location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/TaskDashBoard/:id" render={(nextState) => requireAuth(nextState, <TaskDashBoard location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/TaskDashBoard/" render={(nextState) => requireAuth(nextState, <TaskDashBoard location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/ViewTask" render={(nextState) => requireAuth(nextState, <ViewTask location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/MIMICUser" render={(nextState) => requireAuth(nextState, <MIMICUser location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/ActivityReport" render={(nextState) => requireAuth(nextState, <ActivityReport location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/Project" render={(nextState) => requireAuth(nextState, <Project location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/StockRequests" render={(nextState) => requireAuth(nextState, <StockRequests location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/EditStockRequest/:id" render={(nextState) => requireAuth(nextState, <EditStockRequest location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/StockReport" render={(nextState) => requireAuth(nextState, <StockReport location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/EmployeesLocationMap" render={(nextState) => requireAuth(nextState, <Maps location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/LogReport" render={(nextState) => requireAuth(nextState, <LogReport location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/MyReport" render={(nextState) => requireAuth(nextState, <MyReport location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/Opportunity" render={(nextState) => requireAuth(nextState, <Opportunity location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/LeadsList" render={(nextState) => requireAuth(nextState, <LeadsList location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/OpportunityDetail/:id" render={(nextState) => requireAuth(nextState, <OpportunityDetail location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/AttendanceReport" render={(nextState) => requireAuth(nextState, <AttendanceReport history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                <Route exact path="/DayReport" render={(nextState) => requireAuth(nextState, <DayReport history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                <Route exact path="/Notification" render={(nextState) => requireAuth(nextState, <Notification history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                <Route exact path="/Dashboard" render={(nextState) => requireAuth(nextState, <Dashboard history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                <Route exact path="/ToDos" render={(nextState) => requireAuth(nextState, <ToDos history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                <Route exact path="/Others" render={(nextState) => requireAuth(nextState, <Others history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                <Route exact path="/EmployeeDashboard" render={nextState => requireAuth(nextState, <EmployeeDashboard history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                <Route exact path="/Category" render={(nextState) => requireAuth(nextState, <Category history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                <Route exact path="/Departments" render={(nextState) => requireAuth(nextState, <Departments history={nextState.history} match={nextState.match} location={nextState.location} />)} />
                 
            </App>
        </div>
    </HashRouter>
),
    document.getElementById('root')
);

function requireAuth(nextState, component) {
    var isLoggedIn = sessionStorage.getItem("access_token") != null;
    if (!isLoggedIn) {
        nextState.history.push("/Login");
        return null;
    }
    else {
        return component;
    }
}