import React, { useState } from 'react'
import { VultisigSDK, Vault } from '@vultisig/sdk'

interface VaultCreatorProps {
  sdk: VultisigSDK
  onVaultCreated: (vault: Vault) => void
}

const VaultCreator: React.FC<VaultCreatorProps> = ({ sdk, onVaultCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [step, setStep] = useState<'form' | 'creating' | 'verifying'>('form')
  const [vaultId, setVaultId] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form data
    if (!formData.name.trim()) {
      setError('Vault name is required')
      return
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!formData.password) {
      setError('Password is required')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setStep('creating')

    try {
      console.log('🚀 Starting Fast Vault creation with server...')
      console.log('📝 Vault parameters:', {
        name: formData.name,
        email: formData.email,
        hasPassword: !!formData.password,
        passwordsMatch: formData.password === formData.confirmPassword
      })
      console.log('🌐 API endpoint: https://api.vultisig.com/vault/create')
      
      // Create vault params without confirmPassword
      const vaultParams = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }
      
      // Use SDK for Fast Vault creation with server
      const result = await sdk.createFastVault(vaultParams)
      console.log('✅ Vault creation request successful!')
      console.log('📋 Result:', {
        vaultId: result.vaultId,
        verificationRequired: result.verificationRequired,
        vaultName: result.vault.name
      })
      
      setVaultId(result.vaultId)
      
      if (result.verificationRequired) {
        console.log('📧 Email verification required - switching to verification step')
        setStep('verifying')
      } else {
        console.log('🎉 Vault created successfully without verification needed')
        onVaultCreated(result.vault)
      }
    } catch (err) {
      console.error('❌ Vault creation failed:', err)
      setError((err as Error).message)
      setStep('form')
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      console.log('📧 Starting email verification...')
      console.log('🔑 Verification details:', {
        vaultId: vaultId,
        codeLength: verificationCode.length
      })
      
      await sdk.verifyVaultEmail(vaultId, verificationCode)
      console.log('✅ Email verification successful!')
      
      console.log('🔄 Retrieving complete vault from server...')
      // After verification, retrieve the complete vault
      const vault = await sdk.getVault(vaultId, formData.password)
      console.log('🎉 Vault retrieved successfully!', {
        name: vault.name,
        libType: vault.libType,
        hasPublicKeys: !!(vault.publicKeys?.ecdsa && vault.publicKeys?.eddsa),
        signers: vault.signers?.length || 0
      })
      
      onVaultCreated(vault)
    } catch (err) {
      console.error('❌ Verification failed:', err)
      setError((err as Error).message)
    }
  }

  if (step === 'creating') {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Creating Fast Vault with Server...</h3>
        <p style={{ color: '#666', margin: '0' }}>Server is generating your MPC keyshares</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (step === 'verifying') {
    return (
      <div style={{ 
        maxWidth: '400px',
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Email Verification Required</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>Please check your email for a verification code.</p>
        
        <form onSubmit={handleVerification} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            style={{ 
              padding: '12px', 
              border: '1px solid #ccc', 
              borderRadius: '6px',
              fontSize: '14px'
            }}
            required
          />
          
          <button 
            type="submit"
            style={{
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Verify Email
          </button>
          
          {error && (
            <div style={{ 
              color: '#dc3545', 
              fontSize: '14px',
              padding: '10px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
        </form>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '400px',
      padding: '30px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ color: '#333', marginBottom: '10px' }}>Create Fast Vault (Server-Assisted)</h2>
      <p style={{ color: '#666', marginBottom: '25px' }}>Server will generate MPC keyshares for you</p>
      
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Vault Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          style={{ 
            padding: '12px', 
            border: '1px solid #ccc', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
          required
        />
        
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          style={{ 
            padding: '12px', 
            border: formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
              ? '1px solid #dc3545'
              : '1px solid #ccc', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
          required
        />
        
        {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
          <div style={{
            color: '#dc3545',
            fontSize: '12px',
            marginTop: '-10px'
          }}>
            Please enter a valid email address
          </div>
        )}
        
        <input
          type="password"
          placeholder="Password (minimum 8 characters)"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          style={{ 
            padding: '12px', 
            border: formData.password && formData.password.length < 8
              ? '1px solid #dc3545'
              : '1px solid #ccc', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
          required
          minLength={8}
        />
        
        {formData.password && formData.password.length < 8 && (
          <div style={{
            color: '#dc3545',
            fontSize: '12px',
            marginTop: '-10px'
          }}>
            Password must be at least 8 characters long
          </div>
        )}
        
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          style={{ 
            padding: '12px', 
            border: formData.confirmPassword && formData.password !== formData.confirmPassword 
              ? '1px solid #dc3545' 
              : '1px solid #ccc', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
          required
        />
        
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <div style={{
            color: '#dc3545',
            fontSize: '12px',
            marginTop: '-10px'
          }}>
            Passwords do not match
          </div>
        )}
        
        <button 
          type="submit"
          style={{
            padding: '14px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Create Fast Vault
        </button>
        
        {error && (
          <div style={{ 
            color: '#dc3545', 
            fontSize: '14px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  )
}

export default VaultCreator