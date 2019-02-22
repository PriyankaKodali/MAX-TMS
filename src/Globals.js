var client ="";
var department="";
var taskType="";
var priority="";
var status="";
var sortCol="";
var sortDir="";
var user = "";
var taskCategory= "";

var SearchCriteria = (criteria)=> {
    user = criteria.user;
    client = criteria.client;
    department= criteria.department;
    taskType = criteria.taskType;
    priority = criteria.priority;
    status= criteria.status;
    sortCol = criteria.sortCol;
    sortDir= criteria.sortDir;
    taskCategory= criteria.taskCategory;

    return true;
}

 export  { SearchCriteria, user, client, department, taskType, priority, status, sortCol, sortDir, taskCategory}