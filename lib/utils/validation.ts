export const isValidEmail = (email: string): boolean => {
  // Basic email format validation
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicEmailRegex.test(email)) return false;

  // More comprehensive email validation
  const comprehensiveEmailRegex = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  if (!comprehensiveEmailRegex.test(email)) return false;

  // Check email parts
  const [localPart, domain] = email.split('@');

  // Local part checks
  if (localPart.length > 64) return false;
  if (/^[.-]|[.-]$/.test(localPart)) return false; // Can't start or end with dots or hyphens
  if (/(\.{2,}|-{2,})/.test(localPart)) return false; // No consecutive dots or hyphens

  // Domain checks
  if (domain.length > 255) return false;
  const domainParts = domain.split('.');
  if (domainParts.some(part => part.length > 63)) return false;
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(domainParts[domainParts.length - 1])) return false;

  return true;
};

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProfileData(data: ProfileData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.full_name.trim()) {
    errors.push({ field: 'full_name', message: 'Full name is required' });
  }

  if (data.phone && !/^\+?[\d\s-()]{10,}$/.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (data.hourly_rate && (isNaN(Number(data.hourly_rate)) || Number(data.hourly_rate) < 0)) {
    errors.push({ field: 'hourly_rate', message: 'Please enter a valid hourly rate' });
  }

  if (data.experience_years && (isNaN(Number(data.experience_years)) || Number(data.experience_years) < 0)) {
    errors.push({ field: 'experience_years', message: 'Please enter valid years of experience' });
  }

  return errors;
} 