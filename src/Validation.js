import { validate } from 'validate.js'
import $ from 'jquery';

var constraints = {
    Subject:{
           presence: true
    },
    Description:{
        presence: true
    },
    DOC:{
        presence: true
    },
    DOS:{
        presence: true
    },
    BudgetedHours:{
        presence: true
    },
    HoursWorked: {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          lessThanOrEqualTo: 10
        }
      }
}

validate.validators.presence.message = "is required";


//-------------validation functions------------------//

var removePreviousErrors = (formGroup) => {
    formGroup.classList.remove("has-error");
    formGroup.classList.remove("has-success");
    var k = $(formGroup.getElementsByClassName('help-block'));
    k.map((i, e) => {
        e.parentNode.removeChild(e);
        return null;
    })
    return;
}


var showErrorsForInput = (input, errors) => {
    // This is the root of the input
    if (input.classList.contains("un-touched")) {
        return;
    }
    var formGroup = input.closest(".form-group");
    removePreviousErrors(formGroup);
    // If we have errors
    if (errors) {
        // we first mark the group has having errors
        // then we append all the errors
        if (errors.length > 0) {
            formGroup.classList.add("has-error");
            var block = document.createElement("p");
            block.classList.add("help-block");
            block.classList.add("error");
            block.innerHTML = errors[0];
            formGroup.append(block);
        }
    } else {
        // otherwise we simply mark it as success
        formGroup.classList.add("has-success");
    }
    return;
}


var showErrors = (inputs, errors) => {
    //console.log(errors);
    //console.log(inputs);
    // We loop through all the inputs and show the errors for that input
    inputs.map((i, input) => {
        showErrorsForInput(input, errors && errors[input.name]);
        return null;
    });
    return;
}

var ValidateForm = (e) => {
    var inputs = $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
        if (el.closest(".form-group").classList.contains("hidden") || el.getAttribute("disabled") != null) {
            return null;
        }
        else {
            return el;
        }
    });

    //remove un-touched class for all elements when form submitted
    if (e.type === "submit") {
        inputs.map((i, e) => {
            e.classList.remove("un-touched");
            return null;
        });
    }

    let data = {};
    //create object with {inputName : input value}
    inputs.map((i, e) => {
        data[e.name] = e.value;
        return null;
    });

    //console.log(data);
    //console.log(inputs);

    var errors = validate(data, constraints);

    showErrors(inputs, errors);

    //set focus to first element with error when form submit
    var BreakException = {};

    try {
        //e.type used because focus should be set on when submit fired
        if (errors && e.type === "submit") {
            inputs.map((i, e) => {
                if (errors && errors[e.name]) {
                    e.focus();
                    throw BreakException;  //used to exit map function ref : http://stackoverflow.com/a/2641374
                }
                return null;
            })
        }
    }
    catch (e) {
        if (e !== BreakException) throw e;
    }

    try {
        if (errors) {
            Object.keys(data).forEach((ele) => {
                if (Object.keys(errors).indexOf(ele) > -1) {
                    throw BreakException;
                }
            });
        }
    }
    catch (e) {
        return false;
    }
    return true;
}


var setUnTouched = (doc) => {
    $(doc.getElementsByClassName('form-control')).map((i, e) => {
        e.classList.add("un-touched");
        e.removeEventListener('focusin', () => { });
        e.addEventListener("focusin", () => {
            e.classList.remove("un-touched");
        })

        return null;
    });

    var k = $(doc.getElementsByClassName('help-block'));
    k.map((i, e) => {
        e.parentNode.removeChild(e);
        return null;
    })

    var l = $(doc.getElementsByClassName('has-error'));
    l.map((i, e) => {
        e.classList.remove("has-error");
        return null;
    })

    var m = $(doc.getElementsByClassName('has-success'));
    m.map((i, e) => {
        e.classList.remove("has-success");
        return null;
    })
}

export { ValidateForm, showErrorsForInput, setUnTouched, showErrors };