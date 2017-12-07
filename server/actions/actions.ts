import students from './students';

export function generatePassword(length: number = 12): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  while (password.length < length) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export default {
  students,
};
