# use-svelte-anywhere

Build your web component for any frameworks with svelte

## What is this?

use-svelte-anywhere is a project that started from a story I was working on during work. We want to slowly transition the project from Angular js to svelte, and we decided to do that with creating web components with svelte and use them in Angular js. The project includes a workflow that we are using to build web components and bundle them into the larger project. It contains configuration files and templates that allows you to easily build upon and create your own web component for any frameworks.

## What can a custom svelte component do?

It's just like a html element, the svelte component you build supports props and events, and any other features that a standard HTML element would support.

## Why would I use svelte to build a web component?

The performance features of svelte makes it perfect to build standalone web components. Once you have bundled the component, you just need to import the output file on client side. No extra settings and imports will be needed and the component works super fast. Besides, it feels really good to write svelte :)

## How would this project help me to build web component with svelte?

Although svelte is perfect for building web components, some of its limits with the [custom element api](https://svelte.dev/docs#run-time-custom-element-api) could be quite pain in the ass. In addition, if you need to use it in some legacy frameworks or pure vanilla js, there is some tricks you need to put with building config and the way you import some libraries. We have stepped onto countless miseries trying to figure out how to build a working svelte component that can be used on Angular JS 3(Yes! We are using Angular JS 3) This project allows you to:

1. Write ES6 code, run on ES5 projects
2. Support Internet Explorer
3. Optimized code size
4. Properly import css file(even if you import some ui library like bootstrap)
5. A Svelte playground to test your code with the svelte goodies
6. An Angular js playground to see if your code works on AngularJs 1.8 with example of using ng- with the svelte components
7. Templates that shows you how to configure a custom element, pass a function, etc.

## Project structure

```
use-svelte-anywhere
|
|--app
|--package
   |--SvelteComponents
      |--src
        |--lib //store all components
        |--routes~~
           |--+page.svelte //svelte playground
        |--main.js //entrypoint that vite.config.js uses to build the components
      |--vite.config.js
      |--package.json
      
```

## Developing

```bash
cd package/SvelteComponents
npm install #or pnpm install

#Svelte Playground
npm run dev -- --open

#Angular js Playground
explorer.exe ../../app/index.html #or open ../../app/index.html if you are on Mac or Linux

```

## Building

1. Configure location of @import styles.css in each components
2. Go to `vite.config.js` and set `outDir`
3. Run:
```bash
npm run build
```
4. Get bundle.js and styles.css and place in the desired location of your project or publish it as a library
