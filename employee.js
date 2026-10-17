
let departments = ["IT", "HR", "Finance", "Marketing"];

let employees = [];
let savedEmployees = localStorage.getItem("employees");
if (savedEmployees != null) {
    employees = JSON.parse(savedEmployees);
}
fetch("https://dummy.restapiexample.com/api/v1/employees")
.then(function(response) {
    return response.json();
})
.then(function(result) {
    if (localStorage.getItem("employees") == null) {
        employees = result.data;
    }

    document.getElementById("total").innerHTML = employees.length;
    displayEmployees(employees);
})
.catch(function(error) {
    document.getElementById("employee-list").innerHTML =
        "<tr><td colspan='4'>Unable to load employees. Please try again.</td></tr>";
});





function displayEmployees(data) {
    let table = "";

    data.forEach(function(emp) {
        let department = departments[emp.id % departments.length];

        table += "<tr>";
        table += "<td>" + emp.id + "</td>";
        table += "<td>" + emp.employee_name + "</td>";
        table += "<td>" + emp.employee_salary + "</td>";
        table += "<td>" + emp.employee_age + "</td>";
        table += "<td>" + department + "</td>";
        table += "<td>";
        table += "<button onclick='editEmployee(" + emp.id + ")'>Edit</button>";
        table += "<button onclick='deleteEmployee(" + emp.id + ")'>Delete</button>";
        table += "</td>";
        table += "</tr>";
    });

    document.getElementById("employee-list").innerHTML = table;
}

function showForm() {
    document.getElementById("employee-form").style.display = "block";
}

function hideForm() {
    document.getElementById("employee-form").style.display = "none";
}

function addEmployee() {
    let name = document.getElementById("emp-name").value;
    let salary = document.getElementById("emp-salary").value;
    let age = document.getElementById("emp-age").value;

    if (name == "" || salary == "" || age == "") {
        alert("Please fill all details");
    }
    else {
        let newEmployee = {
            id: employees.length + 1,
            employee_name: name,
            employee_salary: Number(salary),
            employee_age: Number(age)
        };

        employees.push(newEmployee);
saveEmployees();
        displayEmployees(employees);

        document.getElementById("total").innerHTML = employees.length;

        document.getElementById("emp-name").value = "";
        document.getElementById("emp-salary").value = "";
        document.getElementById("emp-age").value = "";

        hideForm();

        alert("Employee added successfully!");
    }
}

function deleteEmployee(id) {
    let answer = confirm("Are you sure you want to delete this employee?");

    if (answer == true) {
        employees = employees.filter(function(emp) {
            return emp.id != id;
        });
saveEmployees();
        displayEmployees(employees);

        document.getElementById("total").innerHTML = employees.length;

        alert("Employee deleted successfully!");
    }
}

function editEmployee(id) {
    let emp = employees.find(function(e) {
        return e.id == id;
    });

    if (emp) {
        let name = prompt("Enter new employee name:", emp.employee_name);

        if (name != null && name.trim() != "") {
            let salary = prompt("Enter new salary:", emp.employee_salary);

            if (salary != null && salary.trim() != "" && !isNaN(salary) && Number(salary) >= 0) {
                let age = prompt("Enter new age:", emp.employee_age);

                if (age != null && age.trim() != "" && !isNaN(age) && Number(age) >= 0) {
                    emp.employee_name = name.trim();
                    emp.employee_salary = Number(salary);
                    emp.employee_age = Number(age);
saveEmployees();
                    displayEmployees(employees);

                    alert("Employee updated successfully!");
                }
            }
        }
    }
}

function filterEmployees() {
    let searchValue = document.getElementById("search").value.toLowerCase();
    let selectedDepartment = document.getElementById("department").value;

    let filtered = employees.filter(function(emp) {
        let department = departments[emp.id % departments.length];

        let matchName = emp.employee_name.toLowerCase().includes(searchValue);
        let matchId = emp.id.toString().includes(searchValue);
        let matchDepartment = selectedDepartment == "All" ||
                              department == selectedDepartment;

        return (matchName || matchId) && matchDepartment;
    });

    displayEmployees(filtered);
}

document.getElementById("search").addEventListener("input", filterEmployees);

document.getElementById("department").addEventListener("change", filterEmployees);

function saveEmployees() {
    localStorage.setItem("employees", JSON.stringify(employees));
}
function showSection(sectionId, clickedMenu) {

// Hide all sections
let sections = document.querySelectorAll(".page-section");

sections.forEach(function(section) {
    section.style.display = "none";
});

// Show the selected section
document.getElementById(sectionId).style.display = "block";

// Remove active class from all menu items
let menus = document.querySelectorAll(".menu");

menus.forEach(function(menu) {
    menu.classList.remove("active");
});

// Highlight the selected menu
clickedMenu.classList.add("active");

}
function showDepartmentEmployees(departmentName) {

let departmentList = document.getElementById("department-employees");
let resultBox = document.getElementById("department-employee-list");
let title = document.getElementById("department-title");

// Show selected department name
title.innerHTML = departmentName + " Department Employees";

// Find employees belonging to this department
let departmentEmployees = employees.filter(function(emp) {

    let department = emp.department ||
        departments[emp.id % departments.length];

    return department === departmentName;
});

// Display employee names
if (departmentEmployees.length === 0) {

    departmentList.innerHTML = "<p>No employees found in this department.</p>";

} else {

    let output = "<table><thead><tr>" +
        "<th>ID</th><th>Name</th><th>Salary</th><th>Age</th>" +
        "</tr></thead><tbody>";

    departmentEmployees.forEach(function(emp) {

        output += "<tr>" +
            "<td>" + emp.id + "</td>" +
            "<td>" + emp.employee_name + "</td>" +
            "<td>" + emp.employee_salary + "</td>" +
            "<td>" + emp.employee_age + "</td>" +
            "</tr>";

    });

    output += "</tbody></table>";

    departmentList.innerHTML = output;
}

// Display the employee list
resultBox.style.display = "block";

}

function closeDepartmentEmployees() {

document.getElementById("department-employee-list")
    .style.display = "none";

}

