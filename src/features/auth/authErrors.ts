/**
 * Map backend validation messages (class-validator / NestJS) to Vietnamese
 */
const backendErrorMap: Record<string, string> = {
  'email must be an email': 'Email không hợp lệ',
  'email should not be empty': 'Email là bắt buộc',
  'password should not be empty': 'Mật khẩu là bắt buộc',
  'password must be longer than or equal to 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
  'username should not be empty': 'Tên đăng nhập là bắt buộc',
  'invalid credentials': 'Email hoặc mật khẩu không đúng',
  'Invalid credentials': 'Email hoặc mật khẩu không đúng',
}

function translateOne(raw: string): string {
  for (const [en, vi] of Object.entries(backendErrorMap)) {
    if (raw.toLowerCase().includes(en.toLowerCase())) return vi
  }
  return raw
}

export function translateAuthError(msg: string | string[] | undefined): string {
  if (!msg) return ''
  const arr = Array.isArray(msg) ? msg : [msg]
  const translated = arr.map((s) => translateOne(String(s).trim())).filter(Boolean)
  return [...new Set(translated)].join('. ')
}
