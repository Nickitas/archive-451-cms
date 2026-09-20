const baseUrl = '/';

export const appFetch = async (
    url: string,
    options: RequestInit & { json?: Record<string, string> } = {},
) => {

    const response = await fetch(`${baseUrl}/${url}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options,
        ...(options.json && {
            body: JSON.stringify(options.json)
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return response.json()
}