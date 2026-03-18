const host = typeof window !== 'undefined' ? window.location.origin : 'http://72.62.81.143';
const backendApiAddress: string = import.meta.env.VITE_BACKEND_API_ADDRESS || `${host}/api`;
export const awsBucketAddress: string = `${import.meta.env.VITE_AWS_BUCKET_URL || ''}`;
export default backendApiAddress;
