import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { Router, Route, IndexRoute } from 'react-router';
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
import Report from './Reports/Report';
import Maps from './Reports/Maps/Maps'
import LogReport from './Reports/LogReport';

import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'bootstrap-fileinput/js/plugins/piexif.min.js';
import 'bootstrap-fileinput/js/plugins/purify.min.js';
import 'bootstrap-fileinput/js/fileinput.js';
import 'bootstrap-fileinput/themes/explorer/theme.js';

import Project from './MaterialRequest/Project';
import StockRequests from './MaterialRequest/StockRequests';
import EditStockRequest from './MaterialRequest/EditStockRequest';
import StockReport from './StockReport/StockReport';


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
                <Route exact path="/Report" render={(nextState) => requireAuth(nextState, <Report location={nextState.location} history={nextState.history} match={nextState.match} />)} />
                <Route exact path="/Project" render={(nextState) => requireAuth(nextState, <Project location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/StockRequests" render={(nextState) => requireAuth(nextState, <StockRequests location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/EditStockRequest/:id" render={(nextState) => requireAuth(nextState, <EditStockRequest location={nextState.location} match={nextState.match} history={nextState.history} />)} />
                <Route exact path="/StockReport" render={(nextState)=>requireAuth(nextState, <StockReport  location={nextState.location} match={nextState.match} history={nextState.history}/>)} />
                <Route exact path="/EmployeesLocationMap" render ={(nextState)=>requireAuth(nextState, <Maps location={nextState.location} match={nextState.match} history={nextState.history} /> )} />
                <Route exact path="/LogReport" render={(nextState)=>requireAuth(nextState, <LogReport location={nextState.location} match={nextState.match} history={nextState.history} />)} />
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

