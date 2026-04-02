import Hashids from 'hashids';

const hashids = new Hashids("my-organization-secret-123", 10);

export const encodeId = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return hashids.encode(numericId);
};

export const decodeId = (hash: string) => {
    const decoded = hashids.decode(hash);
    return decoded.length > 0 ? decoded[0].toString() : null;
};