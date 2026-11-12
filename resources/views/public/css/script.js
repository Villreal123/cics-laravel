const form = document.getElementById("appointmentForm");
const appointmentList = document.getElementById("appointmentList");
const appointmentCount = document.getElementById("appointmentCount");
const emptyMessage = document.getElementById("emptyMessage");
const editIdInput = document.getElementById("editId");
const formHeading = document.getElementById("formHeading");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formAlert = document.getElementById("formAlert");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const toast = document.getElementById("toast");

const CSRF = document.querySelector('meta[name="csrf-token"]').content;
const BASE = document.querySelector('meta[name="base-url"]').content;

// database column name -> form field element
const fields = {
    student_name: document.getElementById("studentName"),
    student_id: document.getElementById("studentId"),
    course_section: document.getElementById("courseSection"),
    instructor: document.getElementById("instructor"),
    consult_date: document.getElementById("consultDate"),
    consult_time: document.getElementById("consultTime"),
    reason: document.getElementById("reason")
};

let appointments = [];

// Disallow past dates in the picker
fields.consult_date.min = new Date().toISOString().split("T")[0];

/* ---------- API helper ---------- */
async function api(url, method = "GET", body = null) {
    const response = await fetch(BASE + url, {
        method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": CSRF
        },
        body: body ? JSON.stringify(body) : null
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || "Something went wrong.");
        error.errors = data.errors || {};
        throw error;
    }
    return data;
}

/* ---------- Helpers ---------- */
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
}

function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString.slice(0, 10) + "T00:00:00").toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric"
    });
}

function formatTime(timeString) {
    if (!timeString) return "";
    const [h, m] = timeString.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function showToast(message, isError = false) {
    toast.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.remove("hidden");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

function clearErrors() {
    formAlert.classList.add("hidden");
    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
    Object.values(fields).forEach(el => el.classList.remove("invalid"));
}

function showErrors(error) {
    formAlert.textContent = error.message;
    formAlert.classList.remove("hidden");

    Object.entries(error.errors || {}).forEach(([key, messages]) => {
        const holder = document.querySelector(`.field-error[data-for="${key}"]`);
        if (holder) holder.textContent = messages[0];
        if (fields[key]) fields[key].classList.add("invalid");
    });
}

/* ---------- READ ---------- */
async function loadAppointments() {
    const params = new URLSearchParams({
        search: searchInput.value,
        status: statusFilter.value
    });

    try {
        appointments = await api(`/appointments?${params}`);
        renderAppointments();
    } catch (error) {
        showToast(error.message, true);
    }
}

function renderAppointments() {
    appointmentCount.textContent = appointments.length;
    emptyMessage.classList.toggle("hidden", appointments.length > 0);

    appointmentList.innerHTML = appointments.map(a => `
        <tr>
            <td>
                <strong>${escapeHTML(a.student_name)}</strong>
                <span class="subtext">${escapeHTML(a.student_id)}<br>${escapeHTML(a.course_section)}</span>
            </td>
            <td>${escapeHTML(a.instructor)}</td>
            <td>
                <strong>${escapeHTML(formatDate(a.consult_date))}</strong>
                <span class="subtext">${escapeHTML(formatTime(a.consult_time))}</span>
            </td>
            <td>${escapeHTML(a.reason)}</td>
            <td>
                <span class="badge badge-${escapeHTML(a.status)}">${escapeHTML(a.status)}</span>
                <select class="status-select" data-action="status" data-id="${a.id}" aria-label="Change status">
                    ${["pending", "confirmed", "completed", "cancelled"].map(s =>
                        `<option value="${s}" ${s === a.status ? "selected" : ""}>${s}</option>`).join("")}
                </select>
            </td>
            <td class="action-cell">
                <button class="action-btn edit-btn" data-action="edit" data-id="${a.id}">Edit</button>
                <button class="action-btn delete-btn" data-action="delete" data-id="${a.id}">Delete</button>
            </td>
        </tr>
    `).join("");
}

/* ---------- CREATE / UPDATE ---------- */
form.addEventListener("submit", async event => {
    event.preventDefault();
    clearErrors();

    const record = {};
    Object.entries(fields).forEach(([key, el]) => record[key] = el.value.trim());

    const editingId = editIdInput.value;
    submitBtn.disabled = true;

    try {
        if (editingId) {
            await api(`/appointments/${editingId}`, "PUT", record);
        } else {
            await api("/appointments", "POST", record);
        }
        showToast(editingId ? "Appointment updated." : "Appointment created.");
        resetForm();
        loadAppointments();
    } catch (error) {
        showErrors(error);
    } finally {
        submitBtn.disabled = false;
    }
});

function startEdit(id) {
    const a = appointments.find(item => String(item.id) === String(id));
    if (!a) return;

    clearErrors();
    Object.keys(fields).forEach(key => {
        fields[key].value = key === "consult_date"
            ? String(a[key]).slice(0, 10)
            : (a[key] || "");
    });

    editIdInput.value = a.id;
    formHeading.textContent = "Update Appointment";
    submitBtn.textContent = "Save Changes";
    cancelEditBtn.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
    form.reset();
    clearErrors();
    editIdInput.value = "";
    formHeading.textContent = "Book a Consultation";
    submitBtn.textContent = "Create Appointment";
    cancelEditBtn.classList.add("hidden");
}

cancelEditBtn.addEventListener("click", resetForm);

/* ---------- DELETE / EDIT / STATUS ---------- */
appointmentList.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        startEdit(id);
    }

    if (button.dataset.action === "delete") {
        const a = appointments.find(item => String(item.id) === String(id));
        if (a && confirm(`Delete the appointment for ${a.student_name}?`)) {
            try {
                await api(`/appointments/${id}`, "DELETE");
                if (editIdInput.value === id) resetForm();
                showToast("Appointment deleted.");
                loadAppointments();
            } catch (error) {
                showToast(error.message, true);
            }
        }
    }
});

appointmentList.addEventListener("change", async event => {
    const select = event.target.closest("select[data-action='status']");
    if (!select) return;

    try {
        await api(`/appointments/${select.dataset.id}/status`, "PATCH", { status: select.value });
        showToast("Status updated.");
        loadAppointments();
    } catch (error) {
        showToast(error.message, true);
    }
});

/* ---------- Search & filter ---------- */
let searchTimer;
searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadAppointments, 300);
});
statusFilter.addEventListener("change", loadAppointments);

loadAppointments();
