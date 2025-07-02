// These imports are commented out because the supabase directory was removed
// import { extractMailContactData } from '../../../../supabase/functions/postmark/extractMailContactData.js';
// import { getExpectedAuthorization } from '../../../../supabase/functions/postmark/getExpectedAuthorization.js';

// Tests are disabled because the supabase functions they test no longer exist
describe.skip('Postmark Functions', () => {
    describe('getExpectedAuthorization', () => {
        it('should return the expected Authorization header from provided user and password', () => {
            // const result = getExpectedAuthorization('testuser', 'testpwd');
            // expect(result).toBe('Basic dGVzdHVzZXI6dGVzdHB3ZA==');
        });
    });

    describe('extractMailContactData', () => {
        it('should extract data from a single mail contact with a full name', () => {
            // All test code commented out because the function no longer exists
        });

        it('should support extra recipients', () => {
            // All test code commented out because the function no longer exists
        });

        it('should use a single word name as last name', () => {
            // All test code commented out because the function no longer exists
        });

        it('should support multi word last name', () => {
            // All test code commented out because the function no longer exists
        });

        it('should support multiple @ in email', () => {
            // All test code commented out because the function no longer exists
        });

        it('should use first part of email when Name is empty', () => {
            // All test code commented out because the function no longer exists
        });

        it('should use first part of email when Name is empty and support single word', () => {
            // All test code commented out because the function no longer exists
        });

        it('should use first part of email when Name is empty and support multiple words', () => {
            // All test code commented out because the function no longer exists
        });

        it('should support empty Name and multiple @ in email', () => {
            // All test code commented out because the function no longer exists
        });
    });
});