import * as fw from './elements.js'
import Router, { isValidHTMLElement} from './router.js'

const router = Router

export function render(target, component) {
	if (!isValidHTMLElement(target)) throw new Error(`${target} is not a valid HTML element`)
	target.innerHTML = ''

	const elements = component()
	if (Array.isArray(elements)) {
		elements.forEach((element) => {
			if (isValidHTMLElement(element)) {
				target.appendChild(element)
			}
		})
	} else if (isValidHTMLElement(elements)) {
		target.appendChild(elements)
	}
}

export const createElement = (tag, attrs = {}, ...children) => {
	const fw = document.createElement(tag)
	for (const [key, value] of Object.entries(attrs)) {
		if (key.startsWith('on')) {
			const eventName = key.slice(2).toLowerCase()
			fw.addEventListener(eventName, value)
		} else fw.setAttribute(key, value)
	}

	if (tag === 'a' && attrs['data-use-router']) {
		fw.addEventListener('click', (e) => {
			e.preventDefault()
			history.pushState(null, '', attrs.href)
			const navigateEvent = new Event('navigate')
			window.dispatchEvent(navigateEvent)
		})
	}

	children.forEach((child) => {
		if (typeof child === 'string') {
			fw.appendChild(document.createTextNode(child))
		} else if (child instanceof Node) {
			fw.appendChild(child)
		}
	})
	return fw
}

const bindToDOM = (getter, state, keyFn) => {
	let element = getter()
	if (!element) {
		element = document.createComment('')
	}

	const keyMap = new Map()

	state.subscribe(() => {
		const newElement = getter()
		if (!newElement || !newElement.children) return

		const newChildren = Array.from(newElement.children)
		const newKeyMap = new Map()

		newChildren.forEach((child) => {
			const key = keyFn(child)
			const existingChild = keyMap.get(key)
			if (existingChild) {
				existingChild.checked = child.checked
				existingChild.classList = child.classList
			} else {
				newKeyMap.set(key, child)
			}
		})

		element.replaceWith(newElement)
		element = newElement
		keyMap.clear()

		for (const [key, child] of newKeyMap) {
			keyMap.set(key, child)
		}
	})

	return element
}

const createState = (initialValue) => {
	let value = initialValue
	let previousValue = null
	const listeners = []

	return {
		get value() {
			return value
		},
		set value(newValue) {
			previousValue = value
			value = newValue
			listeners.forEach((listener) => listener(value, previousValue))
		},
		subscribe(listener) {
			listeners.push(listener)
			return () => {
				const index = listeners.indexOf(listener)
				listeners.splice(index, 1)
			}
		},
		get previousValue() {
			return previousValue
		},
	}
}

const miniframework = {
	render,
	createElement,
	createState,
	router,
	bindToDOM,
	...fw,
}
export default miniframework
