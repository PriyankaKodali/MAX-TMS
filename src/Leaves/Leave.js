import React, {Component} from 'react';
import $ from 'jquery';
import Select from 'react-select';

import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

class Leave extends Component{

    constructor(props){
        super(props);
        var leaveTypes= [{value:0 , label:'Casual Leave'}, {value:1, label:'Sick Leave'}]
        this.state ={
                  LeaveTypes: leaveTypes, Description: EditorState.createEmpty(), DescriptionHtml: "",
            }
    }
    render(){
        return(
            <div className="container">
              <div className="col-xs-12">
                 <div className="col-md-3">
                      <label>From date</label>
                       <div className="form-group">
                          <span className="input-group-addon">
                                <span className="glyphicon glyphicon-calender"></span>
                          </span>
                          <input type="date" className="form-control" name="fromDate" ref="fromDate"  />
                      </div>
                 </div>

                 <div className="col-md-3">
                      <label>To date</label>
                       <div className="form-group">
                          <span className="input-group-addon">
                                <span className="glyphicon glyphicon-calender"></span>
                          </span>
                          <input type="date" className="form-control" name="toDate" ref="toDate"  />
                      </div>
                 </div>

                 <div className="col-md-3">
                      <label>No.Of Days</label>
                       <div className="form-group">
                          <span className="input-group-addon">
                          </span>
                          <input type="number" className="form-control" name="totaldays" ref="noofdays"  />
                      </div>
                 </div>

                 <div className="col-md-3">
                        <label>Leave Type</label>
                         <div className="form-group">
                           <span className="input-group-addon">
                           </span>
                           <Select className="form-control" ref="leaveType"  options={this.state.LeaveTypes} value ={this.state.LeaveType}  />
                         </div>
                  </div>

              </div>
              <div className="col-xs-12" >
                            <div className="col-xs-12 form-group" style={{ height: "auto", paddingTop: '5', paddingLeft: '15px' }}>
                                <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor"
                                    // toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }}
                                    editorState={this.state.Description} toolbarClassName="toolbarClassName"
                                    wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner"
                                    onEditorStateChange={this.messageBoxChange.bind(this)} />

                                <input hidden ref="description" name="forErrorShowing" />
                            </div>
                        </div>
           
            </div>
        )
    }
}

export default Leave;