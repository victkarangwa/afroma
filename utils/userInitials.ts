export const getUserInitials = (firstname: string, lastname: string): string => {
  const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
  const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}`;
}; 