/**
 * Generates a fake token from a non empty string
 * @param username the username of the user
 * @returns a fake token that can be used as a JWT or undefined if the username is invalid
 */
export function generateFakeToken(username: string): string | undefined {
    if (!username || typeof username !== 'string' || username.length === 0) {
        return undefined;        
    }
    return Buffer.from(username, 'utf-8').toString('base64');
};

/**
 * Validate a fake token 
 * @param token the token to validate
 * @returns the username if the token is valid, undefined otherwise
 */
export function validateFakeToken(token: string) : string | undefined {
    try {
        return Buffer.from(token, 'base64').toString('utf-8');
    } catch (error) {
        return undefined;
    }
};