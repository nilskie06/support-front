import axios from 'axios';
import { applyUserPreferences } from '@/helpers/themeConfig';

class LaravelAuthBackend {
    constructor(config = {}) {
        this.apiBase = (config && config.apiBase) || process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
    }

    /**
     * Registers the user with given details
     */
    registerUser(username, email, password) {
        return new Promise((resolve, reject) => {
            axios.post(`${this.apiBase}/register`, {
                name: username,
                username: username,
                email: email,
                password: password,
            }).then((response) => {
                const user = response.data.user;
                const token = response.data.token;
                const authUser = this._prepareUser(user, token);
                this.setLoggedInUser(authUser);
                resolve(authUser);
            }).catch((error) => {
                reject(this._handleError(error));
            });
        });
    }

    /**
     * Login user with given details
     */
    loginUser(email, password) {
        return new Promise((resolve, reject) => {
            axios.post(`${this.apiBase}/login`, {
                email: email,
                password: password,
            }).then((response) => {
                const user = response.data.user;
                const token = response.data.token;
                const authUser = this._prepareUser(user, token);
                this.setLoggedInUser(authUser);
                resolve(authUser);
            }).catch((error) => {
                reject(this._handleError(error));
            });
        });
    }

    /**
     * Forget password for given email
     */
    forgetPassword(email) {
        return new Promise((resolve, reject) => {
            axios.post(`${this.apiBase}/forgot-password`, {
                email: email,
            }).then((response) => {
                resolve(response.data);
            }).catch((error) => {
                reject(this._handleError(error));
            });
        });
    }

    /**
     * Logout current user
     */
    logout() {
        return new Promise((resolve) => {
            const token = localStorage.getItem('jwt') || localStorage.getItem('token');
            const cleanup = () => {
                sessionStorage.removeItem('authUser');
                localStorage.removeItem('user');
                localStorage.removeItem('jwt');
                localStorage.removeItem('token');
                localStorage.removeItem('userdata');
                localStorage.removeItem('userid');
                localStorage.removeItem('app_sidebar_menus');
                delete axios.defaults.headers.common['Authorization'];
                window.dispatchEvent(new CustomEvent('menus-updated'));
                resolve(true);
            };

            if (token) {
                axios.post(`${this.apiBase}/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                }).finally(cleanup);
            } else {
                cleanup();
            }
        });
    }

    setLoggedInUser(user) {
        if (!user) {
            sessionStorage.removeItem('authUser');
            localStorage.removeItem('user');
            localStorage.removeItem('userdata');
            localStorage.removeItem('userid');
            localStorage.removeItem('app_sidebar_menus');
            window.dispatchEvent(new CustomEvent('menus-updated'));
            return;
        }
        sessionStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));
        if (user.id) {
            localStorage.setItem('userid', user.id);
        }
        if (user.token) {
            localStorage.setItem('jwt', user.token);
            localStorage.setItem('token', user.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
        if (user.theme_config || user.layout_config) {
            applyUserPreferences({
                theme_config: user.theme_config,
                layout_config: user.layout_config,
            });
        }
        window.dispatchEvent(new CustomEvent('menus-updated'));
    }

    setLoggeedInUser(user) {
        this.setLoggedInUser(user);
    }

    /**
     * Returns the authenticated user
     */
    getAuthenticatedUser() {
        const raw = sessionStorage.getItem('authUser') || localStorage.getItem('user');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    _prepareUser(user, token) {
        return {
            ...user,
            token: token,
            displayName: user.fullname || user.name || user.username || user.email,
        };
    }

    _handleError(error) {
        if (error.response && error.response.data) {
            const data = error.response.data;
            if (data.message) {
                return data.message;
            }
            if (data.errors) {
                const firstKey = Object.keys(data.errors)[0];
                if (firstKey && data.errors[firstKey].length) {
                    return data.errors[firstKey][0];
                }
            }
        }
        return error.message || 'An error occurred during authentication.';
    }
}

let _authBackend = null;

const initFirebaseBackend = (config) => {
    if (!_authBackend) {
        _authBackend = new LaravelAuthBackend(config);
    }
    return _authBackend;
};

const getFirebaseBackend = () => {
    if (!_authBackend) {
        _authBackend = new LaravelAuthBackend();
    }
    return _authBackend;
};

const getAuthBackend = getFirebaseBackend;
const initAuthBackend = initFirebaseBackend;

export {
    initFirebaseBackend,
    getFirebaseBackend,
    initAuthBackend,
    getAuthBackend,
    LaravelAuthBackend,
};