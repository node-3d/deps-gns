# GameNetworkingSockets binaries and headers

This is part of the [Node3D](https://github.com/node-3d) project.

```bash
npm install @node-3d/deps-gns
```

`@node-3d/deps-gns` distributes the headers and static library needed to build
Node.js native addons against [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets).
It is a build dependency, not a JavaScript networking API.

- Platforms: Windows x64/ARM64, Linux x64/ARM64, macOS x64/ARM64.
- Upstream: GameNetworkingSockets **v1.6.0**.
- Linking: static (`GameNetworkingSockets.lib` on Windows and
  `libGameNetworkingSockets.a` on Linux/macOS).
- P2P/ICE: disabled. The package supplies direct client/server UDP transport;
  standalone P2P additionally requires signalling, STUN, and relay policy.

## Interface

```js
import depsGns, { bin, include } from '@node-3d/deps-gns';
```

`bin` and `include` are the platform-specific binary and header directories.
The default export contains both paths. Use them from a consumer's `binding.gyp`
through `@node-3d/addon-tools` path helpers.

## Binary origin

Release archives are built from the upstream v1.6.0 tag by this repository's
GitHub Actions workflows. The build uses OpenSSL and Protobuf through vcpkg and
publishes only the GameNetworkingSockets headers and static library.

The pinned upstream release does not recognize MSVC ARM64's `_M_ARM64` macro in
its endianness detection. The Windows ARM64 build applies a guarded source patch
that recognizes `_M_ARM64` and `_M_ARM64EC` as little-endian; it fails loudly if
the pinned upstream source changes.

The P2P/ICE build option is deliberately off. It does not affect direct UDP
client/server networking. Enabling P2P is a later consumer contract because it
requires a signalling provider and operational STUN/TURN decisions.

## Legal notice

GameNetworkingSockets is copyright Valve Corporation and is distributed under
the BSD 3-Clause license; a copy is included in
[GAMENETWORKINGSOCKETS_BSD](GAMENETWORKINGSOCKETS_BSD). The Node3D packaging
files are MIT-licensed under [LICENSE](LICENSE).
