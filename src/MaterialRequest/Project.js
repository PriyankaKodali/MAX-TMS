import React, { Component } from "react";
import $ from "jquery";
import Select from "react-select";
import { Ajax, MyAjaxForAttachments } from "../MyAjax";
import { ApiUrl } from "../Config";
import "./MaterialRequest.css";
import { showErrorsForInput, setUnTouched } from "../Validation";
import { toast } from "react-toastify";

var moment = require("moment");

class Project extends Component {
  constructor(props) {
    super(props);
    var itemsList = [{ Item: null, ItemDescription: "", Quantity: ""}];
    this.state = {
      Clients: [],
      Client: null,
      Project: null,
      Projects: [],
      Items: [],
      ItemsList: itemsList,
      RequestedItems: [],
      StockRequest: [],
      Category: null,
      Categories: [],
      SubCategories: [],
      SubCategory: ""
    };
  }

  componentWillMount() {
    var orgId =
      sessionStorage.getItem("roles").indexOf("SuperAdmin") != -1
        ? null
        : sessionStorage.getItem("OrgId");

    
    $.ajax({
      url: ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + orgId,
      type: "get",
      success: data => {
        this.setState({ Clients: data["clients"] });
      }
    });

    $.ajax({
      url: ApiUrl + "/api/MasterData/GetItems",
      type: "get",
      success: data => {
        this.setState({ Items: data["items"] });
      }
    });

    $.ajax({
      url: ApiUrl + "/api/MasterData/GetCategories?deptId=" + "",
      type: "get",
      success: data => {
        this.setState({ Categories: data["categories"] });
      }
    });
  }

  componentDidMount() {
    setUnTouched(document);
  }

  render() {
    return (
      <div className="container">
        <div className="col-xs-12" style={{ marginTop: "1%" }}>
          <h4 className="col-md-11"> </h4>
          <button
            className="col-md-1 btn btn-primary backBtn"
            onClick={() => {
              this.props.history.push("/StockRequests");
            }}
          >
            {" "}
            Back{" "}
          </button>
        </div>

        <form
          onSubmit={this.handleSubmit.bind(this)}
          onChange={this.validate.bind(this)}
        >
          <div
            className="itemRequestContainer"
            key={this.state.StockRequest}
            style={{ marginTop: "4%" }}
          >
            <div className="mleft10">
              <div className="col-xs-12">
                <div className="row">
                  <div className="col-md-3 mTop10">
                    <label> Client </label>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <div className="input-group">
                        <span className="input-group-addon" />
                        <Select
                          className="form-control"
                          placeholder="Select Client"
                          ref="client"
                          value={this.state.Client}
                          options={this.state.Clients}
                          onChange={this.ClientChanged.bind(this)}
                        />
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
                        <span className="input-group-addon" />
                        <Select
                          className="form-control"
                          placeholder="Select Project"
                          ref="project"
                          value={this.state.Project}
                          options={this.state.Projects}
                          onChange={this.ProjectChanged.bind(this)}
                        />
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
                        <input
                          className="form-control"
                          type="date"
                          style={{ lineHeight: "19px" }}
                          ref="stockDate"
                          name="stockDate"
                          defaultValue={
                            this.state.StockRequest["ExpectedStockDate"]
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xs-12">
                <div className="row">
                  <div className="col-md-10">
                    {" "}
                    <hr />{" "}
                  </div>
                </div>
              </div>

              <div className="col-xs-12">
                <div className="row">
                  <div className="col-md-2 mTop12">
                    <label> Items Required :</label>
                  </div>
                </div>
              </div>

              <div className="col-xs-12">
                <div className="row">
                  <div className="col-md-9">
                    <table className="table table-bordered itemTable">
                      <thead className="itemsHeader">
                        <tr>
                          <td>
                            {" "}
                            <label> Item </label>{" "}
                          </td>
                          <td style={{ width: "16%" }}>
                            {" "}
                            <label> Quanitity </label>{" "}
                          </td>
                        </tr>
                      </thead>
                      <tbody >
                        {this.state.ItemsList.map((ele, i) => {
                          return (
                            <tr>
                              <td>
                                <Select 
                                  className="form-control removeItemSelectBorder itemSelect"
                                  ref="item"
                                  value={ele.Item}
                                  options={this.state.Items}
                                  onChange={this.ItemChanged.bind(this, i)}
                                />
                                {ele["Item"] != null && ele["Item"] != "" ? (
                                  <input
                                    style={{ background: "white" }}
                                    key={this.state.ItemSelected}
                                    type="text"
                                    className="form-control un-touched removeBorder"
                                    value={ele.Description}
                                    name="description"
                                    placeholder="Description"
                                    disabled="true"
                                    autoComplete="off"
                                  />
                                ) : (
                                  ""
                                )}
                              </td>
                              <td>
                                <input
                                  className="form-control removeBorder txtRight"
                                  type="number"
                                  name="quantity"
                                  min="0"
                                  ref="quantity"
                                  value={ele.Quantity}
                                  onChange={this.QuanitityChanged.bind(this, i)}
                                />
                              </td>

                              <td
                                className="itemoptions"
                                style={{ width: "1%" }}
                              >
                                <span
                                  style={{ width: "0.5%" }}
                                  title="Remove"
                                  className={
                                    "buttonStyle closebtnStyle fa fa-times  btn-danger "
                                  }
                                  value="close"
                                  onClick={this.removeItem.bind(this, i)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-xs-12">
                <div className="row">
                  <div className="col-md-3">
                    <button
                      className="btn btn-outline-secondary btnAddItem"
                      style={{ textAlign: "left" }}
                      type="button"
                      onClick={this.addAnotherItem.bind(this)}
                    >
                      {" "}
                      + Add Another line
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-xs-12">
                <div className="row">
                  <div className="col-md-10">
                    {" "}
                    <hr />{" "}
                  </div>
                </div>
              </div>

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
                        <span className="inputgroup-addon" />
                      </span>
                      <textarea
                        className="form-control notes"
                        ref="notes"
                        defaultValue={this.state.StockRequest["Notes"]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xs-12 text-center form-group">
              <div
                className="loader"
                style={{ marginLeft: "50%", marginBottom: "2%" }}
              />
              <button type="submit" name="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  removeItem(e, ele) {
    if (this.state.ItemsList.length > 1) {
      if (!window.confirm("Do you wish to remove item from the list?")) {
        return;
      }
      var items = this.state.ItemsList;
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
          success: data => {
            this.setState({ Projects: data["clientProjects"] });
          }
        });
      });
      showErrorsForInput(this.refs.client.wrapper, []);
    } else {
      this.setState({ Client: "", Project: "", Projects: [] });
      showErrorsForInput(this.refs.client.wrapper, ["Please select client"]);
    }
  }

  ProjectChanged(val) {
    if (val) {
      this.setState({ Project: val });
      showErrorsForInput(this.refs.project.wrapper, []);
    } else {
      this.setState({ Project: "" });
      showErrorsForInput(this.refs.project.wrapper, ["Please select project"]);
    }
  }

  ItemChanged(e, ele) {
    var items = this.state.ItemsList;
    var models=this.state.Items;
   
      if (ele != null) {

        var previouslySelected= items.findIndex((item)=>item.Item == ele.value);
        
        if(previouslySelected == -1)
        {
        items[e]["Item"] = ele.value;
        items[e]["Description"] = ele.description;
        }

        else{
          if(previouslySelected !== e)
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

    this.setState({ ItemsList: itemsList });
  }

  addAnotherItem() {
    var items = this.state.ItemsList;
    items.push({ Item: null, Description: "", Quantity: "" });
    this.setState({ ItemsList: items });
  }

  handleSubmit(e) {
    e.preventDefault();
    var items = this.state.ItemsList;
    var exists = items.findIndex(
      i => i.Item == null || i.Quantity == "" || i.Quantity == 0
    );

    //  console.log(exists);

    $(".loader").show();
    $("button[name='submit']").hide();

    if ($("button[name='approve']") == true) {
      $("button[name='approve']").hide();
      $("button[name='reject']").hide();
    }

    if (!this.validate(e)) {
      $(".loader").hide();
      $("button[name='submit']").show();
      if ($("button[name='approve']") == true) {
        $("button[name='approve']").show();
        $("button[name='reject']").show();
      }
      return;
    }

    if (exists !== -1) {
      toast("Enter items with quantity", {
        type: toast.TYPE.INFO
      });
      $("button[name='submit']").show();
      $(".loader").hide();
      return;
    }

    var selectedList = [];

    items.map((ele, i) => {
      var item = {
        ModelId: ele["Item"],
        Quantity: ele["Quantity"]
      };
      selectedList.push(item);
    });

    var data = new FormData();
    data.append("client", this.state.Client.value);
    data.append("project", this.state.Project.value);
    data.append("expectedDate", this.refs.stockDate.value);
    data.append("notes", this.refs.notes.value);
    data.append("items", JSON.stringify(selectedList));

    // if($("button[name='submit']"))
    // {
    //     data.append("status","Under review");
    // }

    if ($("button[name='approve']") == true) {
      data.append("status", "Approved");
    } else if ($("button[name='reject']") == "reject") {
      data.append("status", "Rejected");
    } else {
      data.append("status", "Under review");
    }

    var url = ApiUrl + "/api/Stock/AddMaterialRequest";

    try {
      MyAjaxForAttachments(
        url,
        data => {
          toast("Your request for material is submitted", {
            type: toast.TYPE.SUCCESS
          });
          $(".loader").hide();
          $("button[name='submit']").show();
          this.props.history.push("/StockRequests");

          return true;
        },
        error => {
          toast("An error occured, please try again later", {
            type: toast.TYPE.ERROR
          });
          $(".loader").hide();
          $("button[name='submit']").show();

          return false;
        },
        "POST",
        data
      );
    } catch (e) {
      toast("An error occured, please try again later", {
        type: toast.TYPE.ERROR
      });
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
      $(e.currentTarget.getElementsByClassName("form-control")).map((i, el) => {
        el.classList.remove("un-touched");
      });
    }

    if (!this.state.Client || !this.state.Client.value) {
      success = false;
      if (isSubmit) {
        isSubmit = false;
        this.refs.client.focus();
      }
      showErrorsForInput(this.refs.client.wrapper, ["Plese select client"]);
    }

    if (!this.state.Project || !this.state.Project.value) {
      success = false;
      if (isSubmit) {
        isSubmit = false;
        this.refs.project.focus();
      }
      showErrorsForInput(this.refs.project.wrapper, [
        "Please select a project"
      ]);
    }

    if (this.refs.stockDate.value == "") {
      success = false;
      if (isSubmit) {
        isSubmit = false;
        this.refs.stockDate.focus();
      }
      showErrorsForInput(this.refs.stockDate, ["Please select expected date"]);
    } else {
      showErrorsForInput(this.refs.stockDate, []);
    }

    if (this.refs.notes.value.trim() == "") {
      success = false;
      if (isSubmit) {
        isSubmit = false;
        this.refs.notes.focus();
      }
      showErrorsForInput(this.refs.notes, [
        "Please enter some information about project"
      ]);
    } else {
      showErrorsForInput(this.refs.notes, []);
    }

    return success;
  }
}

export default Project;

{
  /* <div>
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
            <div className="form-group">
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
                <input className="form-control" type="date" ref="stockDate" name="stockDate" defaultValue={this.state.StockRequest["ExpectedStockDate"]} />
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
        </table>
    </div>

    <div className="col-xs-12">
        <div className="col-md-3" style={{ paddingLeft: '26%' }}>
            <button className="btn btn-outline-secondary btnAddItem" style={{ textAlign: 'left' }} type="button" onClick={this.addAnotherItem.bind(this)} > + Add Another line</button>
        </div>
    </div>

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
</div> */
}
