import { getPayload } from 'payload';
import config from '@payload-config'
import { cookies, headers } from 'next/headers';


export const getAppPayload = () => getPayload({ config });

export const getToken = async () => {
    const token = (await cookies()).get('payload-token')?.value;

    return token;
}

export const checkAuth = async () => {
    const result = await (await getAppPayload()).auth({ headers: await headers() });

    return Boolean(result?.user);
}