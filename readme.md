# pfetch

pfetch is just like [pjax](https://github.com/defunkt/jquery-pjax) only it's built on top of the [Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API).

## Quickstart

To start using pfetch you'll first need to designate elements to contain whatever is returned from pfetch links whilst navigating your site, and you'll need to say which links should be pfetch links.

    <!DOCTYPE HTML>
	<html>
	<head>
	    <title>pfetch example</title>
	</head>
	<body>
	    <h1>pfetch</h1>
        <a href="about.html" data-pfetch="#pfetch-body">About</a>
        <div id="pfetch-body">
            This is the container that will contain whatever is returned from pfetch links.
        </div>
    </body>
    <footer>
        <script type="text/javascript" src="/js/pfetch.min.js"></script>
        <script type="text/javascript">
            pfetch.run();
        </script>
    </footer>

So let's clear a few things up. In the example above we want pfetch to fetch the URL `about.html`, and replace `#pfetch-body` with the content it gets back. The HTML response returned from clicking on the link will be filtered down to the element that matches the query selector `#pfetch-body`. If no element can be found then the full HTML response will be used.

But how does pfetch know to target `#pfetch-body` with the returned content? This is done using the `data-pfetch` attribute you can see above. The value of this attribute will correspond with the ID of the element we wish to update with the content returned from the link's URL.

In short: pfetch will listen to any links with the `data-pfetch` attribute, and use the attribute's value to update the element with the corresponding ID with the content returned from the URL.

But what if you don't specify a value for the `data-pfetch` attribute like below?

    <a href="/about.html" data-pfetch>About</a>

If you don't give the `data-pfetch` attribute a value, then pfetch will by default update the `body` with the content returned from the URL.

## Installation

You can install pfetch using curl. The polyfill version of pfetch uses the [fetch](https://github.com/github/fetch), and [promise](https://github.com/taylorhakes/promise-polyfill) polyfills for backwards compatability, whereas the lite version doesn't.

**Polyfill:**

    curl -LO https://raw.github.com/andrewpillar/pfetch/master/dist/pfetch.min.js

**Lite:**

    curl -LO https://raw.github.com/andrewpillar/pfetch/master/dist/pfetch-lite.min.js

## Compatability

The polyfill version of pfetch *should* work on Chrome, Firefox, Safari 6.1+, and Internet Explorer 10+, as long as those browsers have support for [pushState](http://caniuse.com/#search=pushstate).

The lite version of pfetch will work in any browser that natively supports the [Fetch API](http://caniuse.com/#search=fetch).

## Usage

You can simply use the default configuration of pfetch just by calling the `run` method.

    pfetch.run();

But if you would like, you can pass through your own configuration options.

    pfetch.run({
	    filterHtml: false,
        containerAttr: "data-custom-attr",
        defaultContainer: "#custom-container"
	});

**filterHtml**

The `filterHtml` option, when set to `true`, will take the HTML response and search for the target ID to splice into the container.

**containerAttr**

The `containerAttr` option is the name of the data attribute used to target pfetch links.

**defaultContainer**

The `defaultContainer` option is the selector for the default container to use if one is not specified in the container attribute of a pfetch link.

### Events

pfetch events can be listened to via the `on` method.

    pfetch.on("beforeReplace", function(container) {
		// Do stuff before the replace happens...
	});

**beforeReplace**

The `beforeReplace` event is fired before the content is replaced. The target container being updated is passed to the event's callback.

    pfetch.on("beforeReplace", function(container) {
		console.log("beforeReplace");
	});

**afterReplace**

The `afterReplace` event is fired after the content is replaced. The target container that was updated is passed to the event's callback.

    pfetch.on("afterReplace", function(container) {
		console.log("afterReplace");
	});

**beforeFetch**

The `beforeFetch` event is fired before fetching the URL. The body sent with the fetch request is passed to the event's callback.

    pfetch.on("beforeFetch", function(init) {
		init.headers["X-Pfetch"] = "true";
	});

### Server Side

There should be little, to no configuration required on the server side provided that the `filterHtml` option is set to `true`, as this will take care of filtering the content. Should you wish to do anything on the server side then it is recommended that you use the `beforeFetch` event to specify a custom header to be set on the request, which can then be checked on the server for any other actions you may wish to perform.
