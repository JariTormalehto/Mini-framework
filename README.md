# About framework:

 This framework allows you to create html tags in javascript without createElement prefix.


## framework.js

### This contains core functions of the framework.

Here we use render to render a component into a target HTML element.

createElement is used to create an HTML element with the given tags.

bindToDOM binds a state to a DOM element, updating the element when the state changes.

createState creates a state object that can be used to manage state in the application.

## router.js

### contains a router for handling navigation withing application.

registerRoute registers a handler function for a given path.

notFoundHandler registers a handler function to be called when router navigates to a path that hasn't been registered.

navigateTo navigates to the current path in the window's location, calling the appropriate handler and rendering its output.

## How to run the website

Inside your terminal, install http-server via command line ``` npm install --global http-server ```

Next in terminal type ``` http-server ```

Website will be served at ```localhost:8080```

Or use your preferred live server.



## Created by

### JT, IP
