import React, { Component } from 'react';
import Select from 'react-select';
import './Estimates.css';

class Estimates extends Component {

    constructor(props) {
        super(props);
        var itemsList = [{ Item: null, Description: "", Quantity: "1", Rate: 0.0, Discount: 0, Tax: "", Amount: "" }];
        this.state = {
            Clients: [], Client: null, States: [], State: null, Projects: [], Project: null, PlaceOfSupply: null,
            ItemsList: itemsList, Items: [], item: null, SubTotal: 0.0, Adjustment: "0.0", Total: "0.0",

        }
    }

    render() {
        return (
            <div className="container" style={{ marginTop: '15px' }}>

                <div className="ContainerStyle">
                    <div className="col-xs-12">
                        <div className="col-md-2 mTop10" > <label> Customer Name </label> </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-user"></span>
                                    </span>
                                    <Select className="form-control" placeholder="Select Customer"
                                        options={this.state.Clients} value={this.state.Client} onChange={this.CustomerChanged.bind(this)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xs-12">
                        <div className="col-md-2 mTop10" > <label> Place of Supply </label> </div>
                        <div className="col-md-5">
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-map-marker"></span>
                                    </span>
                                    <Select className="form-control" placeholder="Select place of supply"
                                        options={this.state.States} value={this.state.State} onChange={this.PlaceOfSupplyChanged.bind(this)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="formstyle">
                    <div className="col-xs-12">
                        <div className="col-md-2 mTop10" > <label> Estimate Number </label> </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <input className="form-control" type="text" name="estimateNumber" />
                            </div>
                        </div>
                    </div>

                    <div className="col-xs-12">
                        <div className="col-md-2 mTop10" > <label> Reference Number </label> </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <input className="form-control" type="text" name="referenceNumber" />
                            </div>
                        </div>
                    </div>

                    <div className="col-xs-12">

                        <div className="col-md-2 mTop10" > <label> Estimate Date</label> </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <input className="form-control" type="date" name="estimateDate" />
                            </div>
                        </div>

                        <div className="col-md-2 mTop10" > <label> Expiry Date</label> </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <input className="form-control" type="date" name="expiryDate" />
                            </div>
                        </div>

                        <hr className="col-xs-10" />

                    </div>


                    <div className="col-xs-12">
                        <div className="col-md-2 mTop10" > <label> Sales Person </label> </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-map-marker"></span>
                                    </span>
                                    <Select className="form-control" placeholder="Select Supplier Name"
                                        options={this.state.Suppliers} value={this.state.Supplier} onChange={this.SupplierChanged.bind(this)} />
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="col-xs-12">
                        <div className="col-md-2 mTop10" > <label> Project Name </label> </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <span className="glyphicon glyphicon-map-marker"></span>
                                    </span>
                                    <Select className="form-control" placeholder="Select Project Name"
                                        options={this.state.Projects} value={this.state.Project} onChange={this.ProjectChanged.bind(this)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="col-xs-10" />
                    <div className="col-xs-12 itemsBlock">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th > Item details</th>
                                    <th > Quantity</th>
                                    <th > Rate</th>
                                    <th>Discount</th>
                                    <th > Tax</th>
                                    <th> Amount </th>
                                    <th style={{ width: '0.5%' }}><span className="col-xs-1 text-success fa fa-plus btn btn-success" onClick={this.addItem.bind(this)}></span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.ItemsList.map((ele, i) => {
                                        return (
                                            <tr key={ele + "" + i}>
                                                <td className="col-md-3 form-group"><Select className="form-control" value={this.state.Item} options={this.state.Items} onChange={this.ItemChanged.bind(this, i)} />
                                                    <input type="text" className="form-control un-touched" onChange={this.descriptionChange.bind(this, i)} value={ele.Description} name="description" placeholder="Description" autoComplete="off" />
                                                </td>
                                                <td className="col-md-1 form-group colxs1"><input type="number" className="form-control un-touched" onChange={this.quantityChange.bind(this, i)} defaultValue={ele.Quantity} name="units" placeholder="Quantity" autoComplete="off" min={1} /></td>
                                                <td className="col-md-1 form-group colxs1 "><input type="text" className="form-control un-touched" onChange={this.rateChange.bind(this, i)} defaultValue={ele.Rate} name="rate" placeholder="Rate" autoComplete="off" /></td>
                                                <td className="col-md-1 form-group colxs1"><input type="number" className="form-control un-touched" onChange={this.discountChange.bind(this, i)} defaultValue={ele.Discount} name="units" placeholder="Discount" autoComplete="off" min={1} /></td>
                                                <td className="col-md-1 form-group colxs1"><input type="text" className="form-control un-touched" onChange={this.taxChange.bind(this, i)} defaultValue={ele.Tax} name="rate" placeholder="Tax" autoComplete="off" /></td>
                                                <td className="col-md-1 form-group colxs1"><input type="text" className="form-control un-touched" value={ele.Amount} name="Amount" placeholder="Amount" disabled={true} autoComplete="off" /></td>
                                                <td ><span className={"col-xs-1 text-danger fa fa-times btn btn-danger " + (ele["Id"] === undefined ? "" : "hidden")} onClick={this.removeItem.bind(this, i)}></span></td>

                                            </tr>

                                        );
                                    })}
                            </tbody>
                        </table>

                        <div className="col-xs-12">
                            <div className="col-md-8 txtRight" > <label> Sub Total</label> </div>
                            <div className="col-md-3 txtRight" > {this.state.SubTotal} </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="col-md-8">
                                <div className="col-md-3 txtRight" style={{ float: 'right' }}  > <input className="col-xs-2 form-control" type="text" placeholder="Adjustment" /> </div>
                            </div>
                            <div className="col-md-3 txtRight" > {this.state.Adjustment} </div>
                        </div>

                        <div className="col-xs-12">
                            <div className="col-md-8 txtRight" > <label> Total </label> </div>
                            <div className="col-md-3 txtRight"> {this.state.Total} </div>
                        </div>

                    </div>
                </div>

                <div className="ContainerStyle">

                    <div className="col-xs-12"  >
                        <div className="col-md-4 mTop10"> <label> Attach Files </label>
                            <input className="form-control" type="file" name="files" ref="files" multiple />
                        </div>
                        <div className="col-md-8 mTop10">
                            <label>Customer Notes </label>

                            <textarea className="col-md-12 form-control formtextArea" type="text" />
                        </div>
                    </div>

                    <div className="col-xs-12" >
                        <div className="col-md-4 mTop10"> <label> Template </label>
                            <input className="form-control" type="file" name="template" ref="templete" />
                        </div>
                        <div className="col-md-8">
                            <label>Terms & Conditions </label>
                            <textarea className="col-md-12 form-control formtextArea" type="text" />
                        </div>
                    </div>
                </div>

                <div className="col-xs-12 text-center form-group" style={{ marginTop: '1%' }}>
                    <button type="submit" name="submit" className="btn btn-primary">Save and draft</button>
                    <button type="submit" name="submit" className="btn btn-success mLeft5">Save and Send</button>
                    <button className="btn btn-default mLeft5" type="reset" name="submit" > Clear </button>
                    <div className="loader"></div>
                </div>



            </div>
        )
    }

    addItem() {

        var items = this.state.ItemsList;

        items.push({ Item: null, Description: "", Quantity: "1", Rate: "0.0", Discount: "0", Tax: "", Amount: "" });
        this.setState({ ItemsList: items });

    }

    CustomerChanged(val) {
        if (val) {
            this.setState({ Client: val })
        }
        else {
            this.setState({ Client: '' })
        }
    }

    PlaceOfSupplyChanged(val) {
        if (val) {
            this.setState({ PlacsOfSupply: val })
        }
        else {
            this.setState({ PlaceOfSupply: '' })
        }

    }

    SupplierChanged(val) {
        if (val) {
            this.setState({ Supplier: val })
        }
        else {
            this.setState({ Supplier: '' })
        }
    }

    ProjectChanged(val) {
        if (val) {
            this.setState({ Project: val })
        }
        else {
            this.setState({ Project: '' })
        }
    }

    ItemChanged(ele, i) {

    }

    quantityChange(e, ele) {
        var items = this.state.ItemsList;
        items[e]["Quantity"] = ele.target.value;
        this.setState({ ItemsList: items });
    }

    discountChange(e, ele) {
        var items = this.state.ItemsList;
        items[e]["Discount"] = ele.target.value;
        this.setState({ ItemsList: items })
    }

    rateChange(e, ele) {
        var items = this.state.ItemsList;
        items[e]["Rate"] = ele.target.value;
        this.setState({ ItemsList: items });
    }

    taxChange(e, ele) {
        var items = this.state.ItemsList;
        items[e]["Tax"] = ele.target.value;
        this.setState({ ItemsList: items })
    }

    removeItem(e, ele) {

        if (!window.confirm("Do you wish to remove item from the list?")) {
            return;
        }
        var items = this.state.ItemsList
        items.splice(e, 1);
        this.setState({ ItemsList: items });
    }

    descriptionChange(e, ele) {
        var items = this.state.ItemsList;
        items[e]["Description"] = ele.target.value;
        this.setState({ ItemsList: items });
    }
}

export default Estimates;