# Distribution

rightui ships one source package, `@rightui/ui`. It contains Contract components, the shared Tamber theme, font assets and licenses. Exact renders those components; application data logic can be TypeScript or Rust. It is not a JavaScript widget runtime or a Rust widget crate.

## Why one package

[shadcn's CLI](https://ui.shadcn.com/docs/cli) selects and copies component source into an application, together with the required dependencies. Its registry distinguishes [npm dependencies from other registry items](https://ui.shadcn.com/docs/registry/registry-item-json). This is not a separate npm package for every styled component; shared helper and primitive packages can coexist with source distribution.

rightui currently keeps components in one versioned package. Shared primitives and tokens update together, and consumers import the public Contract names they use. Splitting every component into its own release would add dependency/version coordination without demonstrated runtime savings.

At the pinned Exact revision, the source resolver traverses imported files, including a barrel's reexports. Expansion starts at the selected root view, so loading a source file does not imply rendering all its components. This does **not** establish complete tree shaking of styles, resource declarations, fonts or assets. Separate entry points such as `@rightui/ui/button` could reduce the compiler's import graph in the future without creating separate packages; they are not available today.

The relevant implementation is in Exact's [source loader](https://github.com/expo/exact/blob/53426cf02bf986a5e781abc4f953d79989c6dc05/contract/cli/src/sources.rs) and [component expansion](https://github.com/expo/exact/blob/53426cf02bf986a5e781abc4f953d79989c6dc05/contract/syntax/src/inline.rs). No bundle-size or frame-rate guarantee follows from the package layout alone.

## Install today

Install the public `@rightui/ui` beta from npm as described in [Installation](INSTALLATION.md). Bun, npm, pnpm and Yarn use the same registry. The validated consumer path uses Bun 1.4.2. No GitHub access is needed. Immutable `.tgz` archives remain an alternative for offline distribution.

Manual source installation means extracting the **entire** package and installing its directory as a `file:` dependency. Keep its `package.json`, every relative Contract dependency, `ui.tamber`, assets and licenses. Copying one component file alone does not preserve its dependencies or token namespace. Register the included font as described in Installation.

## Publishing

The npm registry hosts packages. npm, pnpm, Yarn and Bun are clients; publishing with pnpm can still publish to the npm registry. See [npm's scoped package guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/) and [pnpm publish](https://pnpm.io/cli/publish).

Before a maintainer publishes, verify ownership or publish permission for the **npm `@rightui` scope**, authentication, package contents and the release checks in [Versioning](VERSIONING.md). The GitHub organization `rightui-dev` does not establish npm scope ownership.

After explicit publication authorization, from `packages/ui`:

```sh
npm publish --access public --tag beta
```

Keep releases on the beta channel. Do not publish `latest` or a stable version under the current policy. Consumers should pin a specific published beta and commit their lockfile. The beta channel can be used to discover the newest preview. Update the website's commands only after confirming the registry release.
