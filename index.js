import miniframework from './miniframework/framework.js'

const container = document.getElementById('app')

const todos = miniframework.createState([
	{ id: 0, name: 'Cook pizza', checked: false },
	{ id: 1, name: 'miniframework', checked: false },
	{ id: 2, name: 'Bomberman-DOM', checked: false },
])
const currentFilter = miniframework.createState('all') // 'all', 'active', 'completed'
let completedCount = miniframework.createState(0)

todos.subscribe(updateCompletedCount)
let newTodo = ''

const header = () => {
	return miniframework.header(
		{ class: 'header' },
		miniframework.h1({}, 'todos'),
		miniframework.input({
			class: 'new-todo',
			placeholder: 'What needs to be done?',
			autofocus: true,
			oninput: (e) => {
				newTodo = e.target.value
			},
			onkeydown: (e) => {
				if (e.key === 'Enter') {
					if (newTodo.trim() === '') return

					const maxId = Math.max(0, ...todos.value.map((t) => t.id))
					const newId = maxId + 1

					const newTodos = [...todos.value, { id: newId, name: newTodo.trim(), checked: false }]
					todos.value = newTodos
					newTodo = ''
					e.target.value = ''
				}
			},
		})
	)
}

const info = () => {
	return miniframework.footer(
		{ class: 'info' },
		miniframework.p({}, 'Double-click to edit a todo'),
		miniframework.p({}, 'Created by', miniframework.a({ href: 'https://01.kood.tech/git/jtormale/miniframework-framework.git' }, ' JT, IP')),
		miniframework.p({}, 'Part of ', miniframework.a({ href: 'http://todomvc.com' }, 'TodoMVC'))
	)
}

const main = () => {
	return miniframework.section(
		{ class: 'main' },
		miniframework.input({ id: 'toggle-all', class: 'toggle-all', type: 'checkbox' }),
		miniframework.label({ for: 'toggle-all', onclick: toggleAllTasks }, 'Mark all as complete'),
		miniframework.bindToDOM(todosView, todos, keyFn)
	)
}

const todosView = () => {
	const filteredTodos = todos.value.filter((todo) => {
		if (currentFilter.value === 'all') return true
		if (currentFilter.value === 'active') return !todo.checked
		if (currentFilter.value === 'completed') return todo.checked
		return true
	})

	return miniframework.ul(
		{ class: 'todo-list' },
		...filteredTodos.map((todo, index) => {
			const liAttributes = { id: `todo-${todo.id}` }
			if (todo.checked) {
				liAttributes.class = 'completed'
			}

			const inputAttrs = {
				class: 'toggle',
				type: 'checkbox',
				onclick: (e) => toggleCompleted(e, todo.id),
			}
			if (todo.checked) {
				inputAttrs.checked = 'checked'
			}

			return miniframework.li(
				liAttributes,
				miniframework.div(
					{ class: 'view' },
					miniframework.input(inputAttrs),
					miniframework.label({ ondblclick: (event) => handleEdit(event, index) }, todo.name),
					miniframework.button({ class: 'destroy', onclick: (event) => destroyTodo(event, todo.id) })
				)
			)
		})
	)
}

const footer = () => {
	const clearBtn = miniframework.button({ class: 'clear-completed', onclick: () => clearCompleted() }, 'Clear completed')

	const filters = () => {
		if (todos.value.length === 0) return null
		return miniframework.ul(
			{ class: 'filters' },
			miniframework.li(
				{},
				miniframework.a(
					{
						'data-use-router': true,
						href: '/',
						class: currentFilter.value === 'all' ? 'selected' : '',
						onclick: () => (currentFilter.value = 'all'),
					},
					'All'
				)
			),
			miniframework.li(
				{},
				miniframework.a(
					{
						'data-use-router': true,
						href: '/active',
						class: currentFilter.value === 'active' ? 'selected' : '',
						onclick: () => (currentFilter.value = 'active'),
					},
					'Active'
				)
			),
			miniframework.li(
				{},
				miniframework.a(
					{
						'data-use-router': true,
						href: '/completed',
						class: currentFilter.value === 'completed' ? 'selected' : '',
						onclick: () => (currentFilter.value = 'completed'),
					},
					'Completed'
				)
			)
		)
	}

	const itemCount = () => {
		if (todos.value.length === 0) return null
		return miniframework.span({ class: 'todo-count' }, miniframework.bindToDOM(counter, completedCount, keyFn), ' items left')
	}

	return miniframework.footer(
		{ class: 'footer' },
		miniframework.bindToDOM(itemCount, todos, () => 'itemCountKey'),
		miniframework.bindToDOM(filters, todos, () => 'filtersKey'),
		miniframework.bindToDOM(
			() => {
				const hasCheckedItems = todos.value.some((todo) => todo.checked)
				clearBtn.style.display = hasCheckedItems ? 'block' : 'none'
				return clearBtn
			},
			todos,
			() => 'clearButtonKey'
		)
	)
}

const ToDoApp = () => {
	updateCompletedCount()

	const todoAppSection = miniframework.section({ class: 'todoapp' }, header(), main())

	const footerElement = footer()

	if (todos.value.length > 0) {
		todoAppSection.appendChild(footerElement)
	} else {
		if (footerElement.parentNode === todoAppSection) {
			todoAppSection.removeChild(footerElement)
		}
	}

	todos.subscribe(() => {
		if (todos.value.length > 0) {
			todoAppSection.appendChild(footerElement)
		} else {
			if (footerElement.parentNode === todoAppSection) {
				todoAppSection.removeChild(footerElement)
			}
		}
	})

	return [todoAppSection, info()]
}

const clearCompleted = () => {
	const newTodos = todos.value.filter((todo) => !todo.checked)
	todos.value = newTodos
}

const counter = () => {
	return miniframework.strong({}, String(completedCount.value))
}

const edit = (value) => {
	return miniframework.input({ id: 'edit', class: 'edit', value: value })
}

function handleEdit(event, index) {
	let editorRemoved = false

	const liElement = event.target.closest('li')
	liElement.classList.add('editing')

	const editor = edit(todos.value[index].name)
	liElement.append(editor)
	editor.focus()

	const onBlur = () => {
		if (editorRemoved) return
		const newValue = editor.value.trim()
		if (newValue) {
			const newTodos = [...todos.value]
			newTodos[index].name = newValue
			todos.value = newTodos
		}
		liElement.classList.remove('editing')
		editorRemoved = true
		editor.removeEventListener('blur', onBlur)
		editor.removeEventListener('keydown', onKeyDown)
		editor.remove()
	}

	const onKeyDown = (e) => {
		if (editorRemoved) return
		if (e.key === 'Enter' || e.key === 'Escape') {
			editorRemoved = true
			const newValue = editor.value.trim()
			if (newValue) {
				const newTodos = [...todos.value]
				newTodos[index].name = newValue
				todos.value = newTodos
			}
			liElement.classList.remove('editing')
			editor.removeEventListener('blur', onBlur)
			editor.removeEventListener('keydown', onKeyDown)
			editor.remove()
		}
	}

	editor.addEventListener('blur', onBlur)
	editor.addEventListener('keydown', onKeyDown)
}

function toggleAllTasks() {
	const allChecked = todos.value.every((todo) => todo.checked)
	const newTodos = todos.value.map((todo) => ({
		...todo,
		checked: !allChecked,
	}))

	todos.value = newTodos
}

function updateTodo(id, changes) {
	const newTodos = todos.value.map((todo) => {
		return todo.id === id ? { ...todo, ...changes } : todo
	})
	todos.value = newTodos
}

function toggleCompleted(e, id) {
	const todo = todos.value.find((t) => t.id === id)
	if (todo) {
		todo.checked = e.target.checked
		todos.value = [...todos.value]
	}
}

function destroyTodo(e, id) {
	todos.value = todos.value.filter((t) => t.id !== id)
}

const keyFn = (element) => {
	return element.id
}

function updateCompletedCount() {
	completedCount.value = todos.value.filter((todo) => !todo.checked).length
}

const router = miniframework.router(container)
router.registerRoute('/', ToDoApp)
router.registerRoute('/active', ToDoApp)
router.registerRoute('/completed', ToDoApp)
router.navigateTo()
