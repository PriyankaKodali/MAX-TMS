import React, {Component} from 'react';
import $ from 'jquery';
import {ApiUrl} from '../Config.js';
import {MyAjax} from '../MyAjax.js';
import Select from 'react-select';
import { toast } from 'react-toastify';

class AssigneesList extends Component{
    constructor(props){
        super(props);
         var newAssignee=[{AssineeId: '', AssigneeName:'', Quantity:null}]
        this.state={
            AssigneesList:this.props.SelectedAssigneesList, Assignees:[], Assignee:null,
            OrgId:this.props.OrgId, TaskId:this.props.TaskId, 
            BudgetedQuantity: this.props.BudgetedQuantity,
            CreatorId:this.props.CreatorId, PreviouslyWorked:this.props.QuantityWorked
        }
    }

    componentWillMount(){
        var AssignedBy= null;
        if(this.props.AssignedBy !=""){
            AssignedBy= this.props.AssignedBy;
        }
        else{
            AssignedBy= null;
        }
        MyAjax(
            ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + AssignedBy + "&orgId=" + this.state.OrgId,
            (data) => { this.setState({ Assignees: data["employees"] }) },
            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            })
        )
    }

    componentWillReceiveProps(nextProps){
        this.setState({AssignessList: nextProps.SelectedAssigneesList, OrgId: nextProps.OrgId, TaskId:nextProps.TaskId,
             BudgetedQuantity: this.props.BudgetedQuantity, CreatorId:nextProps.AssignedBy,PreviouslyWorked:nextProps.QuantityWorked  })
    }

    render(){
        return(
            <div className="col-xs-12 AssigneesList">
                <div style={{marginTop: '1%'}}>
                     {/* <div className="col-xs-12">
                        <div className="col-md-3">
                          <button className="btn btn-primary" name="" onClick={this.AddAssignee.bind(this)} >Add Another Assignee</button>
                        </div>
                     </div> */}
                <div className="col-xs-12" key={this.state.AssigneesList}>
                <div className="col-xs-11">
                {
                  this.state.AssigneesList.map((ele,i)=>{
                    return(
                        <div className="col-xs-12" key={i}>
                         <div className="col-md-6"> 
                         <label >Assign To </label>
                          <div className="form-group">
                              <div className="input-group">
                                 <span className="input-group-addon" >
                                    <span className="glyphicon glyphicon-user"></span>
                                 </span>
                                <Select  className="form-control" placeholder="Select Assignee" options={this.state.Assignees} value={ele["AssigneeId"]} onChange={this.AssigneeChanged.bind(this,i)}  />
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4">
                           <label >Quantity </label>
                            <div className="form-group">
                              <div className="input-group">
                              <span className="input-group-addon"> </span>
                               <input type="number" className="form-control" ref="quantity" placeholder="Quantity" value={ele["Quantity"]} onChange={this.QuantityChanged.bind(this,i)} />
                              </div>
                           </div>
                          </div>
                          <div className="col-md-1" style={{marginTop: '6%'}}>
                            <span style={{ width: '0.5%', color:'red'}} title="Remove" className="glyphicon glyphicon-trash" value="close" onClick={this.RemoveAssignee.bind(this,i)} ></span>
                        </div>

                        </div>
                    )
                 })
               } 
                </div>
                
                 <div className="col-xs-1">
                  <button className="btn btn-primary glyphicon glyphicon-plus addBtn"  onClick={this.AddAssignee.bind(this)} ></button>
                </div>
               </div>
               </div>

               <div className="col-xs-12" style={{marginBottom: '1%'}}>
                  <div style={{textAlign:'center', marginLeft:'40%'}}>
                    <button className="col-xs-2 btn btn-success" name="submit" onClick={this.handleAssigneesSubmit.bind(this)} > OK </button>
                  </div>
               </div> 
            </div>
           
        )
    }

    AssigneeChanged(e,ele){
        var selectedAssignees= this.state.AssigneesList;

        if(ele !=null)
        {
            var previouslySelected= selectedAssignees.findIndex((i)=>i.AssigneeId== ele.value);
            if(previouslySelected==-1)
            {
                selectedAssignees[e]["AssigneeId"] = ele.value;
                selectedAssignees[e]["AssigneeName"]= ele.label;
            }
            else{
                selectedAssignees[e]["AssigneeId"] = '';
                selectedAssignees[e]["AssigneeName"]= '';
            }
        }
        else{
            selectedAssignees[e]["AssigneeId"] = '';
            selectedAssignees[e]["AssigneeName"]= '';
        }
        this.setState({AssigneesList: selectedAssignees})
    }

    QuantityChanged(e,ele){
        var selectedAssignees= this.state.AssigneesList;
        selectedAssignees[e]["Quantity"]= ele.target.value;    
        this.setState({AssigneesList: selectedAssignees})   
    }

    AddAssignee(){
        var selectedAssignees= this.state.AssigneesList;
        var newAssignee={AssigneeId: null,AssigneeName:"", Quantity: null}
        selectedAssignees.push(newAssignee);
        this.setState({AssigneesList: selectedAssignees})
    }

    RemoveAssignee(e,ele){
        var selectedAssignees= this.state.AssigneesList;
        selectedAssignees.splice(e,1);

        this.setState({AssigneesList:selectedAssignees })
    }

    handleAssigneesSubmit(e){
        e.preventDefault();
        var assignees= this.state.AssigneesList;
        var quantityAssigned =0;
        var isNullexists= assignees.findIndex((i)=>i.AssigneeId == null );
        var budgetedQuantity= this.state.BudgetedQuantity;
        var invalidQuantity= assignees.findIndex((i)=> i.Quantity <=0 && i.Quantity!==null && i.Quantity!="");
        var previoslyWorked=this.state.PreviouslyWorked;

        if(budgetedQuantity!=""&& budgetedQuantity!=null)
        {
            if(previoslyWorked!=="")
            {
              budgetedQuantity = parseFloat(budgetedQuantity) - parseFloat(previoslyWorked)
            }

             assignees.map((ele,i)=>{
                quantityAssigned += parseFloat(ele["Quantity"]);
              })

              if(quantityAssigned>budgetedQuantity  || quantityAssigned<budgetedQuantity){
                  toast("Budgeted is " + budgetedQuantity,{
                      type: toast.TYPE.INFO
                  })
                  return;
              }
        }

        if(isNullexists!==-1){
            toast(" Assignees list is incomplete!", {
                type: toast.TYPE.INFO
            });
            return;
        }
  
        if(invalidQuantity!==-1){
            toast("Enter valid quantity!", {
                type: toast.TYPE.INFO
            });
            return;
        }

        if(budgetedQuantity!=""){
            var isNullexists= assignees.findIndex((i)=>i.AssigneeId == null || i.Quantity=="" || i.Quantity<=0);
            if(isNullexists!==-1)
            {
                toast("List is Incomplete!", {
                    type: toast.TYPE.INFO
                });
                return;
            }
        }
       
        if(this.props.TaskId!="")
        {
            this.props.UpdatedTaskAssigneesList(assignees);
        }
        else{
            this.props.TaskAssigneesList(assignees); 
        }
    }

}

export {AssigneesList};