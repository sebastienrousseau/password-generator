<!-- markdownlint-disable MD033 MD041 -->

<img
  src="https://kura.pro/password-generator-pro/images/logos/password-generator-pro.webp"
  alt="Password Generator Logo"
  width="261"
  align="right"
/>

<!-- markdownlint-enable MD033 MD041 -->

# Password Generator

A fast, simple, and powerful open-source utility tool for generating strong, unique, and random passwords. The Password Generator supports various types of passwords including base64-encoded, memorable, and complex strong passwords. It is designed to be a versatile tool for both personal and enterprise needs, ensuring that all users have access to high-security password options. Password Generator is free to use as a secure password generator on any computer, phone, or tablet.

[![Getting Started](https://kura.pro/common/images/buttons/button-primary.svg)](#installation)
[![Download the Password Generator Tool v1.1.4](https://kura.pro/common/images/buttons/button-secondary.svg)](https://github.com/sebastienrousseau/password-generator/archive/refs/tags/1.1.4.zip)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0acb169c95e443729551979e0fd86eaf)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/password-generator&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/@sebastienrousseau/password-generator.svg?style=flat&color=success)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![Release Notes](https://img.shields.io/badge/release-notes-success.svg)](https://github.com/sebastienrousseau/password-generator/releases/)
[![npm](https://img.shields.io/npm/dm/password-generator.svg?style=flat)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-success.svg?style=flat)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsebastienrousseau%2Fpassword-generator.svg?type=small)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsebastienrousseau%2Fpassword-generator?ref=badge_small)

## Features

-   **Base64 Passwords**: Generate passwords with base64 encoding for a balance of security and usability.
-   **Memorable Passwords**: Create passwords using a combination of memorable words, making them easier to remember while maintaining security.
-   **Strong Passwords**: Produce highly secure passwords with customizable length and complexity to meet the highest security standards.
-   **Customizable Options**: Specify password length, complexity, and word separators to tailor your password to your security needs.
-   **CLI Support**: Use the Password Generator directly from your terminal for quick and easy access.
-   **Clipboard Support**: Optionally copy the generated password directly to your clipboard with the `--clipboard` flag.
-   **Secure**: Built with security as a priority, using Node.js `crypto.randomInt()` and `crypto.randomBytes()` for cryptographically secure randomness.

## Installation

### From NPM or YARN

To install the Password Generator Tool, use either npm or yarn as follows:

-   `npm i @sebastienrousseau/password-generator`
-   `yarn add @sebastienrousseau/password-generator`

### From GitHub

Clone the main repository to get all source files including build scripts: `git clone https://github.com/sebastienrousseau/password-generator.git`

## Requirements

-   Node.js >= 18.0.0

## What's included

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
    ├── bin
    │   └── password-generator.js
    ├── dictionaries
    │   ├── common.json
    │   └── ... (24 themed dictionaries)
    ├── lib
    │   ├── base64-password.js
    │   ├── memorable-password.js
    │   └── strong-password.js
    └── utils
        ├── crypto.js
        ├── randomConsonant.js
        ├── randomNumber.js
        ├── randomSyllable.js
        ├── randomVowel.js
        └── strings.js
```

## Usage

### From the CLI

```shell
node index.js --help
```

Displays the following help menu:

```shell
Usage: password-generator [options]

A fast, simple and powerful utility for generating strong, unique and random passwords

Options:
  -t, --type <type>          password type (strong, base64, memorable)
  -l, --length <number>      length of each password chunk
  -i, --iteration <number>   number of password chunks or words
  -s, --separator <char>     separator between password chunks
  -c, --clipboard            copy the generated password to clipboard
  -h, --help                 display help for command
```

#### Examples

```shell
# Generate a strong password with 3 chunks of 12 characters
node index.js -t strong -l 12 -i 3 -s '-'

# Generate a base64 password with 4 chunks of 8 characters
node index.js -t base64 -l 8 -i 4 -s '.'

# Generate a memorable password with 4 words
node index.js -t memorable -i 4 -s '-'

# Generate and copy to clipboard
node index.js -t strong -l 16 -i 2 -s '-' --clipboard
```

### From Node.js (ES Modules)

```javascript
import { PasswordGenerator } from "@sebastienrousseau/password-generator";

// Generate a strong password
const strong = await PasswordGenerator({
  type: "strong",
  length: 12,
  iteration: 3,
  separator: "-",
});
console.log(strong); // e.g. "aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A"

// Generate a memorable password
const memorable = await PasswordGenerator({
  type: "memorable",
  iteration: 4,
  separator: "-",
});
console.log(memorable); // e.g. "Apple-Breeze-Castle-Diamond"

// Generate a base64 password
const base64 = await PasswordGenerator({
  type: "base64",
  length: 8,
  iteration: 3,
  separator: ".",
});
console.log(base64); // e.g. "aB3dEf+/.Kl2MnOp.tU4vWxYz"
```

## Password options

### Base64 password

```shell
# Using node
node index.js -t base64 -l 8 -i 4 -s '-'

# Using yarn
yarn start -t base64 -l 8 -i 4 -s '-'
```

### Strong password

```shell
# Using node
node index.js -t strong -l 8 -i 4 -s '-'

# Using yarn
yarn start -t strong -l 8 -i 4 -s '-'
```

### Memorable password

```shell
# Using node
node index.js -t memorable -i 4 -s '-'

# Using yarn
yarn start -t memorable -i 4 -s '-'
```

## Semantic Versioning Policy

For transparency into our release cycle and in striving to maintain backward compatibility, `password-generator` follows [semantic versioning](http://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

## Changelog

-   [GitHub Releases](https://github.com/sebastienrousseau/password-generator/releases)

## Contributing

Please read carefully through our [Contributing Guidelines](https://github.com/sebastienrousseau/password-generator/blob/master/.github/CONTRIBUTING.md) for further details on the process for submitting pull requests to us.

Development Tools

-   `pnpm build` runs build.
-   `pnpm clean` removes the coverage result of npm test command.
-   `pnpm coverage` shows the coverage result of npm test command.
-   `pnpm lint` run ESLint.
-   `pnpm lint:fix` instructs ESLint to try to fix as many issues as possible..
-   `pnpm test` runs tests and measures coverage.

## Rules

We are committed to preserving and fostering a diverse, welcoming community. Please read our [Code of Conduct](https://github.com/sebastienrousseau/password-generator/blob/master/.github/CODE-OF-CONDUCT.md).

## Our Values

-   We believe perfection must consider everything.
-   We take our passion beyond code into our daily practices.
-   We are just obsessed about creating and delivering exceptional solutions.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/sebastienrousseau/password-generator/blob/master/LICENSE) file for details

## Acknowledgements

[The Password Generator Tool](https://password-generator.pro) is beautifully crafted by these people and a bunch of awesome [contributors](https://github.com/sebastienrousseau/password-generator/graphs/contributors)

| Contributors |
|---------|
|[![Sebastien Rousseau](https://avatars0.githubusercontent.com/u/1394998?s=117)](https://sebastienrousseau.co.uk)|
|[Sebastien Rousseau](https://github.com/sebastienrousseau)|

Made with ❤ in London.
