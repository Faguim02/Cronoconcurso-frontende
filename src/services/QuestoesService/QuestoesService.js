import { api, useJwtToken } from '../Api'

export class QuestoesService {
    async generateQuestion(data) {
        try {
            useJwtToken()
            const response = await api.post('/generate-question', data)
            console.log('RESPONSE STATUS:', response.status);
            console.log('RESPONSE DATA:', response.data);
            if (response.status == 200) {
                return {
                    data: response.data,
                    status: response.status
                }
            }
        } catch (error) {
            return {
                message: 'Error generating question',
                error: error.message
            }
        }
    }
}