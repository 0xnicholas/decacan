import { ICache } from './cache';
import { Auth0ClientOptions, AuthorizationParams, AuthorizeOptions, ClientAuthorizationParams, LogoutOptions } from './global';
/**
 * @ignore
 */
export declare const GET_TOKEN_SILENTLY_LOCK_KEY = "auth0.lock.getTokenSilently";
/**
 * @ignore
 */
export declare const buildGetTokenSilentlyLockKey: (clientId: string, audience: string) => string;
/**
 * @ignore
 */
export declare const buildOrganizationHintCookieName: (clientId: string) => string;
/**
 * @ignore
 */
export declare const OLD_IS_AUTHENTICATED_COOKIE_NAME = "auth0.is.authenticated";
/**
 * @ignore
 */
export declare const buildIsAuthenticatedCookieName: (clientId: string) => string;
/**
 * @ignore
 */
export declare const cacheFactory: (location: string) => () => ICache;
/**
 * @ignore
 */
export declare const getAuthorizeParams: (clientOptions: Auth0ClientOptions & {
    authorizationParams: ClientAuthorizationParams;
}, scope: Record<string, string>, authorizationParams: AuthorizationParams & {
    scope?: string | undefined;
}, state: string, nonce: string, code_challenge: string, redirect_uri: string | undefined, response_mode: string | undefined, thumbprint: string | undefined) => AuthorizeOptions;
/**
 * @ignore
 *
 * Function used to provide support for the deprecated onRedirect through openUrl.
 */
export declare const patchOpenUrlWithOnRedirect: <T extends Pick<LogoutOptions, "openUrl" | "onRedirect">>(options: T) => T;
/**
 * @ignore
 *
 * Checks if all scopes are included inside other array of scopes
 */
export declare const allScopesAreIncluded: (scopeToInclude?: string, scopes?: string) => boolean;
/**
 * @ignore
 *
 * Returns the scopes that are missing after a refresh
 */
export declare const getMissingScopes: (requestedScope?: string, respondedScope?: string) => string;
/**
 * @ignore
 *
 * For backward compatibility we are going to check if we are going to downscope while doing a refresh request
 * while MRRT is allowed. If the audience is the same for the refresh_token we are going to use and it has
 * lower scopes than the ones originally in the token, we are going to return the scopes that were stored
 * with the refresh_token in the tokenset.
 * @param useMrrt Setting that the user can activate to use MRRT in their requests
 * @param authorizationParams Contains the audience and scope that the user requested to obtain a token
 * @param cachedAudience Audience stored with the refresh_token wich we are going to use in the request
 * @param cachedScope Scope stored with the refresh_token wich we are going to use in the request
 */
export declare const getScopeToRequest: (useMrrt: boolean | undefined, authorizationParams: {
    audience?: string;
    scope: string;
}, cachedAudience?: string, cachedScope?: string) => string;
/**
 * @ignore
 *
 * Checks if the refresh request has been done using MRRT
 * @param cachedAudience Audience from the refresh token used to refresh
 * @param cachedScope Scopes from the refresh token used to refresh
 * @param requestAudience Audience sent to the server
 * @param requestScope Scopes sent to the server
 */
export declare const isRefreshWithMrrt: (cachedAudience: string | undefined, cachedScope: string | undefined, requestAudience: string | undefined, requestScope: string) => boolean;
