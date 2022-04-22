# NAME

**Password Generator** - A fast, simple and powerful open-source utility tool for generating strong, unique and random passwords. The Password Generator is free to use as a secure password generator on any computer, phone, or tablet.

To learn more about the Password Generator, visit [https://password-generator.pro](https://password-generator.pro)

## SYNOPSIS

`password-generator  [init]  [-i]  [docs]  [-d]  [watch]  [-w]  [--no-generate]  [-n]  [--silent]  [-s]  [--version]  [-V]  [--verbose]  [-v]`

## DESCRIPTION

**Password Generator** creates strong, unique and random passwords as well as including additional rules and syntax geared toward authoring security.

In its default mode, ronn converts one or more input files to HTML or roff output files. The --roff, --html, and --fragment options dictate which output files are generated. Multiple format arguments may be specified to generate multiple output files. Output files are named after and written to the same directory as input files.

The --server and --man options change the output behavior from file generation to serving dynamically generated HTML manpages or viewing file as with man(1).

With no file arguments, ronn acts as simple filter. Ronn source text is read from standard input and roff output is written to standard output. Use the --html, --roff, and/or --fragment options to select the output format.

## OPTIONS

These options control whether output is written to file(s), standard output, or directly to a man pager.

-m, --man
Don't generate files, display files as if man(1) were invoked on the roff output file. This simulates default man behavior by piping the roff output through groff(1) and the paging program specified by the MANPAGER environment variable.

-S, --server
Don't generate files, start an HTTP server at <http://localhost:1207/> and serve dynamically generated HTML for the set of input files. A file named example.2.ronn is served as /example.2.html. There's also an index page at the root with links to each file.

The server respects the --style and document attribute options (--manual, --date, etc.). These same options can be varied at request time by giving them as query parameters: ?manual=FOO&style=dark,toc

NOTE: The builtin server is designed to assist in the process of writing and styling manuals. It is in no way recommended as a general purpose web server.

--pipe
Don't generate files, write generated output to standard output. This is the default behavior when ronn source text is piped in on standard input and no file arguments are provided.

Format options control the files ronn generates, or the output format when the --pipe argument is specified. When no format options are given, both --roff and --html are assumed.

-r, --roff
Generate roff output. This is the default behavior when no files are given and ronn source text is read from standard input.

-5, --html
Generate output in HTML format.

-f, --fragment
Generate output in HTML format but only the document fragment, not the header, title, or footer.

Document attributes displayed in the header and footer areas of generated content are specified with these options. (These values may also be set via the ENVIRONMENT.)

--manual=manual
The name of the manual this man page belongs to; manual is prominently displayed top-center in the header area.

--organization=name
The name of the group, organization, or individual responsible for publishing the document; name is displayed in the bottom-left footer area.

--date=date
The document's published date; date must be formatted YYYY-MM-DD and is displayed in the bottom-center footer area. The file mtime is used when no date is given, or the current time when no file is available.

HTML output can be customized through the use of CSS stylesheets:

--style=module[,module]...
The list of CSS stylesheets to apply to the document. Multiple module arguments may be specified, but must be separated by commas or spaces.

When module is a simple word, search for files named module.css in all directories listed in the RONN_STYLE environment variable, and then search internal styles.

When module includes a / character, use it as the full path to a stylesheet file.

Internal styles are man (included by default), toc, and 80c. See STYLES for descriptions of features added by each module.

Miscellaneous options:

-w, --warnings
Show troff warnings on standard error when performing roff conversion. Warnings are most often the result of a bug in ronn's HTML to roff conversion logic.

-W
Disable troff warnings. Warnings are disabled by default. This option can be used to revert the effect of a previous -w argument.

-v, --version
Show ronn version and exit.

EXAMPLES
Build roff and HTML output files and view the roff manpage using man(1):

$ ronn some-great-program.1.ronn
roff: some-great-program.1
html: some-great-program.1.html
$ man ./some-great-program.1
Build only the roff manpage for all .ronn files in the current directory:

$ ronn --roff *.ronn
roff: mv.1
roff: ls.1
roff: cd.1
roff: sh.1
Build only the HTML manpage for a few files and apply the dark and toc stylesheets:

$ ronn --html --style=dark,toc mv.1.ronn ls.1.ronn
html: mv.1.html
html: ls.1.html
Generate roff output on standard output and write to file:

$ ronn <hello.1.ronn >hello.1
View a ronn file in the same way as man(1) without building a roff file:

$ ronn --man hello.1.ronn
Serve HTML manpages at <http://localhost:1207/> for all *.ronn files under a man/ directory:

$ ronn --server man/*.ronn
$ open <http://localhost:1207/>

`npm install password-generator -g`

`password-generator init`

`password-generator`

`password-generator docs`

`password-generator watch`

## BUGS

Ronn is written in Ruby and depends on hpricot and rdiscount, extension libraries that are non-trivial to install on some systems. A more portable version of this program would be welcome.

## COPYRIGHT

Ronn is Copyright (C) 2009 Ryan Tomayko <http://tomayko.com/about>

Please report any bugs to <https://github.com/password-generator/password-generator>.

## LICENSE

Copyright (c) 2018, Dominik Wilkowski (GPL-3.0 License).

## SEE ALSO

node.js(1), react(1), static-site-generator(1)
