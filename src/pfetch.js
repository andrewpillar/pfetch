import Promise from "promise-polyfill";
import "whatwg-fetch";

const pfetch = {
	_config: {},
	_events: {},
	_state: null,
	_defaultConfig: {
		filterHtml: true,
		containerAttr: "data-pfetch",
		defaultContainer: "body"
	},

	on: function(eventName, handler) {
		this._events[eventName] = handler;
	},

	run: function(config = {}) {
		this._loadConfig(config);
		this._registerEvents(document);

		window.onpopstate = this._handlePopState.bind(this);

		if ( ! this._state) {
			this._state = {
				url: window.location.href,
				title: document.title,
				fragment: document.body.innerHTML,
				container: "body",
			};

			window.history.replaceState(this._state, document.title);
		}
	},

	// Create an HTML element so we can use the DOM API to easily select the
	// part of the DOM we're going to splice in.
	_createHtmlElement: function(html) {
		const element = document.createElement("html");

		element.innerHTML = html;

		return element;
	},

	_fire: function(eventName, args) {
		const callback = this._events[eventName]

		if (callback) {
			callback(...args);
		}
	},

	_getContainer: function(link) {
		let container = link.getAttribute(this._config.containerAttr);

		if ( ! container) {
			container = this._config.defaultContainer;
		}

		return container;
	},

	// Get section of the given DOM element that we want to splice into the
	// page using the given selector. If the DOM element cannot be found then
	// the full DOM element will be returned.
	_getFragment: function(element, selector) {
		if (this._config.filterHtml) {
			let fragment = element.querySelector(selector);

			if ( ! fragment) {
				return element;
			}

			return fragment;
		}

		return element;
	},

	_getTitle: function(element) {
		const titleNode = element.getElementsByTagName("title")[0];

		if ( ! titleNode) {
			return document.title;
		}

		return titleNode.innerText;
	},

	_handleClick: function(e) {
		e.preventDefault();

		const link = e.target.closest('a');
		const href = link.href;

		const init = {
			method: "GET",
			headers: {
				"Content-Type": "text/html"
			}
		};

		this._fire("beforeFetch", [init]);

		if (init.method == "GET" || init.method == "HEAD") {
			delete init.body;
		}

		fetch(href, init).then((response) => {
			this._fire("afterFetch", [response]);

			const contentType = response.headers.get("Content-Type");

			if (contentType.indexOf("text/html") == -1) {
				return null;
			}

			return response.text();
		}).then((html) => {
			if (html) {
				const container = this._getContainer(link);
				const element = this._createHtmlElement(html);

				const title = this._getTitle(element);
				const fragment = this._getFragment(element, container);

				this._fire("beforeReplace", [fragment]);

				this._replaceContent(container, title, fragment.innerHTML);

				this._fire("afterReplace", [fragment]);

				this._state = {
					url: href,
					title: title,
					fragment: document.body.innerHTML,
					container: "body"
				};

				window.history.pushState(this._state, title, href);
			}
		});
	},

	_handlePopState: function(e) {
		const state = e.state;

		this._replaceContent(state.container, state.title, state.fragment);
	},

	_loadConfig: function(config) {
		const keys = Object.keys(config);
		const loadedConfig = this._defaultConfig;

		for (let i = 0; i < keys.length; i++) {
			const value = config[keys[i]];

			if (keys[i] in loadedConfig) {
				loadedConfig[keys[i]] = value;
			}
		}

		this._config = loadedConfig;
	},

	_registerEvents: function(element) {
		const selector = "a[" + this._config.containerAttr + "]";
		const links = element.querySelectorAll(selector);

		for (let i = 0; i < links.length; i++) {
			links[i].addEventListener("click", this._handleClick.bind(this));
		}
	},

	_replaceContent: function(container, title, fragment) {
		const containerElement = document.querySelector(container);

		document.title = title;
		containerElement.innerHTML = fragment;

		this._registerEvents(containerElement);
	}
};

window.pfetch = pfetch;
