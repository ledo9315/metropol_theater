export const generateCsrfToken = () => {
    return crypto.randomUUID();
};
