# Password Generator

![Banner representing the Password Generator Library](https://raw.githubusercontent.com/sebastienrousseau/password-generator/master/images/password-generator-logo.svg)

A fast, simple and powerful utility library for generating unique passwords to streamline your digital and mobile web development needs.

[![Getting Started](https://raw.githubusercontent.com/sebastienrousseau/password-generator/master/images/button-primary.svg)](#installation)
[![Download the Password Generator Library v1.0.3](https://raw.githubusercontent.com/sebastienrousseau/password-generator/master/images/button-secondary.svg)](https://github.com/sebastienrousseau/password-generator/archive/refs/tags/1.0.4.zip)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0acb169c95e443729551979e0fd86eaf)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/password-generator&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/@sebastienrousseau/password-generator.svg?style=flat&color=success)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![Release Notes](https://img.shields.io/badge/release-notes-success.svg)](https://github.com/sebastienrousseau/password-generator/releases/)
[![npm](https://img.shields.io/npm/dm/password-generator.svg?style=flat)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-success.svg?style=flat)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsebastienrousseau%2Fpassword-generator.svg?type=small)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsebastienrousseau%2Fpassword-generator?ref=badge_small)

## Table of Contents

- [Password Generator](#password-generator)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [From NPM or YARN](#from-npm-or-yarn)
    - [From GitHub](#from-github)
  - [What's included](#whats-included)
  - [Usage](#usage)
    - [From the CLI](#from-the-cli)
    - [From Node.js](#from-nodejs)
    - [From the Browser](#from-the-browser)
  - [Password options](#password-options)
    - [Generating a random base64 password](#generating-a-random-base64-password)
    - [Generating a strong password](#generating-a-strong-password)
    - [Generating a memorable password](#generating-a-memorable-password)
  - [Versioning](#versioning)
  - [Contributing](#contributing)
    - [Code of Conduct](#code-of-conduct)
    - [Our Values](#our-values)
    - [Releases](#releases)
    - [License](#license)
    - [Acknowledgements](#acknowledgements)

## Installation

### From NPM or YARN

To install the Password Generator, use either npm or yarn as follows:

- `npm i @sebastienrousseau/password-generator`
- `yarn add @sebastienrousseau/password-generator`

### From GitHub

Clone the main repository to get all source files including build scripts: `git clone https://github.com/sebastienrousseau/password-generator.git`

## What's included

Within the download you'll find all the password generator source files grouped into the _dist_ folder.

You'll see something like this:

```bash
.
├── COPYRIGHT
├── LICENSE
├── README.md
├── bin
│   └── password-generator.js
├── bower.json
├── dictionaries
│   ├── adjectives.json
│   ├── adverbs.json
│   ├── animals.json
│   ├── cars.json
│   ├── cities.json
│   ├── common.json
│   ├── countries.json
│   ├── dinosaurs.json
│   ├── emoji.json
│   ├── encouraging.json
│   ├── ergative.json
│   ├── fruits.json
│   ├── gemstones.json
│   ├── hazards.json
│   ├── instruments.json
│   ├── lovecraft.json
│   ├── metals.json
│   ├── music.json
│   ├── nouns.json
│   ├── prepositions.json
│   ├── shakespeare.json
│   ├── sports.json
│   ├── strange.json
│   ├── vegetables.json
│   └── winds.json
├── dist
├── lib
│   ├── base64-password.js
│   ├── complex-password.js
│   ├── memorable-password.js
│   └── title-case.js
├── package-lock.json
├── package.json
└── test
    └── test-title-case.js

5 directories, 37 files
```

## Usage

### From the CLI

```shell
node ./bin/password-generator.js
```

Displays the following help menu

```shell
Usage: password-generator [options]

Options:
  \-V, --version              output the version number
  \-t, --type <type>          Specify a type (base64, complex, memorable)
  \-l, --length <numbers>     Specify a length for each iteration
  \-i, --iteration <numbers>  Specify a number of iteration
  \-s, --separator <char>     Specify a character for the separator
  \-h, --help                 display help for command
```

### From Node.js

    var generatePassword = require('password-generator');

### From the Browser

    <script src="<https://raw.githubusercontent.com/sebastienrousseau/password-generator/master/bin/password-generator.js>" type="text/javascript"></script>

## Password options

### Generating a random base64 password

```shell
node ./bin/password-generator.js -t base64 -l 8 -i 4 -s - 
```

### Generating a strong password

```shell
node ./bin/password-generator.js -t complex -l 8 -i 4 -s -
```

### Generating a memorable password

```shell
node ./bin/password-generator.js -t memorable -i 4 -s -
```

## Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, Password Generator is maintained under the [Semantic Versioning](https://semver.org/) guidelines.

## Contributing

Please read carefully through our [Contributing Guidelines](https://github.com/sebastienrousseau/password-generator/blob/master/.github/CONTRIBUTING.md) for further details on the process for submitting pull requests to us.

### Code of Conduct

We are committed to preserving and fostering a diverse, welcoming community. Please read our [Code of Conduct](https://github.com/sebastienrousseau/password-generator/blob/master/.github/CODE-OF-CONDUCT.md).

### Our Values

- We believe perfection must consider everything.
- We take our passion beyond code into our daily practices.
- We are just obsessed about creating and delivering exceptional solutions.

### Releases

- See [Password Generator Release](https://github.com/sebastienrousseau/password-generator/releases) list.

### License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/sebastienrousseau/password-generator/blob/master/LICENSE) file for details

### Acknowledgements

[The Password Generator Library](https://password-generator.pro) is beautifully crafted by these people and a bunch of awesome [contributors](https://github.com/sebastienrousseau/password-generator/graphs/contributors)

| Contributors                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- |
| [![Sebastien Rousseau](https://avatars0.githubusercontent.com/u/1394998?s=117)](https://sebastienrousseau.co.uk) |
| [Sebastien Rousseau](https://github.com/sebastienrousseau)                                                       |

Made with ❤ in London.
