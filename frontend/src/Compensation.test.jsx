
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Compensation from './Compensation.jsx'

const employees = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    firstName: 'Rahul',
    lastName: 'Sharma',
  },
]

const defaultProps = {
  employees,
  token: 'test-token',
  showMessage: vi.fn(),
  userRole: 'HR_MANAGER',
}

describe('Compensation component', () => {
  it('denies access to unauthorized users', () => {
    render(
      <Compensation {...defaultProps} userRole="EMPLOYEE" />
    )

    expect(
      screen.getByText(
        'You do not have permission to access compensation details.'
      )
    ).toBeInTheDocument()

    expect(screen.queryByText('Add Salary / Revision')).not.toBeInTheDocument()
  })

  it('loads salary history for an authorized HR user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          annualSalary: 850000,
          currencyCode: 'INR',
          effectiveFrom: '2026-01-01',
          effectiveTo: null,
          revisionReason: 'Annual revision',
        },
      ],
    }))

    render(<Compensation {...defaultProps} />)

    expect(
      await screen.findByText('INR 850,000')
    ).toBeInTheDocument()

    expect(screen.getByText('Annual revision')).toBeInTheDocument()

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/compensation/employees/1/history',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      })
    )
  })

  it('rejects a zero annual salary', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }))

    render(<Compensation {...defaultProps} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })

    fireEvent.change(screen.getByLabelText('Annual Salary'), {
      target: { value: '0' },
    })

    fireEvent.submit(
      screen.getByRole('button', { name: 'Save Compensation' }).closest('form')
    )

    expect(
      await screen.findByText('Annual salary must be greater than zero.')
    ).toBeInTheDocument()
  })

  it('rejects an invalid currency code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }))

    render(<Compensation {...defaultProps} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })

    fireEvent.change(screen.getByLabelText('Annual Salary'), {
      target: { value: '850000' },
    })

    fireEvent.change(screen.getByLabelText('Currency Code'), {
      target: { value: 'IN' },
    })

    fireEvent.submit(
      screen.getByRole('button', { name: 'Save Compensation' }).closest('form')
    )

    expect(
      await screen.findByText('Enter a valid three-letter currency code.')
    ).toBeInTheDocument()
  })
})
