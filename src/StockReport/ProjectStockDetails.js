import React, { Component } from 'react';
import $ from 'jquery';

var moment = require('moment');

class ProjectStockDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            MaterialUsed: this.props.MaterialUsed, StockDetails: this.props.StockDetails
        }
    }

    componentWillMount() {
        console.log(this.props.StockDetails);
        $("#myItemModel").modal("show");
    }

    render() {
        return (
            <div key={this.state.StockDetails}>

                {
                    this.state.StockDetails.map((ele, i) => {
                        return (
                            <div className="panel panel-info" >
                                <div className="panel-heading">
                                    <h4 className="panel-title">
                                        <a data-toggle="collapse" data-parent="#accordion" href={"#collapse" + i}>
                                            {ele["ModelName"]}   {"No of items : "}  {ele["TotalItems"]}
                                        </a>
                                    </h4>
                                </div>

                                <div id={"collapse" + i} className="panel-collapse collapse ">
                                    <div className="panel-body">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <td> <label> Serial Number </label> </td>
                                                    <td> <label> MAC Address </label> </td>
                                                    <td> <label> Manufactured Date </label> </td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ele["Items"].map((e, j) => {
                                                    return (
                                                        <tr>
                                                            <td> {e["SerialNumber"]} </td>
                                                            <td> {e["MacAddress"]} </td>
                                                            <td> {moment(e["ManufacturedDate"]).format("DD-MM-YYYY")} </td>
                                                        </tr>
                                                    )

                                                })}
                                            </tbody>
                                        </table>

                                    </div>

                                </div>

                            </div>
                        )
                    })
                }

            </div >

        )
    }
}

export default ProjectStockDetails;