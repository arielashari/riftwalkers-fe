// config/app.ts
export const config = {
    baseUrl: process.env.NEXT_PUBLIC_USE_PROXY === 'true' 
        ? '/api/proxy?path=' 
        : ((typeof window !== 'undefined' ? (window as any).serverEnv?.DYNAMIC_ENV_BASE_URL : '') || process.env.NEXT_PUBLIC_BASE_URL || 'http://109.123.232.126:3291'),
    socketUrl: (typeof window !== 'undefined' ? (window as any).serverEnv?.DYNAMIC_ENV_BASE_URL : '') || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://109.123.232.126:3291',
    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
}