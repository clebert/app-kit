# app-kit

[![][ci-badge]][ci-link] [![][version-badge]][version-link]
[![][license-badge]][license-link]

[ci-badge]: https://github.com/clebert/app-kit/workflows/CI/badge.svg
[ci-link]: https://github.com/clebert/app-kit
[version-badge]: https://badgen.net/npm/v/@clebert/app-kit
[version-link]: https://www.npmjs.com/package/@clebert/app-kit
[license-badge]: https://badgen.net/npm/license/@clebert/app-kit
[license-link]: https://github.com/clebert/app-kit/blob/master/LICENSE

This package contains shared components for my web apps:

- [bookmark.wtf](https://bookmark.wtf)
- [to-do.wtf](https://to-do.wtf)

**Please do not use this package. The API is neither stable nor documented.**

## Installation

Using `yarn`:

```
yarn add @clebert/app-kit
```

Using `npm`:

```
npm install @clebert/app-kit --save
```

## Development

### Publish A New Release

```
yarn release patch
```

```
yarn release minor
```

```
yarn release major
```

After a new release has been created by pushing the tag, it must be published
via the GitHub UI. This triggers the final publication to npm.

---

Copyright (c) 2020, Clemens Akens. Released under the terms of the
[MIT License](https://github.com/clebert/app-kit/blob/master/LICENSE).
