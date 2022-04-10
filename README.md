# Password Generator Library

![Banner representing the Password Generator Library](./images/password-generator-logo.svg)

A fast, simple and powerful utility library for generating unique passwords to streamline your digital and mobile web development needs.

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/91039081c6b14e55b2cf6f4e6377f42e)](https://app.codacy.com/gh/sebastienrousseau/password-generator?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/password-generator&utm_campaign=Badge_Grade_Settings)
[![Getting Started](./images/button-primary.svg)](#installation)
[![Download the Password Generator Library v1.0.1](./images/button-secondary.svg)](https://github.com/sebastienrousseau/password-generator/archive/v1.0.1.zip)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0acb169c95e443729551979e0fd86eaf)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/password-generator&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/password-generator.svg?style=flat&color=success)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![Release Notes](https://img.shields.io/badge/release-notes-success.svg)](https://github.com/sebastienrousseau/password-generator/releases/)
[![License: MIT](https://img.shields.io/badge/License-MIT-success.svg?style=flat)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsebastienrousseau%2Fpassword-generator.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsebastienrousseau%2Fpassword-generator?ref=badge_shield)
[![npm](https://img.shields.io/npm/dm/password-generator.svg?style=flat)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)

## Table of Contents

- [Password Generator Library](#password-generator-library)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [From NPM or YARN](#from-npm-or-yarn)
    - [From GitHub](#from-github)
  - [What's included](#whats-included)
  - [base64 password](#base64-password)
  - [Complex password](#complex-password)
  - [Memorable password](#memorable-password)
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

-   `npm install password-generator`
-   `yarn add password-generator`

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

## base64 password

```shell
node ./bin/password-generator.js -t base64 -l 8 -i 4 -s - 
```

## Complex password

```shell
node ./bin/password-generator.js -t complex -l 8 -i 4 -s -
```

## Memorable password

```shell
node ./bin/password-generator.js -t memorable -i 4 -s -
```

### Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, Password Generator is maintained under the [Semantic Versioning](https://semver.org/) guidelines.

## Contributing

Please read carefully through our [Contributing Guidelines](https://github.com/sebastienrousseau/password-generator/blob/main/.github/CONTRIBUTING.md) for further details on the process for submitting pull requests to us.

### Code of Conduct

We are committed to preserving and fostering a diverse, welcoming community. Please read our [Code of Conduct](https://github.com/sebastienrousseau/password-generator/blob/main/.github/CODE_OF_CONDUCT.md).

### Our Values

-   We believe perfection must consider everything.
-   We take our passion beyond code into our daily practices.
-   We are just obsessed about creating and delivering exceptional solutions.

### Releases

-   See [Password Generator Release](https://github.com/sebastienrousseau/password-generator/releases) list.

### License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/sebastienrousseau/password-generator/blob/main/LICENSE) file for details

### Acknowledgements

[The Password Generator Library](https://password-generator.pro) is beautifully crafted by these people and a bunch of awesome [contributors](https://github.com/sebastienrousseau/password-generator/graphs/contributors)

| Contributors                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- |
| [![Sebastien Rousseau](https://avatars0.githubusercontent.com/u/1394998?s=117)](https://sebastienrousseau.co.uk) |
| [Sebastien Rousseau](https://github.com/sebastienrousseau)                                                       |

Made with ❤ in London. 
