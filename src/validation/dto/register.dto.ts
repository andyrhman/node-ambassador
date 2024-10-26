import { IsString, Length, IsEmail, IsNotEmpty } from 'class-validator';
import { IsEqualTo } from '../decorator/check-password.decorator';

export class RegisterDto {
    @IsString({ message: 'Full name must be a string' })
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
    username: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, undefined, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsString()
    @IsNotEmpty()
    @IsEqualTo('password', { message: 'Password Confirm must be the same as password' })
    confirm_password: string;
}