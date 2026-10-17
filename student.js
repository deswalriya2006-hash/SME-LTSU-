
const departments = {
    CSE: "Computer Science",
    IT: "Information Technology",
    ECE: "Electronics",
    ME: "Mechanical"
};

// Sample student records
const sampleStudents = [
    {
        id: 1,
        roll: "CSE001",
        name: "Aman Sharma",
        course: "B.Tech CSE",
        semester: "3",
        department: "CSE",
        email: "aman@example.com"
    },
    {
        id: 2,
        roll: "CSE002",
        name: "Priya Verma",
        course: "B.Tech CSE",
        semester: "3",
        department: "CSE",
        email: "priya@example.com"
    },
    {
        id: 3,
        roll: "IT001",
        name: "Rahul Singh",
        course: "B.Tech IT",
        semester: "2",
        department: "IT",
        email: "rahul@example.com"
    },
    {
        id: 4,
        roll: "ECE001",
        name: "Neha Gupta",
        course: "B.Tech ECE",
        semester: "4",
        department: "ECE",
        email: "neha@example.com"
    },
    {
        id: 5,
        roll: "ME001",
        name: "Karan Kumar",
        course: "B.Tech ME",
        semester: "1",
        department: "ME",
        email: "karan@example.com"
    }
];

// Load saved records or use sample records
let students;

try {
    const savedStudents = localStorage.getItem("studentPortalRecords");

    students = savedStudents === null
        ? sampleStudents
        : JSON.parse(savedStudents);

    if (!Array.isArray(students)) {
        students = sampleStudents;
    }
} catch (error) {
    students = sampleStudents;
}

// Save student records
function saveStudents() {
    localStorage.setItem(
        "studentPortalRecords",
        JSON.stringify(students)
    );
}

// Protect text displayed in HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}

// Switch between dashboard, students and departments
function showSection(sectionId, clickedMenu) {
    document.querySelectorAll(".page-section").forEach(function(section) {
        section.hidden = true;
    });

    document.getElementById(sectionId).hidden = false;

    document.querySelectorAll(".menu").forEach(function(menu) {
        menu.classList.remove("active");
    });

    if (clickedMenu) {
        clickedMenu.classList.add("active");
    }

    if (sectionId !== "departments") {
        closeDepartment();
    }

    if (sectionId === "students") {
        renderStudents();
    }

    updateDashboard();
}

// Update dashboard numbers and department counts
function updateDashboard() {
    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("totalDepartments").textContent =
        Object.keys(departments).length;

    Object.keys(departments).forEach(function(code) {
        const count = students.filter(function(student) {
            return student.department === code;
        }).length;

        document.getElementById("count-" + code).textContent =
            count + (count === 1 ? " student" : " students");
    });
}

// Display students in the main directory
function renderStudents() {
    const tableBody = document.getElementById("studentTableBody");

    const searchValue = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const selectedDepartment =
        document.getElementById("departmentFilter").value;

    const filteredStudents = students.filter(function(student) {
        const matchesSearch =
            student.name.toLowerCase().includes(searchValue) ||
            student.roll.toLowerCase().includes(searchValue) ||
            student.course.toLowerCase().includes(searchValue);

        const matchesDepartment =
            selectedDepartment === "All" ||
            student.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    if (filteredStudents.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="7">No students found.</td></tr>';
        return;
    }

    tableBody.innerHTML = filteredStudents.map(function(student) {
        return `
            <tr>
                <td>${escapeHTML(student.roll)}</td>
                <td>
    <span class="student-name-link"
        onclick="viewStudentProfile(${student.id})">
        ${escapeHTML(student.name)}
    </span>
</td>
                <td>${escapeHTML(student.course)}</td>
                <td>${escapeHTML(student.semester)}</td>
                <td>${escapeHTML(student.department)}</td>
                <td>${escapeHTML(student.email)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn"
                            onclick="editStudent(${student.id})">
                            Edit
                        </button>
                        <button class="delete-btn"
                            onclick="deleteStudent(${student.id})">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Open a blank form to add a student
function openStudentForm() {
    document.getElementById("studentForm").reset();
    document.getElementById("studentId").value = "";
    document.getElementById("formTitle").textContent = "Add Student";

    document.getElementById("studentFormBox").hidden = false;
    document.getElementById("studentFormBox").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Close the form
function closeStudentForm() {
    document.getElementById("studentFormBox").hidden = true;
}

// Add or update a student when the form is submitted
document.getElementById("studentForm").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();

        const idValue = document.getElementById("studentId").value;
        const roll = document.getElementById("rollNumber")
            .value.trim();
        const name = document.getElementById("studentName")
            .value.trim();
        const course = document.getElementById("studentCourse")
            .value.trim();
        const semester = document.getElementById("studentSemester")
            .value;
        const department = document.getElementById("studentDepartment")
            .value;
        const email = document.getElementById("studentEmail")
            .value.trim();

        // Check for duplicate roll numbers
        const duplicateRoll = students.some(function(student) {
            return student.roll.toLowerCase() === roll.toLowerCase() &&
                String(student.id) !== idValue;
        });

        if (duplicateRoll) {
            alert("This roll number already exists.");
            return;
        }

        const studentData = {
            roll: roll,
            name: name,
            course: course,
            semester: semester,
            department: department,
            email: email
        };

        if (idValue !== "") {
            // Update existing student
            const student = students.find(function(item) {
                return item.id === Number(idValue);
            });

            if (student) {
                Object.assign(student, studentData);
            }
        } else {
            // Add new student
            const newId = students.length === 0
                ? 1
                : Math.max(...students.map(function(student) {
                    return student.id;
                })) + 1;

            students.push({
                id: newId,
                ...studentData
            });
        }

        saveStudents();
        renderStudents();
        updateDashboard();
        renderDepartmentStudents();

        closeStudentForm();
        alert("Student record saved successfully!");
    }
);

// Find a student and open the form for editing
function editStudent(id) {
    const student = students.find(function(item) {
        return item.id === id;
    });

    if (!student) {
        return;
    }

    document.getElementById("studentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("rollNumber").value = student.roll;
    document.getElementById("studentCourse").value = student.course;
    document.getElementById("studentSemester").value = student.semester;
    document.getElementById("studentDepartment").value =
        student.department;
    document.getElementById("studentEmail").value = student.email;

    document.getElementById("formTitle").textContent = "Edit Student";
    document.getElementById("studentFormBox").hidden = false;

    document.getElementById("studentFormBox").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Delete a student
function deleteStudent(id) {
    const student = students.find(function(item) {
        return item.id === id;
    });

    if (!student) {
        return;
    }

    const confirmed = confirm(
        "Do you want to delete " + student.name + "?"
    );

    if (confirmed) {
        students = students.filter(function(item) {
            return item.id !== id;
        });

        saveStudents();
        renderStudents();
        updateDashboard();
        renderDepartmentStudents();

        alert("Student deleted successfully.");
    }
}

// Open a particular department
let currentDepartment = "";

function showDepartment(departmentCode) {
    currentDepartment = departmentCode;

    document.getElementById("departmentStudentBox").hidden = false;

    document.getElementById("departmentTitle").textContent =
        departments[departmentCode] + " Students";

    renderDepartmentStudents();

    document.getElementById("departmentStudentBox").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Display students belonging to the selected department
function renderDepartmentStudents() {
    if (!currentDepartment) {
        return;
    }

    const departmentStudents = students.filter(function(student) {
        return student.department === currentDepartment;
    });

    const tableBody =
        document.getElementById("departmentTableBody");

    if (departmentStudents.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="5">No students in this department.</td></tr>';
        return;
    }

    tableBody.innerHTML = departmentStudents.map(function(student) {
        return `
            <tr>
                <td>${escapeHTML(student.roll)}</td>
                <td>${escapeHTML(student.name)}</td>
                <td>${escapeHTML(student.course)}</td>
                <td>${escapeHTML(student.semester)}</td>
                <td>${escapeHTML(student.email)}</td>
            </tr>
        `;
    }).join("");
}

// Close the department student list
function closeDepartment() {
    const box = document.getElementById("departmentStudentBox");

    if (box) {
        box.hidden = true;
    }

    currentDepartment = "";
}

// Initialize the portal
saveStudents();
renderStudents();
updateDashboard();

/* Student Profile Feature */
function viewStudentProfile(id) {
    const student = students.find(function(item) {
        return item.id === id;
    });

    if (!student) return;

    document.getElementById("profileDetails").innerHTML = `
        <p><strong>Name:</strong> ${escapeHTML(student.name)}</p>
        <p><strong>Roll Number:</strong> ${escapeHTML(student.roll)}</p>
        <p><strong>Course:</strong> ${escapeHTML(student.course)}</p>
        <p><strong>Semester:</strong> ${escapeHTML(student.semester)}</p>
        <p><strong>Department:</strong>
            ${escapeHTML(departments[student.department] || student.department)}
        </p>
        <p><strong>Email:</strong> ${escapeHTML(student.email)}</p>
    `;

    document.getElementById("profileModal").hidden = false;
}

function closeStudentProfile() {
    document.getElementById("profileModal").hidden = true;
}


/* Analytics Feature */
function renderAnalytics() {
    const total = students.length;

    document.getElementById("analyticsTotal").textContent = total;

    const departmentCounts = Object.keys(departments).map(function(code) {
        return {
            code: code,
            name: departments[code],
            count: students.filter(function(student) {
                return student.department === code;
            }).length
        };
    });

    const largest = departmentCounts.reduce(function(best, item) {
        return item.count > best.count ? item : best;
    }, {
        code: "-",
        name: "-",
        count: -1
    });

    document.getElementById("largestDepartment").textContent =
        total === 0 ? "-" : largest.code;

    const average = total === 0
        ? 0
        : students.reduce(function(sum, student) {
            return sum + Number(student.semester || 0);
        }, 0) / total;

    document.getElementById("averageSemester").textContent =
        average.toFixed(1);

    // Department chart
    document.getElementById("departmentChart").innerHTML =
        departmentCounts.map(function(item) {
            const width = total === 0
                ? 0
                : (item.count / total) * 100;

            return `
                <div class="chart-row">
                    <span class="chart-label">${escapeHTML(item.code)}</span>
                    <div class="chart-track">
                        <div class="chart-bar"
                            style="width:${width}%"></div>
                    </div>
                    <span class="chart-count">${item.count}</span>
                </div>
            `;
        }).join("");

    // Semester chart
    document.getElementById("semesterChart").innerHTML =
        Array.from({length: 8}, function(_, index) {
            const semester = index + 1;

            const count = students.filter(function(student) {
                return Number(student.semester) === semester;
            }).length;

            const width = total === 0
                ? 0
                : (count / total) * 100;

            return `
                <div class="chart-row">
                    <span class="chart-label">
                        Semester ${semester}
                    </span>
                    <div class="chart-track">
                        <div class="chart-bar"
                            style="width:${width}%"></div>
                    </div>
                    <span class="chart-count">${count}</span>
                </div>
            `;
        }).join("");
}


/* Export student records to CSV */
function exportStudentsCSV() {
    const headers = [
        "Roll Number",
        "Name",
        "Course",
        "Semester",
        "Department",
        "Email"
    ];

    const rows = students.map(function(student) {
        return [
            student.roll,
            student.name,
            student.course,
            student.semester,
            student.department,
            student.email
        ];
    });

    // Escape CSV values safely
    const csvValue = function(value) {
        let text = String(value ?? "");

        // Prevent spreadsheet formula execution
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    };

    const csv = [headers, ...rows]
        .map(function(row) {
            return row.map(csvValue).join(",");
        })
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "student-records.csv";
    link.click();

    URL.revokeObjectURL(url);
}


/* Connect analytics to the navigation */
const originalShowSection = showSection;

showSection = function(sectionId, clickedMenu) {
    originalShowSection(sectionId, clickedMenu);

    if (sectionId === "analytics") {
        renderAnalytics();
    }
};
