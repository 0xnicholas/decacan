(function(factory) {
    typeof define === "function" && define.amd ? define(factory) : factory();
})((function() {
    "use strict";
    class GenericError extends Error {
        constructor(error, error_description) {
            super(error_description);
            this.error = error;
            this.error_description = error_description;
            Object.setPrototypeOf(this, GenericError.prototype);
        }
        static fromPayload({error: error, error_description: error_description}) {
            return new GenericError(error, error_description);
        }
    }
    class MissingRefreshTokenError extends GenericError {
        constructor(audience, scope) {
            super("missing_refresh_token", `Missing Refresh Token (audience: '${valueOrEmptyString(audience, [ "default" ])}', scope: '${valueOrEmptyString(scope)}')`);
            this.audience = audience;
            this.scope = scope;
            Object.setPrototypeOf(this, MissingRefreshTokenError.prototype);
        }
    }
    function valueOrEmptyString(value, exclude = []) {
        return value && !exclude.includes(value) ? value : "";
    }
    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
    }
    typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    const stripUndefined = params => Object.keys(params).filter((k => typeof params[k] !== "undefined")).reduce(((acc, key) => Object.assign(Object.assign({}, acc), {
        [key]: params[key]
    })), {});
    const createQueryParams = _a => {
        var {clientId: client_id} = _a, params = __rest(_a, [ "clientId" ]);
        return new URLSearchParams(stripUndefined(Object.assign({
            client_id: client_id
        }, params))).toString();
    };
    const fromEntries = iterable => [ ...iterable ].reduce(((obj, [key, val]) => {
        obj[key] = val;
        return obj;
    }), {});
    let refreshTokens = {};
    const cacheKey = (audience, scope) => `${audience}|${scope}`;
    const cacheKeyContainsAudience = (audience, cacheKey) => cacheKey.startsWith(`${audience}|`);
    const getRefreshToken = (audience, scope) => refreshTokens[cacheKey(audience, scope)];
    const setRefreshToken = (refreshToken, audience, scope) => refreshTokens[cacheKey(audience, scope)] = refreshToken;
    const deleteRefreshToken = (audience, scope) => delete refreshTokens[cacheKey(audience, scope)];
    const wait = time => new Promise((resolve => setTimeout(resolve, time)));
    const formDataToObject = formData => {
        const queryParams = new URLSearchParams(formData);
        const parsedQuery = {};
        queryParams.forEach(((val, key) => {
            parsedQuery[key] = val;
        }));
        return parsedQuery;
    };
    const updateRefreshTokens = (oldRefreshToken, newRefreshToken) => {
        Object.entries(refreshTokens).forEach((([key, token]) => {
            if (token === oldRefreshToken) {
                refreshTokens[key] = newRefreshToken;
            }
        }));
    };
    const checkDownscoping = (scope, audience) => {
        const findCoincidence = Object.keys(refreshTokens).find((key => {
            if (key !== "latest_refresh_token") {
                const isSameAudience = cacheKeyContainsAudience(audience, key);
                const scopesKey = key.split("|")[1].split(" ");
                const requestedScopes = scope.split(" ");
                const scopesAreIncluded = requestedScopes.every((key => scopesKey.includes(key)));
                return isSameAudience && scopesAreIncluded;
            }
        }));
        return findCoincidence ? true : false;
    };
    const messageHandler = async ({data: {timeout: timeout, auth: auth, fetchUrl: fetchUrl, fetchOptions: fetchOptions, useFormData: useFormData, useMrrt: useMrrt}, ports: [port]}) => {
        let headers = {};
        let json;
        let refreshToken;
        const {audience: audience, scope: scope} = auth || {};
        try {
            const body = useFormData ? formDataToObject(fetchOptions.body) : JSON.parse(fetchOptions.body);
            if (!body.refresh_token && body.grant_type === "refresh_token") {
                refreshToken = getRefreshToken(audience, scope);
                if (!refreshToken && useMrrt) {
                    const latestRefreshToken = refreshTokens["latest_refresh_token"];
                    const isDownscoping = checkDownscoping(scope, audience);
                    if (latestRefreshToken && !isDownscoping) {
                        refreshToken = latestRefreshToken;
                    }
                }
                if (!refreshToken) {
                    throw new MissingRefreshTokenError(audience, scope);
                }
                fetchOptions.body = useFormData ? createQueryParams(Object.assign(Object.assign({}, body), {
                    refresh_token: refreshToken
                })) : JSON.stringify(Object.assign(Object.assign({}, body), {
                    refresh_token: refreshToken
                }));
            }
            let abortController;
            if (typeof AbortController === "function") {
                abortController = new AbortController;
                fetchOptions.signal = abortController.signal;
            }
            let response;
            try {
                response = await Promise.race([ wait(timeout), fetch(fetchUrl, Object.assign({}, fetchOptions)) ]);
            } catch (error) {
                port.postMessage({
                    error: error.message
                });
                return;
            }
            if (!response) {
                if (abortController) abortController.abort();
                port.postMessage({
                    error: "Timeout when executing 'fetch'"
                });
                return;
            }
            headers = fromEntries(response.headers);
            json = await response.json();
            if (json.refresh_token) {
                if (useMrrt) {
                    refreshTokens["latest_refresh_token"] = json.refresh_token;
                    updateRefreshTokens(refreshToken, json.refresh_token);
                }
                setRefreshToken(json.refresh_token, audience, scope);
                delete json.refresh_token;
            } else {
                deleteRefreshToken(audience, scope);
            }
            port.postMessage({
                ok: response.ok,
                json: json,
                headers: headers
            });
        } catch (error) {
            port.postMessage({
                ok: false,
                json: {
                    error: error.error,
                    error_description: error.message
                },
                headers: headers
            });
        }
    };
    {
        addEventListener("message", messageHandler);
    }
}));
//# sourceMappingURL=auth0-spa-js.worker.development.js.map
