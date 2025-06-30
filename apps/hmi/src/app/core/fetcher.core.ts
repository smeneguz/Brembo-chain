import { http } from './http.core'

export const fetcher = (url: string) => http.get(url).then((res) => res.data)
