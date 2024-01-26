# Node Admin with Express server

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/300px-Node.js_logo.svg.png" />
</p>

## Introduction

Provide a brief overview of your Node.js admin server, explaining its purpose and key features.

### First Time Set Up & Configuration

Create the directory:

```bash
mkdir node-admin
npm init -y
```

Install some dependencies:

```bash
npm i -D typescript ts-node nodemon

### Ignore this if you have installed typescript globally

npm i -g typescript
```

Typescript configuration:

```bash
tsc --init
```

Create a file called `nodemon.json` and copy this code

```json
{
    "ignore": [
      ".git",
      "node_modules/",
      "dist/",
      "coverage/"
    ],
    "watch": [
      "src/*"
    ],
    "ext": "js,json,ts"
  }
```

## Features

List the main features of your admin server. For example:
- User authentication and authorization
- CRUD operations for managing resources
- Logging and monitoring
- Order & Checkout

## Requirements

Outline the prerequisites and dependencies needed to run your admin server. For example:
- Node.js (version)
- npm or yarn
- Database (if applicable)

## Installation

Provide step-by-step instructions for installing and setting up the project locally. Include commands and any additional configurations. For example:

```bash
git clone https://github.com/andyrhman/node-ambassador.git
cd node-admin
npm install