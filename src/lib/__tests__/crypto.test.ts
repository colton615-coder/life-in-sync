/** @jest-environment node */
import { describe, it, expect, beforeAll } from '@jest/globals'
import { encrypt, decrypt } from '../crypto'

describe('crypto functions', () => {
  beforeAll(async () => {
    if (typeof globalThis.crypto === 'undefined') {
      const { webcrypto } = await import('node:crypto')
      globalThis.crypto = webcrypto as Crypto
    }
  })

  describe('encrypt', () => {
    it('should encrypt plaintext and return base64 string', async () => {
      const plaintext = 'Hello, World!'
      const encrypted = await encrypt(plaintext)

      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
      expect(encrypted.length).toBeGreaterThan(0)
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/)
    })

    it('should produce different ciphertext for same plaintext due to random IV', async () => {
      const plaintext = 'Hello, World!'
      const encrypted1 = await encrypt(plaintext)
      const encrypted2 = await encrypt(plaintext)

      expect(encrypted1).not.toBe(encrypted2)
    })

    it('should encrypt empty string', async () => {
      const encrypted = await encrypt('')
      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
    })

    it('should encrypt special characters', async () => {
      const plaintext = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./'
      const encrypted = await encrypt(plaintext)
      expect(encrypted).toBeDefined()
    })

    it('should encrypt unicode characters', async () => {
      const plaintext = '你好世界 🌍 مرحبا بالعالم'
      const encrypted = await encrypt(plaintext)
      expect(encrypted).toBeDefined()
    })

    it('should encrypt long text', async () => {
      const plaintext = 'a'.repeat(10000)
      const encrypted = await encrypt(plaintext)
      expect(encrypted).toBeDefined()
      expect(encrypted.length).toBeGreaterThan(0)
    })

    it('should encrypt JSON data', async () => {
      const data = {
        username: 'john_doe',
        password: 'super_secret_123',
        metadata: {
          created: new Date().toISOString(),
          version: 1
        }
      }
      const plaintext = JSON.stringify(data)
      const encrypted = await encrypt(plaintext)
      expect(encrypted).toBeDefined()
    })
  })

  describe('decrypt', () => {
    it('should decrypt ciphertext back to original plaintext', async () => {
      const plaintext = 'Hello, World!'
      const encrypted = await encrypt(plaintext)
      const decrypted = await decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should decrypt empty string', async () => {
      const plaintext = ''
      const encrypted = await encrypt(plaintext)
      const decrypted = await decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should decrypt special characters', async () => {
      const plaintext = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./'
      const encrypted = await encrypt(plaintext)
      const decrypted = await decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should decrypt unicode characters', async () => {
      const plaintext = '你好世界 🌍 مرحبا بالعالم'
      const encrypted = await encrypt(plaintext)
      const decrypted = await decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should decrypt long text', async () => {
      const plaintext = 'a'.repeat(10000)
      const encrypted = await encrypt(plaintext)
      const decrypted = await decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should decrypt JSON data', async () => {
      const data = {
        username: 'john_doe',
        password: 'super_secret_123',
        metadata: {
          created: new Date().toISOString(),
          version: 1
        }
      }
      const plaintext = JSON.stringify(data)
      const encrypted = await encrypt(plaintext)
      const decrypted = await decrypt(encrypted)
      const parsedData = JSON.parse(decrypted)

      expect(parsedData).toEqual(data)
    })

    it('should throw error for invalid ciphertext', async () => {
      await expect(decrypt('invalid_base64')).rejects.toThrow('Failed to decrypt data')
    })

    it('should throw error for malformed ciphertext', async () => {
      const validEncrypted = await encrypt('test')
      const malformed = validEncrypted.substring(0, validEncrypted.length - 5)
      
      await expect(decrypt(malformed)).rejects.toThrow()
    })

    it('should throw error for empty string', async () => {
      await expect(decrypt('')).rejects.toThrow()
    })

    it('should throw error for corrupted data', async () => {
      await expect(decrypt('SGVsbG8gV29ybGQh')).rejects.toThrow()
    })
  })

  describe('round-trip encryption/decryption', () => {
    const testCases = [
      { name: 'simple text', value: 'Hello, World!' },
      { name: 'empty string', value: '' },
      { name: 'numbers', value: '1234567890' },
      { name: 'mixed alphanumeric', value: 'abc123XYZ' },
      { name: 'special chars', value: '!@#$%^&*()' },
      { name: 'whitespace', value: '  spaces  and\ttabs\nand\r\nnewlines  ' },
      { name: 'unicode', value: '你好 مرحبا 🎉' },
      { name: 'long text', value: 'Lorem ipsum '.repeat(100) },
      { name: 'API key format', value: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc' },
      { name: 'JWT format', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U' },
    ]

    testCases.forEach(({ name, value }) => {
      it(`should correctly encrypt and decrypt: ${name}`, async () => {
        const encrypted = await encrypt(value)
        const decrypted = await decrypt(encrypted)
        expect(decrypted).toBe(value)
      })
    })
  })

  describe('security properties', () => {
    it('should use different salts for each encryption', async () => {
      const plaintext = 'test'
      const encrypted1 = await encrypt(plaintext)
      const encrypted2 = await encrypt(plaintext)

      const decoded1 = atob(encrypted1)
      const decoded2 = atob(encrypted2)
      
      const salt1 = decoded1.substring(0, 16)
      const salt2 = decoded2.substring(0, 16)

      expect(salt1).not.toBe(salt2)
    })

    it('should use different IVs for each encryption', async () => {
      const plaintext = 'test'
      const encrypted1 = await encrypt(plaintext)
      const encrypted2 = await encrypt(plaintext)

      const decoded1 = atob(encrypted1)
      const decoded2 = atob(encrypted2)
      
      const iv1 = decoded1.substring(16, 28)
      const iv2 = decoded2.substring(16, 28)

      expect(iv1).not.toBe(iv2)
    })

    it('should produce ciphertext with minimum expected length', async () => {
      const plaintext = 'a'
      const encrypted = await encrypt(plaintext)
      const decoded = atob(encrypted)
      
      const expectedMinLength = 16 + 12
      expect(decoded.length).toBeGreaterThanOrEqual(expectedMinLength)
    })

    it('should not leak plaintext in ciphertext', async () => {
      const plaintext = 'my_secret_password_12345'
      const encrypted = await encrypt(plaintext)

      expect(encrypted.toLowerCase()).not.toContain('secret')
      expect(encrypted.toLowerCase()).not.toContain('password')
      expect(encrypted).not.toContain('12345')
    })
  })

  describe('error handling', () => {
    it('should handle encryption failure gracefully', async () => {
      await expect(encrypt(null as unknown as string)).rejects.toThrow()
    })

    it('should provide meaningful error message on decryption failure', async () => {
      try {
        await decrypt('not_valid_encrypted_data')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Failed to decrypt data')
      }
    })
  })
})
