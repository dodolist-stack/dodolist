
/* =====================================
   DODOLIST
   Version 1.0 — Emoji-Free UI
===================================== */

const App = {
  profileName: localStorage.getItem("pla_profile_name") || "User",
profileImage: localStorage.getItem("pla_profile_image") || "",
    editorTitle: "",
  editorText: "",
  editingNoteId: null,
editingIncomeId: null,
editingExpenseId: null,
  editingPurchaseId: null,
  notes: JSON.parse(localStorage.getItem("pla_notes") || "[]"),
  tasks: JSON.parse(localStorage.getItem("pla_tasks") || "[]"),
  income: JSON.parse(localStorage.getItem("pla_income") || "[]"),
  expenses: JSON.parse(localStorage.getItem("pla_expenses") || "[]"),
  purchases: JSON.parse(localStorage.getItem("pla_purchases") || "[]"),
  monthlyBudget: Number(localStorage.getItem("pla_monthly_budget") || 0),
  currentPage: "home",
selectedDate: new Date().toISOString().slice(0, 10),
  icons: {
    home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
    notes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/></svg>`,
    more: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>`,
    microphone: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>`,
    search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>`
  },

  

save() {
    const currentData = {
        notes: this.notes,
        tasks: this.tasks,
        income: this.income,
        expenses: this.expenses,
        purchases: this.purchases,
        monthlyBudget: this.monthlyBudget
    };

    const previousData = {
        notes: JSON.parse(localStorage.getItem("pla_notes") || "[]"),
        tasks: JSON.parse(localStorage.getItem("pla_tasks") || "[]"),
        income: JSON.parse(localStorage.getItem("pla_income") || "[]"),
        expenses: JSON.parse(localStorage.getItem("pla_expenses") || "[]"),
        purchases: JSON.parse(localStorage.getItem("pla_purchases") || "[]"),
        monthlyBudget: Number(localStorage.getItem("pla_monthly_budget") || 0)
    };

    localStorage.setItem(
        "pla_auto_backup",
        JSON.stringify(previousData)
    );

    localStorage.setItem("pla_notes", JSON.stringify(currentData.notes));
    localStorage.setItem("pla_tasks", JSON.stringify(currentData.tasks));
    localStorage.setItem("pla_income", JSON.stringify(currentData.income));
    localStorage.setItem("pla_expenses", JSON.stringify(currentData.expenses));
    localStorage.setItem("pla_purchases", JSON.stringify(currentData.purchases));
    localStorage.setItem("pla_monthly_budget", currentData.monthlyBudget);
},

  

init() {
  const getToday = () => {
    const today = new Date();

    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");
  };

  this.selectedDate = getToday();

  this.tasks.forEach(task => {
    if (!task.date) {
      task.date = this.selectedDate;
    }
  });

  this.save();
  this.render();

  setInterval(() => {
    const today = getToday();

    if (this.selectedDate !== today) {
      this.selectedDate = today;
      this.render();
    }
  }, 60000);
},


render() {
  const app = document.getElementById("app");

  if (this.currentPage === "editor") {
    app.innerHTML = `
      <main class="main-content"
        style="padding:0;width:100%;max-width:none;margin:0;min-height:100dvh;">
        ${this.editorPage()}
      </main>
    `;

    window.removeEventListener(
      "resize", App.updateEditorViewport
    );

    window.addEventListener(
      "resize", App.updateEditorViewport
    );

    if (window.visualViewport) {
      window.visualViewport.removeEventListener(
        "resize", App.updateEditorViewport
      );

      window.visualViewport.addEventListener(
        "resize", App.updateEditorViewport
      );
    }

    App.updateEditorViewport();
    return;
  }

  app.innerHTML = `

<header class="app-header">
  <div class="logo">Dodolist</div>

  <div style="display:flex;align-items:center;gap:10px;">
    <span style="font-size:14px;font-weight:600;color:#17243a;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
      ${this.profileName !== "User" ? this.escape(this.profileName) : ""}
    </span>

    <button class="profile-button" aria-label="Profile" onclick="App.openProfile()">
      ${this.profileImage
        ? `<img src="${this.profileImage}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 5h-4L8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/></svg>`}
    </button>
  </div>
</header>

    <main class="main-content">
      ${this.getPage()}
    </main>

    <nav class="bottom-nav" aria-label="Main navigation">
      ${this.navButton("home", "Home")}
      ${this.navButton("calendar", "Calendar")}
      ${this.navButton("notes", "Notes")}
      ${this.navButton("more", "More")}
    </nav>
  `;
},


  navButton(page, label) {
    return `
      <button class="nav-item ${this.currentPage === page ? "active" : ""}"
        onclick="App.go('${page}')"
        aria-label="${label}">
        <span class="nav-icon">${this.icons[page]}</span>
        <span>${label}</span>
      </button>
    `;
  },

  go(page) {
    this.currentPage = page;
    this.render();
  },

  getPage() {
    switch (this.currentPage) {
      case "home": return this.homePage();
      case "calendar": return this.calendarPage();
      case "notes": return this.notesPage();
      case "more": return this.morePage();
        case "money": return this.moneyPage();
        case "income": return this.incomePage();
        case "expenses": return this.expensesPage();
        case "purchases": return this.purchasesPage();
        case "budget": return this.budgetPage();
       case "reports": return this.reportsPage();

      default: return this.homePage();
  
    }
  },

  /* Textarea sizing */
  resizeTextarea(element, maxHeight, minHeight = 0) {
    if (!element) return;

    element.style.height = "auto";

    const newHeight = Math.min(
      Math.max(element.scrollHeight, minHeight),
      maxHeight
    );

    element.style.height = newHeight + "px";
    element.style.overflowY =
      element.scrollHeight > maxHeight ? "auto" : "hidden";
  },

  /* Full-width note field styling */
  noteFieldStyle(minHeight, maxHeight) {
    return `
      display:block;
      width:calc(100% + 36px);
      max-width:none;
      margin-left:-18px;
      margin-right:-18px;
      box-sizing:border-box;
      padding:14px 18px;
      border:1px solid #e7edf5;
      border-radius:12px;
      background:white;
      color:#17243a;
      outline:none;
      font:inherit;
      line-height:1.5;
      resize:none;
      min-height:${minHeight}px;
      max-height:${maxHeight}px;
      overflow-y:auto;
      overscroll-behavior:contain;
      -webkit-overflow-scrolling:touch;
      overflow-anchor:none;
    `;
  },

  
   

homePage() {
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  const todayTasks = this.tasks.filter(
    t => t.date === today
  );

  const completed = todayTasks.filter(
    t => t.done
  ).length;

  const remaining = todayTasks.length - completed;

  const total = todayTasks.length;

  const progress = total
    ? Math.round((completed / total) * 100)
    : 0;

  return `
    <h1 class="greeting">Hello, welcome!</h1>
    <p class="subtitle">Your personal space, organized.</p>

    <div class="section-heading">
      <h2>Daily Focus</h2>
      <span style="font-size:13px;color:#8290a5">
        ${progress}% completed
      </span>
    </div>

    <div class="card">

      <div class="card-title">Today's Task Summary</div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0">

        <div style="background:#f1f5f9;padding:14px 6px;border-radius:12px;text-align:center">
          <div style="font-size:26px;font-weight:800;color:#1769e0">
            ${total}
          </div>
          <div style="font-size:12px;color:#64748b">Total</div>
        </div>

        <div style="background:#eaf8f1;padding:14px 6px;border-radius:12px;text-align:center">
          <div style="font-size:26px;font-weight:800;color:#20a675">
            ${completed}
          </div>
          <div style="font-size:12px;color:#64748b">Completed</div>
        </div>

        <div style="background:#fff7ed;padding:14px 6px;border-radius:12px;text-align:center">
          <div style="font-size:26px;font-weight:800;color:#ea8a24">
            ${remaining}
          </div>
          <div style="font-size:12px;color:#64748b">Remaining</div>
        </div>

      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px">
        <span style="font-size:14px;font-weight:700">Today's Progress</span>
        <span style="font-size:14px;font-weight:700;color:#20a675">
          ${progress}%
        </span>
      </div>

      <div style="width:100%;height:11px;background:#eaf0f6;border-radius:20px;overflow:hidden">
        <div style="width:${progress}%;height:100%;background:#20a675;border-radius:20px;transition:width 0.3s">
        </div>
      </div>

      <p style="margin-top:14px;margin-bottom:24px;font-size:13px;color:#8290a5">
        ${
          total === 0
            ? "You have no tasks planned for today."
            : remaining === 0
              ? "Excellent! You completed all today's tasks."
              : `You have ${remaining} tasks left to complete today.`
        }
      </p>

      <button class="capture-button"
        style="${this.primaryStyle()}"
        onclick="App.go('calendar')">
        View All Today's Tasks
      </button>

    </div>

    <div class="section-heading">
      <h2>What Should I Do Today?</h2>
    </div>

    ${
      total > 0
        ? todayTasks.map(t => `
          <div class="card">
            <label style="display:flex;gap:10px;align-items:center">
              <input type="checkbox"
                class="task-checkbox"
                ${t.done ? "checked" : ""}
                onchange="App.toggleTask('${t.id}')">

              <span style="font-size:22px;flex-shrink:0">
                ${this.getTaskEmoji(t.text)}
              </span>

              <span style="${t.done ? "text-decoration:line-through;color:#8290a5" : ""}">
                ${this.escape(t.text)}
              </span>
            </label>
          </div>
        `).join("")
        : `
          <div class="card">
            <p class="card-description">
              No tasks for today. Go to Calendar and add your first task.
            </p>
          </div>
        `
    }

  `;
},

        


  openEditor() {
    this.editorTitle = "";
    this.editorText = "";
    this.editingNoteId = null;
    this.currentPage = "editor";
    this.render();
  },




editorPage() {
  return `
    <div style="display:flex;align-items:center;width:100%;gap:10px;margin:0 0 15px;padding:12px 14px;box-sizing:border-box">
      
      <h1 class="greeting" style="margin:0;flex:1">
        New Note
      </h1>

      <button onclick="App.cancelEditor()"
        style="background:#edf2f8;color:#34445c;padding:12px 16px;border:none;border-radius:10px;font-weight:bold;flex-shrink:0">
        Cancel
      </button>

      <button onclick="App.saveEditor()"
        style="background:#1769e0;color:white;padding:12px 20px;border:none;border-radius:10px;font-weight:bold;flex-shrink:0">
        Save
      </button>

    </div>

<textarea id="editorTitle"
  placeholder="Title"
  rows="1"
  oninput="App.resizeTextarea(this, 180, 55)"
  style="display:block;width:100%;box-sizing:border-box;padding:14px;border:none;border-radius:0;outline:none;background:white;color:#17243a;font:inherit;font-size:20px;font-weight:600;resize:none;min-height:55px;max-height:180px;overflow-y:auto;overflow-wrap:break-word;word-break:break-word;margin:0 0 10px;">${this.escape(this.editorTitle)}</textarea>

    <textarea id="editorText"
      placeholder="Write something..."
      rows="10"
      style="display:block;width:100%;box-sizing:border-box;height:calc(100dvh - 60px);min-height:300px;padding:14px;margin:0;border:none;border-radius:0;outline:none;background:white;color:#17243a;font:inherit;font-size:17px;line-height:1.6;resize:none;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;white-space:pre-wrap;"
      oninput="App.keepCursorVisible()">${this.escape(this.editorText)}</textarea>
  `;
},



  updateEditorViewport() {
  const field = document.getElementById("editorText");
  if (!field) return;

  const viewport = window.visualViewport;
  const viewportHeight = viewport
    ? viewport.height
    : window.innerHeight;

  const top = field.getBoundingClientRect().top;
  const availableHeight = viewportHeight - top - 15;

  field.style.height = Math.max(120, availableHeight) + "px";
},


keepCursorVisible() {
  const field = document.getElementById("editorText");
  if (!field) return;

  requestAnimationFrame(() => {
    const cursor = field.selectionStart;
    const textBeforeCursor = field.value.slice(0, cursor);

    const mirror = document.createElement("div");
    const style = getComputedStyle(field);

    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.overflowWrap = "break-word";
    mirror.style.width = field.clientWidth + "px";
    mirror.style.font = style.font;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.boxSizing = style.boxSizing;

    mirror.textContent = textBeforeCursor;

    const marker = document.createElement("span");
    marker.textContent = "\u200b";
    mirror.appendChild(marker);

    document.body.appendChild(mirror);

    const cursorTop = marker.offsetTop;
    const cursorBottom = cursorTop + marker.offsetHeight;

    const fieldTop = field.scrollTop;
    const visibleBottom = fieldTop + field.clientHeight - 12;

    if (cursorBottom > visibleBottom) {
      field.scrollTop = cursorBottom - field.clientHeight + 12;
    }

    mirror.remove();
  });
},

  
  saveEditor() {
    const title = document.getElementById("editorTitle").value.trim();
    const text = document.getElementById("editorText").value.trim();

    if (!title && !text) {
      alert("Please write something first.");
      return;
    }

    if (this.editingNoteId) {
      const note = this.notes.find(n => n.id === this.editingNoteId);
      if (note) {
        note.title = title || "Untitled Note";
        note.text = text;
      }
    } else {
      this.notes.unshift({
        id: Date.now().toString(),
        title: title || "Untitled Note",
        text
      });
    }

    this.save();
    this.currentPage = "notes";
    this.render();
  },

  cancelEditor() {
    this.currentPage = "notes";
    this.render();
  },

  
  notesPage() {
    return `
      <h1 class="greeting">My Notes</h1>
      <p class="subtitle">Keep your thoughts in one place.</p>

      
      <button class="capture-button"
        style="${this.primaryStyle()}padding:18px;font-size:17px;"
        onclick="App.openEditor()">
        Write something
      </button>


     
<div class="section-heading"
  style="display:flex;align-items:center;justify-content:space-between;">

  <h2>Saved Notes</h2>

  <span style="
    background:#eaf2ff;
    color:#1769e0;
    padding:7px 12px;
    border-radius:20px;
    font-size:13px;
    font-weight:700;
  ">
    ${this.notes.length} ${this.notes.length === 1 ? "Note" : "Notes"}
  </span>

</div>
 

      <div class="search-box" style="display:flex;align-items:center;gap:10px">
        ${this.icons.search}

        <input id="noteSearch"
          placeholder="Search your notes..."
          oninput="App.searchNotes(this.value)"
          style="flex:1;min-width:0;">

        <button onclick="App.clearNoteSearch()"
          aria-label="Clear search"
          style="width:40px;height:40px;flex-shrink:0;border:none;border-radius:10px;background:#edf2f8;color:#34445c;font-size:25px;cursor:pointer">
          ×
        </button>
      </div>

      <div id="notesList">
        ${this.noteItems(this.notes)}
      </div>
    `;
  },

  noteItems(items) {
    return items.map(n => `
      <div class="card"
        style="display:flex;align-items:center;justify-content:space-between;gap:12px">

        <div onclick="App.openNote('${n.id}')"
          style="flex:1;min-width:0;cursor:pointer;padding:5px 0">

          <div class="card-title">
            ${this.escape(n.title)}
          </div>

          <p class="card-description"
            style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${this.escape(n.text || "No additional text")}
          </p>
        </div>

        <button
          onclick="event.stopPropagation();App.deleteNote('${n.id}')"
          style="background:#fff0f0;color:#dc3545;border:1px solid #ffd6d6;border-radius:10px;padding:11px 14px;font-weight:bold;flex-shrink:0">
          Delete
        </button>
      </div>
    `).join("") || `
      <div class="card">
        <p class="card-description">No notes saved yet.</p>
      </div>
    `;
  },


openNote(id) {
  const note = this.notes.find(n => n.id === id);
  if (!note) return;

  const main = document.querySelector(".main-content");

  main.innerHTML = `
    <button onclick="App.go('notes')"
      style="display:flex;align-items:center;gap:10px;background:#eaf2ff;color:#1769e0;border:none;border-radius:10px;padding:10px 15px;font-size:15px;font-weight:600;cursor:pointer">

      <svg viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5"/>
        <path d="m12 19-7-7 7-7"/>
      </svg>

      Back to Notes
    </button>

    <div style="display:flex;flex-direction:column;gap:14px;margin-top:20px;width:100%;">

      <h1 class="greeting"
        style="margin:0;width:100%;min-width:0;overflow-wrap:anywhere;word-break:break-word;white-space:normal">
        ${this.escape(note.title)}
      </h1>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;">

        <div style="display:flex;align-items:center;gap:8px;">

          <button onclick="App.editNote('${note.id}')"
            aria-label="Edit note" title="Edit"
            style="width:40px;height:40px;border:none;border-radius:10px;background:#eaf2ff;color:#1769e0;display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
            </svg>
          </button>

          <button onclick="App.copyNote('${note.id}')"
            aria-label="Copy note" title="Copy"
            style="width:40px;height:40px;border:none;border-radius:10px;background:#eaf2ff;color:#1769e0;display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="8" y="8" width="13" height="13" rx="2"/>
              <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>

          <button onclick="App.clearNoteText('${note.id}')"
            aria-label="Delete note" title="Delete"
            style="width:40px;height:40px;border:none;border-radius:10px;background:#fff0f0;color:#dc3545;display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/>
              <path d="M8 6V4h8v2"/>
              <path d="m19 6-1 14H6L5 6"/>
              <path d="M10 11v5M14 11v5"/>
            </svg>
          </button>

        </div>

        <div style="display:flex;align-items:center;gap:6px;">

          <button onclick="App.changeNoteFontSize(-2)"
            style="min-width:38px;height:36px;padding:0 9px;border:1px solid #dce5f0;border-radius:9px;background:#edf2f8;color:#34445c;font-weight:600;font-size:14px;">
            A−
          </button>

          <button onclick="App.changeNoteFontSize(2)"
            style="min-width:38px;height:36px;padding:0 9px;border:1px solid #dce5f0;border-radius:9px;background:#eaf2ff;color:#1769e0;font-weight:600;font-size:14px;">
            A+
          </button>

        </div>

      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <p id="noteDisplayText" style="font-size:17px;white-space:pre-wrap;line-height:1.7;overflow-wrap:anywhere;word-break:break-word;max-width:100%;box-sizing:border-box">${this.escape(note.text)}</p>
    </div>
  `;
},



changeNoteFontSize(amount) {
  const text = document.getElementById("noteDisplayText");
  if (!text) return;

  const currentSize = parseFloat(
    getComputedStyle(text).fontSize
  );

  const newSize = Math.min(
    32,
    Math.max(12, currentSize + amount)
  );

  text.style.fontSize = newSize + "px";
},
  
  editNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    this.editingNoteId = id;
    this.editorTitle = note.title || "";
    this.editorText = note.text || "";

    this.currentPage = "editor";
    this.render();
  },


  saveEditedNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    const title = document.getElementById("editNoteTitle").value.trim();
    const text = document.getElementById("editNoteText").value.trim();

    if (!title && !text) {
      alert("Please write something first.");
      return;
    }

    note.title = title || "Untitled Note";
    note.text = text;

    this.save();
    this.openNote(id);
  },

  async copyNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    const content = note.title + "\n\n" + note.text;

    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = content;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
  },

  addNote() {
    const title = document.getElementById("noteTitle").value.trim();
    const text = document.getElementById("noteText").value.trim();

    if (!title && !text) {
      alert("Please write something first.");
      return;
    }

    this.notes.unshift({
      id: Date.now().toString(),
      title: title || "Untitled Note",
      text
    });

    this.save();
    this.render();
  },

  clearNoteText(id) {
    this.pendingClearNoteId = id;

    const oldDialog = document.getElementById("clearNoteDialog");
    if (oldDialog) oldDialog.remove();

    document.body.insertAdjacentHTML("beforeend", `
      <div id="clearNoteDialog" class="delete-overlay">
        <div class="delete-dialog">
          <h2>Delete Note Text?</h2>
          <p>Are you sure you want to delete all text from this note?</p>

          <div class="dialog-actions">
            <button class="cancel-button" onclick="App.cancelClearNote()">
              Cancel
            </button>

            <button class="confirm-delete-button" onclick="App.confirmClearNote()">
              Delete
            </button>
          </div>
        </div>
      </div>
    `);
  },

  confirmClearNote() {
    if (!this.pendingClearNoteId) return;

    const note = this.notes.find(
      n => n.id === this.pendingClearNoteId
    );

    if (note) {
      note.text = "";
      this.save();
    }

    const id = this.pendingClearNoteId;
    this.pendingClearNoteId = null;

    const dialog = document.getElementById("clearNoteDialog");
    if (dialog) dialog.remove();

    this.openNote(id);
  },

  cancelClearNote() {
    this.pendingClearNoteId = null;

    const dialog = document.getElementById("clearNoteDialog");
    if (dialog) dialog.remove();
  },

  deleteNote(id) {
    this.pendingDeleteNoteId = id;

    const oldDialog = document.getElementById("noteDeleteDialog");
    if (oldDialog) oldDialog.remove();

    document.body.insertAdjacentHTML("beforeend", `
      <div id="noteDeleteDialog" class="delete-overlay">
        <div class="delete-dialog">
          <h2>Delete Note?</h2>
          <p>Are you sure you want to permanently delete this note?</p>

          <div class="dialog-actions">
            <button class="cancel-button" onclick="App.cancelDeleteNote()">
              Cancel
            </button>

            <button class="confirm-delete-button" onclick="App.confirmDeleteNote()">
              Delete
            </button>
          </div>
        </div>
      </div>
    `);
  },

  confirmDeleteNote() {
    if (!this.pendingDeleteNoteId) return;

    this.notes = this.notes.filter(
      n => n.id !== this.pendingDeleteNoteId
    );

    this.pendingDeleteNoteId = null;

    const dialog = document.getElementById("noteDeleteDialog");
    if (dialog) dialog.remove();

    this.save();
    this.go("notes");
  },

  cancelDeleteNote() {
    this.pendingDeleteNoteId = null;

    const dialog = document.getElementById("noteDeleteDialog");
    if (dialog) dialog.remove();
  },

  clearNoteSearch() {
    const input = document.getElementById("noteSearch");
    if (!input) return;

    input.value = "";

    document.getElementById("notesList").innerHTML =
      this.noteItems(this.notes);
  },

  searchNotes(query) {
    const filtered = this.notes.filter(n =>
      (n.title + " " + n.text).toLowerCase()
        .includes(query.toLowerCase())
    );

    document.getElementById("notesList").innerHTML =
      this.noteItems(filtered);
  },



  getTaskEmoji(taskText) {
    const text = String(taskText || "").toLowerCase();
    const words = text.match(/[a-z]+/g) || [];

    const emojiRules = [
      // Emotions
      { emoji: "😡", keywords: ["angry", "anger", "furious", "mad", "annoyed", "rage"] },
      { emoji: "🤬", keywords: ["hate", "outraged", "swearing", "revenge"] },
      { emoji: "😢", keywords: ["sad", "sadness", "unhappy", "cry", "crying", "sorrow"] },
      { emoji: "😭", keywords: ["heartbroken", "sobbing", "tears", "grief", "devastated"] },
      { emoji: "😞", keywords: ["disappointed", "upset", "failure", "hopeless"] },
      { emoji: "🥺", keywords: ["lonely", "miss you", "emotional", "homesick"] },
      { emoji: "😨", keywords: ["scared", "afraid", "fear", "nervous", "frightened"] },
      { emoji: "😱", keywords: ["terrified", "shocked", "horror", "scream"] },
      { emoji: "😰", keywords: ["stress", "stressed", "anxiety", "worried", "pressure"] },
      { emoji: "😤", keywords: ["frustrated", "irritated", "complain"] },
      { emoji: "😊", keywords: ["happy", "happiness", "smile", "smiling", "joy"] },
      { emoji: "😂", keywords: ["funny", "laugh", "laughing", "joke", "comedy"] },
      { emoji: "😍", keywords: ["love", "lovely", "romantic", "crush", "adorable"] },
      { emoji: "🥰", keywords: ["affection", "caring", "sweetheart", "cuddle"] },
      { emoji: "😎", keywords: ["cool", "confident", "style", "fashion"] },
      { emoji: "🤔", keywords: ["thinking", "wonder", "question", "decide", "decision"] },
      { emoji: "🤗", keywords: ["hug", "comfort", "support", "kindness"] },
      { emoji: "🥳", keywords: ["party", "celebrate", "celebration", "congratulations"] },
      { emoji: "😌", keywords: ["peace", "calm", "peaceful", "relaxation"] },
      { emoji: "🤩", keywords: ["excited", "amazing", "awesome", "fantastic"] },
      { emoji: "😏", keywords: ["smirk", "satisfied", "sneaky"] },
      { emoji: "🤯", keywords: ["surprised", "unexpected", "mind blown"] },
      { emoji: "😵", keywords: ["dizzy", "confused", "exhausted", "overwhelmed"] },
      { emoji: "🥱", keywords: ["yawning", "sleepy", "tired", "bored"] },
      { emoji: "😇", keywords: ["innocent", "blessed", "good deed"] },
      { emoji: "🤑", keywords: ["greedy", "rich", "profit", "earnings"] },
      { emoji: "🥹", keywords: ["grateful", "touched", "teary"] },
      { emoji: "🤝", keywords: ["agreement", "deal", "teamwork", "partnership"] },
      { emoji: "🙏", keywords: ["prayer", "pray", "worship", "thanks", "thankful", "gratitude"] },

      // Dating and relationships
      { emoji: "💑", keywords: ["dating", "date night", "romantic date", "go on a date"] },
      { emoji: "💏", keywords: ["kiss", "kissing", "make out"] },
      { emoji: "💍", keywords: ["engagement", "engaged", "proposal", "marriage proposal"] },
      { emoji: "💒", keywords: ["wedding", "marriage", "married", "bride", "groom"] },
      { emoji: "❤️", keywords: ["relationship", "boyfriend", "girlfriend", "partner", "valentine"] },
      { emoji: "💔", keywords: ["breakup", "broken heart", "heartbreak", "divorce"] },
      { emoji: "💕", keywords: ["couple", "romance", "affectionate"] },
      { emoji: "💌", keywords: ["love letter", "love message", "romantic message"] },
      { emoji: "🌹", keywords: ["roses", "rose", "romantic gift"] },
      { emoji: "🎁", keywords: ["gift", "present", "anniversary gift"] },
      { emoji: "👨‍👩‍👧", keywords: ["family", "parents", "mother", "father", "siblings"] },
      { emoji: "👶", keywords: ["baby", "newborn", "childcare", "parenting"] },
      { emoji: "🫂", keywords: ["friendship", "friend", "friends", "reunion"] },

      // Education
      { emoji: "📚", keywords: ["study", "school", "student", "lesson", "learn", "learning", "education", "homework", "class", "course", "exam", "test", "revision", "university", "college"] },
      { emoji: "🧮", keywords: ["math", "mathematics", "algebra", "calculation", "arithmetic"] },
      { emoji: "🔬", keywords: ["science", "biology", "chemistry", "physics", "experiment", "research"] },
      { emoji: "📖", keywords: ["read", "reading", "book", "novel", "story", "chapter"] },
      { emoji: "✍️", keywords: ["write", "writing", "essay", "journal", "draft"] },
      { emoji: "🌍", keywords: ["english", "language", "geography", "history", "vocabulary"] },
      { emoji: "📝", keywords: ["exam paper", "worksheet", "checklist", "assignment"] },
      { emoji: "🎓", keywords: ["graduation", "graduate", "degree", "diploma"] },
      { emoji: "🖊️", keywords: ["pen", "handwriting", "dictation"] },
      { emoji: "🧠", keywords: ["memory", "brain", "focus", "concentration", "memorize"] },

      // Health and fitness
      { emoji: "🏃", keywords: ["run", "running", "jog", "jogging", "exercise", "fitness"] },
      { emoji: "🏋️", keywords: ["workout", "gym", "weightlifting", "training", "pushup"] },
      { emoji: "🚴", keywords: ["cycling", "bicycle", "bike", "ride"] },
      { emoji: "🧘", keywords: ["yoga", "meditation", "mindfulness"] },
      { emoji: "💧", keywords: ["water", "hydration", "drink water"] },
      { emoji: "🥗", keywords: ["diet", "salad", "nutrition", "vegetable"] },
      { emoji: "😴", keywords: ["sleep", "nap", "bedtime", "rest"] },
      { emoji: "🩺", keywords: ["doctor", "hospital", "appointment", "checkup"] },
      { emoji: "💊", keywords: ["medicine", "medication", "vitamin", "tablet"] },
      { emoji: "🚶", keywords: ["walk", "walking", "stroll"] },
      { emoji: "🤒", keywords: ["sick", "illness", "fever", "disease"] },
      { emoji: "🤕", keywords: ["injury", "wound", "hurt", "accident"] },
      { emoji: "🤧", keywords: ["sneeze", "cold", "flu", "allergy"] },
      { emoji: "😷", keywords: ["mask", "infection", "hygiene"] },
      { emoji: "🦷", keywords: ["dentist", "tooth", "teeth", "dental"] },

      // Work and technology
      { emoji: "💻", keywords: ["coding", "code", "programming", "software", "developer"] },
      { emoji: "📱", keywords: ["phone", "mobile", "smartphone", "app"] },
      { emoji: "💼", keywords: ["work", "job", "business", "office", "career"] },
      { emoji: "📧", keywords: ["email", "mail", "inbox"] },
      { emoji: "📊", keywords: ["meeting", "report", "presentation", "analytics", "data"] },
      { emoji: "🎨", keywords: ["design", "drawing", "paint", "painting", "art", "illustration"] },
      { emoji: "📂", keywords: ["files", "folder", "document", "organize files"] },
      { emoji: "🌐", keywords: ["website", "web", "internet", "browser", "domain"] },
      { emoji: "🤖", keywords: ["ai", "artificial intelligence", "machine learning", "robot"] },
      { emoji: "🔧", keywords: ["repair", "fix", "maintenance", "tool"] },
      { emoji: "🚀", keywords: ["startup", "launch", "ambition", "growth", "project"] },
      { emoji: "💡", keywords: ["idea", "ideas", "invention", "innovation"] },
      { emoji: "🔒", keywords: ["security", "password", "privacy"] },
      { emoji: "🔑", keywords: ["key", "unlock", "access"] },
      { emoji: "📞", keywords: ["call", "calling", "telephone"] },
      { emoji: "💬", keywords: ["chat", "message", "conversation"] },
      { emoji: "📨", keywords: ["send", "sending", "letter"] },
      { emoji: "🖨️", keywords: ["print", "printer", "printing"] },
      { emoji: "📷", keywords: ["camera", "photograph", "photography"] },
      { emoji: "🔋", keywords: ["battery", "charging", "charge phone"] },

      // Daily life
      { emoji: "🛒", keywords: ["shopping", "shop", "buy", "purchase", "groceries"] },
      { emoji: "🍳", keywords: ["cook", "cooking", "recipe", "breakfast", "lunch", "dinner"] },
      { emoji: "🧹", keywords: ["clean", "cleaning", "sweep", "dusting"] },
      { emoji: "🧺", keywords: ["laundry", "washing clothes", "clothes", "ironing"] },
      { emoji: "🚿", keywords: ["shower", "bath", "bathing"] },
      { emoji: "🪥", keywords: ["brush teeth", "toothbrush"] },
      { emoji: "🚗", keywords: ["drive", "driving", "car", "travel", "trip"] },
      { emoji: "🏠", keywords: ["home", "house", "room", "housework"] },
      { emoji: "💰", keywords: ["money", "payment", "pay", "budget", "saving", "finance"] },
      { emoji: "📦", keywords: ["delivery", "package", "parcel", "shipping"] },
      { emoji: "🛏️", keywords: ["bed", "bedroom", "make bed"] },
      { emoji: "🧼", keywords: ["soap", "handwash", "washing hands"] },
      { emoji: "🪴", keywords: ["houseplant", "plant care", "water plants"] },
      { emoji: "🧵", keywords: ["sewing", "thread", "knitting"] },
      { emoji: "🧳", keywords: ["pack", "packing", "luggage", "suitcase"] },

      // Food and drinks
      { emoji: "🍔", keywords: ["burger", "hamburger", "fast food"] },
      { emoji: "🍕", keywords: ["pizza"] },
      { emoji: "🍎", keywords: ["apple", "fruit", "fruits"] },
      { emoji: "🍌", keywords: ["banana"] },
      { emoji: "🍰", keywords: ["cake", "dessert", "baking"] },
      { emoji: "☕", keywords: ["coffee", "tea", "cafe"] },
      { emoji: "🥛", keywords: ["milk", "dairy"] },
      { emoji: "🍚", keywords: ["rice", "lunch rice"] },
      { emoji: "🍜", keywords: ["noodles", "soup", "ramen"] },
      { emoji: "🥪", keywords: ["sandwich"] },
      { emoji: "🍦", keywords: ["ice cream", "icecream"] },
      { emoji: "🥤", keywords: ["juice", "smoothie", "soft drink"] },

      // Sports
      { emoji: "⚽", keywords: ["football", "soccer"] },
      { emoji: "🏏", keywords: ["cricket", "batting", "bowling"] },
      { emoji: "🏀", keywords: ["basketball", "basket"] },
      { emoji: "🏸", keywords: ["badminton", "shuttlecock"] },
      { emoji: "🎾", keywords: ["tennis", "racket"] },
      { emoji: "🏊", keywords: ["swimming", "swim"] },
      { emoji: "🥊", keywords: ["boxing", "martial arts"] },
      { emoji: "🏆", keywords: ["winner", "winning", "success", "victory", "champion"] },
      { emoji: "🥇", keywords: ["gold medal", "first place"] },
      { emoji: "🎯", keywords: ["goal", "target", "aim", "objective"] },
      { emoji: "♟️", keywords: ["chess", "strategy"] },
      { emoji: "🎲", keywords: ["dice", "board game"] },
      { emoji: "🧩", keywords: ["puzzle", "problem solving"] },

      // Entertainment
      { emoji: "🎵", keywords: ["music", "song", "sing", "singing", "practice singing"] },
      { emoji: "🎮", keywords: ["game", "gaming", "playstation", "xbox"] },
      { emoji: "🎬", keywords: ["movie", "film", "cinema", "video"] },
      { emoji: "📸", keywords: ["photo", "picture", "photography"] },
      { emoji: "🎤", keywords: ["microphone", "voice practice", "vocal practice"] },
      { emoji: "📺", keywords: ["television", "watch tv", "series", "show"] },
      { emoji: "🎸", keywords: ["guitar", "instrument"] },
      { emoji: "🎹", keywords: ["piano", "keyboard"] },
      { emoji: "🎧", keywords: ["headphones", "podcast", "listening"] },
      { emoji: "🎭", keywords: ["acting", "theatre", "drama"] },
      { emoji: "🎼", keywords: ["melody", "composition", "musical"] },
      { emoji: "🎻", keywords: ["violin", "orchestra"] },

      // Nature and animals
      { emoji: "🌧️", keywords: ["rain", "rainy", "weather"] },
      { emoji: "☀️", keywords: ["sun", "sunny", "sunshine"] },
      { emoji: "❄️", keywords: ["snow", "snowy", "winter"] },
      { emoji: "🌈", keywords: ["rainbow", "nature"] },
      { emoji: "🌳", keywords: ["tree", "forest", "environment"] },
      { emoji: "🌸", keywords: ["flower", "flowers", "spring"] },
      { emoji: "🐶", keywords: ["dog", "puppy", "pet"] },
      { emoji: "🐱", keywords: ["cat", "kitten"] },
      { emoji: "🐦", keywords: ["bird", "birds"] },
      { emoji: "🐟", keywords: ["fish", "fishing"] },
      { emoji: "🐴", keywords: ["horse", "riding"] },
      { emoji: "🦋", keywords: ["butterfly", "insect"] },
      { emoji: "🌱", keywords: ["plant", "garden", "gardening"] },
      { emoji: "🌙", keywords: ["moon", "night", "nighttime"] },
      { emoji: "⭐", keywords: ["star", "stars", "stargazing"] },
      { emoji: "🪐", keywords: ["planet", "universe", "solar system", "space"] },
      { emoji: "🔭", keywords: ["astronomy", "telescope"] },

      // Travel and places
      { emoji: "✈️", keywords: ["flight", "airport", "airplane", "vacation"] },
      { emoji: "🚆", keywords: ["train", "railway", "station"] },
      { emoji: "🚌", keywords: ["bus", "bus stop"] },
      { emoji: "🚢", keywords: ["ship", "boat", "cruise"] },
      { emoji: "🏖️", keywords: ["beach", "seaside", "holiday"] },
      { emoji: "🏨", keywords: ["hotel", "resort", "booking"] },
      { emoji: "🗺️", keywords: ["map", "explore", "adventure"] },
      { emoji: "📍", keywords: ["location", "place", "address"] },
      { emoji: "🧭", keywords: ["direction", "navigation", "compass"] },
      { emoji: "🏕️", keywords: ["camping", "camp", "tent"] },

      // Time and planning
      { emoji: "📅", keywords: ["schedule", "calendar", "planning", "appointment"] },
      { emoji: "⏰", keywords: ["alarm", "reminder", "deadline", "on time"] },
      { emoji: "⏳", keywords: ["waiting", "wait", "countdown"] },
      { emoji: "⏱️", keywords: ["timer", "stopwatch", "timing"] },
      { emoji: "🔔", keywords: ["notification", "notify", "alert"] },
      { emoji: "📌", keywords: ["task", "todo", "important", "remember"] },

      // Other activities
      { emoji: "🙏", keywords: ["meditation", "spiritual", "blessing"] },
      { emoji: "💪", keywords: ["strength", "strong", "motivation", "motivational"] },
      { emoji: "🧑‍🍳", keywords: ["chef", "baking bread"] },
      { emoji: "🛠️", keywords: ["building", "construction", "woodwork"] },
      { emoji: "🧑‍🎨", keywords: ["craft", "crafting", "sculpture"] },
      { emoji: "🧑‍🌾", keywords: ["farming", "farmer", "harvest"] },
      { emoji: "🧑‍🚒", keywords: ["firefighter", "fire safety"] },
      { emoji: "🧑‍⚕️", keywords: ["nurse", "nursing", "healthcare"] }
    ];

    for (const rule of emojiRules) {
      const matched = rule.keywords.some(keyword => {
        if (keyword.includes(" ")) {
          return text.includes(keyword);
        }

        return words.includes(keyword);
      });

      if (matched) return rule.emoji;
    }

    return "📌";
  },

  
  
  calendarPage() {
    const selected = new Date(this.selectedDate + "T12:00:00");
    const year = selected.getFullYear();
    const month = selected.getMonth();

    const monthName = selected.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarCells = [];

    for (let i = 0; i < firstDay; i++) {
      calendarCells.push(`<div></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = [
        year,
        String(month + 1).padStart(2, "0"),
        String(day).padStart(2, "0")
      ].join("-");

      const isSelected = dateKey === this.selectedDate;

      calendarCells.push(`
        <button onclick="App.selectDate('${dateKey}')"
          style="height:46px;border:1px solid ${isSelected ? "#1769e0" : "#e7edf5"};border-radius:10px;background:${isSelected ? "#1769e0" : "white"};color:${isSelected ? "white" : "#34445c"};font-size:15px;font-weight:${isSelected ? "bold" : "normal"}">
          ${day}
        </button>
      `);
    }

    return `
      <h1 class="greeting">My Calendar</h1>
      <p class="subtitle">Plan and organize your daily activities.</p>

      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
          <button onclick="App.changeMonth(-1)"
            style="width:40px;height:40px;border:none;border-radius:10px;background:#edf2f8;color:#34445c;font-size:22px">
            ‹
          </button>

          <h2 style="margin:0;font-size:18px">${monthName}</h2>

          <button onclick="App.changeMonth(1)"
            style="width:40px;height:40px;border:none;border-radius:10px;background:#edf2f8;color:#34445c;font-size:22px">
            ›
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-bottom:10px">
          ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => `
            <div style="text-align:center;color:#8290a5;font-size:12px;font-weight:600">
              ${day}
            </div>
          `).join("")}
        </div>

        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:7px">
          ${calendarCells.join("")}
        </div>

        <button onclick="App.goToday()"
          style="margin-top:16px;width:100%;height:42px;border:1px solid #dce5f0;border-radius:10px;background:#eaf2ff;color:#1769e0;font-weight:600">
          Today
        </button>
      </div>

      <div class="section-heading">
        <h2>Tasks for ${selected.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</h2>
      </div>

      <textarea id="taskInput"
        placeholder="What do you need to do?"
        rows="2"
        oninput="App.resizeTextarea(this,300,55)"
        style="${this.inputStyle()}resize:none;overflow-y:auto;min-height:55px;max-height:300px;"></textarea>

      <button class="capture-button"
        style="${this.primaryStyle()}"
        onclick="App.addTask()">
        Add Task
      </button>

      ${this.tasks.filter(t => t.date === this.selectedDate).map(t => `
        <div class="card task-card">
          <div class="task-row">
            <input type="checkbox"
              class="task-checkbox"
              ${t.done ? "checked" : ""}
              onchange="App.toggleTask('${t.id}')">

          <span class="task-emoji" aria-hidden="true"
  style="font-size:22px;flex-shrink:0">
  ${this.getTaskEmoji(t.text)}
</span>

<span class="task-text"
  style="${t.done ? "text-decoration:line-through;color:#8290a5" : ""}">
  ${this.escape(t.text)}
</span>
          </div>

          <div class="task-actions">
            <button class="delete-button"
              onclick="App.deleteTask('${t.id}')">
              Delete
            </button>
          </div>
        </div>
      `).join("") || `
        <div class="card">
          <p class="card-description">Your task list is empty.</p>
        </div>
      `}
    `;
  },


  selectDate(date) {
    this.selectedDate = date;
    this.render();
  },

  changeMonth(amount) {
    const date = new Date(this.selectedDate + "T12:00:00");

    date.setDate(1);
    date.setMonth(date.getMonth() + amount);

    this.selectedDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      "01"
    ].join("-");

    this.render();
  },

  goToday() {
    const today = new Date();

    this.selectedDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    this.render();
  },

  
  addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();

    if (!text) {
      alert("Please enter a task.");
      return;
    }

     this.tasks.unshift({
      id: Date.now().toString(),
      text,
      done: false,
      date: this.selectedDate
    });

    this.save();
    this.render();
  },

  toggleTask(id) {
  const task = this.tasks.find(t => t.id === id);
  if (!task) return;

  task.done = !task.done;
  this.save();
  this.render();

  if (task.done) {
    const today = new Date().toISOString().slice(0, 10);

    const todaysTasks = this.tasks.filter(
      t => t.date === today
    );

    if (
      todaysTasks.length > 0 &&
      todaysTasks.every(t => t.done)
    ) {
      this.showCelebration();
    }
  }
},

showCelebration() {
  const oldEffect = document.getElementById("celebrationEffect");
  if (oldEffect) oldEffect.remove();

  const style = document.createElement("style");

  style.textContent = `
    @keyframes confettiFall {
      0% {
        transform: translateY(-20px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }

    @keyframes celebrationPop {
      0% {
        transform: scale(0.3);
        opacity: 0;
      }
      70% {
        transform: scale(1.1);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;

  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "celebrationEffect";

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    z-index:99999;
    pointer-events:none;
    overflow:hidden;
    display:flex;
    align-items:center;
    justify-content:center;
  `;

  const message = document.createElement("div");

  message.textContent = "🎉 Task Completed! 🥳";

  message.style.cssText = `
    background:white;
    color:#1769e0;
    padding:22px 26px;
    border-radius:18px;
    font-size:22px;
    font-weight:800;
    box-shadow:0 8px 35px rgba(0,0,0,0.18);
    animation:celebrationPop 0.5s ease-out;
  `;

  overlay.appendChild(message);

  const colors = [
    "#1769e0",
    "#20a675",
    "#ffb020",
    "#ff5577",
    "#9b59b6",
    "#00bcd4"
  ];

  for (let i = 0; i < 55; i++) {
    const piece = document.createElement("span");

    piece.style.cssText = `
      position:absolute;
      top:-20px;
      left:${Math.random() * 100}%;
      width:${6 + Math.random() * 7}px;
      height:${10 + Math.random() * 10}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:3px;
      animation:confettiFall ${2 + Math.random() * 2}s linear forwards;
      animation-delay:${Math.random() * 0.8}s;
    `;

    overlay.appendChild(piece);
  }

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    style.remove();
  }, 4000);
},

  deleteTask(id) {
    this.pendingDeleteId = id;
    this.renderDeleteDialog();
  },

  confirmDeleteTask() {
    if (!this.pendingDeleteId) return;

    this.tasks = this.tasks.filter(
      t => t.id !== this.pendingDeleteId
    );

    this.pendingDeleteId = null;

    const dialog = document.getElementById("deleteDialog");
    if (dialog) dialog.remove();

    this.save();
    this.render();
  },

  cancelDeleteTask() {
    this.pendingDeleteId = null;

    const dialog = document.getElementById("deleteDialog");
    if (dialog) dialog.remove();
  },

  renderDeleteDialog() {
    const oldDialog = document.getElementById("deleteDialog");
    if (oldDialog) oldDialog.remove();

    document.body.insertAdjacentHTML("beforeend", `
      <div id="deleteDialog" class="delete-overlay">
        <div class="delete-dialog">
          <h2>Delete Task?</h2>
          <p>Are you sure you want to delete this task?</p>

          <div class="dialog-actions">
            <button class="cancel-button" onclick="App.cancelDeleteTask()">
              Cancel
            </button>

            <button class="confirm-delete-button" onclick="App.confirmDeleteTask()">
              Delete
            </button>
          </div>
        </div>
      </div>
    `);
  },


morePage() {
  return `
    <h1 class="greeting">More</h1>
    <p class="subtitle">Manage your personal workspace.</p>

    <div class="card"
      onclick="App.go('money')"
      style="cursor:pointer;display:flex;align-items:center;gap:15px;padding:20px">

      <div style="width:50px;height:50px;border-radius:14px;background:#eaf8f1;color:#20a675;display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <path d="M2 10h20M16 15h2"/>
        </svg>
      </div>

      <div style="flex:1">
        <div class="card-title">Money Manager</div>
        <p class="card-description">Track your income, expenses and purchases.</p>
      </div>

      <span style="font-size:24px;color:#8290a5">›</span>
    </div>

    <div class="card" style="padding:22px;border:1px solid #e8eef7;border-radius:18px;margin-top:18px;">

      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
        <div style="width:48px;height:48px;border-radius:15px;background:#eaf2ff;color:#3978e8;display:flex;align-items:center;justify-content:center;">
          <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 16V3m-5 5 5-5 5 5"/>
            <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>
          </svg>
        </div>

        <div>
          <div class="card-title" style="margin:0;">Data Backup</div>
          <p class="card-description" style="margin:5px 0 0;">Back up all your app data.</p>
        </div>
      </div>

      <button onclick="App.backup()"
        style="width:100%;padding:15px;background:#3978e8;color:white;border:0;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">
        Export Backup
      </button>

    </div>

    <div class="card" style="padding:22px;border:1px solid #e8eef7;border-radius:18px;margin-top:18px;">

      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
        <div style="width:48px;height:48px;border-radius:15px;background:#eaf8f1;color:#20a675;display:flex;align-items:center;justify-content:center;">
          <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8v13m-5-5 5 5 5-5"/>
            <path d="M5 11V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/>
          </svg>
        </div>

        <div>
          <div class="card-title" style="margin:0;">Restore Data</div>
          <p class="card-description" style="margin:5px 0 0;">Import a previous backup.</p>
        </div>
      </div>

      <input
        type="file"
        id="backupFileInput"
        accept=".json,application/json"
        onchange="App.restore(this)"
        style="display:none;">

      <label for="backupFileInput"
        style="display:flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;padding:15px;background:#eaf8f1;color:#15945d;border:1px solid #cceedd;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">
        Choose Backup File
      </label>

      <p style="font-size:12px;color:#929eae;text-align:center;margin:12px 0 0;">
        Select a previously exported JSON backup file.
      </p>

    </div>


<div class="card" style="padding:22px;border:1px solid #e8eef7;border-radius:18px;margin-top:18px;">

  <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
    <div style="width:48px;height:48px;border-radius:15px;background:#fff4e5;color:#e69a32;display:flex;align-items:center;justify-content:center;">
      <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M12 7v5l3 2"/>
      </svg>
    </div>

    <div>
      <div class="card-title" style="margin:0;">Automatic Backup</div>
      <p class="card-description" style="margin:5px 0 0;">Recover your previous saved data.</p>
    </div>
  </div>

  <button onclick="App.restoreAutoBackup()"
    style="width:100%;padding:15px;background:#fff4e5;color:#c27b17;border:1px solid #f5dfbd;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">
    Restore Previous Data
  </button>

</div>


    <div class="card" style="margin-top:18px;">
      <div class="card-title">About</div>
    <p class="card-description">
    Dodolist · Version 1.0
</p>
    </div>
  `;
},


  moneyPage() {
  const totalIncome = this.income.reduce(
  (sum, item) => {
    const amount = Number(item.amount);

    if (
      Number.isFinite(amount) &&
      amount > 0 &&
      amount <= 999999999.99
    ) {
      return sum + amount;
    }

    return sum;
  },
  0
);
const totalExpenses = this.expenses.reduce(
  (sum, item) => {
    const amount = Number(item.amount);

    if (
      Number.isFinite(amount) &&
      amount > 0 &&
      amount <= 999999999.99
    ) {
      return sum + amount;
    }

    return sum;
  },
  0
);

const totalPurchases = this.purchases.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
);

const totalBalance = totalIncome - totalExpenses - totalPurchases;
  return `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:22px">
      <button onclick="App.go('more')"
        style="width:40px;height:40px;border:0;border-radius:12px;background:#eaf2ff;color:#1769e0;font-size:24px">
        ‹
      </button>

      <div>
        <h1 class="greeting" style="margin:0">Money Manager</h1>
        <p class="subtitle" style="margin:4px 0 0">Manage your money.</p>
      </div>
    </div>

    <div class="card" style="background:#1769e0;color:white">
      <p style="margin:0 0 8px;opacity:.85">Total Balance</p>
      <h1 style="font-size:34px;margin:0">$${totalBalance.toFixed(2)}</h1>
      <p style="margin:8px 0 0;opacity:.8">Your available balance</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0">
      <div class="card">
  <p style="color:#20a675;margin:0 0 8px">Total Income</p>
  <h2 style="margin:0">$${totalIncome.toFixed(2)}</h2>
</div>

      <div class="card">
        <p style="color:#e05252;margin:0 0 8px">Total Expenses</p>
        <h2 style="margin:0">$${totalExpenses.toFixed(2)}</h2>
      </div>
    </div>

    <h2 style="font-size:19px;margin:25px 0 14px">Manage Money</h2>

    <div class="card" onclick="App.go('income')" style="cursor:pointer">
  <div class="card-title">Income</div>
  <p class="card-description">Record your earnings and income.</p>
</div>

    <div class="card"
  onclick="App.go('expenses')"
  style="cursor:pointer">
  <div class="card-title">Expenses</div>
  <p class="card-description">Track your daily spending and bills.</p>
</div>

    <div class="card" onclick="App.go('purchases')">
  <div class="card-title">Purchases</div>
  <p class="card-description">Keep a record of things you buy.</p>
</div>

<div class="card" onclick="App.go('budget')" style="cursor:pointer">
  <div class="card-title">Monthly Budget</div>
  <p class="card-description">Plan and manage your monthly budget.</p>
</div>


<div class="card" onclick="App.go('reports')" style="cursor:pointer">
  <div class="card-title">Reports</div>
  <p class="card-description">Review your income and spending.</p>
</div>

  `;
},




      
incomePage() {
  const editing = this.editingIncomeId !== null
    ? this.income.find(item =>
        String(item.id) === String(this.editingIncomeId)
      )
    : null;

  return `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px">
      <button onclick="App.go('money')"
        style="width:44px;height:44px;border:0;border-radius:14px;background:#eaf2ff;color:#1769e0;font-size:26px">
        ‹
      </button>
      <div>
        <h1 class="greeting" style="margin:0">${editing ? "Edit Income" : "Add Income"}</h1>
        <p class="subtitle" style="margin:5px 0 0">Track your earnings</p>
      </div>
    </div>

    <div class="card" style="background:linear-gradient(135deg,#1769e0,#438cf5);color:white;padding:24px">
      <p style="margin:0 0 12px;font-size:14px;opacity:.9">Enter Income Amount</p>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:30px;font-weight:600">$</span>
        <input id="incomeAmount" type="number" min="0" step="0.01"
          value="${editing ? this.escape(String(editing.amount)) : ""}"
          placeholder="0.00"
          style="width:100%;background:transparent;border:0;border-bottom:1px solid rgba(255,255,255,.6);border-radius:0;color:white;font-size:34px;font-weight:600;outline:none;padding:8px 0">
      </div>
      <p style="font-size:12px;opacity:.8;margin:12px 0 0">Currency: USD ($)</p>
    </div>

    <div class="card" style="padding:22px">
      <h3 style="margin:0 0 20px;font-size:17px">Income Details</h3>

      <label style="display:block;font-weight:600;margin-bottom:9px">Category</label>
      <select id="incomeCategory"
        style="width:100%;padding:14px;border:1px solid #dce3ed;border-radius:12px;background:#fff">
        <option value="Salary" ${editing?.category === "Salary" ? "selected" : ""}>Salary</option>
        <option value="Business" ${editing?.category === "Business" ? "selected" : ""}>Business</option>
        <option value="Freelance" ${editing?.category === "Freelance" ? "selected" : ""}>Freelance</option>
        <option value="Investment" ${editing?.category === "Investment" ? "selected" : ""}>Investment</option>
        <option value="Other" ${editing?.category === "Other" ? "selected" : ""}>Other</option>
      </select>

      <label style="display:block;font-weight:600;margin:20px 0 9px">Date</label>
      <input id="incomeDate" type="date"
        value="${editing ? this.escape(editing.date || "") : new Date().toLocaleDateString('en-CA')}"
        style="width:100%;padding:14px;border:1px solid #dce3ed;border-radius:12px;box-sizing:border-box">

      <label style="display:block;font-weight:600;margin:20px 0 9px">Description</label>
      <textarea id="incomeDescription"
        placeholder="What was this income for?"
        rows="3"
        style="width:100%;padding:14px;border:1px solid #dce3ed;border-radius:12px;box-sizing:border-box;resize:vertical">${editing ? this.escape(editing.description || "") : ""}</textarea>

      <button onclick="App.addIncome()"
        style="width:100%;margin-top:24px;padding:16px;background:#1769e0;color:white;border:0;border-radius:13px;font-size:16px;font-weight:600">
        ${editing ? "Update Income" : "Save Income"}
      </button>

      ${editing ? `
        <button onclick="App.cancelEditIncome()"
          style="width:100%;margin-top:10px;padding:14px;background:#edf2f8;color:#34445c;border:0;border-radius:13px;font-size:15px;font-weight:600">
          Cancel Edit
        </button>
      ` : ""}
    </div>

    <h2 style="font-size:19px;margin:28px 0 14px">Income History</h2>

    ${
      this.income.length
        ? [...this.income].reverse().map(item => `
          <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
            <div style="min-width:0;flex:1">
              <div style="font-weight:700;color:#263449">${this.escape(item.category)}</div>
              <div style="font-size:13px;color:#8290a5;margin-top:5px">${this.escape(item.date)}</div>
              <div style="font-size:13px;color:#64748b;margin-top:4px">${this.escape(item.description || "No description")}</div>
              <div style="font-weight:700;color:#20a675;margin-top:8px">$${Number(item.amount).toFixed(2)}</div>
            </div>

            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
              <button onclick="App.editIncome('${item.id}')"
                aria-label="Edit income" title="Edit"
                style="width:42px;height:42px;border:0;border-radius:10px;background:#eaf2ff;color:#1769e0;display:flex;align-items:center;justify-content:center">
                <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
                </svg>
              </button>

              <button onclick="App.deleteIncome('${item.id}')"
                style="background:#fff0f0;color:#dc3545;border:1px solid #ffd6d6;border-radius:10px;padding:11px 14px;font-weight:bold">
                Delete
              </button>
            </div>
          </div>
        `).join("")
        : `
          <div class="card">
            <p class="card-description">No income recorded yet.</p>
          </div>
        `
    }
  `;
},


expensesPage() {
  const editing = this.editingExpenseId !== null
    ? this.expenses.find(item =>
        String(item.id) === String(this.editingExpenseId)
      )
    : null;

  return `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px">
      <button onclick="App.go('money')"
        style="width:44px;height:44px;border:0;border-radius:14px;background:#eaf2ff;color:#1769e0;font-size:26px">
        ‹
      </button>

      <div>
        <h1 class="greeting" style="margin:0">
          ${editing ? "Edit Expense" : "Add Expense"}
        </h1>
        <p class="subtitle" style="margin:5px 0 0">
          Track your spending
        </p>
      </div>
    </div>

    <div class="card"
      style="background:linear-gradient(135deg,#e05252,#f47777);color:white;padding:24px">

      <p style="margin:0 0 12px;font-size:14px;opacity:.9">
        Enter Expense Amount
      </p>

      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:30px;font-weight:600">$</span>

        <input id="expenseAmount" type="number" min="0" step="0.01"
          value="${editing ? this.escape(String(editing.amount)) : ""}"
          placeholder="0.00"
          style="width:100%;background:transparent;border:0;border-bottom:1px solid rgba(255,255,255,.6);border-radius:0;color:white;font-size:34px;font-weight:600;outline:none;padding:8px 0">
      </div>

      <p style="font-size:12px;opacity:.8;margin:12px 0 0">
        Currency: USD ($)
      </p>
    </div>

    <div class="card" style="padding:22px">
      <h3 style="margin:0 0 20px;font-size:17px">
        Expense Details
      </h3>

      <label style="display:block;font-weight:600;margin-bottom:9px">
        Category
      </label>

      <select id="expenseCategory"
        style="width:100%;padding:14px;border:1px solid #dce3ed;border-radius:12px;background:#fff">

        ${["Food", "Bills", "Transport", "Shopping", "Entertainment", "Health", "Education", "Other"].map(category => `
          <option value="${category}"
            ${editing?.category === category ? "selected" : ""}>
            ${category}
          </option>
        `).join("")}

      </select>

      <label style="display:block;font-weight:600;margin:20px 0 9px">
        Date
      </label>

      <input id="expenseDate" type="date"
        value="${editing ? this.escape(editing.date || "") : new Date().toLocaleDateString('en-CA')}"
        style="width:100%;padding:14px;border:1px solid #dce3ed;border-radius:12px;box-sizing:border-box">

      <label style="display:block;font-weight:600;margin:20px 0 9px">
        Description
      </label>

      <textarea id="expenseDescription"
        placeholder="What was this expense for?"
        rows="3"
        style="width:100%;padding:14px;border:1px solid #dce3ed;border-radius:12px;box-sizing:border-box;resize:vertical">${editing ? this.escape(editing.description || "") : ""}</textarea>

      <button onclick="App.addExpense()"
        style="width:100%;margin-top:24px;padding:16px;background:#e05252;color:white;border:0;border-radius:13px;font-size:16px;font-weight:600">
        ${editing ? "Update Expense" : "Save Expense"}
      </button>

      ${editing ? `
        <button onclick="App.cancelEditExpense()"
          style="width:100%;margin-top:10px;padding:14px;background:#edf2f8;color:#34445c;border:0;border-radius:13px;font-size:15px;font-weight:600">
          Cancel Edit
        </button>
      ` : ""}
    </div>

    <h2 style="font-size:19px;margin:28px 0 14px">
      Expense History
    </h2>

    ${
      this.expenses.length
        ? [...this.expenses].reverse().map(item => `
          <div class="card"
            style="display:flex;justify-content:space-between;align-items:center;gap:12px">

            <div style="min-width:0;flex:1">
              <div style="font-weight:700;color:#263449">
                ${this.escape(item.category)}
              </div>

              <div style="font-size:13px;color:#8290a5;margin-top:5px">
                ${this.escape(item.date)}
              </div>

              <div style="font-size:13px;color:#64748b;margin-top:4px">
                ${this.escape(item.description || "No description")}
              </div>

              <div style="font-weight:700;color:#e05252;margin-top:8px">
                -$${Number(item.amount).toFixed(2)}
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">

              <button onclick="App.editExpense('${item.id}')"
                aria-label="Edit expense" title="Edit"
                style="width:42px;height:42px;border:0;border-radius:10px;background:#eaf2ff;color:#1769e0;display:flex;align-items:center;justify-content:center">

                <svg viewBox="0 0 24 24" width="21" height="21"
                  fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
                </svg>
              </button>

              <button onclick="App.deleteExpense('${item.id}')"
                style="background:#fff0f0;color:#dc3545;border:1px solid #ffd6d6;border-radius:10px;padding:11px 14px;font-weight:bold">
                Delete
              </button>

            </div>
          </div>
        `).join("")
        : `
          <div class="card">
            <p class="card-description">
              No expenses recorded yet.
            </p>
          </div>
        `
    }
  `;
},


  
purchasesPage() {
  const totalSpent = this.purchases.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const editingItem = this.purchases.find(
    item => String(item.id) === String(this.editingPurchaseId)
  );

  const today = new Date().toISOString().slice(0, 10);

  return `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;">
      <button onclick="App.go('money')" style="width:44px;height:44px;flex-shrink:0;border:0;border-radius:14px;background:#eaf2ff;color:#1769e0;font-size:26px;cursor:pointer;">‹</button>
      <div>
        <h1 class="greeting" style="margin:0">Purchases</h1>
        <p class="subtitle" style="margin:5px 0 0">Track everything you buy.</p>
      </div>
    </div>

    <div style="background:linear-gradient(135deg,#1769e0,#5595f5);border-radius:20px;padding:23px;color:white;margin-bottom:22px;box-shadow:0 8px 22px rgba(23,105,224,.16);">
      <div style="font-size:14px;opacity:.9">Total Money Spent</div>
      <div style="font-size:32px;font-weight:800;margin:9px 0;">$${totalSpent.toFixed(2)}</div>
      <div style="font-size:13px;opacity:.9">${this.purchases.length} total purchases recorded</div>
    </div>

    <div class="card" style="padding:22px;border-radius:20px;border:1px solid #e8eef6;box-shadow:0 5px 20px rgba(20,40,80,.05);">
      <div style="margin-bottom:24px">
        <div style="font-size:21px;font-weight:800;color:#172b4d;">
          ${editingItem ? "Edit Purchase" : "Add Purchase"}
        </div>
        <p style="font-size:14px;color:#8290a5;margin-top:6px;">
          ${editingItem ? "Update your purchase details." : "Record something you bought."}
        </p>
      </div>

      <div style="margin-bottom:19px">
        <label style="display:block;font-size:14px;font-weight:600;color:#34445c;margin-bottom:8px;">Item Name</label>
        <input type="text" id="purchaseName" placeholder="What did you buy?" value="${this.escape(editingItem?.name || "")}" style="display:block;width:100%;box-sizing:border-box;padding:14px;border:1px solid #dce4ef;border-radius:11px;background:#f8faff;font-size:15px;color:#172b4d;outline:none;">
      </div>

      <div style="margin-bottom:19px">
        <label style="display:block;font-size:14px;font-weight:600;color:#34445c;margin-bottom:8px;">Amount (USD)</label>
        <input type="number" id="purchaseAmount" placeholder="0.00" min="0.01" step="0.01" value="${editingItem ? editingItem.amount : ""}" style="display:block;width:100%;box-sizing:border-box;padding:14px;border:1px solid #dce4ef;border-radius:11px;background:#f8faff;font-size:15px;color:#172b4d;outline:none;">
      </div>

      <div style="margin-bottom:19px">
        <label style="display:block;font-size:14px;font-weight:600;color:#34445c;margin-bottom:8px;">Category</label>
        <select id="purchaseCategory" style="display:block;width:100%;box-sizing:border-box;padding:14px;border:1px solid #dce4ef;border-radius:11px;background:#f8faff;font-size:15px;color:#172b4d;">
          ${["Shopping","Food","Electronics","Clothing","Household","Health","Other"].map(category => `
            <option value="${category}" ${editingItem?.category === category ? "selected" : ""}>${category}</option>
          `).join("")}
        </select>
      </div>

      <div style="margin-bottom:19px">
        <label style="display:block;font-size:14px;font-weight:600;color:#34445c;margin-bottom:8px;">Purchase Date</label>
        <input type="date" id="purchaseDate" value="${this.escape(editingItem?.date || today)}" style="display:block;width:100%;box-sizing:border-box;padding:14px;border:1px solid #dce4ef;border-radius:11px;background:#f8faff;font-size:15px;color:#172b4d;">
      </div>

      <div style="margin-bottom:20px">
        <label style="display:block;font-size:14px;font-weight:600;color:#34445c;margin-bottom:8px;">Description</label>
        <textarea id="purchaseDescription" placeholder="Additional details (optional)" rows="4" style="display:block;width:100%;box-sizing:border-box;padding:14px;border:1px solid #dce4ef;border-radius:11px;background:#f8faff;font-size:15px;color:#172b4d;resize:vertical;min-height:100px;">${this.escape(editingItem?.description || "")}</textarea>
      </div>

      <button onclick="App.addPurchase()" style="display:block;width:100%;padding:15px;background:#1769e0;color:white;border:0;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 5px 12px rgba(23,105,224,.18);">
        ${editingItem ? "Update Purchase" : "Save Purchase"}
      </button>

      ${editingItem ? `
        <button onclick="App.cancelEditPurchase()" style="display:block;width:100%;padding:14px;margin-top:10px;background:#f1f5f9;color:#475569;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">
          Cancel Edit
        </button>
      ` : ""}
    </div>

    <div style="margin:28px 0 14px">
      <h2 style="font-size:19px;color:#172b4d;margin:0;">Purchase History</h2>
      <p style="font-size:13px;color:#8290a5;margin-top:5px;">Your recorded purchases.</p>
    </div>

    ${
      this.purchases.length === 0
        ? `
          <div class="card" style="text-align:center;padding:32px 20px;border:1px dashed #cbd8e8;border-radius:18px;">
            <div style="width:58px;height:58px;border-radius:16px;background:#eaf2ff;color:#1769e0;display:flex;align-items:center;justify-content:center;margin:0 auto 15px;font-size:25px;font-weight:700;">$</div>
            <div style="font-weight:700;color:#172b4d;">No Purchases Yet</div>
            <p style="font-size:13px;color:#8290a5;margin-top:7px;">Your purchase records will appear here.</p>
          </div>
        `
        : this.purchases.map(item => `
          <div class="card" style="padding:17px;border-radius:16px;margin-bottom:12px;border:1px solid #e8eef6;">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;">
              <div style="min-width:0">
                <div style="font-size:16px;font-weight:700;color:#172b4d;overflow-wrap:anywhere;">
                  ${this.escape(item.name || "Purchase")}
                </div>
                <div style="font-size:12px;color:#8290a5;margin-top:5px;">
                  ${this.escape(item.category || "Other")}
                  ${item.date ? " · " + this.escape(item.date) : ""}
                </div>
              </div>
              <div style="font-size:17px;font-weight:800;color:#1769e0;white-space:nowrap;">
                $${(Number(item.amount) || 0).toFixed(2)}
              </div>
            </div>

            ${item.description ? `
              <p style="font-size:13px;color:#64748b;margin-top:12px;">
                ${this.escape(item.description)}
              </p>
            ` : ""}

            <div style="display:flex;gap:10px;margin-top:16px;">
              <button onclick="App.editPurchase('${item.id}')" style="flex:1;padding:11px;background:#eaf2ff;color:#1769e0;border:0;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">
                Edit
              </button>
              <button onclick="App.confirmDeletePurchase('${item.id}')" style="flex:1;padding:11px;background:#fff0f0;color:#dc2626;border:0;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">
                Delete
              </button>
            </div>
          </div>
        `).join("")
    }
  `;
},


  
addPurchase() {
  const name = document.getElementById("purchaseName").value.trim();

  const amount = Number(
    document.getElementById("purchaseAmount").value
  );

  const category = document.getElementById("purchaseCategory").value;
  const date = document.getElementById("purchaseDate").value;
  const description = document.getElementById("purchaseDescription").value.trim();

  if (!name) {
    alert("Please enter the item name.");
    return;
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 999999999.99
  ) {
    alert("Please enter a valid amount.");
    return;
  }

  if (!date) {
    alert("Please select a purchase date.");
    return;
  }

  // Update existing purchase
  if (this.editingPurchaseId !== null) {
    const index = this.purchases.findIndex(
      item => String(item.id) === String(this.editingPurchaseId)
    );

    if (index === -1) {
      alert("Purchase not found.");
      this.editingPurchaseId = null;
      this.go("purchases");
      return;
    }

    this.purchases[index] = {
      ...this.purchases[index],
      name,
      amount,
      category,
      date,
      description
    };

    this.editingPurchaseId = null;
  } else {
    // Add new purchase
    this.purchases.push({
      id: Date.now(),
      name,
      amount,
      category,
      date,
      description
    });
  }

  this.save();
  this.go("purchases");
},




confirmDeletePurchase(id) {
  const item = this.purchases.find(
    record => String(record.id) === String(id)
  );

  if (!item) return;

  this.pendingDeletePurchaseId = item.id;

  const oldDialog = document.getElementById("purchaseDeleteDialog");
  if (oldDialog) oldDialog.remove();

  document.body.insertAdjacentHTML("beforeend", `
    <div id="purchaseDeleteDialog" class="delete-overlay"
      style="position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999;">
      <div class="delete-dialog"
        style="background:white;width:100%;max-width:360px;padding:25px;border-radius:20px;box-shadow:0 15px 40px rgba(0,0,0,.18);">
        <div style="font-size:20px;font-weight:800;color:#172b4d;margin-bottom:10px;">
          Delete Purchase?
        </div>
        <p style="font-size:14px;color:#64748b;line-height:1.6;margin-bottom:22px;">
          Are you sure you want to delete "${this.escape(item.name || "this purchase")}"? This action cannot be undone.
        </p>
        <div style="display:flex;gap:10px;">
          <button onclick="App.cancelDeletePurchase()"
            style="flex:1;padding:13px;background:#f1f5f9;color:#475569;border:0;border-radius:11px;font-weight:700;">
            Cancel
          </button>
          <button onclick="App.deletePurchase()"
            style="flex:1;padding:13px;background:#dc2626;color:white;border:0;border-radius:11px;font-weight:700;">
            Delete
          </button>
        </div>
      </div>
    </div>
  `);
},

cancelDeletePurchase() {
  this.pendingDeletePurchaseId = null;

  const dialog = document.getElementById("purchaseDeleteDialog");
  if (dialog) dialog.remove();
},

deletePurchase() {
  if (this.pendingDeletePurchaseId === null) return;

  this.purchases = this.purchases.filter(
    item => String(item.id) !== String(this.pendingDeletePurchaseId)
  );

  this.pendingDeletePurchaseId = null;

  const dialog = document.getElementById("purchaseDeleteDialog");
  if (dialog) dialog.remove();

  this.save();
  this.go("purchases");
},


editPurchase(id) {
  const item = this.purchases.find(
    record => String(record.id) === String(id)
  );

  if (!item) return;

  this.editingPurchaseId = item.id;
  this.go("purchases");
},

cancelEditPurchase() {
  this.editingPurchaseId = null;
  this.go("purchases");
},

  

editIncome(id) {
  const item = this.income.find(
    record => String(record.id) === String(id)
  );

  if (!item) return;

  this.editingIncomeId = item.id;
  this.go("income");
},

cancelEditIncome() {
  this.editingIncomeId = null;
  this.go("income");
},

addIncome() {
  const amount = Number(
    document.getElementById("incomeAmount").value
  );

  const category =
    document.getElementById("incomeCategory").value;

  const date =
    document.getElementById("incomeDate").value;

  const description =
    document.getElementById("incomeDescription").value.trim();

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 999999999.99
  ) {
    alert("Please enter a valid amount.");
    return;
  }

  if (!date) {
    alert("Please select a date.");
    return;
  }

  if (this.editingIncomeId !== null) {
    const index = this.income.findIndex(
      item => String(item.id) === String(this.editingIncomeId)
    );

    if (index === -1) {
      alert("Income record not found.");
      this.editingIncomeId = null;
      this.go("income");
      return;
    }

    this.income[index] = {
      ...this.income[index],
      amount,
      category,
      date,
      description
    };

    this.editingIncomeId = null;
  } else {
    this.income.push({
      id: Date.now(),
      amount,
      category,
      date,
      description
    });
  }

  this.save();
  this.showIncomeSuccess();
},



editExpense(id) {
    const expense = this.expenses.find(item => String(item.id) === String(id));

    if (!expense) return;

    this.editingExpenseId = expense.id;
    this.go('expenses');
},

cancelEditExpense() {
    this.editingExpenseId = null;
    this.go('expenses');
},

addExpense() {
    const amount = Number(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;
    const description = document.getElementById('expenseDescription').value.trim();

    if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999.99) {
        alert('Please enter a valid amount.');
        return;
    }

    if (!date) {
        alert('Please select a date.');
        return;
    }

    if (this.editingExpenseId !== null) {
        const index = this.expenses.findIndex(
            item => String(item.id) === String(this.editingExpenseId)
        );

        if (index === -1) return;

        this.expenses[index] = {
            ...this.expenses[index],
            amount,
            category,
            date,
            description
        };

        this.editingExpenseId = null;
    } else {
        this.expenses.push({
            id: Date.now(),
            amount,
            category,
            date,
            description
        });
    }

    this.save();
    this.showExpenseSuccess();
},


deleteIncome(id) {
    this.pendingDeleteIncomeId = id;

    const existing = document.getElementById("incomeDeleteDialog");
    if (existing) existing.remove();

    const dialog = document.createElement("div");
    dialog.id = "incomeDeleteDialog";
    dialog.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";

    dialog.innerHTML = `
        <div style="background:white;width:100%;max-width:360px;padding:25px;border-radius:20px;">
            <h3 style="margin:0 0 10px;color:#222;">Delete Income?</h3>
            <p style="color:#777;font-size:14px;line-height:1.6;">
                Are you sure you want to delete this income record?
            </p>
            <div style="display:flex;gap:12px;margin-top:20px;">
                <button onclick="App.cancelDeleteIncome()" style="flex:1;padding:14px;background:#edf2f8;border:0;border-radius:12px;">
                    Cancel
                </button>
                <button onclick="App.confirmDeleteIncome()" style="flex:1;padding:14px;background:#e05252;color:white;border:0;border-radius:12px;">
                    Delete
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
},

  
  
confirmDeleteIncome() {
  if (
    this.pendingDeleteIncomeId === null ||
    this.pendingDeleteIncomeId === undefined
  ) return;

  this.income = this.income.filter(
    item => String(item.id) !== String(this.pendingDeleteIncomeId)
  );

  this.pendingDeleteIncomeId = null;

  const dialog = document.getElementById("incomeDeleteDialog");
  if (dialog) dialog.remove();

  this.save();
  this.go("income");
},

cancelDeleteIncome() {
  this.pendingDeleteIncomeId = null;

  const dialog = document.getElementById("incomeDeleteDialog");
  if (dialog) dialog.remove();
},


  
deleteExpense(id) {
  this.pendingDeleteExpenseId = id;

  const oldDialog = document.getElementById("expenseDeleteDialog");
  if (oldDialog) oldDialog.remove();

  document.body.insertAdjacentHTML("beforeend", `
    <div id="expenseDeleteDialog" class="delete-overlay">
      <div class="delete-dialog">
        <h2>Delete Expense?</h2>
        <p>Are you sure you want to delete this expense?</p>
        <div class="dialog-actions">
          <button class="cancel-button" onclick="App.cancelDeleteExpense()">Cancel</button>
          <button class="confirm-delete-button" onclick="App.confirmDeleteExpense()">Delete</button>
        </div>
      </div>
    </div>
  `);
},

confirmDeleteExpense() {
  if (
    this.pendingDeleteExpenseId === null ||
    this.pendingDeleteExpenseId === undefined
  ) return;

  this.expenses = this.expenses.filter(
    item => String(item.id) !== String(this.pendingDeleteExpenseId)
  );

  this.pendingDeleteExpenseId = null;

  const dialog = document.getElementById("expenseDeleteDialog");
  if (dialog) dialog.remove();

  this.save();
  this.go("expenses");
},

cancelDeleteExpense() {
  this.pendingDeleteExpenseId = null;

  const dialog = document.getElementById("expenseDeleteDialog");
  if (dialog) dialog.remove();
},
  
showIncomeSuccess() {
  const oldPopup = document.getElementById("incomeSuccessPopup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.id = "incomeSuccessPopup";

  popup.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      background:rgba(15,30,55,.55);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:22px;
      z-index:99999;
    ">
      <div style="
        background:white;
        width:100%;
        max-width:360px;
        border-radius:24px;
        padding:30px 22px;
        text-align:center;
        box-shadow:0 15px 45px rgba(0,0,0,.15);
      ">
        <div style="
          width:76px;
          height:76px;
          border-radius:50%;
          background:#e5f8ef;
          color:#20a675;
          display:flex;
          align-items:center;
          justify-content:center;
          margin:0 auto 20px;
          font-size:42px;
          font-weight:bold;
        ">✓</div>

        <h2 style="margin:0 0 10px;color:#172b4d">
          Income Saved!
        </h2>

        <p style="color:#718096;line-height:1.6;margin:0 0 25px">
          Your income has been saved successfully.
        </p>

        <button onclick="App.closeIncomeSuccess()"
          style="
            width:100%;
            padding:15px;
            background:#1769e0;
            color:white;
            border:0;
            border-radius:13px;
            font-size:16px;
            font-weight:600;
          ">
          Continue
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
},

closeIncomeSuccess() {
  const popup = document.getElementById("incomeSuccessPopup");
  if (popup) popup.remove();

  this.go("money");
},

  voice() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = event => {
      const spokenText = event.results[0][0].transcript;

      this.currentPage = "notes";
      this.render();

      const textBox = document.getElementById("noteText");
      const titleBox = document.getElementById("noteTitle");

      textBox.value = spokenText;
      titleBox.value = "Voice Note";

      this.resizeTextarea(textBox, 600, 110);
      this.resizeTextarea(titleBox, 160, 48);
    };

    recognition.onerror = () => {
      alert("Voice recognition failed. Please try again.");
    };

    recognition.start();
  },

showExpenseSuccess() {
  const main = document.querySelector(".main-content");

  main.innerHTML = `
    <div style="text-align:center;padding:60px 20px">
      <div style="width:80px;height:80px;margin:0 auto 20px;border-radius:50%;background:#e8f8ef;color:#20a464;display:flex;align-items:center;justify-content:center;font-size:42px">
        ✓
      </div>

      <h2 style="margin:0 0 10px;color:#202938">
        Expense Saved!
      </h2>

      <p style="color:#718096;margin-bottom:28px">
        Your expense has been saved successfully.
      </p>

      <button onclick="App.closeExpenseSuccess()"
        style="width:100%;padding:15px;background:#1769e0;color:white;border:0;border-radius:12px;font-size:16px;font-weight:600">
        Continue
      </button>
    </div>
  `;
},

closeExpenseSuccess() {
  this.go("money");
},
  
  inputStyle() {
    return `
      width:100%;
      padding:14px;
      border:1px solid #e7edf5;
      border-radius:12px;
      background:white;
      margin-bottom:12px;
      outline:none;
      color:#17243a;
      box-sizing:border-box;
    `;
  },

  primaryStyle() {
    return `
      background:#1769e0;
      color:white;
      width:100%;
      margin-bottom:15px;
    `;
  },

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  
},


budgetPage() {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const expenses = this.expenses
        .filter(item => item.date && item.date.startsWith(currentMonth))
        .reduce((total, item) => total + Number(item.amount || 0), 0);

    const purchases = this.purchases
        .filter(item => item.date && item.date.startsWith(currentMonth))
        .reduce((total, item) => total + Number(item.amount || 0), 0);

    const totalSpent = expenses + purchases;
    const remaining = this.monthlyBudget - totalSpent;

    const usagePercent = this.monthlyBudget > 0
        ? (totalSpent / this.monthlyBudget) * 100
        : 0;

    const progress = Math.min(usagePercent, 100);

    return `
        <div style="padding-bottom:20px;">

            <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;">
                
<button onclick="App.go('money')"
  style="width:44px;height:44px;border:0;border-radius:14px;background:#eaf2ff;color:#1769e0;font-size:26px">
  ‹
</button>


                <div>
                    <h2 class="greeting" style="margin:0;">Monthly Budget</h2>
                    <p class="subtitle" style="margin:5px 0 0;">Plan and manage your money.</p>
                </div>
            </div>

            <div class="card" style="background:linear-gradient(135deg,#1769e0,#5596f5);color:white;padding:24px;border:none;border-radius:20px;">
                <p style="margin:0 0 8px;color:#e5efff;font-size:14px;">
                    Monthly Budget
                </p>

                <h1 style="font-size:34px;margin:0;font-weight:700;">
                    $${this.monthlyBudget.toFixed(2)}
                </h1>

                <p style="font-size:13px;color:#e5efff;margin:8px 0 0;">
                    Your monthly spending limit
                </p>
            </div>

            <div class="card" style="padding:22px;margin-top:16px;">
                <div class="card-title">Set Your Budget</div>

                <p class="card-description" style="margin-bottom:18px;">
                    Enter how much money you want to spend this month.
                </p>

                <label style="display:block;font-weight:600;margin-bottom:9px;">
                    Budget Amount (USD)
                </label>

                <input
                    type="number"
                    id="budgetAmount"
                    min="0"
                    max="999999999.99"
                    step="0.01"
                    placeholder="Enter amount"
                    value="${this.monthlyBudget || ''}"
                    style="width:100%;box-sizing:border-box;padding:15px;border:1px solid #dce3ed;border-radius:12px;font-size:16px;outline:none;margin-bottom:16px;"
                >

                <button
                    onclick="App.setMonthlyBudget()"
                    style="width:100%;padding:16px;background:#1769e0;color:white;border:none;border-radius:13px;font-size:15px;font-weight:600;cursor:pointer;">
                    Save Budget
                </button>
                
<button
    onclick="App.openDeleteBudgetModal()"
    style="width:100%;padding:15px;margin-top:10px;background:#fff0f0;color:#e05252;border:1px solid #ffd5d5;border-radius:13px;font-size:15px;font-weight:600;cursor:pointer;">
    Delete Budget
</button>

     </div>

            <div class="card" style="padding:22px;margin-top:16px;">
                <div class="card-title">Monthly Overview</div>

                <p class="card-description" style="margin-bottom:20px;">
                    Your spending summary for this month.
                </p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

                    <div style="background:#eaf2ff;padding:16px;border-radius:14px;">
                        <p style="font-size:12px;color:#52709b;margin:0 0 8px;">
                            Total Budget
                        </p>
                        <h3 style="margin:0;color:#1769e0;font-size:19px;">
                            $${this.monthlyBudget.toFixed(2)}
                        </h3>
                    </div>

                    <div style="background:#fff0f0;padding:16px;border-radius:14px;">
                        <p style="font-size:12px;color:#a45b5b;margin:0 0 8px;">
                            Total Spent
                        </p>
                        <h3 style="margin:0;color:#e05252;font-size:19px;">
                            $${totalSpent.toFixed(2)}
                        </h3>
                    </div>

                    <div style="background:#eaf8f1;padding:16px;border-radius:14px;grid-column:span 2;">
                        <p style="font-size:12px;color:#438366;margin:0 0 8px;">
                            Remaining Balance
                        </p>
                        <h3 style="margin:0;color:${remaining < 0 ? '#e05252' : '#20a675'};font-size:23px;">
                            ${this.monthlyBudget > 0
                                ? (remaining < 0 ? '-$' + Math.abs(remaining).toFixed(2) : '$' + remaining.toFixed(2))
                                : 'Set your budget'}
                        </h3>
                    </div>

                </div>

                <div style="margin-top:24px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <strong style="font-size:14px;">Budget Usage</strong>
                        <strong style="font-size:14px;color:#1769e0;">
                            ${usagePercent.toFixed(1)}%
                        </strong>
                    </div>

                    <div style="height:11px;background:#eaf0f6;border-radius:20px;overflow:hidden;">
                        <div style="height:100%;width:${progress}%;background:${usagePercent > 100 ? '#e05252' : '#20a675'};border-radius:20px;transition:width 0.3s;"></div>
                    </div>

                    ${this.monthlyBudget > 0 && remaining < 0
                        ? '<p style="color:#e05252;font-size:13px;font-weight:600;margin-top:12px;">You have exceeded your monthly budget!</p>'
                        : ''}
                </div>
            </div>

            <div class="card" style="padding:22px;margin-top:16px;">
                <div class="card-title">Spending Breakdown</div>

                <p class="card-description" style="margin-bottom:18px;">
                    Where your money is going.
                </p>

                <div style="display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #edf0f5;">
                    <span>Expenses</span>
                    <strong style="color:#e05252;">$${expenses.toFixed(2)}</strong>
                </div>

                <div style="display:flex;justify-content:space-between;padding:14px 0;">
                    <span>Purchases</span>
                    <strong style="color:#1769e0;">$${purchases.toFixed(2)}</strong>
                </div>

                <div style="display:flex;justify-content:space-between;padding:14px 0;border-top:1px solid #edf0f5;">
                    <strong>Total Spent</strong>
                    <strong>$${totalSpent.toFixed(2)}</strong>
                </div>
            </div>


<div id="deleteBudgetModal"
    style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;align-items:center;justify-content:center;padding:20px;">

    <div style="background:white;width:100%;max-width:360px;padding:25px;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.15);">

        <div style="width:55px;height:55px;border-radius:16px;background:#fff0f0;color:#e05252;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:18px;">
            !
        </div>

        <h3 style="margin:0 0 10px;color:#222;font-size:20px;">
            Delete Monthly Budget?
        </h3>

        <p style="color:#777;font-size:14px;line-height:1.6;margin-bottom:24px;">
            Are you sure you want to delete your monthly budget? Your expenses and purchases will remain safe.
        </p>

        <div style="display:flex;gap:12px;">

            <button onclick="App.closeDeleteBudgetModal()"
                style="flex:1;padding:14px;background:#edf2f8;color:#333;border:none;border-radius:12px;font-weight:600;font-size:14px;">
                Cancel
            </button>

            <button onclick="App.confirmDeleteMonthlyBudget()"
                style="flex:1;padding:14px;background:#e05252;color:white;border:none;border-radius:12px;font-weight:600;font-size:14px;">
                Delete
            </button>

        </div>
    </div>
</div>


        </div>
    `;
},



reportsPage() {
    const validAmount = item => {
        const amount = Number(item.amount);
        return Number.isFinite(amount) &&
            amount > 0 &&
            amount <= 999999999.99
            ? amount : 0;
    };

    const totalIncome = this.income.reduce(
        (sum, item) => sum + validAmount(item), 0
    );

    const totalExpenses = this.expenses.reduce(
        (sum, item) => sum + validAmount(item), 0
    );

    const totalPurchases = this.purchases.reduce(
        (sum, item) => sum + validAmount(item), 0
    );

    const totalSpent = totalExpenses + totalPurchases;
    const netBalance = totalIncome - totalSpent;

    const now = new Date();
    const currentMonth =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0");

    const monthIncome = this.income
        .filter(item => (item.date || "").startsWith(currentMonth))
        .reduce((sum, item) => sum + validAmount(item), 0);

    const monthExpenses = this.expenses
        .filter(item => (item.date || "").startsWith(currentMonth))
        .reduce((sum, item) => sum + validAmount(item), 0);

    const monthPurchases = this.purchases
        .filter(item => (item.date || "").startsWith(currentMonth))
        .reduce((sum, item) => sum + validAmount(item), 0);

    const categoryReport = (items, color) => {
        const groups = {};

        items.forEach(item => {
            const category = item.category || "Other";
            groups[category] =
                (groups[category] || 0) + validAmount(item);
        });

        return Object.entries(groups).map(([category, amount]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #edf0f5">
                <span style="color:#526176">${this.escape(category)}</span>
                <strong style="color:${color}">$${amount.toFixed(2)}</strong>
            </div>
        `).join("") || `
            <p style="color:#8290a5;font-size:14px">No records available.</p>
        `;
    };

    return `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px">
            <button onclick="App.go('money')"
                style="width:44px;height:44px;border:0;border-radius:14px;background:#eaf2ff;color:#1769e0;font-size:26px">
                ‹
            </button>
            <div>
                <h1 class="greeting" style="margin:0">Financial Reports</h1>
                <p class="subtitle" style="margin:5px 0 0">Review your financial activity.</p>
            </div>
        </div>

        <div class="card" style="background:#1769e0;color:white;padding:22px">
            <p style="margin:0 0 8px;opacity:.85">Net Balance</p>
            <h1 style="font-size:32px;margin:0">$${netBalance.toFixed(2)}</h1>
            <p style="margin:8px 0 0;opacity:.85">Income minus all spending</p>
        </div>

        <h2 style="font-size:19px;margin:25px 0 14px">Financial Summary</h2>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="card">
                <p style="color:#20a675;margin:0 0 8px">Total Income</p>
                <h2 style="margin:0;font-size:21px">$${totalIncome.toFixed(2)}</h2>
            </div>

            <div class="card">
                <p style="color:#e05252;margin:0 0 8px">Total Expenses</p>
                <h2 style="margin:0;font-size:21px">$${totalExpenses.toFixed(2)}</h2>
            </div>

            <div class="card">
                <p style="color:#1769e0;margin:0 0 8px">Purchases</p>
                <h2 style="margin:0;font-size:21px">$${totalPurchases.toFixed(2)}</h2>
            </div>

            <div class="card">
                <p style="color:#e05252;margin:0 0 8px">Total Spent</p>
                <h2 style="margin:0;font-size:21px">$${totalSpent.toFixed(2)}</h2>
            </div>
        </div>

        <div class="card" style="margin-top:20px;padding:20px">
            <h3 style="margin:0 0 16px">Monthly Report</h3>
            <p style="color:#8290a5;font-size:13px;margin:0 0 14px">${currentMonth}</p>

            <div style="display:flex;justify-content:space-between;padding:10px 0">
                <span>Income</span>
                <strong style="color:#20a675">$${monthIncome.toFixed(2)}</strong>
            </div>

            <div style="display:flex;justify-content:space-between;padding:10px 0">
                <span>Expenses</span>
                <strong style="color:#e05252">$${monthExpenses.toFixed(2)}</strong>
            </div>

            <div style="display:flex;justify-content:space-between;padding:10px 0">
                <span>Purchases</span>
                <strong style="color:#e05252">$${monthPurchases.toFixed(2)}</strong>
            </div>

            <div style="display:flex;justify-content:space-between;border-top:1px solid #edf0f5;padding-top:14px;margin-top:8px">
                <strong>Monthly Balance</strong>
                <strong style="color:#1769e0">$${(monthIncome - monthExpenses - monthPurchases).toFixed(2)}</strong>
            </div>
        </div>

        <div class="card" style="margin-top:20px;padding:20px">
            <h3 style="margin:0 0 12px">Income Breakdown</h3>
            ${categoryReport(this.income, "#20a675")}
        </div>

        <div class="card" style="margin-top:16px;padding:20px">
            <h3 style="margin:0 0 12px">Expense Breakdown</h3>
            ${categoryReport(this.expenses, "#e05252")}
        </div>

        <div class="card" style="margin-top:16px;padding:20px">
            <h3 style="margin:0 0 12px">Purchase Summary</h3>
            ${categoryReport(this.purchases, "#1769e0")}
        </div>

        
    `;
},


backup() {
    const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        notes: this.notes,
        tasks: this.tasks,
        income: this.income,
        expenses: this.expenses,
        purchases: this.purchases,
        monthlyBudget: this.monthlyBudget
    };

    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "dodolist-backup.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert("Backup exported successfully!");
},

restore(input) {
    const file = input.files && input.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);

            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data)
            ) {
                throw new Error("Invalid backup file.");
            }

            const arrayKeys = [
                "notes",
                "tasks",
                "income",
                "expenses",
                "purchases"
            ];

            const hasKnownData =
                arrayKeys.some(key =>
                    Object.prototype.hasOwnProperty.call(data, key)
                ) ||
                Object.prototype.hasOwnProperty.call(data, "monthlyBudget");

            if (!hasKnownData) {
                throw new Error("No backup data found.");
            }

            for (const key of arrayKeys) {
                if (
                    Object.prototype.hasOwnProperty.call(data, key) &&
                    !Array.isArray(data[key])
                ) {
                    throw new Error("Invalid " + key + " data.");
                }
            }

            if (
                Object.prototype.hasOwnProperty.call(data, "monthlyBudget") &&
                (
                    !Number.isFinite(Number(data.monthlyBudget)) ||
                    Number(data.monthlyBudget) < 0
                )
            ) {
                throw new Error("Invalid monthly budget.");
            }

            const confirmed = confirm(
                "Restoring this backup will replace matching existing data. Continue?"
            );

            if (!confirmed) {
                input.value = "";
                return;
            }

            for (const key of arrayKeys) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    this[key] = data[key];
                }
            }

            if (
                Object.prototype.hasOwnProperty.call(data, "monthlyBudget")
            ) {
                this.monthlyBudget = Number(data.monthlyBudget);
            }

            this.save();

            alert("Backup restored successfully!");

            input.value = "";
            this.go("more");

        } catch (error) {
            alert("Restore failed: " + error.message);
            input.value = "";
        }
    };

    reader.onerror = () => {
        alert("Could not read the backup file.");
        input.value = "";
    };

    reader.readAsText(file);
},

  


restoreAutoBackup() {
    const backup = localStorage.getItem("pla_auto_backup");

    if (!backup) {
        alert("No automatic backup found.");
        return;
    }

    try {
        const data = JSON.parse(backup);

        const keys = [
            "notes",
            "tasks",
            "income",
            "expenses",
            "purchases"
        ];

        for (const key of keys) {
            if (!Array.isArray(data[key])) {
                throw new Error("Invalid backup data.");
            }
        }

        if (
            !Number.isFinite(Number(data.monthlyBudget)) ||
            Number(data.monthlyBudget) < 0
        ) {
            throw new Error("Invalid budget data.");
        }

        const existing = document.getElementById("autoRestoreDialog");
        if (existing) existing.remove();

        const dialog = document.createElement("div");
        dialog.id = "autoRestoreDialog";

        dialog.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(15,25,45,0.50);
            backdrop-filter:blur(4px);
            z-index:99999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        `;

        dialog.innerHTML = `
            <div style="
                background:#ffffff;
                width:100%;
                max-width:360px;
                padding:25px;
                border-radius:22px;
                box-shadow:0 15px 50px rgba(0,0,0,0.15);
                animation:restoreModalIn .2s ease;
            ">

                <div style="
                    width:58px;
                    height:58px;
                    border-radius:17px;
                    background:#eaf2ff;
                    color:#3978e8;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    margin-bottom:20px;
                ">
                    <svg viewBox="0 0 24 24"
                        width="29" height="29"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M12 7v5l3 2"/>
                    </svg>
                </div>

                <h3 style="
                    margin:0 0 10px;
                    color:#202b3c;
                    font-size:20px;
                    font-weight:700;
                ">
                    Restore Previous Data
                </h3>

                <p style="
                    margin:0;
                    color:#7b8798;
                    font-size:14px;
                    line-height:1.7;
                ">
                    Are you sure you want to restore your previous saved data?
                </p>

                <div style="
                    margin-top:14px;
                    padding:12px;
                    background:#fff8eb;
                    border-radius:12px;
                    color:#b47a25;
                    font-size:12px;
                    line-height:1.6;
                ">
                    Your current data will be replaced with the previous saved data.
                </div>

                <div style="
                    display:flex;
                    gap:12px;
                    margin-top:24px;
                ">

                    <button onclick="document.getElementById('autoRestoreDialog').remove()"
                        style="
                            flex:1;
                            padding:14px;
                            background:#edf2f8;
                            color:#536174;
                            border:0;
                            border-radius:12px;
                            font-size:14px;
                            font-weight:600;
                            cursor:pointer;
                        ">
                        Cancel
                    </button>

                    <button onclick="App.confirmAutoRestore()"
                        style="
                            flex:1;
                            padding:14px;
                            background:#3978e8;
                            color:white;
                            border:0;
                            border-radius:12px;
                            font-size:14px;
                            font-weight:600;
                            cursor:pointer;
                        ">
                        Restore Data
                    </button>

                </div>
            </div>
        `;

        document.body.appendChild(dialog);

    } catch (error) {
        alert("Restore failed: " + error.message);
    }
},

confirmAutoRestore() {
    const backup = localStorage.getItem("pla_auto_backup");

    try {
        const data = JSON.parse(backup);

        this.notes = data.notes;
        this.tasks = data.tasks;
        this.income = data.income;
        this.expenses = data.expenses;
        this.purchases = data.purchases;
        this.monthlyBudget = Number(data.monthlyBudget);

        localStorage.setItem("pla_notes", JSON.stringify(this.notes));
        localStorage.setItem("pla_tasks", JSON.stringify(this.tasks));
        localStorage.setItem("pla_income", JSON.stringify(this.income));
        localStorage.setItem("pla_expenses", JSON.stringify(this.expenses));
        localStorage.setItem("pla_purchases", JSON.stringify(this.purchases));
        localStorage.setItem("pla_monthly_budget", this.monthlyBudget);

        const dialog = document.getElementById("autoRestoreDialog");
        if (dialog) dialog.remove();

        this.go("more");

    } catch (error) {
        alert("Restore failed: " + error.message);
    }
},


  
setMonthlyBudget() {
    const input = document.getElementById("budgetAmount");

    if (!input || input.value.trim() === "") {
        alert("Please enter your monthly budget.");
        return;
    }

    const amount = Number(input.value);

    if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999.99) {
        alert("Please enter a valid budget amount.");
        return;
    }

    this.monthlyBudget = amount;
    this.save();
    this.render();
},



openDeleteBudgetModal() {
    if (Number(this.monthlyBudget) <= 0) {
        alert("No budget to delete.");
        return;
    }

    document.getElementById("deleteBudgetModal").style.display = "flex";
},

closeDeleteBudgetModal() {
  document.getElementById("deleteBudgetModal").style.display = "none";
},

confirmDeleteMonthlyBudget() {
    this.monthlyBudget = 0;

    localStorage.removeItem("pla_monthly_budget");

    this.save();
    this.render();
},


openProfile() {
    const oldDialog = document.getElementById("profileDialog");
    if (oldDialog) oldDialog.remove();

    this.profileCropZoom = 1;
    this.profileCropX = 0;
    this.profileCropY = 0;
    this.profileCropImage = null;

    const dialog = document.createElement("div");
    dialog.id = "profileDialog";
    dialog.style.cssText = "position:fixed;inset:0;background:rgba(15,25,45,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;";

    dialog.innerHTML = `
        <div style="background:white;width:100%;max-width:360px;padding:24px;border-radius:20px;text-align:center;">
            <h2 style="margin:0 0 20px;color:#17243a;">Edit Profile</h2>

            <div style="position:relative;width:220px;height:220px;margin:auto;">
                <canvas id="profileCropCanvas" width="300" height="300"
                    style="width:220px;height:220px;border-radius:50%;background:#eaf1ff;touch-action:none;"></canvas>

                <span id="profileInitial" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:55px;color:#2563eb;pointer-events:none;">U</span>

                <label for="profileImageInput"
                    style="position:absolute;right:5px;bottom:5px;width:46px;height:46px;border-radius:50%;background:#2563eb;color:white;display:flex;align-items:center;justify-content:center;border:3px solid white;cursor:pointer;">
                    <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 5h-4L8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/>
                        <circle cx="12" cy="13" r="3"/>
                    </svg>
                </label>
                <input id="profileImageInput" type="file" accept="image/*" style="display:none;" onchange="App.previewProfileImage(this)">
            </div>

            <p style="font-size:12px;color:#718096;margin:12px 0;">Drag to move and pinch to zoom</p>

            <div style="margin:18px 0;text-align:left;">
                <label style="font-size:13px;color:#17243a;">Zoom</label>
                <input type="range" min="1" max="4" step="0.05" value="1"
                    style="width:100%;margin-top:10px;"
                    oninput="App.setProfileZoom(this.value)">
            </div>

            <div style="text-align:left;">
                <label style="display:block;margin-bottom:8px;color:#17243a;">Profile Name</label>
                <input id="profileNameInput" type="text" maxlength="40"
                    value="${this.escape(this.profileName)}"
                    style="width:100%;box-sizing:border-box;padding:13px;border:1px solid #dce3ee;border-radius:10px;font-size:16px;">
            </div>

            <div style="display:flex;gap:10px;margin-top:22px;">
                <button onclick="document.getElementById('profileDialog').remove()"
                    style="flex:1;padding:13px;border:0;border-radius:10px;background:#edf1f7;">Cancel</button>
                <button onclick="App.saveProfile()"
                    style="flex:1;padding:13px;border:0;border-radius:10px;background:#2563eb;color:white;">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const canvas = document.getElementById("profileCropCanvas");
    const pointers = new Map();
    let dragStart = null;
    let pinchStart = null;

    const distance = (a, b) =>
        Math.hypot(a.x - b.x, a.y - b.y);

    canvas.addEventListener("pointerdown", e => {
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.size === 1) {
            dragStart = {
                x: e.clientX,
                y: e.clientY,
                cropX: this.profileCropX,
                cropY: this.profileCropY
            };
        }

        if (pointers.size === 2) {
            const p = [...pointers.values()];
            pinchStart = {
                distance: distance(p[0], p[1]),
                zoom: this.profileCropZoom
            };
        }
    });

    canvas.addEventListener("pointermove", e => {
        if (!pointers.has(e.pointerId)) return;

        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.size === 2 && pinchStart) {
            const p = [...pointers.values()];
            const currentDistance = distance(p[0], p[1]);

            this.profileCropZoom = Math.max(1, Math.min(4,
                pinchStart.zoom * currentDistance / pinchStart.distance
            ));

            this.drawProfileCrop();
        } else if (pointers.size === 1 && dragStart) {
            this.profileCropX = dragStart.cropX +
                (e.clientX - dragStart.x) * 300 / canvas.clientWidth;

            this.profileCropY = dragStart.cropY +
                (e.clientY - dragStart.y) * 300 / canvas.clientHeight;

            this.drawProfileCrop();
        }
    });

    const endPointer = e => {
        pointers.delete(e.pointerId);
        pinchStart = null;
        dragStart = null;

        if (pointers.size === 1) {
            const p = [...pointers.values()][0];
            dragStart = {
                x: p.x,
                y: p.y,
                cropX: this.profileCropX,
                cropY: this.profileCropY
            };
        }
    };

    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);

    if (this.profileImage) {
        const image = new Image();
        image.onload = () => {
            this.profileCropImage = image;
            this.drawProfileCrop();
            document.getElementById("profileInitial").style.display = "none";
        };
        image.src = this.profileImage;
    }
},

previewProfileImage(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert("Please choose an image smaller than 2 MB.");
        input.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const image = new Image();

        image.onload = () => {
            this.profileCropImage = image;
            this.profileCropZoom = 1;
            this.profileCropX = 0;
            this.profileCropY = 0;

            document.getElementById("profileInitial").style.display = "none";
            this.drawProfileCrop();
        };

        image.src = reader.result;
    };

    reader.readAsDataURL(file);
},

drawProfileCrop() {
    const canvas = document.getElementById("profileCropCanvas");
    const image = this.profileCropImage;

    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    const size = 300;

    ctx.clearRect(0, 0, size, size);

    const baseScale = Math.max(
        size / image.width,
        size / image.height
    );

    const scale = baseScale * this.profileCropZoom;
    const width = image.width * scale;
    const height = image.height * scale;

    const maxX = Math.max(0, (width - size) / 2);
    const maxY = Math.max(0, (height - size) / 2);

    this.profileCropX = Math.max(-maxX, Math.min(maxX, this.profileCropX));
    this.profileCropY = Math.max(-maxY, Math.min(maxY, this.profileCropY));

    const x = (size - width) / 2 + this.profileCropX;
    const y = (size - height) / 2 + this.profileCropY;

    ctx.drawImage(image, x, y, width, height);
},

setProfileZoom(value) {
    this.profileCropZoom = Number(value);
    this.drawProfileCrop();
},

saveProfile() {
    const nameInput = document.getElementById("profileNameInput");
    const name = nameInput.value.trim();

    if (!name) {
        alert("Please enter a profile name.");
        return;
    }

    try {
        let imageData = this.profileImage;

        if (this.profileCropImage) {
            imageData = document.getElementById("profileCropCanvas").toDataURL("image/jpeg", 0.85);
        }

        localStorage.setItem("pla_profile_name", name);

        if (imageData) {
            localStorage.setItem("pla_profile_image", imageData);
        }

        this.profileName = name;
        this.profileImage = imageData || "";

        document.getElementById("profileDialog").remove();
        this.render();

    } catch (error) {
        alert("Could not save profile. Please choose a smaller image.");
    }
},


  
};
  
App.init();

