# Password Generator

![Banner representing the Password Generator](https://raw.githubusercontent.com/sebastienrousseau/password-generator/master/assets/password-generator-logo.svg)

A fast, simple and powerful open-source utility tool for generating strong, unique and random passwords. Password Generator is free to use as a secure password generator on any computer, phone, or tablet.

[![Getting Started](https://raw.githubusercontent.com/sebastienrousseau/password-generator/master/assets/button-primary.svg)](#installation)
[![Download the Password Generator Tool v1.0.6](https://raw.githubusercontent.com/sebastienrousseau/password-generator/master/assets/button-secondary.svg)](https://github.com/sebastienrousseau/password-generator/archive/refs/tags/1.0.6.zip)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0acb169c95e443729551979e0fd86eaf)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/password-generator&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/@sebastienrousseau/password-generator.svg?style=flat&color=success)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![Release Notes](https://img.shields.io/badge/release-notes-success.svg)](https://github.com/sebastienrousseau/password-generator/releases/)
[![npm](https://img.shields.io/npm/dm/password-generator.svg?style=flat)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-success.svg?style=flat)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsebastienrousseau%2Fpassword-generator.svg?type=small)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsebastienrousseau%2Fpassword-generator?ref=badge_small)

## 🔧 Installation

### From NPM or YARN

To install the Password Generator Tool, use either npm or yarn as follows:

-   `npm i @sebastienrousseau/password-generator`
-   `yarn add @sebastienrousseau/password-generator`

### From GitHub

Clone the main repository to get all source files including build scripts: `git clone https://github.com/sebastienrousseau/password-generator.git`

## ❓ What's included

Within the download you'll find all the password generator source files grouped into the _dist_ folder.

You'll see something like this:

```shell
.
├── COPYRIGHT
├── LICENSE
├── Makefile
├── README.md
├── Report.txt
├── index.js
├── package.json
└── src
    ├── dictionaries
    │   ├── adjectives.json
    │   ├── adverbs.json
    │   ├── animals.json
    │   ├── cars.json
    │   ├── cities.json
    │   ├── common.json
    │   ├── countries.json
    │   ├── dinosaurs.json
    │   ├── emoji.json
    │   ├── encouraging.json
    │   ├── ergative.json
    │   ├── fruits.json
    │   ├── gemstones.json
    │   ├── hazards.json
    │   ├── instruments.json
    │   ├── lovecraft.json
    │   ├── metals.json
    │   ├── music.json
    │   ├── nouns.json
    │   ├── prepositions.json
    │   ├── shakespeare.json
    │   ├── sports.json
    │   ├── strange.json
    │   ├── vegetables.json
    │   └── winds.json
    ├── lib
    │   ├── base64-password.js
    │   ├── memorable-password.js
    │   └── strong-password.js
    └── utils
        ├── README.md
        ├── randomConsonant.js
        ├── randomNumber.js
        ├── randomSyllable.js
        ├── randomVowel.js
        ├── toCamelCase
        │   ├── README.md
        │   └── toCamelCase.js
        ├── toCharArray
        │   ├── README.md
        │   └── toCharArray.js
        ├── toKebabCase
        │   ├── README.md
        │   └── toKebabCase.js
        ├── toSnakeCase
        │   ├── README.md
        │   └── toSnakeCase.js
        └── toTitleCase
            ├── README.md
            └── toTitleCase.js

9 directories, 50 files
```

## 💿 Usage

### From the CLI

```shell
node .
```

Displays the following help menu

```shell
Usage: password-generator [options]

A fast, simple and powerful open-source utility tool for generating strong, unique and random passwords

Options:
  -v, --version              output the current version
  -t, --type <type>          specify a password type (default: "base64, memorable or strong")
  -l, --length <numbers>     specify a length for each iteration
  -i, --iteration <numbers>  specify a number of iteration
  -s, --separator <char>     specify a character for the separator
  -h, --help                 display help for command
```

### From Node.js

```shell
var generatePassword = require('password-generator');
```

### From the Browser

```shell
<script src="<https://raw.githubusercontent.com/sebastienrousseau/password-generator/master/src/bin/password-generator.js>" type="text/javascript"></script>
```

## 🔐 Password options

### Base64 password

#### Generating a random base64 password using yarn

```shell
yarn start -t base64 -l 8 -i 4 -s -
```

#### Generating a random base64 password using node

```shell
node . -t base64 -l 8 -i 4 -s -
```

#### Generating a random base64 password calling the base64Password function

```shell
node dist/src/lib/base64-password.js -t base64 -l 8 -i 4 -s -
```

### Strong password

#### Generating a random strong password using yarn

```shell
yarn start -t strong -l 8 -i 4 -s -
```

#### Generating a random strong password using node

```shell
node . -t strong -l 8 -i 4 -s -
```

#### Generating a random strong password calling the strongPassword function

```shell
node dist/src/lib/strong-password.js -t base64 -l 8 -i 4 -s -  
```

### Memorable password

#### Generating a random memorable password using yarn

```shell
yarn start -t memorable -i 4 -s -
```

#### Generating a random memorable password using node

```shell
node . -t memorable -i 4 -s -
```

#### Generating a random memorable password calling the memorablePassword function

```shell
node dist/src/lib/memorable-password.js -t base64  -i 4 -s -
```

## 🚥 Semantic Versioning Policy

For transparency into our release cycle and in striving to maintain backward compatibility, `password-generator` follows [semantic versioning](http://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

## ✅ Changelog

-   [GitHub Releases](https://github.com/sebastienrousseau/password-generator/releases)

## ❤️ Contributing

Please read carefully through our [Contributing Guidelines](https://github.com/sebastienrousseau/password-generator/blob/master/.github/CONTRIBUTING.md) for further details on the process for submitting pull requests to us.

Development Tools

-   `yarn build` runs build.
-   `yarn clean` removes the coverage result of npm test command.
-   `yarn coverage` shows the coverage result of npm test command.
-   `yarn lint` run ESLint.
-   `yarn lint-fix` instructs ESLint to try to fix as many issues as possible..
-   `yarn test` runs tests and measures coverage.

## 📖 Rules

We are committed to preserving and fostering a diverse, welcoming community. Please read our [Code of Conduct](https://github.com/sebastienrousseau/password-generator/blob/master/.github/CODE-OF-CONDUCT.md).

## ⭐️ Our Values

-   We believe perfection must consider everything.
-   We take our passion beyond code into our daily practices.
-   We are just obsessed about creating and delivering exceptional solutions.

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/sebastienrousseau/password-generator/blob/master/LICENSE) file for details

## 🏢 Acknowledgements

[The Password Generator Tool](https://password-generator.pro) is beautifully crafted by these people and a bunch of awesome [contributors](https://github.com/sebastienrousseau/password-generator/graphs/contributors)

| Contributors                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- |
| [![Sebastien Rousseau](https://avatars0.githubusercontent.com/u/1394998?s=117)](https://sebastienrousseau.co.uk) |
| [Sebastien Rousseau](https://github.com/sebastienrousseau)                                                       |

Made with ❤ in London.
