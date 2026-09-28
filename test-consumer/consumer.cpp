#include <node_api.h>
#include <steam/steamnetworkingsockets.h>

napi_value probe(napi_env env, napi_callback_info) {
	napi_value result;
	SteamNetworkingErrMsg error;
	const bool initialized = GameNetworkingSockets_Init(nullptr, error);
	if (initialized) {
		GameNetworkingSockets_Kill();
	}
	napi_get_boolean(env, initialized, &result);
	return result;
}

napi_value init(napi_env env, napi_value exports) {
	napi_value function;
	napi_create_function(env, "probe", NAPI_AUTO_LENGTH, probe, nullptr, &function);
	napi_set_named_property(env, exports, "probe", function);
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
