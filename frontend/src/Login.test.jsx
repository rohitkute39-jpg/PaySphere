
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Login from './Login.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Login component', () => {
  it('renders the login form', () => {
    render(<Login onLogin={vi.fn()} />)

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('shows and hides the password', () => {
    render(<Login onLogin={vi.fn()} />)

    const passwordInput = screen.getByLabelText('Password')

    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: 'Show' }))

    expect(passwordInput).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: 'Hide' }))

    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('displays an error when username and password are empty', () => {
    render(<Login onLogin={vi.fn()} />)

    fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form'))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please enter your username and password.'
    )
  })

  it('logs in successfully and stores the session', async () => {
    const onLogin = vi.fn()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'test-access-token',
        username: 'admin',
        role: 'ADMIN',
      }),
    }))

    render(<Login onLogin={onLogin} />)

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'admin' },
    })

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'test-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({
        username: 'admin',
        role: 'ADMIN',
      })
    })

    expect(sessionStorage.getItem('paysphere_token')).toBe('test-access-token')
    expect(JSON.parse(sessionStorage.getItem('paysphere_user'))).toEqual({
      username: 'admin',
      role: 'ADMIN',
    })
  })

  it('displays the server error for invalid credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    }))

    render(<Login onLogin={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'admin' },
    })

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials'
    )
  })

  it('handles a login response without an access token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ username: 'admin', role: 'ADMIN' }),
    }))

    render(<Login onLogin={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'admin' },
    })

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'test-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Login response did not contain an access token.'
    )
  })

  it('handles a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      new Error('Network unavailable')
    ))

    render(<Login onLogin={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'admin' },
    })

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'test-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Network unavailable'
    )
  })
})
