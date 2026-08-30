import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getBin } from '@node-3d/addon-tools';

const upstreamVersion = 'v1.6.0';
const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'source');
const build = path.join(root, 'build');
const include = path.join(root, 'include');
const bin = path.resolve(getBin());

const run = (command, args) => {
	const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
	if (result.status !== 0) {
		throw new Error(`${command} failed with status ${result.status ?? 'unknown'}.`);
	}
};

const copyLibraries = async (directory) => {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			await copyLibraries(entryPath);
		} else if (/^(?:lib)?GameNetworkingSockets\.(?:a|lib)$/u.test(entry.name)) {
			await cp(entryPath, path.join(bin, entry.name));
		}
	}
};

await rm(source, { recursive: true, force: true });
await rm(build, { recursive: true, force: true });
await rm(include, { recursive: true, force: true });
await rm(bin, { recursive: true, force: true });
await mkdir(bin, { recursive: true });

run('git', [
	'clone',
	'--depth',
	'1',
	'--branch',
	upstreamVersion,
	'https://github.com/ValveSoftware/GameNetworkingSockets.git',
	source,
]);

if (process.env.GNS_WINDOWS_ARM64 === '1') {
	const header = path.join(source, 'src', 'public', 'minbase', 'minbase_identify.h');
	const original = await readFile(header, 'utf8');
	const marker = '|| defined(__aarch64__) || defined(_XBOX)';
	if (!original.includes(marker)) {
		throw new Error(
			'GameNetworkingSockets endianness patch did not match the pinned upstream source.',
		);
	}
	await writeFile(
		header,
		original.replace(
			marker,
			'|| defined(__aarch64__) || defined(_M_ARM64) || defined(_M_ARM64EC) || defined(_XBOX)',
		),
	);
}

const cmakeArgs = [
	'-S',
	source,
	'-B',
	build,
	'-DBUILD_SHARED_LIB=OFF',
	'-DBUILD_STATIC_LIB=ON',
	'-DBUILD_EXAMPLES=OFF',
	'-DBUILD_TESTS=OFF',
	'-DENABLE_ICE=ON',
	'-DUSE_STEAMWEBRTC=OFF',
];
const vcpkgRoot = process.env.VCPKG_ROOT ?? process.env.VCPKG_INSTALLATION_ROOT;
if (vcpkgRoot) {
	cmakeArgs.push(
		`-DCMAKE_TOOLCHAIN_FILE=${path.join(vcpkgRoot, 'scripts', 'buildsystems', 'vcpkg.cmake')}`,
	);
}
if (process.env.GNS_CMAKE_OSX_ARCHITECTURES) {
	cmakeArgs.push(`-DCMAKE_OSX_ARCHITECTURES=${process.env.GNS_CMAKE_OSX_ARCHITECTURES}`);
}

run('cmake', cmakeArgs);
run('cmake', ['--build', build, '--config', 'Release', '--parallel']);
await cp(path.join(source, 'include'), include, { recursive: true });
await copyLibraries(build);
