# GameNetworkingSockets binaries and headers

This is a part of [Node3D](https://github.com/node-3d) project.

[![NPM](https://badge.fury.io/js/@node-3d%2Fdeps-gns.svg)](https://badge.fury.io/js/@node-3d/deps-gns)
[![Lint](https://github.com/node-3d/deps-gns/actions/workflows/lint.yml/badge.svg)](https://github.com/node-3d/deps-gns/actions/workflows/lint.yml)
[![Test](https://github.com/node-3d/deps-gns/actions/workflows/test.yml/badge.svg)](https://github.com/node-3d/deps-gns/actions/workflows/test.yml)

```bash
npm install @node-3d/deps-gns
```

This dependency package distributes **GameNetworkingSockets 1.6.0**
binaries and headers through **npm** for **Node.js** addons.

- Platforms: Windows x64/ARM64, Linux x64/ARM64, macOS x64/ARM64.
- Library: GameNetworkingSockets shared transport library.

## Source And Build Notes

This package builds from the upstream
[GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets)
v1.6.0 source using CMake and vcpkg. The build provides the upstream shared
target: `GameNetworkingSockets.dll` and its `GameNetworkingSockets.lib` import
library on Windows, `libGameNetworkingSockets.so` on Linux, and
`libGameNetworkingSockets.dylib` on macOS. GNS's `_s` target is its static
library variant and is not shipped.

This exposes the custom-signalling and P2P/ICE configuration APIs without
shipping a WebRTC ICE backend. Direct client/server UDP networking is unchanged.
A consumer that wants NAT traversal must provide its own compatible ICE transport
or use a future package build that explicitly enables Google WebRTC.

Each platform `bin-*` directory contains the GNS shared library and any OpenSSL
or Protobuf shared-library dependencies it requires. Consumers link only GNS:
`GameNetworkingSockets.lib` on Windows or the GNS `.so`/`.dylib` on Linux/macOS.
The sibling dependency libraries are runtime implementation details; do not link
them from an addon. Google WebRTC libraries are not included because
`USE_STEAMWEBRTC=OFF`.

In `binding.gyp`, resolve `include` and `bin` exactly as other dependency
packages do, add `include` to `include_dirs`, add `bin` to `library_dirs`, and
link only the GNS import/shared library. Follow the same Linux/macOS rpath
pattern used by `@node-3d/image` and `@node-3d/glfw` so the addon can find the
dependency package's `bin-*` directory. On Windows, import this package before
loading the addon so `@node-3d/addon-tools` adds that directory to `PATH`.

Windows ARM64 requires a narrow, guarded source patch because the pinned upstream
release does not recognize MSVC's `_M_ARM64` / `_M_ARM64EC` macros in its
endianness detection. The build fails if that upstream source location changes,
rather than silently applying a patch to a different release.

### JS Interface

`index.js` exports the platform-specific `bin` and `include` paths through
`@node-3d/addon-tools`.

```cpp
#include <steam/steamnetworkingsockets.h>
```

Refer to [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets)
and its public headers for the native API.

## Legal notice

This software uses [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets),
which is legally used under the BSD 3-Clause license. A copy is included in the
[GAMENETWORKINGSOCKETS_BSD](GAMENETWORKINGSOCKETS_BSD) file.

The bundled OpenSSL and Protobuf dependency libraries are covered by the
[OPENSSL_LICENSE](OPENSSL_LICENSE) and [PROTOBUF_LICENSE](PROTOBUF_LICENSE)
files, respectively.

The rest of this package is MIT licensed.

Windows, Linux, and macOS binaries are built with
[GitHub Actions](https://github.com/node-3d/deps-gns/actions).

## Binary Origin

Release archives are built by this repository's public GitHub Actions workflows.

Attestations: https://github.com/node-3d/deps-gns/attestations

To verify a downloaded archive:

```bash
gh release download <tag> -R node-3d/deps-gns -p <platform>.gz
gh attestation verify <platform>.gz -R node-3d/deps-gns
```
