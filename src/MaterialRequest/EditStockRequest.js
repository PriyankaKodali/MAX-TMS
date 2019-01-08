import React, { Component } from 'react';
import $ from 'jquery';
import { MyAjax, MyAjaxForAttachments } from '../MyAjax.js';
import { ApiUrl } from '../Config';
import Select from 'react-select';
import { showErrorsForInput, setUnTouched, showErrors } from '../Validation';
import { toast } from 'react-toastify';

var moment = require('moment');

class EditStockRequest extends Component {

    constructor(props) {
        super(props);
        var itemsList = [{ Item: null, ItemDescription: '', Quantity: '', Id: '',NoOfItemsAvailable:'' }]
        this.state = {
            Clients: [], Client: null, Project: '', Projects: [], Items: [], ItemsList: itemsList,
            RequestedItems: [], StockRequest: [], buttonName: "", StockManagers: [], IsStockManager: false,
            AllowStockEdit: true, ItemsNotAvailable: false

        }
    }

    componentWillMount() {
        var orgId = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ? null : sessionStorage.getItem("OrgId")


        if (this.props.match.params["id"] !== null) {

            MyAjax(
                ApiUrl + "/api/Stock/GetStockRequest?stockReqId=" + this.props.match.params["id"],
                (data) => {
                    this.setState({
                        StockRequest: data["stockRequestData"], 
                        RequestedItems: data["stockRequestData"]["Items"],
                        Client: { value: data["stockRequestData"]["ClientId"], label: data["stockRequestData"]["ClientName"] },
                        Project: { value: data["stockRequestData"]["ProjectId"], label: data["stockRequestData"]["ProjectName"] }

                    }, () => {
                    
                        $.ajax({
                            url: ApiUrl + "/api/Client/GetClientProjects?clientId=" + data["stockRequestData"]["ClientId"],
                            type: "get",
                            success: (info) => {
                                this.setState({
                                    Projects: info["clientProjects"],
                                    //   Project: { label: this.state.StockRequest["ProjectName"], value: this.state.StockRequest["Project"] }
                                })
                            }
                        })
                        var items = []
                        this.state.RequestedItems.map((ele, i) => {
                            var item = {
                                Item: { value: ele["ModelId"], label: ele["ItemName"] },
                                Description: ele["Description"],
                                Quantity: ele["Quantity"],
                                Id: ele["StockReqMappingId"],
                                NoOfItemsAvailable: ele["NoOfItemsAvailable"]
                            }
                            items.push(item);
                        })

                        var CheckAllItemsExists = items.findIndex((i) => (i.Quantity > i.NoOfItemsAvailable));

                        if (CheckAllItemsExists != -1) {
                            this.setState({ ItemsNotAvailable: true })
                        }

                        var status = this.state.StockRequest["Status"]

                        if (status == "Approved" || status == "Declined" || status == "Dispatched") {
                            this.setState({ AllowStockEdit: false })
                        }

                        this.setState({ ItemsList: items })
                    })
                },
                (error) => toast(error.responseText, {
                    type: toast.TYPE.ERROR
                })
            )
        }

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
            type: "get",
            success: (data) => { this.setState({ Clients: data["clients"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/MasterData/GetItems",
            type: "get",
            success: (data) => {
                this.setState({ Items: data["items"] })
            }
        })

        $.ajax({
            url: ApiUrl + "/api/Stock/GetStockManagers",
            type: "get",
            success: (data) => {
                this.setState({ StockManagers: data["stockManagers"] }, () => {
                    var stockManagers = data["stockManagers"];
                    var user = sessionStorage.getItem("EmpId");
                    var isManager = stockManagers.findIndex((i) => i.AspNetUserId == user);
                    if (isManager != -1) {
                        this.setState({ IsStockManager: true })
                    }
                })
            }
        })

    }

    componentDidMount() {
        setUnTouched(document);
    }


    render() {
        return (
            <div className="container" key={this.state.StockManagers} >

                <div className="col-xs-12" style={{ marginTop: '0.2%' }}>
                    <h4 className="col-md-11"> </h4>
                    <button className="col-md-1 btn btn-primary backBtn" onClick={() => { this.props.history.push("/StockRequests") }}  > Back </button>
                </div>


                <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)}>

                    <div className="itemRequestContainer" key={this.state.StockRequest} style={{ marginTop: '3%' }}>

                        <div className="col-xs-12">
                            <div className="row">
                                <div className="col-md-3 mTop10" >
                                    <label> Client </label>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon"></span>
                                            <Select className="form-control" placeholder="Select Client" ref="client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12">
                            <div className="row">
                                <div className="col-md-3 mTop10">
                                    <label> Project </label>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon"></span>
                                            <Select className="form-control" placeholder="Select Project" ref="project" value={this.state.Project} options={this.state.Projects} onChange={this.ProjectChanged.bind(this)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12">
                            <div className="row">
                                <div className="col-md-3 mTop10">
                                    <label> Stock Required on or before </label>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon">
                                                <span className="glyphicon glyphicon-calendar" />
                                            </span>
                                            <input className="form-control" type="date" style={{ lineHeight: '19px' }} ref="stockDate" name="stockDate" defaultValue={moment(this.state.StockRequest["ExpectedStockDate"]).format("YYYY-MM-DD")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12" >
                            <div className="row">
                                <div className="col-md-10"> <hr />  </div>
                            </div>
                        </div>


                        <div className="col-xs-12">
                            <div className="row">
                                <div className="col-md-2 mTop12">
                                    <label> Items Required :</label>
                                </div>
                            </div>
                        </div>


                        <div className="col-xs-12" key={this.state.ItemsList} >

                            <div className="row">
                                <div className="col-md-9" key={this.state.AllowStockEdit}>
                                    <table className="table table-bordered itemTable">
                                        <thead className="itemsHeader">
                                            <tr>
                                                <td> <label> Item </label> </td>
                                                <td style={{ width: '16%' }}> <label> Quanitity Requested</label> </td>
                                                {
                                                    sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ?
                                                        <td style={{ width: '16%' }}> <label> Quantity Available </label> </td>
                                                        :
                                                        ""
                                                }
                                            </tr>
                                        </thead>

                                        {
                                            // this.state.StockRequest["Status"] !== "Approved" && this.state.StockRequest["Status"] !== "Rejected"
                                            this.state.AllowStockEdit == true ?
                                                <tbody key={this.state.ItemsList}>
                                                    {
                                                        this.state.ItemsList.map((ele, i) => {
                                                            return (
                                                                <tr>
                                                                    <td>
                                                                        <Select className="form-control removeItemSelectBorder itemSelect" ref="item" value={ele.Item} options={this.state.Items} onChange={this.ItemChanged.bind(this, i)} />
                                                                        {
                                                                            ele["Item"] != null && ele["Item"] != '' ?
                                                                                <input style={{ background: 'white' }} key={this.state.ItemSelected} type="text" className="form-control un-touched removeBorder" value={ele.Description} name="description" placeholder="Description" disabled="true" autoComplete="off" />
                                                                                :
                                                                                ""
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        <input className="form-control removeBorder quantityLabel" type="number" name="quantity" min="0" ref="quantity" value={ele.Quantity} onChange={this.QuanitityChanged.bind(this, i)} />
                                                                    </td>
                                                                    {
                                                                        sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ?
                                                                            <td className="quantityLabel" style={{ paddingTop: '16px' }} >  {ele.NoOfItemsAvailable} </td>
                                                                            :
                                                                            ""
                                                                    }

                                                                    <td className="itemoptions" style={{ width: '1%' }} >
                                                                        <span style={{ width: '0.5%' }} title="Remove" className={"buttonStyle closebtnStyle fa fa-times  btn-danger "} value="close" onClick={this.removeItem.bind(this, i)}></span>
                                                                    </td>

                                                                </tr>
                                                            )
                                                        })
                                                    }

                                                </tbody>
                                                :
                                                <tbody key={this.state.ItemsList}>
                                                    {
                                                        this.state.ItemsList.map((ele, i) => {
                                                            return (
                                                                <tr>
                                                                    <td>
                                                                        <label>{ele["Item"] != null ? ele["Item"]["label"] : ""} </label>
                                                                        <input style={{ background: 'white' }} key={this.state.ItemSelected} type="text" className="form-control un-touched removeBorder" value={ele.Description} name="description" placeholder="Description" disabled="true" autoComplete="off" />
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <label >{ele.Quantity}</label>
                                                                    </td>
                                                                    {
                                                                        sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ?
                                                                            <td style={{ textAlign: 'center' }}> <label> {ele.NoOfItemsAvailable} </label>    </td>
                                                                            :
                                                                            ""
                                                                    }
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                        }

                                    </table>
                                </div>

                                {/* <div className="col-md-3">
                                    <image style={{ height: '100px' }} src={this.state.StockRequest["Status"] == "Approved" ? "/Images/approved.png" : ""} />
                                </div> */}

                                {
                                    this.state.StockRequest["Status"] == "Approved" ?
                                        <div className="col-md-3">
                                            <h3 className="text-center" >
                                                <img className="stockStatus" src="Images/approved.png" alt="" />
                                            </h3>
                                        </div>
                                        :
                                        this.state.StockRequest["Status"] == "Declined" ?
                                            <div className="col-md-3">
                                                <h3 className="text-center" >
                                                    <img className="stockStatus" src="Images/declined.jpg" alt="" />
                                                </h3>
                                            </div>
                                            :
                                            this.state.StockRequest["Status"] == "Dispatched" ?
                                                <div className="col-md-3">
                                                    <h3 className="text-center">
                                                        <img className="stockStatus" src="Images/dispatched.jpg" alt="Dispatched" />
                                                    </h3>
                                                </div>
                                                :
                                                ""
                                }

                            </div>

                        </div>

                        {
                            // this.state.StockRequest["Status"] !== "Approved" && this.state.StockRequest["Status"] !== "Rejected" && this.state.StockRequest["Status"] !== "Dispatched" 
                            this.state.AllowStockEdit == true ?
                                <div className="col-xs-12">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <button className="btn btn-outline-secondary btnAddItem" style={{ textAlign: 'left' }} type="button" onClick={this.addAnotherItem.bind(this)} > + Add Another line</button>
                                        </div>
                                    </div>
                                </div>
                                :
                                ""
                        }

                        <div className="col-xs-12">
                            <div className="row">
                                <div className="col-md-2">
                                    <label> Notes : </label>
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="row">
                                <div className="col-md-10">
                                    <div className="form-group">
                                        <span className="input-group">
                                            <span className="inputgroup-addon"></span>
                                        </span>
                                        <textarea className="form-control notes" ref="notes" defaultValue={this.state.StockRequest["Notes"]} />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {
                            // this.state.StockRequest["Status"] !== "Approved" && this.state.StockRequest["Status"] !== "Rejected" && this.state.StockRequest["Status"] !== "Dispatched" && this.state.IsStockManager == false
                            this.state.AllowStockEdit == true && this.state.IsStockManager == false ?
                                <div className="col-xs-12 text-center form-group"  >
                                    {
                                        sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ?
                                            <div key={this.state.ItemsNotAvailable}>
                                                <div className="loader" style={{ marginLeft: '50%', marginBottom: '0%' }}></div>
                                                <button type="submit" name="approve" id="approve" className="btn btn-success" disabled={this.state.ItemsNotAvailable} onClick={() => this.setState({ buttonName: "approve" })}>Approve</button>
                                                <button type="submit" style={{ marginLeft: '1%' }} id="reject" name="reject" disabled={this.state.ItemsNotAvailable} className="btn btn-danger" onClick={() => this.setState({ buttonName: "reject" })}>Decline</button>
                                            </div>
                                            :
                                            <div>
                                                <div className="loader" style={{ marginLeft: '50%', marginBottom: '0%' }}></div>
                                                <button type="submit" name="submit" className="btn btn-primary">Submit</button>
                                            </div>
                                    }
                                </div>
                                :
                                this.state.IsStockManager == true && this.state.StockRequest["Status"] == "Approved" && this.state.StockRequest["Status"] !== "Dispatched" ?
                                    <div className="col-xs-12 text-center form-group" key={this.state.IsStockManager} >
                                        <div className="loader" ></div>
                                        <button type="submit" id="dispatch" name="dispatch" className="btn btn-info" onClick={() => this.setState({ buttonName: "dispatch" })} >Dispatch</button>
                                    </div>
                                    :
                                    ""
                        }

                    </div>
                </form>
            </div>
        )
    }

    removeItem(e, ele) {
        if (this.state.ItemsList.length > 1) {
            if (!window.confirm("Do you wish to remove item from the list?")) {
                return;
            }
            var items = this.state.ItemsList
            items.splice(e, 1);
            this.setState({ ItemsList: items });
        }
    }

    ClientChanged(val) {
        if (val) {
            this.setState({ Client: val, Project: null, Projects: [] }, () => {
                $.ajax({
                    url: ApiUrl + "/api/Client/GetClientProjects?clientId=" + val.value,
                    type: "get",
                    success: (data) => {
                        this.setState({ Projects: data["clientProjects"] })
                    }
                })
            })
            showErrorsForInput(this.refs.client.wrapper, [])
        }
        else {
            this.setState({ Client: '', Project: '', Projects: [] });
            showErrorsForInput(this.refs.client.wrapper, ["Please select project"]);
        }
    }

    ProjectChanged(val) {
        if (val) {
            this.setState({ Project: val });
            showErrorsForInput(this.refs.project.wrapper, [])
        }
        else {
            this.setState({ Project: '' })
            showErrorsForInput(this.refs.project.wrapper, ["Please select project"]);
        }
    }

    ItemChanged(e, ele) {
        var items = this.state.ItemsList;
        var models= this.state.Items;
        var previouslySelected= -1;
        if (ele != null) {
            if(ele["Id"]!== '')
            {
              previouslySelected= items.findIndex((item)=>item.Item.value == ele.value);
            }
            else{
               previouslySelected= items.findIndex((item)=>item.Item == ele.value);
            }
           
            var modelIndex= models.findIndex((model)=>model.value == ele.value);
          
            if(previouslySelected == -1)
            {
             if(modelIndex!==-1)
             {
              items[e]["NoOfItemsAvailable"] = models[modelIndex]["Availability"];
             }
             items[e]["Item"] = ele.value;
             items[e]["Description"] = ele.description;
             items[e]["Id"] = "";
            }
            else{
                toast("Item already selected, please check the list", {
                  type: toast.TYPE.INFO
                });
            }
        }

        this.setState({ ItemsList: items });
    }

    QuanitityChanged(e, ele) {
        var itemsList = this.state.ItemsList;
        itemsList[e]["Quantity"] = ele.target.value;

        var isSuperAdmin = sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1;

        if (isSuperAdmin) {
            if (itemsList[e]["Quantity"] > itemsList[e]["NoOfItemsAvailable"]) {
                this.setState({ ItemsNotAvailable: true })
            }
            else {
                this.setState({ ItemsNotAvailable: false })
            }
        }

        this.setState({ ItemsList: itemsList })
    }

    addAnotherItem() {
        var items = this.state.ItemsList;
        items.push({ Item: null, Description: '', Quantity: '', Id: '',NoOfItemsAvailable:'' })
        this.setState({ ItemsList: items })
    }

    handleSubmit(e) {
        e.preventDefault();
        var items = this.state.ItemsList;
        var exists = items.findIndex((i) => i.Item == null || i.Quantity == "" || i.Quantity == 0);
        var status = "";
        //  console.log(this.state.buttonName);

        $(".loader").show();
        $("button[name='submit']").hide();

        if (this.state.buttonName == "approve" || this.state.buttonName == "reject") {
            $("button[name='approve']").hide();
            $("button[name='reject']").hide();
        }

        if (this.state.buttonName == "dispatch") {
            $("button[name='dispatch']").hide();
        }


        if (!this.validate(e)) {
            $(".loader").hide();
            $("button[name='submit']").show();

            if (this.state.buttonName == "approve" || this.state.buttonName == "reject") {
                $("button[name='approve']").show();
                $("button[name='reject']").show();
            }

            if (this.state.buttonName == "dispatch") {
                $("button[name='dispatch']").show();
            }

            return;
        }

        if (exists !== -1) {
            toast("Enter items with quantity", {
                type: toast.TYPE.INFO
            })
            $("button[name='submit']").show();

            if (this.state.buttonName == "approve" || this.state.buttonName == "reject") {
                $("button[name='approve']").show();
                $("button[name='reject']").show();
            }

            if (this.state.buttonName == "dispatch") {
                $("button[name='dispatch']").show();
            }
            $(".loader").hide();
            return;
        }

        var selectedList = [];

        items.map((ele, i) => {
            var model = "";
            if (ele["Id"] != "") {
                model = ele["Item"]["value"];
            }
            else {
                model = ele["Item"];
            }
            var item = {
                ModelId: model,
                Quantity: ele["Quantity"]
            }
            selectedList.push(item);
        })


        var data = new FormData();
        data.append("client", this.state.Client.value);
        data.append("project", this.state.Project.value);
        data.append("expectedDate", this.refs.stockDate.value);
        data.append("notes", this.refs.notes.value);
        data.append("items", JSON.stringify(selectedList));
        data.append("taskId", this.state.StockRequest["TaskId"]);


        if (this.state.buttonName == "approve") {
            data.append("status", "Approved");
            status = "approved";
        }
        else if (this.state.buttonName == "reject") {
            data.append("status", "Declined");
            status = "declined";
        }
        else if (this.state.buttonName == "dispatch") {
            data.append("status", "Dispatched");
            status = "dispatched";
        }
        else {
            data.append("status", "Under review");
            status = "updated"
        }

        var url = ApiUrl + "/api/Stock/EditStockRequest?StockId=" + this.props.match.params["id"]

        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Your have successfully " + status + " stock request", {
                        type: toast.TYPE.SUCCESS
                    })
                    $(".loader").hide();
                    $("button[name='submit']").show();
                    if (this.state.buttonName == "approve" || this.state.buttonName == "reject") {
                        $("button[name='approve']").show();
                        $("button[name='reject']").show();
                    }

                    if (this.state.buttonName == "dispatch") {
                        $("button[name='dispatch']").show();
                    }
                    this.props.history.push("/StockRequests");
                    return true;

                },
                (error) => {
                    if (error.responseJSON) {
                        toast(error.responseJSON, {
                            type: toast.TYPE.ERROR,
                            autoClose: false
                        });
                    }
                    else {
                        toast("An error occured, please try again later", {
                            type: toast.TYPE.ERROR,
                            autoClose: false
                        })
                    }

                    $(".loader").hide();
                    $("button[name='submit']").show();

                    if (this.state.buttonName == "approve" || this.state.buttonName == "reject") {
                        $("button[name='approve']").show();
                        $("button[name='reject']").show();
                    }

                    if (this.state.buttonName == "dispatch") {
                        $("button[name='dispatch']").show();
                    }

                    return false;

                },
                "POST",
                data
            );

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

        e.preventDefault();

        var isSubmit = e.type === "submit";
        var success = true;


        if (isSubmit) {
            $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
                el.classList.remove("un-touched");
            });
        }

        if (!this.state.Client || !this.state.Client.value) {
            success = false;
            if (isSubmit) {
                isSubmit = false;
                this.refs.client.focus();
            }
            showErrorsForInput(this.refs.client.wrapper, ["Plese select client"])
        }

        if (!this.state.Project || !this.state.Project.value) {
            success = false;
            if (isSubmit) {
                isSubmit = false;
                this.refs.project.focus();
            }
            showErrorsForInput(this.refs.project.wrapper, ["Please select a project"]);
        }

        if (this.refs.stockDate.value == "") {
            success = false;
            if (isSubmit) {
                isSubmit = false;
                this.refs.stockDate.focus();
            }
            showErrorsForInput(this.refs.stockDate, ["Please select expected date"])
        }
        else {
            showErrorsForInput(this.refs.stockDate, [])
        }

        if (this.refs.notes.value.trim() == "") {
            success = false;
            if (isSubmit) {
                isSubmit = false;
                this.refs.notes.focus();
            }
            showErrorsForInput(this.refs.notes, ["Please enter some information about project"])
        }
        else {
            showErrorsForInput(this.refs.notes, [])
        }

        return success;

    }
}

export default EditStockRequest;

{/* <div>

    <div className="col-xs-12">
        <div className="col-md-4">
            <label> Client </label>
            <div className="form-group">
                <span className="input-group">
                    <span className="inputgroup-addon">  </span>
                </span>
                <Select className="form-control" placeholder="Select Client" ref="client" value={this.state.Client} options={this.state.Clients} onChange={this.ClientChanged.bind(this)} />
            </div>
        </div>

        <div className="col-md-5">
            <label> Project </label>
            <div className="form-group" key={this.state.Project}>
                <span className="input-group">
                    <span className="inputgroup-addon">  </span>
                </span>
                <Select className="form-control" placeholder="Select Project" ref="project" value={this.state.Project} options={this.state.Projects} onChange={this.ProjectChanged.bind(this)} />
            </div>
        </div>

        <div className="col-md-3">
            <label> Stock Required on or before </label>
            <div className="form-group">
                <span className="input-group">
                    <span className="inputgroup-addon">  </span>
                </span>
                <input className="form-control" type="date" ref="stockDate" name="stockDate" defaultValue={moment(this.state.StockRequest["ExpectedStockDate"]).format("YYYY-MM-DD")} />
            </div>
        </div>
    </div>

    <div className="col-xs-12">
    </div>

    <div className="col-xs-12">
        <div className="col-md-6 col-md-offset-3">
            <label> Items Required </label>
        </div>
    </div>
    <div className="col-md-7 col-md-offset-3">
        <table className="table table-bordered itemTable">
            <thead className="itemsHeader">
                <tr>
                    <td> <label> Item </label> </td>
                    <td style={{ width: '16%' }}> <label> Quanitity </label> </td>
                </tr>
            </thead>

            {
                this.state.StockRequest["Status"] !== "Approved" && this.state.StockRequest["Status"] !== "Rejected" ?
                    <tbody key={this.state.ItemsList}>
                        {
                            this.state.ItemsList.map((ele, i) => {
                                return (
                                    <tr>
                                        <td>
                                            <Select className="form-control removeItemSelectBorder itemSelect" ref="item" value={ele.Item} options={this.state.Items} onChange={this.ItemChanged.bind(this, i)} />
                                            {
                                                ele["Item"] != null && ele["Item"] != '' ?
                                                    <input style={{ background: 'white' }} key={this.state.ItemSelected} type="text" className="form-control un-touched removeBorder" value={ele.Description} name="description" placeholder="Description" disabled="true" autoComplete="off" />
                                                    :
                                                    ""
                                            }
                                        </td>
                                        <td>
                                            <input className="form-control removeBorder txtRight" type="number" name="quantity" min="0" ref="quantity" value={ele.Quantity} onChange={this.QuanitityChanged.bind(this, i)} />
                                        </td>

                                        <td className="itemoptions" style={{ width: '1%' }} >
                                            <span style={{ width: '0.5%' }} title="Remove" className={"buttonStyle closebtnStyle fa fa-times  btn-danger "} value="close" onClick={this.removeItem.bind(this, i)}></span>
                                        </td>
                                    </tr>
                                )
                            })
                        }

                    </tbody>
                    :
                    <tbody key={this.state.ItemsList}>
                        {
                            this.state.ItemsList.map((ele, i) => {
                                return (
                                    <tr>
                                        <td>
                                            <label>{ele["Item"] != null ? ele["Item"]["label"] : ""} </label>
                                            <input style={{ background: 'white' }} key={this.state.ItemSelected} type="text" className="form-control un-touched removeBorder" value={ele.Description} name="description" placeholder="Description" disabled="true" autoComplete="off" />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <label >{ele.Quantity}</label>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
            }


        </table>
    </div>
    {
        this.state.StockRequest["Status"] !== "Approved" && this.state.StockRequest["Status"] !== "Rejected" ?
            <div className="col-xs-12">
                <div className="col-md-3" style={{ paddingLeft: '26%' }}>
                    <button className="btn btn-outline-secondary btnAddItem" style={{ textAlign: 'left' }} type="button" onClick={this.addAnotherItem.bind(this)} > + Add Another line</button>
                </div>
            </div>
            :
            ""
    }

    <div className="col-xs-12">
        <div className="col-md-12">
            <label> Notes </label>
            <div className="form-group">
                <span className="input-group">
                    <span className="inputgroup-addon"></span>
                </span>
                <textarea className="form-control notes" ref="notes" defaultValue={this.state.StockRequest["Notes"]} />
            </div>
        </div>
    </div>

    {
        this.state.StockRequest["Status"] !== "Approved" && this.state.StockRequest["Status"] !== "Rejected"
            ?
            < div className="col-xs-12 text-center form-group" style={{ marginTop: '1%' }}>
                {
                    sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1 ?
                        <div>
                            <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                            <button type="submit" name="approve" id="approve" className="btn btn-success" onClick={() => this.setState({ buttonName: "approve" })}>Approve</button>
                            <button type="submit" style={{ marginLeft: '1%' }} id="reject" name="reject" className="btn btn-danger" onClick={() => this.setState({ buttonName: "reject" })}>Reject</button>
                        </div>
                        :
                        <div>
                            <div className="loader" style={{ marginLeft: '50%', marginBottom: '2%' }}></div>
                            <button type="submit" name="submit" className="btn btn-primary">Submit</button>
                        </div>
                }

            </div>
            :
            ""
    }


</div> */}