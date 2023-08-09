# uimf-svelte

## What is this?

TL;DR

uimf-svelte is a uimf component library built with svelte and bootstrap, you can use it to automatically build your frontend with Uimf.

uimf-svelte is a svelte implementation of uimf components that can be created by metadata configs from the backend service. All components are created by [svelte](https://svelte.dev/) and using [Bootstrap](https://getbootstrap.com/) for styles. This combination granted this project small size and great compatibility with any environments(thanks to svelte and vite), and Bootstrap gives it a clean and modern look(with full bootstrap customization ability). 

## Why would I use it?

With this library, you don't have to write any frontend code for your project(but if you want you can still write!). All you need is a backend with Api documented with Uimf Attributes, and that's it.

## Getting Started
```
git clone https://github.com/UNOPS/uimf-svelte.git
cd uimf-svelte
npm install
npm run build
```

The above commands will generate `bundle.js` and `styles.css`. Simply drag these files into your project and import it. Then you can freely create components in your project.
