import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { Router, Route, IndexRoute } from 'react-router';
import { HashRouter } from 'react-router-dom';
import 'react-select/dist/react-select.css';
import $ from 'jquery';

import Task from './Task/Task';
import TaskDashBoard from './TaskDashBoard/TaskDashBoard';
import ViewTask from './ViewTask/ViewTask';


import 'froala-editor/js/froala_editor.pkgd.min.js';

import 'bootstrap-fileinput/js/plugins/piexif.min.js';
import 'bootstrap-fileinput/js/plugins/purify.min.js';
import 'bootstrap-fileinput/js/fileinput.js';
import 'bootstrap-fileinput/themes/explorer/theme.js';


window.jQuery = window.$ = require("jquery");
var bootstrap = require('bootstrap');

ReactDOM.render((
    <HashRouter>
        <div>
            <ToastContainer autoClose={3000} position="top-center" />
            <App>
                <Route exact path="/" component={Task} />
                <Route exact path="/Task" component={Task} />
                <Route exact path="/TaskDashBoard" component={TaskDashBoard} />
                <Route exact path="/ViewTask" component={ViewTask} />
            </App>
        </div>
    </HashRouter>

),
    document.getElementById("root")
)

