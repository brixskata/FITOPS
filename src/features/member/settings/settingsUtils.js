export const emptyPasswordForm = {
  current_password: '',
  password: '',
  password_confirmation: '',
}

export const validatePasswordForm = (form) => {
  const errors = {}

  if (!form.current_password) errors.current_password = 'Current password is required.'
  if (!form.password) errors.password = 'New password is required.'
  else if (form.password.length < 8) errors.password = 'New password must be at least 8 characters.'
  if (!form.password_confirmation) errors.password_confirmation = 'Please confirm your new password.'
  else if (form.password !== form.password_confirmation) errors.password_confirmation = 'The password confirmation does not match.'

  return errors
}

export const getPasswordErrorMessage = (error) => {
  if (error.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.status === 403) return 'You do not have permission to change this password.'
  if (error.status === 429) return 'Too many attempts. Please try again later.'
  if (error.status === 500 || error.isNetworkError) return 'Unable to update your password. Please try again.'
  return error.message || 'Unable to update your password.'
}
