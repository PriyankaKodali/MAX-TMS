import React, { Component } from 'react';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '../Config';
import { MyAjax, MyAjaxForAttachments } from '../MyAjax';
import { showErrorsForInput } from '../Validation';
import { toast } from 'react-toastify';
import validate from 'validate.js';



class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Employees: [], SelectedEmployees: '',
        }
    }
    componentWillMount() {

        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + '' + "&orgId=" + null,
            (data) => { this.setState({ Employees: data["employees"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )
    }


    render() {
        return (
            <div className="container">
                <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)}  >
                    <div className="notificationContainer">
                        <div className="col-xs-12">
                            <label>Employees</label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" name="employees" ref="employees" placeholder="Select Employee/(s)" multi options={this.state.Employees} value={this.state.SelectedEmployees} onChange={this.EmployeesSelected.bind(this)} />
                                </div>
                            </div>

                        </div>
                        <div className="col-xs-12">
                            <label> Notification Title</label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon"> </span>
                                    <input className="form-control" type="text" placeholder="Notification Title" ref="notificationTitle" />
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12">
                            <label> Message  </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon"> </span>
                                    <input type="text" className="form-control" placeholder="Message" ref="message" />
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12 text-center form-group" style={{ marginTop: '1%' }}>
                            <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                            <button type="submit" name="submit" className="btn btn-primary">Submit</button>
                        </div>

                    </div>
                </form>
            </div>

        )
    }

    EmployeesSelected(val) {
        if (val.length > 0) {
            this.setState({ SelectedEmployees: val })
            showErrorsForInput(this.refs.employees.wrapper, '');
        }
        else {
            this.setState({ SelectedEmployees:  '' })
            showErrorsForInput(this.refs.employees.wrapper, ["Select atleast one employee"]);
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        $(".loader").show();
        $("button[name='submit']").hide();

        if (!this.validate(e)) {
            $("button[name='submit']").show();
            $(".loader").hide();
            return;
        }
        var employees = [];
        var selectedEmployees = this.state.SelectedEmployees;
        selectedEmployees.map((ele, i) => {
            employees.push(ele["value"]);
        })

        var data = new FormData();
        data.append("employees", JSON.stringify(employees));
        data.append("notificationTitle", this.refs.notificationTitle.value);
        data.append("message", this.refs.message.value);

        var url = ApiUrl + "/api/Notification/SendNotification"

        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Notification was sent successfully", {
                        type: toast.TYPE.SUCCESS
                    })
                    $("button[name='submit']").show();
                    $(".loader").hide();
                     
                    this.setState({SelectedEmployees:''})
                    this.refs.notificationTitle.value= "";
                    this.refs.message.value="";
                    return true;
                },
                (error) => {
                    toast(error.responseText, {
                        type: toast.TYPE.ERROR,
                        autoClose: false
                    });
                    $(".loader").hide();
                    $("button[name='submit']").show();
                    return false;
                },
                "POST",
                data
            )
        }
        catch (e) {
            toast("An error occured, please try again later", {
                type: toast.TYPE.ERROR
            })
            $(".loader").hide();
            $("button[name='submit']").show();
            return false;
        }


    }

    validate(e) {
        var success = true;
        var isSubmit = e.type === "submit"

        if (this.state.SelectedEmployees.length == 0) {
            success = false;
            showErrorsForInput(this.refs.employees.wrapper, ["Select atleast one employee"]);
            if (isSubmit) {
                isSubmit = false;
                this.refs.employees.focus();
            }
        }

        if (validate.single(this.refs.notificationTitle.value, { presence: true }) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.notificationTitle, ["Please enter notification title"]);
            if (isSubmit) {
                this.refs.notificationTitle.focus();
                isSubmit = false;
            }
            success = false;
        }
        else {
            showErrorsForInput(this.refs.notificationTitle, '');
        }

        if (validate.single(this.refs.message.value, { presence: true }) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.message, ["Please enter message"]);
            if (isSubmit) {
                this.refs.message.focus();
                isSubmit = false;
            }
            success = false;
        }
        else {
            showErrorsForInput(this.refs.message, '');
        }

        return success;

    }
}


export default Notification;