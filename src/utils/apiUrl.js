/**
 * Returns the base API URL with trailing slashes stripped.
 */
export const getApiUrl = () => {
    const url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
    return url.replace(/\/+$/, '');
};
