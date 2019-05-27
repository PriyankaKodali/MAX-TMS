import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl } from '../Config.js';
import { MyAjaxForAttachments } from '../MyAjax';
import { toast } from 'react-toastify';

class SubCategories extends Component {

    constructor(props) {
        super(props);
        this.state = {
            SubCategories: this.props.subCategories, Category: this.props.category
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            SubCategories: nextProps.subCategories, Category: nextProps.category
        })
    }
    render() {
        return (
            <div key={this.state.SubCategories}>

                <div className="col-xs-12 subheading"  >
                    <button style={{ cursor: 'pointer', float: 'right' }} className="btn btn-primary" onClick={() => { this.addSubCat(this.state.SubCategories) }}>  Add SubCategory </button>
                </div>
                {
                    this.state.SubCategories.map((ele, i) => {
                        return (
                            <div className="col-xs-12" key={i}>
                                <div className="col-md-5">
                                    <div className="form-group">
                                        <label>SubCategory Name</label>
                                        <input className="form-control" type="text" defaultValue={ele["Name"]} onChange={this.SubCatChanged.bind(this, i)} />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Points</label>
                                        <input className="form-control" type="number" defaultValue={ele["Points"]} onChange={this.PointsChanged.bind(this, i)} />
                                    </div>
                                </div>
                                {
                                    ele["SubCategoryId"] == '' ?
                                        <div className="col-md-2 removeBtn" >
                                            <i className="fa fa-trash pointer" onClick={this.removeItem.bind(this, i)} aria-hidden="true"></i>
                                        </div>
                                        :
                                        ""
                                }
                            </div>
                        )
                    })
                }
                <div className="col-xs-12 mTop1 tcenter">
                    <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                    <button name="submit" value="save" className="btn btn-primary" onClick={this.handleSubmit.bind(this)}> Save </button>

                </div>
            </div>
        )
    }

    SubCatChanged(e, ele) {
        var subCategories = this.state.SubCategories;
        subCategories[e]["Name"] = ele.target.value;

        this.setState({ SubCategories: subCategories })
    }

    PointsChanged(e, ele) {
        var subCategories = this.state.SubCategories;
        subCategories[e]["Points"] = ele.target.value;
        this.setState({ SubCategories: subCategories })
    }

    addSubCat() {
        var subCategories = this.state.SubCategories;
        subCategories.push({ Name: '', Points: '', SubCategoryId: '', PointsLogId: '' })

        this.setState({ SubCategories: subCategories }, () => {
            $("#subCategories").modal("show");
        });
    }

    removeItem(e, ele) {
        var subCategories = this.state.SubCategories;
        subCategories.splice(e, 1);
        this.setState({ SubCategories: subCategories });
    }

    handleSubmit(e) {
        e.preventDefault();

        $(".loader").show();
        $("button[name='submit']").hide();

        var isInvalid = this.state.SubCategories.findIndex((i) => i.Name == "" || i.Points == "");
        var invalidPoints = this.state.SubCategories.findIndex((i) => i.Points <= 0);
        if (isInvalid !== -1) {
            toast("List of subCategories are incomplete", { type: toast.TYPE.INFO });
            $(".loader").hide();
            $("button[name='submit']").show();
            return;
        }
        if (invalidPoints !== -1) {
            toast(" Points should be greater than 0", { type: toast.TYPE.INFO });
            $(".loader").hide();
            $("button[name='submit']").show();
            return;
        }

        var data = new FormData();

        data.append("subCategories", JSON.stringify(this.state.SubCategories));
        data.append("catId", this.props.category);

        var url = ApiUrl + "/api/Category/EditCategory"

        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Categories changes were successful", { type: toast.TYPE.SUCCESS });
                    this.props.CloseModal();
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
        }

    }
}

export default SubCategories;