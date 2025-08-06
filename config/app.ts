export const config = {
    baseUrl: (typeof window !== 'undefined' ? (window as any).serverEnv?.DYNAMIC_ENV_BASE_URL : '') || process.env.NEXT_PUBLIC_BASE_URL || 'https://official-joke-api.appspot.com',
    socketUrl: (typeof window !== 'undefined' ? (window as any).serverEnv?.DYNAMIC_ENV_BASE_URL : '') || process.env.NEXT_PUBLIC_SOCKET_URL || 'https://official-joke-api.appspot.com',
    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
}
