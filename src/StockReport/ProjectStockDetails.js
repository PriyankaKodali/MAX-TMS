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
                                    <a data-toggle="collapse" data-parent="#accordion" href={"collapse" +  i }>   {ele["ModelName"]} </a>
                                </div>

                                <div id={"collapse" +  i } className="panel-collapse collapse in">
                                    <div className="panel-body">
                                        {ele["Items"].map((e, j) => {
                                            return (
                                                <p key={j}>
                                                    <label> Serial Number : </label> {e["SerialNumber"]}
                                                    <label> MAC Address : </label> {e["MacAddress"]}
                                                    <label> Manufactured Date : </label> {moment(e["ManufacturedDate"]).format("DD-MM-YYYY")}
                                                </p>
                                            )

                                        })}
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