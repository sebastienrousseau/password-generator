# Password Generator

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0acb169c95e443729551979e0fd86eaf)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/password-generator&utm_campaign=Badge_Grade)

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
