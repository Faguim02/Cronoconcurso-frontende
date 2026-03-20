import { api, useJwtToken, setJwtToken } from "../Api";

export class UsuarioService {

    async signIn(data) {
        try {
            const response = await api.post('/usuarios/signin', data)
            if(response.status == 200) {
                setJwtToken(response.data.token)
                localStorage.setItem('auth', true);
                this.AboutUser()
            }
            return response
        } catch (error) {
            return {
                message: 'Error signing in',
                error: error.message
            }
        }
    }
    async createUser(data) {
        try {
            
            const response = await api.post('/usuarios', data)

            if (response.status == 201) {
                localStorage.setItem('email', JSON.stringify({ email: response.data.email}));
            }

            return response

        } catch (error) {
            return {
                message: 'Error creating user',
                error: error.message
            }
        }
    }

    async AboutUser(id) {
        try {
            useJwtToken()
            const response = await api.get(`/usuarios`)
            if (response.status == 200) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data
        } catch (error) {
            return {
                message: 'Error fetching user',
                error: error.message
            }
        }
    }

    async verifyEmail(code) {
        try {

            const email = localStorage.getItem('email')
            const data = {
                email: (JSON.parse(email)).email,
                code: code
            }

            const response = await api.post(`/usuarios/verify`, data)
            return {
                status: response.status,
                data: response.data
            }
        } catch (error) {
            return {
                message: 'Error verifying email',
                error: error.message
            }
        }
    }
}