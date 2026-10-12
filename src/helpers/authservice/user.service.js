import { authHeader } from './auth-header';

const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';

export const userService = {
    login,
    logout,
    register,
    getAll,
};

function login(email, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    };

    return fetch(`${apiBase}/login`, requestOptions)
        .then(handleResponse)
        .then(data => {
            const user = { ...(data.user || data), token: data.token };
            if (user.token) {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('jwt', user.token);
                localStorage.setItem('token', user.token);
                sessionStorage.setItem('authUser', JSON.stringify(user));
            }
            return user;
        });
}

function logout() {
    const token = localStorage.getItem('jwt') || localStorage.getItem('token');
    if (token) {
        fetch(`${apiBase}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).catch(() => {});
    }
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    localStorage.removeItem('token');
    sessionStorage.removeItem('authUser');
}

function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };
    return fetch(`${apiBase}/register`, requestOptions).then(handleResponse);
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${apiBase}/user`, requestOptions).then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload(true);
            }
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
}
