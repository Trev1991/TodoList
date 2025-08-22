(function () {
    const KEY = 'sb_week4_todos_v2';
    let todos = [];
    let currentFilter = 'all';

    const form = document.getElementById('new-todo');
    const input = document.getElementById('todo-text');
    const addBtn = form.querySelector('button[type="submit"]');
    const listEl = document.getElementById('list');
    const countEl = document.getElementById('count');
    const clearBtn = document.getElementById('clearCompleted');
    const filterButtons = Array.from(document.querySelectorAll('.filters button'));
    const live = document.getElementById('live');

    const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    const save = () => localStorage.setItem(KEY, JSON.stringify(todos));
    const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
    const announce = (msg) => { live.textContent = msg; };

    function applyFilter(items) {
        switch (currentFilter) {
            case 'active': return items.filter(t => !t.done);
            case 'done': return items.filter(t => t.done);
            default: return items;
        }
    }

    function updateCount() {
        const active = todos.filter(t => !t.done).length;
        const total = todos.length;
        countEl.textContent = `${total} item${total !== 1 ? 's' : ''} (${active} left)`;
    }

    function setFilter(name) {
        currentFilter = name;
        filterButtons.forEach(btn => {
            const pressed = btn.dataset.filter === name;
            btn.setAttribute('aria-pressed', String(pressed));
            btn.classList.toggle('chip--active', pressed);
        });
        render();
    }

    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = 'todo' + (todo.done ? ' done' : '');
        li.dataset.id = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.done;

        const title = document.createElement('div');
        title.className = 'title';

        const text = document.createElement('span');
        text.className = 'text';
        text.textContent = todo.text;
        text.addEventListener('dblclick', () => beginEdit(li, text, todo));

        title.appendChild(text);

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn';
        editBtn.type = 'button';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', () => beginEdit(li, text, todo));

        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn danger';
        delBtn.type = 'button';
        delBtn.textContent = '🗑️';
        delBtn.addEventListener('click', () => removeTodo(todo.id));

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));

        li.appendChild(checkbox);
        li.appendChild(title);
        li.appendChild(actions);

        return li;
    }

    function beginEdit(li, textEl, todo) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit';

        const title = li.querySelector('.title');
        title.replaceChild(input, textEl);
        input.focus();
        input.select();

        const commit = () => {
            const next = input.value.trim();
            if (!next) { removeTodo(todo.id); return; }
            todo.text = next;
            save();
            render();
            announce('Task updated');
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') render();
        });
        input.addEventListener('blur', commit);
    }

    function render() {
        listEl.innerHTML = '';
        const visible = applyFilter(todos);
        visible
            .sort((a, b) => Number(a.done) - Number(b.done) || a.created - b.created)
            .forEach(t => listEl.appendChild(createTodoElement(t)));
        updateCount();
    }

    function addTodo(text) {
        todos.push({ id: uid(), text, done: false, created: Date.now() });
        save();
        render();
        announce('Task added');
    }

    function toggleTodo(id, done) {
        const t = todos.find(t => t.id === id);
        if (t) { t.done = done; save(); render(); announce(done ? 'Task completed' : 'Task reactivated'); }
    }

    function removeTodo(id) {
        todos = todos.filter(t => t.id !== id);
        save();
        render();
        announce('Task deleted');
    }

    function clearCompleted() {
        const before = todos.length;
        todos = todos.filter(t => !t.done);
        save();
        render();
        announce(`${before - todos.length} completed task(s) cleared`);
    }

    input.addEventListener('input', () => {
        addBtn.disabled = input.value.trim().length === 0;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        addTodo(text);
        input.value = '';
        addBtn.disabled = true;
        input.focus();
    });

    filterButtons.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
    clearBtn.addEventListener('click', clearCompleted);

    todos = load();
    render();
})();
