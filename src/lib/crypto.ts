const ENCRYPTION_ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  )
}

export function getDeviceKey(): string {
  // First, try to get the stable key from localStorage
  let deviceKey = localStorage.getItem('deviceKey');
  if (deviceKey) {
    return deviceKey;
  }

  // If no stable key, try to generate the old, unstable key for migration
  try {
    const userAgent = window.navigator.userAgent || 'unknown';
    const platform = window.navigator.platform || 'unknown';
    const language = window.navigator.language || 'unknown';
    const unstableKey = `${userAgent}${platform}${language}`

    // If we successfully generate a meaningful unstable key, store it as the new stable key
    if (unstableKey && unstableKey !== 'unknownunknownunknown') {
      localStorage.setItem('deviceKey', unstableKey);
      return unstableKey;
    }
  } catch (error) {
    // This might fail in environments without navigator, continue to UUID
  }

  // If migration is not possible (e.g., new user), create a new stable key
  deviceKey = crypto.randomUUID();
  localStorage.setItem('deviceKey', deviceKey);
  return deviceKey;
}

export async function encrypt(plaintext: string): Promise<string> {
  try {
    if (typeof plaintext !== 'string') {
      throw new Error('Plaintext must be a string')
    }
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    const deviceKey = getDeviceKey()
    const key = await deriveKey(deviceKey, salt)
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv
      },
      key,
      data
    )
    
    const encryptedArray = new Uint8Array(encryptedData)
    const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(encryptedArray, salt.length + iv.length)
    
    const base64 = btoa(String.fromCharCode(...combined))
    return base64
  } catch (error) {
    throw new Error('Failed to encrypt data')
  }
}

export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    
    const salt = combined.slice(0, SALT_LENGTH)
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const data = combined.slice(SALT_LENGTH + IV_LENGTH)
    
    const deviceKey = getDeviceKey()
    const key = await deriveKey(deviceKey, salt)
    
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv
      },
      key,
      data
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    throw new Error('Failed to decrypt data')
  }
}
