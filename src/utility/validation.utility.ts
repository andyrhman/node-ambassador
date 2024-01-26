import { ValidationError } from 'class-validator';

export function formatValidationErrors(validationErrors: ValidationError[]): any {
    const message = validationErrors.map(error => {
        // This will return only the first error message for each field
        return error.constraints ? Object.values(error.constraints)[0] : null;
    }).filter(error => error !== null); // Remove null values (fields without errors)
    return { message };
}