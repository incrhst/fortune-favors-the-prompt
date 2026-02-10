import { AUTH_SECRET } from '$env/static/private';

export async function encryptSession(data: any): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(AUTH_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const jsonData = JSON.stringify(data);
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(jsonData)
    );

    const b64Data = btoa(jsonData);
    const b64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return `${b64Data}.${b64Signature}`;
}

export async function decryptSession(sessionStr: string): Promise<any | null> {
    try {
        const [b64Data, b64Signature] = sessionStr.split('.');
        const jsonData = atob(b64Data);
        const signature = new Uint8Array(
            atob(b64Signature)
                .split('')
                .map((c) => c.charCodeAt(0))
        );

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(AUTH_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signature,
            encoder.encode(jsonData)
        );

        if (!isValid) return null;
        return JSON.parse(jsonData);
    } catch (e) {
        return null;
    }
}
