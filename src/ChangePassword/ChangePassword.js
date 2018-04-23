import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config.js';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import './ChangePassword.css';
import { toast } from 'react-toastify';
import{MyAjax} from '../MyAjax.js';


class ChangePassword extends Component {

    render() {
        return (
            <div className="container">
                <form action="" method="post" name="Change_Password" className="changePwdForm" onChange={this.validate.bind(this)} onSubmit={this.handleSubmit.bind(this)} >
                    <h3 className="text-center" >
                        <img className="logo" src="Images/logo.png" alt="" />
                    </h3>

                    <div className="form-group">
                        <div className="input-group">
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-user"></span>
                            </span>
                            <input className="form-control" type="password" placeholder="Old Password" name="OldPassword" autoComplete="off" ref="oldpwd" />
                        </div>
                    </div>

                    <div className="form-group" >
                        <div className="input-group">
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-user"></span>
                            </span>
                            <input className="form-control" type="password" placeholder="New Password" name="NewPassword" autoComplete="off" ref="newpwd" />
                        </div>
                    </div>

                    <div className="form-group" >
                        <div className="input-group">
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-user"></span>
                            </span>
                            <input className="form-control" type="password" placeholder="Confirm Password" name="ConfirmPassword" autoComplete="off" ref="confirmpwd" />
                        </div>
                    </div>

                    <div >
                        <button type="submit" className="btn btn-primary btnChange" name="submit" value="Login" type="submit" >Change</button>
                        <div className="loader loaderActivity btnSave"></div>
                    </div>
                </form>

            </div>
        )
    }

     logout() {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("roles");
        window.isLoggedIn = false;
        window.open("/", "_self")
    }


    handleSubmit(e) {
        e.preventDefault();

         $(".loaderActivity").show();
        $("button[name='submit']").hide();


        if (!ValidateForm(e)) {
            $(".loaderActivity").hide();
            $("button[name='submit']").show();
            return false;
        }

        var data = {
            OldPassword: this.refs.oldpwd.value.trim(),
            NewPassword: this.refs.newpwd.value.trim(),
            ConfirmPassword: this.refs.confirmpwd.value.trim()
        };

        let url = ApiUrl + "/api/Account/ChangePassword";

          MyAjax(
            url,
            (data) => {
                toast("Password updated succesfully!", {
                    type: toast.TYPE.SUCCESS
                });
                this.logout();
            },
            (error) => {
                this.setState({ error: error.responseJSON[0] });
                toast(error.responseJSON[0], {
                    type: toast.TYPE.ERROR
                });
                $(".loader").hide();
                $("button[type='submit']").show();
            },
            "POST",
            data
        );
    }

    validate(e) {
        var success = ValidateForm(e);

        if (this.refs.newpwd.value != this.refs.confirmpwd.value) {
            showErrorsForInput(this.refs.confirmpwd, ["New password & Confirm password should match"]);
            return false;
        }
        return success;
    }
}

export default ChangePassword;