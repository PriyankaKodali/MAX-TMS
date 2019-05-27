import React, { Component } from 'react';
import $ from 'jquery';
import { showErrorsForInput } from '.././Validation.js';
import { validate } from 'validate.js';
import { toast } from 'react-toastify';
import { MyAjaxForAttachments } from '.././MyAjax';
import { ApiUrl } from '.././Config';
import { withRouter } from "react-router-dom";

class SendNotification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Employee: this.props.EmpId,
        }
    } 
    
    componentWillReceiveProps(nextProps) {
        this.setState({ Employee: nextProps.EmpId })
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)}  >
                    <div className="col-xs-12">
                        <div className="form-group">
                            <label>Title</label>
                            <input className="form-control" type="text" name="title" ref="title" autoComplete="off" />
                        </div>
                    </div>
                    <div className="col-xs-12">
                        <div className="form-group">
                            <label>Message</label>
                            <input className="form-control" type="text" name="message" ref="message" autoComplete="off" />
                        </div>
                    </div>
                    <div className="col-xs-12" style={{ textAlign: 'center', marginTop: '1%' }}>
                        <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                        <button type="submit" name="submit" className="btn btn-primary">Submit</button>
                    </div>
                </form>
            </div >
        )
    }

    handleSubmit(e) {
        e.preventDefault(); 
        $("button[name='submit']").hide();
        $(".loader").show();

        if (!this.validate(e)) {
            return;
        }
        var employees = [];
        employees.push(this.state.Employee);
        var data = new FormData();

        data.append("employees", JSON.stringify(employees));
        data.append("notificationTitle", this.refs.title.value);
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
                     this.props.closeModel();
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
        var isSubmit = e.type == "submit";

        if (validate.single(this.refs.title.value, { presence: true }) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.title, ["Title is required"]);
            if (isSubmit) {
                isSubmit = false;
                this.refs.title.focus();
            }
        }
        else {
            showErrorsForInput(this.refs.title, '');
        }
        if (validate.single(this.refs.message.value, { presence: true }) !== undefined) {
            success = false;
            showErrorsForInput(this.refs.message, ["Message is required"]);
            if (isSubmit) {
                isSubmit = false;
                this.refs.message.focus();
            }
        }
        else {
            showErrorsForInput(this.refs.message, '');
        }

        return success;
    }
}

export default withRouter(SendNotification);
