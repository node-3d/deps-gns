{
	'variables': {
		'dep_bin': '<!(node -p "require(\'@node-3d/deps-gns\').bin")',
		'dep_include': '<!(node -p "require(\'@node-3d/deps-gns\').include")',
		'bin': '<!(node -p "require(\'@node-3d/addon-tools\').getBin()")',
	},
	'targets': [{
		'target_name': 'consumer',
		'sources': ['consumer.cpp'],
		'include_dirs': ['<(dep_include)'],
		'library_dirs': ['<(dep_bin)'],
		'conditions': [
			['OS=="linux"', { 'libraries': ["-Wl,-rpath,'$$ORIGIN/../../node_modules/@node-3d/deps-gns/<(bin)'", '<(dep_bin)/libGameNetworkingSockets.so'] }],
			['OS=="mac"', { 'libraries': ['-Wl,-rpath,@loader_path/../../node_modules/@node-3d/deps-gns/<(bin)', '<(dep_bin)/libGameNetworkingSockets.dylib'] }],
			['OS=="win"', { 'libraries': ['GameNetworkingSockets.lib'] }],
		],
	}],
}
