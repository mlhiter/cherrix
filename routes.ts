/**
 * An array of routes that are public and do not require authentication.
 *
 * @type {string[]}
 */
export const publicRoutes = ['/', '/auth/new-verification']

/**
 * An array of routes that are used for authentication.
 * These routes will redirect logged in users to the home page.
 *
 * @type {string[]}
 */
export const authRoutes = ['/auth/login', '/auth/register', '/auth/error', '/auth/reset', '/auth/new-password']

/**
 * The prefix for API routes that are used for authentication.
 *
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth'

/**
 * The default redirect URL for authenticated users.
 *
 * @type {string}
 */
export const DEFAULT_REDIRECT_URL = '/client/home'
