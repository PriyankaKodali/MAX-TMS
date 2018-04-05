import React, { Component } from 'react';
import './ViewTask.css';
import RichTextEditor from 'react-rte';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import $ from 'jquery';
import Select from 'react-select';
import { ApiUrl } from '.././Config.js';
import FroalaEditor from 'react-froala-wysiwyg';

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';



var moment = require('moment');

class ViewTask extends Component {

    constructor(props) {
        super(props);
        var froalaConfig = {
            heightMin: 210
        }
        this.state = {
            Status: null, Statuss: [], Model: "", model: "", FroalaConfig: froalaConfig,
            CreatedOn: moment(), CreatedBy: '', taskNum: 1, Action: null,
            StartDate: moment().format("YYYY-MM-DD")
        }

    }

    componentDidMount() {

        setUnTouched(document);

        $("#input-id").fileinput({
            theme: "explorer",
            hideThumbnailContent: true,
            uploadUrl: ApiUrl + "/api/Task",
            uploadAsync: true,
            overwriteInitial: false,
            initialPreviewAsData: true,
            showCancel: false,
            showRemove: false,
            showUpload: false,
            minFileCount: 1,
            fileActionSettings: {
                showUpload: false,
                showRemove: true
            }
        }).on("filebatchpreupload", function (event, data) {
            var form = data.form, files = data.files
            this.uploadFile(files)

        }.bind(this))
    }

    componentDidUpdate() {
        setUnTouched(document);
    }


    render() {

        return (

            <div style={{ marginTop: '5%' }}>
                <div className="myContainer">

                    <div class="col-xs-12">
                        <table className="table table-bordered table-hover" style={{ borderCollapse: 'collapse' }} >
                            <thead>
                                <tr >
                                    <th colspan={2}> <label> Task </label> {this.state.taskNum} Details</th>
                                    <th colspan={2}> <label> Creator : </label> {this.state.CreatedBy.value}</th>
                                    <th colSpan={2}> <label> Created On :</label> {this.state.CreatedOn.value} </th>
                                </tr>
                            </thead>
                            <tbody >
                                <tr>
                                    <td > <label>Priority:</label></td>
                                    <td ><label> Status:</label></td>
                                    <td colspan={2}> <label> Assigned To: </label></td>
                                    <td  > <label> AssignedDate: </label></td>
                                </tr>
                                <tr>
                                    <td > <label>Subject:</label></td>
                                    <td colSpan={4}> </td>
                                </tr>
                                <tr>
                                    <td > <label>Description:</label></td>
                                    <td colSpan={4}> </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="col-xs-12">

                        <table className="table table-bordered table-hover">
                            <thead>
                                <tr >
                                    <th colspan={8}> Actions / Responses</th>
                                </tr>
                                <tr>
                                    <th>Task Date</th>
                                    <th> UserName</th>
                                    <th></th>
                                    <th colspan={2}> Action/ Response</th>
                                    <th>Assign To</th>
                                    <th> Status </th>
                                    <th>Hours Worked </th>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <form onSubmit={this.handleSubmit.bind(this)} >
                        <div className="col-xs-3">
                            <label>Action Type </label>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" name="Action" ref="action" placeholder="Select Action" value={this.state.Action} onChange={this.ActionChanged.bind(this)}
                                        options={[{ value: "Assign", label: "Assign" }, { value: "Pending", label: "Pending/Acknowledgement" },
                                        { value: "Resolved", label: "Resolved" }]} />
                                </div>
                            </div>
                        </div>

                        {
                            this.state.Action != null ?
                                this.state.Action.value === "Assign" ?
                                    <div>
                                        <div className="col-xs-3">
                                            <label> Assign to</label>
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <span className="input-group-addon">
                                                        <span className="glyphicon glyphicon-user"></span>
                                                    </span>
                                                    <Select className="form-control" name="AssignedTo" ref="assignee" placeholder="Select an Assignee" value={this.state.assignedTo} options={this.state.Assignees} onChange={this.AssignedToChanged.bind(this)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-xs-3">
                                            <label>No. Of Hours Worked</label>
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <span className="input-group-addon">
                                                        <span className="glyphicon glyphicon-time" ></span>
                                                    </span>
                                                    <input className="form-control" name="budgetedhours" type="number" min="0" ref="budgetedhours" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    :
                                    this.state.Action.value === "Pending" ?
                                        <div>
                                            <div className="col-xs-3">
                                                <label>Planned Budgeted Hours</label>
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <span className="input-group-addon">
                                                            <span className="glyphicon glyphicon-time" ></span>
                                                        </span>
                                                        <input className="form-control" name="budgetedhours" type="number" min="0" ref="budgetedhours" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <label>Expected/Start Date </label>
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <span className="input-group-addon">
                                                            <span className="glyphicon glyphicon-calendar"></span>
                                                        </span>
                                                        <input className="col-md-3 form-control" style={{ lineHeight: '19px' }} type="date" name="DOS" ref="dos" autoComplete="off" defaultValue={this.state.StartDate} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <label>Expected Date of Completion </label>
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <span className="input-group-addon">
                                                            <span className="glyphicon glyphicon-calendar"></span>
                                                        </span>
                                                        <input className="col-md-3 form-control" style={{ lineHeight: '19px' }} type="date" name="DOC" ref="doc" autoComplete="off" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xs-3">
                                                <label>No. Of Hours Worked</label>
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <span className="input-group-addon">
                                                            <span className="glyphicon glyphicon-time" ></span>
                                                        </span>
                                                        <input className="form-control" name="budgetedhours" type="number" min="0" ref="budgetedhours" />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        :

                                        this.state.Action.value === "Resolved" ?
                                            <div className="col-xs-3">
                                                <label>No. Of Hours Worked</label>
                                                <div className="form-group">
                                                    <div className="input-group">
                                                        <span className="input-group-addon">
                                                            <span className="glyphicon glyphicon-time" ></span>
                                                        </span>
                                                        <input className="form-control" name="budgetedhours" type="number" min="0" ref="budgetedhours" />
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div />
                                :
                                <div />
                        }


                        <div className="col-xs-12 ">
                            <h4 className="heading"> Action </h4>
                            <div className="col-xs-12 actionLayout" >
                                <div className="col-xs-12" style={{ paddingTop: '12px' }}>
                                    <label> Action  </label>
                                    <div className="form-group">
                                        <FroalaEditor id="froala-editor" model={this.state.model} config={this.state.FroalaConfig} style={{ zIndex: '0px' }} />
                                    </div>
                                </div>

                                <div className="col-xs-12">
                                    <div className="form-group">
                                        <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any" showUpload="false" multiple />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="col-xs-12 text-center form-group">
                            <button type="submit" name="submit" className="btn btn-primary" style={{ marginTop: '1%' }}>Submit</button>
                            <div className="loader"></div>
                        </div>

                    </form>

                </div>

            </div >

        )
    }

    myNoteChanged(val) {
        this.setState({ myNote: val, myNoteHtml: val.toString('html') })

    }
    ActionChanged(val) {
        if (val) {
            this.setState({ Action: val })
            showErrorsForInput(this.refs.action.wrapper, null)
        }
        else {
            this.setState({ Action: '' })
            showErrorsForInput(this.refs.action.wrapper, ["Please select action type"]);
        }
    }

    handleModelChange(model) {
        this.setState({ model: model });
    }

    AssignedToChanged(val) {
        if (val) {
            this.setState({ AssignedTo: val })
            showErrorsForInput(this.refs.assignee.wrapper, null);
        }
        else {
            this.setState({ AssignedTo: '' })
        }
    }

    handleSubmit(e) {
        e.preventDefault();

    }


    validate(e) {
        var success = ValidateForm(e);

        if (!this.state.Action || !this.state.Action.value) {
            success = false;
            showErrorsForInput(this.refs.Action.wrapper, ["Please select action type"])
        }




    }
}
export default ViewTask;







