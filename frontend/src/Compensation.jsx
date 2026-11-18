
import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = 'http://localhost:8080/api/v1'

function Compensation({ employees = [], token, showMessage, userRole }) {
  const canAccessCompensation = ['ADMIN', 'HR_MANAGER'].includes(userRole)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    annualSalary: '',
    currencyCode: 'INR',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    revisionReason: '',
  })

  const selectedEmployee = useMemo(
    () => employees.find(
      employee => String(employee.id) === String(selectedEmployeeId)
    ),
    [employees, selectedEmployeeId]
  )

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(String(employees[0].id))
    }
  }, [employees, selectedEmployeeId])

  useEffect(() => {
    if (!canAccessCompensation || !selectedEmployeeId || !token) {
      setHistory([])
      setLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchHistory = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `${API_BASE_URL}/compensation/employees/${selectedEmployeeId}/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load salary history.')
        }

        const data = await response.json()

        if (!controller.signal.aborted) {
          setHistory(data)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message)
          setHistory([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchHistory()

    return () => controller.abort()
  }, [canAccessCompensation, selectedEmployeeId, token])

  const currentSalary = history.find(record => record.effectiveTo === null)

  const handleInputChange = event => {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!canAccessCompensation) {
      setError('You do not have permission to manage compensation.')
      return
    }

    if (!selectedEmployeeId) {
      setError('Please select an employee.')
      return
    }

    if (Number(form.annualSalary) <= 0) {
      setError('Annual salary must be greater than zero.')
      return
    }

    if (!/^[A-Za-z]{3}$/.test(form.currencyCode.trim())) {
      setError('Enter a valid three-letter currency code.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/compensation/employees/${selectedEmployeeId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            annualSalary: Number(form.annualSalary),
            currencyCode: form.currencyCode.trim().toUpperCase(),
            effectiveFrom: form.effectiveFrom,
            revisionReason: form.revisionReason.trim(),
          }),
        }
      )

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}))
        throw new Error(
          responseData.message || 'Unable to save compensation.'
        )
      }

      const historyResponse = await fetch(
        `${API_BASE_URL}/compensation/employees/${selectedEmployeeId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!historyResponse.ok) {
        throw new Error('Salary saved, but history could not be refreshed.')
      }

      setHistory(await historyResponse.json())

      setForm(previous => ({
        ...previous,
        annualSalary: '',
        revisionReason: '',
      }))

      showMessage?.('Compensation saved successfully.', 'success')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!canAccessCompensation) {
    return (
      <section className="panel">
        <div className="empty-state">
          You do not have permission to access compensation details.
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Compensation</h1>
          <p>Manage employee salaries and salary revision history.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Select Employee</h2>
        </div>

        <div className="employee-form-group">
          <label htmlFor="compensationEmployee">Employee</label>
          <select
            id="compensationEmployee"
            value={selectedEmployeeId}
            onChange={event => setSelectedEmployeeId(event.target.value)}
          >
            <option value="">Select an employee</option>

            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.employeeNumber} - {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>

        {selectedEmployee && (
          <p>
            Selected: <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>
          </p>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Current Compensation</h2>
        </div>

        {loading ? (
          <p>Loading salary information...</p>
        ) : currentSalary ? (
          <div>
            <h2>
              {currentSalary.currencyCode} {Number(currentSalary.annualSalary).toLocaleString()}
            </h2>
            <p>Annual salary</p>
            <p>Effective from: {currentSalary.effectiveFrom}</p>
          </div>
        ) : (
          <div className="empty-state">
            No compensation record found for this employee.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Add Salary / Revision</h2>
        </div>

        <form className="employee-form" onSubmit={handleSubmit}>
          <div className="employee-form-group">
            <label htmlFor="annualSalary">Annual Salary</label>
            <input
              id="annualSalary"
              name="annualSalary"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.annualSalary}
              onChange={handleInputChange}
              placeholder="Enter annual salary"
            />
          </div>

          <div className="employee-form-group">
            <label htmlFor="currencyCode">Currency Code</label>
            <input
              id="currencyCode"
              name="currencyCode"
              type="text"
              minLength="3"
              maxLength="3"
              pattern="[A-Za-z]{3}"
              required
              value={form.currencyCode}
              onChange={handleInputChange}
              placeholder="INR"
            />
          </div>

          <div className="employee-form-group">
            <label htmlFor="effectiveFrom">Effective From</label>
            <input
              id="effectiveFrom"
              name="effectiveFrom"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              required
              value={form.effectiveFrom}
              onChange={handleInputChange}
            />
          </div>

          <div className="employee-form-group">
            <label htmlFor="revisionReason">Revision Reason</label>
            <input
              id="revisionReason"
              name="revisionReason"
              type="text"
              maxLength="255"
              value={form.revisionReason}
              onChange={handleInputChange}
              placeholder="Optional reason"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="button-primary"
            disabled={saving || !selectedEmployeeId}
          >
            {saving ? 'Saving...' : 'Save Compensation'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Salary History</h2>
        </div>

        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <div className="empty-state">No salary history available.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Annual Salary</th>
                  <th>Currency</th>
                  <th>Effective From</th>
                  <th>Effective To</th>
                  <th>Revision Reason</th>
                </tr>
              </thead>

              <tbody>
                {history.map(record => (
                  <tr key={record.id}>
                    <td>{Number(record.annualSalary).toLocaleString()}</td>
                    <td>{record.currencyCode}</td>
                    <td>{record.effectiveFrom}</td>
                    <td>{record.effectiveTo || 'Current'}</td>
                    <td>{record.revisionReason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

export default Compensation
