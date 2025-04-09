# Task List 

>move into project area some time

# MOXI sdk

This is the behavior library for adding lifecycle methods to core PIXI entities.

It also provides a light framework for more accessible parts like loading assets, creating scenes, device event handling, rendering utilities. 

The idea is to use these in conjunction with PIXI.JS as it's still used directly as a framework for rendering to a WebGL canvas.

The mind set around this is 
- harness PIXI. yet, remain unobtrusive to PIXI features
- provide a middle layer for accessible device events and information
- grow it as needed, keep it minimal
- provide core independant elements that are loosely coupled; fundamentally adhering to SRP
- provide capabilities to the scene editor allowing one to create portable gaming bundles. 

# Scene Editor

This is the reason I'm building all this. I have a fascination with building editors and companions.

I wanted to build a simple in-browser IDE for making quick little 2D (for now) browser games. 

I'm hoping to provide some simple core features for easily creating pre-build entities (pre-fabs) and a scene editor

The MOXI sdk will provide capabilites of loading the scene, deserializing it and binding the object references.

Features planned
- intuitive scene editor where one can manipulate primitives, sprites, prefabs and other entities.
- ability to serialize the scene into a project file that can be de-serialized by MOXI.
- utilize PWA elements to provide a fast and close to a desktop experience
- allow for exporting to a portable bundle that can be loaded into a browser.
- provide an instant-play capability
- debug tools like a scene tree viewer
- eventually introduce in the code editor for quickly adding behaviors

that's a large paint stroke of features to give one an idea

The idea is that MOXI will work in tandem with this editor to enhance the capabilities to visually construct an experience, but, should allow one to just use MOXI sdk directly, no editor.

# Code Editor with CODE-4

This was a forcing function for me to explore creating a light sandbox code editor that
- had intuitive methods to supply external libraries that were made availble to the browser environment. 
- used a virtual file-system that allowed references to multiple files using import and require
- instantly transpiled TypeScript and JavaScript on-screne
- React based with intuitive props and docs 
- plugins and over-rides that allowed for custom components to be utilized.

I'll be enhancing it as I go using moxi-edit, but, 

I am also doing this as a base to learn to create a codeless editor with AI enhancements. 
