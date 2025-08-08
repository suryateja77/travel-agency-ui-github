import axios from 'axios'

type requestBodyType = Record<string, any>

axios.defaults.withCredentials = true

const API = axios.create({
  baseURL: '/api',
  timeout: 20000
})

// API.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response.status === 401 || error.response.status === 403) {
//       window.location.replace('/')
//     }
//     return Promise.reject(error)
//   },
// )

type payload = Record<string, any>

const get = async (URL: string, config?: payload) => await API.get(URL, config).then(response => response)

const post = async (URL: string, payload: payload, config?: payload) => await API.post(URL, payload, config).then(response => response)

const put = async (URL: string, payload: payload, config?: payload) => await API.put(URL, payload, config).then(response => response)

const patch = async (URL: string, payload: payload, config?: payload) => await API.patch(URL, payload, config).then(response => response)

const remove = async (URL: string, config?: payload) => await API.delete(URL, config).then((response: any) => response)

const generateAPIMethods = (url: string) => {
  return {
    get: async (requestBody: requestBodyType) => await get(url, requestBody),
    getById: async (requestBody: requestBodyType) => await get(`${url}/${requestBody._id}`, requestBody),
    create: async (requestBody: requestBodyType) => await post(url, requestBody),
    updateById: async (requestBody: requestBodyType) => await patch(`${url}/${requestBody._id}`, requestBody),
    delete: async (requestBody: requestBodyType) => await remove(`${url}/${requestBody._id}`, requestBody),
  }
}

export {generateAPIMethods, get, post, put, patch, remove}