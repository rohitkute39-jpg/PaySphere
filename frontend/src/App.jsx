import { useEffect, useMemo, useState } from 'react'

import './App.css'

import Login from './Login'



import Compensation from './Compensation'



const API_BASE_URL = 'http://localhost:8080/api/v1'



const navigationItems = [

  { id: 'dashboard', label: 'Dashboard', icon: '\u25A6' },

  { id: 'employees', label: 'Employees', icon: '\u265F' },

  { id: 'departments', label: 'Departments', icon: '\u25A4' },

  { id: 'compensation', label: 'Compensation', icon: '\u20B9' },

  { id: 'payroll', label: 'Payroll', icon: '\u25A3' },

  { id: 'reports', label: 'Reports', icon: '\u25A5' },

]



const payrollData = [

  {

    id: 1,

    month: 'October 2026',

    employees: 0,

    amount: 0,

    status: 'Pending',

  },

  {

    id: 2,

    month: 'September 2026',

    employees: 0,

    amount: 0,

    status: 'Completed',

  },

]



const emptyEmployeeForm = {

  employeeNumber: '',

  firstName: '',

  lastName: '',

  email: '',

  phone: '',

  countryCode: 'IN',

  designation: '',

  departmentId: '',

  dateOfJoining: '',

  status: 'ACTIVE',

}



function formatCurrency(amount) {

  return new Intl.NumberFormat('en-IN', {

    style: 'currency',

    currency: 'INR',

    maximumFractionDigits: 0,

  }).format(Number(amount || 0))

}



function getStoredUser() {

  const token = sessionStorage.getItem('paysphere_token')

  const user = sessionStorage.getItem('paysphere_user')



  if (!token || !user) {

    return null

  }



  try {

    const payload = JSON.parse(atob(token.split('.')[1]))



    if (payload.exp && payload.exp * 1000 < Date.now()) {

      sessionStorage.removeItem('paysphere_token')

      sessionStorage.removeItem('paysphere_user')

      return null

    }



    return JSON.parse(user)

  } catch {

    sessionStorage.removeItem('paysphere_token')

    sessionStorage.removeItem('paysphere_user')

    return null

  }

}



function getStatusLabel(status) {

  const labels = {

    ACTIVE: 'Active',

    INACTIVE: 'Inactive',

    ON_LEAVE: 'On Leave',

    TERMINATED: 'Terminated',

    PENDING: 'Pending',

    COMPLETED: 'Completed',

  }



  return labels[status] || status || 'Unknown'

}



function App() {

  const [currentUser, setCurrentUser] = useState(getStoredUser)

  const [activePage, setActivePage] = useState('dashboard')

  const [search, setSearch] = useState('')



  const [notification, setNotification] = useState({

    message: '',

    type: 'success',

  })



  const [employees, setEmployees] = useState([])

  const [allEmployees, setAllEmployees] = useState([])

  const [currentSalaries, setCurrentSalaries] = useState([])

  const [selectedSalaryDepartment, setSelectedSalaryDepartment] = useState('All')

  const [selectedSalaryCurrency, setSelectedSalaryCurrency] = useState('INR')

  const currencySymbols = {

  INR: '?',

  USD: '$',

  GBP: 'Ã‚Â£',

  CAD: 'CA$',

  EUR: 'Ã¢â€šÂ¬',

  AUD: 'A$',

  SGD: 'S$',

  AED: 'AED ',

}

  const [salaryLoading, setSalaryLoading] = useState(false)

  const [employeeLoading, setEmployeeLoading] = useState(false)

  const [employeeError, setEmployeeError] = useState('')

  const [employeeTotal, setEmployeeTotal] = useState(0)

  const [employeeRefresh, setEmployeeRefresh] = useState(0)



  const [showEmployeeForm, setShowEmployeeForm] = useState(false)

  const [editingEmployeeId, setEditingEmployeeId] = useState(null)

  const [departments, setDepartments] = useState([])

  const [departmentLoading, setDepartmentLoading] = useState(false)

  const [savingEmployee, setSavingEmployee] = useState(false)

  const [formError, setFormError] = useState('')



  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm)



  const token = sessionStorage.getItem('paysphere_token')



  const filteredCurrentSalaries = useMemo(() => {

  return currentSalaries.filter((salary) => {

    if (selectedSalaryDepartment === 'All') return true



    const employee = allEmployees.find(

      (item) => Number(item.id) === Number(salary.employeeId)

    )



    return employee?.departmentName === selectedSalaryDepartment

  })

}, [currentSalaries, selectedSalaryDepartment, allEmployees])



console.log('Current salaries:', currentSalaries.length, currentSalaries.slice(0, 2))

const currencyFilteredSalaries = useMemo(() => {

  return filteredCurrentSalaries.filter(

    (salary) => salary.currencyCode === selectedSalaryCurrency

  )

}, [filteredCurrentSalaries, selectedSalaryCurrency])



  console.log('Salary filters:', {

  department: selectedSalaryDepartment,

  currency: selectedSalaryCurrency,

  filteredCount: filteredCurrentSalaries.length,

  currencyCount: currencyFilteredSalaries.length

})

  const showMessage = (message, type = 'success') => {

    setNotification({ message, type })



    window.setTimeout(() => {

      setNotification({ message: '', type: 'success' })

    }, 3500)

  }



  const handleLogin = (user) => {

    setCurrentUser(user)

  }



  const handleLogout = () => {

    sessionStorage.removeItem('paysphere_token')

    sessionStorage.removeItem('paysphere_user')

    setCurrentUser(null)

  }



  const handleNavigation = (page) => {

    setActivePage(page)

    setSearch('')

    setShowEmployeeForm(false)



    setFormError('')

  }



  // Fetch employees from backend

  useEffect(() => {

    if (!currentUser || !token) return



    const controller = new AbortController()



    const fetchEmployees = async () => {

      setEmployeeLoading(true)

      setEmployeeError('')



      try {

        const params = new URLSearchParams({

          page: '0',

          size: '100',

          sortBy: 'id',

          direction: 'DESC',

        })



        if (search.trim()) {

          params.append('search', search.trim())

        }



        const response = await fetch(

          `${API_BASE_URL}/employees?${params.toString()}`,

          {

            method: 'GET',

            headers: {

              Authorization: `Bearer ${token}`,

              'Content-Type': 'application/json',

            },

            signal: controller.signal,

          }

        )



        if (!response.ok) {

          throw new Error(

            response.status === 401

              ? 'Your session has expired. Please log in again.'

              : 'Unable to load employees.'

          )

        }



        const data = await response.json()



        if (!controller.signal.aborted) {

          const employeeList = Array.isArray(data)

            ? data

            : data.content || data.data || []



          setEmployees(employeeList)

          setEmployeeTotal(

            data.totalElements ?? data.total ?? employeeList.length

          )

        }

      } catch (error) {

        if (!controller.signal.aborted) {

          setEmployeeError(error.message || 'Unable to load employees.')

        }

      } finally {

        if (!controller.signal.aborted) {

          setEmployeeLoading(false)

        }

      }

    }



    fetchEmployees()



    return () => controller.abort()

  }, [currentUser, token, search, employeeRefresh])



    // Fetch current salary records from backend

useEffect(() => {

console.log('Salary fetch auth:', Boolean(currentUser), Boolean(token))

  if (!currentUser || !token) return



  const controller = new AbortController()



  const fetchCurrentSalaries = async () => {

    setSalaryLoading(true)



    try {

      const response = await fetch(`${API_BASE_URL}/compensation/current`, {

        method: 'GET',

        headers: {

          Authorization: `Bearer ${token}`,

          'Content-Type': 'application/json',

        },

        signal: controller.signal,

      })

      console.log('Salary API status:', response.status)

      if (!response.ok) {

        throw new Error('Unable to load current salaries.')

      }



      const data = await response.json()

      console.log('Salary API records:', Array.isArray(data), Array.isArray(data) ? data.length : data)



      if (!controller.signal.aborted) {

        setCurrentSalaries(Array.isArray(data) ? data : [])

      }

    } catch (error) {

      if (!controller.signal.aborted) {

        showMessage(error.message, 'error')

      }

    } finally {

      if (!controller.signal.aborted) {

        setSalaryLoading(false)

      }

    }

  }



  fetchCurrentSalaries()



  return () => controller.abort()

}, [currentUser, token])



     // Fetch all employees for dashboard analytics

  useEffect(() => {

    if (!currentUser || !token) return



    const controller = new AbortController()



    const fetchAllEmployees = async () => {

      try {

        const pageSize = 100

        let allEmployeeList = []



        const fetchPage = async (page) => {

          const params = new URLSearchParams({

            page: String(page),

            size: String(pageSize),

            sortBy: 'id',

            direction: 'DESC',

          })



          const response = await fetch(

            `${API_BASE_URL}/employees?${params.toString()}`,

            {

              method: 'GET',

              headers: {

                Authorization: `Bearer ${token}`,

                'Content-Type': 'application/json',

              },

              signal: controller.signal,

            }

          )



          console.log('Employee API status:', response.status)

          if (!response.ok) {

            throw new Error('Unable to load employees for dashboard.')

          }



          return response.json()

        }



        const firstPage = await fetchPage(0)



        const firstEmployees = Array.isArray(firstPage)

          ? firstPage

          : firstPage.content || firstPage.data || []



        allEmployeeList = [...firstEmployees]



        const totalPages = Array.isArray(firstPage)

          ? 1

          : firstPage.totalPages || 1



        for (let page = 1; page < totalPages; page++) {

          const data = await fetchPage(page)



          const employeeList = Array.isArray(data)

            ? data

            : data.content || data.data || []



          allEmployeeList = [...allEmployeeList, ...employeeList]

        }



        if (!controller.signal.aborted) {

          setAllEmployees(allEmployeeList)

        }

      } catch (error) {

        if (!controller.signal.aborted) {

          showMessage(error.message, 'error')

        }

      }

    }



    fetchAllEmployees()



    return () => controller.abort()

  }, [currentUser, token])



  // Fetch departments for the dashboard and employee form

  useEffect(() => {

    if (!currentUser || !token) return



    const controller = new AbortController()



    const fetchDepartments = async () => {

      setDepartmentLoading(true)



      try {

        const response = await fetch(`${API_BASE_URL}/departments`, {

          method: 'GET',

          headers: {

            Authorization: `Bearer ${token}`,

            'Content-Type': 'application/json',

          },

          signal: controller.signal,

        })



        if (!response.ok) {

          throw new Error('Unable to load departments.')

        }



        const data = await response.json()



        console.log('Salary API response:', Array.isArray(data), data.length)



        if (!controller.signal.aborted) {

          const departmentList = Array.isArray(data)

            ? data

            : data.content || data.data || []



          setDepartments(

            departmentList.filter(

              (department) => department.active !== false

            )

          )

        }

      } catch (error) {

        if (!controller.signal.aborted) {

          console.error('Department loading error:', error)

        }

      } finally {

        if (!controller.signal.aborted) {

          setDepartmentLoading(false)

        }

      }

    }



    fetchDepartments()



    return () => controller.abort()

  }, [currentUser, token])



  const filteredEmployees = useMemo(() => {

    return employees.filter((employee) => {

      const fullName =

        `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase()



      const searchValue = search.toLowerCase()



      return (

        fullName.includes(searchValue) ||

        (employee.employeeNumber || '').toLowerCase().includes(searchValue) ||

        (employee.email || '').toLowerCase().includes(searchValue) ||

        (employee.departmentName || '').toLowerCase().includes(searchValue) ||

        (employee.designation || '').toLowerCase().includes(searchValue)

      )

    })

  }, [employees, search])



  const activeEmployeeCount = employees.filter(

    (employee) => employee.status === 'ACTIVE'

  ).length



  const COUNTRY_DIAL_CODES = {

    IN: '+91',

    US: '+1',

    GB: '+44',

    CA: '+1',

    AU: '+61',

    DE: '+49',

    AE: '+971',

    SG: '+65',

  }



  const handleEmployeeFormChange = (event) => {

    const { name, value } = event.target



    setEmployeeForm((previous) => ({

      ...previous,

      [name]: value,

      ...(name === 'countryCode' ? { phone: '' } : {}),

    }))



    if (formError) {

      setFormError('')

    }

  }



  const selectedDialCode =

    COUNTRY_DIAL_CODES[employeeForm.countryCode] || '+91'

  const openEmployeeForm = () => {

    setEditingEmployeeId(null)

    setEmployeeForm(emptyEmployeeForm)

    setFormError('')

    setShowEmployeeForm(true)

  }



  const openEditEmployeeForm = (employee) => {

  setEditingEmployeeId(employee.id)



  setEmployeeForm({

    employeeNumber: employee.employeeNumber || '',

    firstName: employee.firstName || '',

    lastName: employee.lastName || '',

    email: employee.email || '',

    phone: employee.phone || '',

    countryCode: employee.countryCode || 'IN',

    designation: employee.designation || '',

    departmentId: String(employee.departmentId ?? ''),

    dateOfJoining: employee.dateOfJoining || '',

    status: employee.status || 'ACTIVE',

  })



  setFormError('')

  setShowEmployeeForm(true)

}

const closeEmployeeForm = () => {

    if (savingEmployee) return



    setShowEmployeeForm(false)

    setEditingEmployeeId(null)

    setEmployeeForm(emptyEmployeeForm)

    setFormError('')

  }



  const handleAddEmployee = async (event) => {

    event.preventDefault()

    setFormError('')



    const requiredFields = [

      ['employeeNumber', 'Employee number'],

      ['firstName', 'First name'],

      ['lastName', 'Last name'],

      ['email', 'Email'],

      ['designation', 'Designation'],

      ['departmentId', 'Department'],

      ['dateOfJoining', 'Joining date'],

    ]



    for (const [field, label] of requiredFields) {

      if (!String(employeeForm[field] || '').trim()) {

        setFormError(`${label} is required.`)

        return

      }

    }



    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/



    if (!emailPattern.test(employeeForm.email.trim())) {

      setFormError('Please enter a valid email address.')

      return

    }



    if (employeeForm.dateOfJoining > new Date().toISOString().split('T')[0]) {

      setFormError('Joining date cannot be in the future.')

      return

    }



    if (!token) {

      setFormError('Your session has expired. Please log in again.')

      return

    }



    const payload = {

      employeeNumber: employeeForm.employeeNumber.trim(),

      firstName: employeeForm.firstName.trim(),

      lastName: employeeForm.lastName.trim(),

      email: employeeForm.email.trim(),

      phone: employeeForm.phone.trim() || null,

      countryCode: employeeForm.countryCode,

      designation: employeeForm.designation.trim(),

      departmentId: Number(employeeForm.departmentId),

      dateOfJoining: employeeForm.dateOfJoining,

      status: employeeForm.status,

    }



    setSavingEmployee(true)



    try {

      const isEditing = editingEmployeeId !== null



      const response = await fetch(

        isEditing

          ? `${API_BASE_URL}/employees/${editingEmployeeId}`

          : `${API_BASE_URL}/employees`,

        {

        method: isEditing ? 'PUT' : 'POST',

        headers: {

          Authorization: `Bearer ${token}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify(payload),

      })

      console.log('Salary API status:', response.status)

      if (!response.ok) {

        let errorMessage = isEditing ? 'Unable to update employee.' : 'Unable to create employee.'



        try {

          const errorData = await response.json()



          errorMessage =

            errorData.message ||

            errorData.error ||

            errorData.detail ||

            errorMessage



          if (errorData.errors && Array.isArray(errorData.errors)) {

            errorMessage = errorData.errors

              .map((item) => item.defaultMessage || item.message)

              .filter(Boolean)

              .join(', ')

          }

        } catch {

          // Keep the default error message if the response is not JSON.

        }



        throw new Error(errorMessage)

      }



      setShowEmployeeForm(false)

      setEditingEmployeeId(null)

      setEmployeeForm(emptyEmployeeForm)

      setFormError('')

      setSearch('')

      setEmployeeRefresh((previous) => previous + 1)



      showMessage(isEditing ? 'Employee updated successfully!' : 'Employee added successfully!')

    } catch (error) {

      setFormError(error.message || 'Something went wrong.')

    } finally {

      setSavingEmployee(false)

    }

  }



  if (!currentUser) {

    return <Login onLogin={handleLogin} />

  }



  const displayName =

    currentUser.firstName ||

    currentUser.name ||

    currentUser.username ||

    currentUser.email ||

    'Administrator'



  const displayRole = currentUser.role || 'ADMIN'



  const employeeTable = (

    <div className="table-wrapper">

      <table>

        <thead>

          <tr>

            <th>EMPLOYEE</th>

            <th>EMPLOYEE ID</th>

            <th>EMAIL</th>

            <th>DEPARTMENT</th>

            <th>DESIGNATION</th>

            <th>STATUS</th>

            <th>ACTION</th>

          </tr>

        </thead>



        <tbody>

          {employeeLoading ? (

            <tr>

              <td colSpan="7" className="empty-state">

                Loading employees...

              </td>

            </tr>

          ) : employeeError ? (

            <tr>

              <td colSpan="7" className="empty-state">

                {employeeError}

              </td>

            </tr>

          ) : filteredEmployees.length === 0 ? (

            <tr>

              <td colSpan="7" className="empty-state">

                No employees found. Add your first employee to get started.

              </td>

            </tr>

          ) : (

            filteredEmployees.map((employee) => (

              <tr key={employee.id}>

                <td>

                  <strong>

                    {employee.firstName} {employee.lastName}

                  </strong>

                </td>

                <td>{employee.employeeNumber}</td>

                <td>{employee.email}</td>

                <td>{employee.departmentName || '-'}</td>

                <td>{employee.designation}</td>

                <td>

                  <span

                    className={`status-badge ${(

                      employee.status || ''

                    ).toLowerCase()}`}

                  >

                    {getStatusLabel(employee.status)}

                  </span>

                </td>

                <td>

                  <button

                    type="button"

                    className="button-secondary"

                    onClick={() => openEditEmployeeForm(employee)}

                  >

                    Edit

                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  )



  const employeeFormPanel = showEmployeeForm && (

    <section className="panel employee-form-panel">

      <div className="panel-header">

        <div>

          <h3>{editingEmployeeId ? 'Edit Employee' : 'Add New Employee'}</h3>

          <p>{editingEmployeeId ? 'Update the employee details below.' : 'Enter the employee details below.'}</p>

        </div>



        <button

          type="button"

          className="button-secondary"

          onClick={closeEmployeeForm}

          disabled={savingEmployee}

        >

          Cancel

        </button>

      </div>



      <form className="employee-form" onSubmit={handleAddEmployee}>

        <div className="employee-form-group">

          <label htmlFor="employeeNumber">

            Employee Number <span className="form-required">*</span>

          </label>

          <input

            id="employeeNumber"

            name="employeeNumber"

            type="text"

            maxLength="30"

            placeholder="Example: EMP001"

            value={employeeForm.employeeNumber}

            onChange={handleEmployeeFormChange}

            required

          />

        </div>



        <div className="employee-form-group">

          <label htmlFor="designation">

            Designation <span className="form-required">*</span>

          </label>

          <input

            id="designation"

            name="designation"

            type="text"

            maxLength="100"

            placeholder="Example: Software Engineer"

            value={employeeForm.designation}

            onChange={handleEmployeeFormChange}

            required

          />

        </div>



        <div className="employee-form-group">

          <label htmlFor="firstName">

            First Name <span className="form-required">*</span>

          </label>

          <input

            id="firstName"

            name="firstName"

            type="text"

            maxLength="80"

            placeholder="Enter first name"

            value={employeeForm.firstName}

            onChange={handleEmployeeFormChange}

            required

          />

        </div>



        <div className="employee-form-group">

          <label htmlFor="lastName">

            Last Name <span className="form-required">*</span>

          </label>

          <input

            id="lastName"

            name="lastName"

            type="text"

            maxLength="80"

            placeholder="Enter last name"

            value={employeeForm.lastName}

            onChange={handleEmployeeFormChange}

            required

          />

        </div>



        <div className="employee-form-group">

          <label htmlFor="email">

            Email Address <span className="form-required">*</span>

          </label>

          <input

            id="email"

            name="email"

            type="email"

            maxLength="150"

            placeholder="employee@company.com"

            value={employeeForm.email}

            onChange={handleEmployeeFormChange}

            required

          />

        </div>



        <div className="employee-form-group">

          <label htmlFor="phone">Phone Number</label>

          <input

            id="phone"

            name="phone"

            type="tel"

            maxLength="30"

            placeholder={`${selectedDialCode} Enter phone number`}

            value={employeeForm.phone}

            onChange={handleEmployeeFormChange}

          />

        </div>

        <div className="employee-form-group">

          <label htmlFor="countryCode">Country</label>

          <select

            id="countryCode"

            name="countryCode"

            value={employeeForm.countryCode}

            onChange={handleEmployeeFormChange}

          >

            <option value="IN">India (IN)</option>

            <option value="US">United States (US)</option>

            <option value="GB">United Kingdom (GB)</option>

            <option value="CA">Canada (CA)</option>

            <option value="AU">Australia (AU)</option>

            <option value="DE">Germany (DE)</option>

            <option value="AE">United Arab Emirates (AE)</option>

            <option value="SG">Singapore (SG)</option>

          </select>

        </div>



        <div className="employee-form-group">

          <label htmlFor="departmentId">

            Department <span className="form-required">*</span>

          </label>

          <select

            id="departmentId"

            name="departmentId"

            value={employeeForm.departmentId}

            onChange={handleEmployeeFormChange}

            required

            disabled={departmentLoading}

          >

            <option value="">

              {departmentLoading ? 'Loading departments...' : 'Select department'}

            </option>



            {departments.map((department) => (

              <option key={department.id} value={department.id}>

                {department.name}

              </option>

            ))}

          </select>

        </div>



        <div className="employee-form-group">

          <label htmlFor="dateOfJoining">

            Date of Joining <span className="form-required">*</span>

          </label>

          <input

            id="dateOfJoining"

            name="dateOfJoining"

            type="date"

            max={new Date().toISOString().split('T')[0]}

            value={employeeForm.dateOfJoining}

            onChange={handleEmployeeFormChange}

            required

          />

        </div>



        <div className="employee-form-group">

          <label htmlFor="status">Employment Status</label>

          <select

            id="status"

            name="status"

            value={employeeForm.status}

            onChange={handleEmployeeFormChange}

          >

            <option value="ACTIVE">Active</option>

            <option value="INACTIVE">Inactive</option>

            <option value="ON_LEAVE">On Leave</option>

            <option value="TERMINATED">Terminated</option>

          </select>

        </div>



        {formError && (

          <div className="form-error">

            {formError}

          </div>

        )}



        <div className="employee-form-actions">

          <button

            type="button"

            className="button-secondary"

            onClick={closeEmployeeForm}

            disabled={savingEmployee}

          >

            Cancel

          </button>



          <button

            type="submit"

            className="button-primary"

            disabled={savingEmployee || departmentLoading}

          >

            {savingEmployee ? 'Saving...' : editingEmployeeId ? 'Update Employee' : 'Save Employee'}

          </button>

        </div>

      </form>

    </section>

  )



  return (

    <div className="app-layout">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">P</div>

          <div className="brand-name">

            <h2>PaySphere</h2>

            <span>HR & PAYROLL</span>

          </div>

        </div>



        <div className="sidebar-section">

          <span className="sidebar-heading">WORKSPACE</span>



          <nav className="sidebar-nav">

            {navigationItems.map((item) => (

              <button

                key={item.id}

                type="button"

                className={activePage === item.id ? 'active' : ''}

                onClick={() => handleNavigation(item.id)}

              >

                <span className="nav-icon">{item.icon}</span>

                <span>{item.label}</span>

              </button>

            ))}

          </nav>

        </div>



        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">

              {displayName.charAt(0).toUpperCase()}

            </div>

            <div>

              <strong>{displayName}</strong>

              <span>{getStatusLabel(displayRole)}</span>

            </div>

          </div>



          <button

            type="button"

            className="logout-button"

            onClick={handleLogout}

          >

            {'\u21AA'} Sign Out

          </button>

        </div>

      </aside>



      <main className="main-content">

        <header className="topbar">

          <div className="topbar-left">

            <span>Workspace</span>

            <span className="breadcrumb-divider">/</span>

            <strong>

              {navigationItems.find((item) => item.id === activePage)?.label}

            </strong>

          </div>



          <div className="topbar-right">

            <span className="topbar-date">

              {new Date().toLocaleDateString('en-IN', {

                day: '2-digit',

                month: 'short',

                year: 'numeric',

              })}

            </span>



            <div className="topbar-user">

              <div className="user-avatar">

                {displayName.charAt(0).toUpperCase()}

              </div>

              <span>{displayName}</span>

            </div>

          </div>

        </header>



        <div className="page-content">

          {activePage === 'dashboard' && (

            <>

              <section className="page-heading">

                <div>

                  <h1>Dashboard</h1>

                  <p>Welcome back, {displayName}. Here's your HR overview.</p>

                </div>



                <button

                  type="button"

                  className="button-primary"

                  onClick={() => {

                    handleNavigation('employees')

                    openEmployeeForm()

                  }}

                >

                  + Add Employee

                </button>

              </section>



              <section className="stats-grid">

                <div className="stat-card">

                  <span className="stat-label">TOTAL EMPLOYEES</span>

                  <h2>{employeeTotal}</h2>

                  <span className="stat-description">Registered employees</span>

                </div>



                <div className="stat-card">

                  <span className="stat-label">ACTIVE EMPLOYEES</span>

                  <h2>{activeEmployeeCount}</h2>

                  <span className="stat-description">Currently active</span>

                </div>



                <div className="stat-card">

                  <span className="stat-label">DEPARTMENTS</span>

                  <h2>{departments.length || '\u2014'}</h2>

                  <span className="stat-description">Available departments</span>

                </div>



                <div className="stat-card">

                  <span className="stat-label">PAYROLL STATUS</span>

                  <h2>{'\u2014'}</h2>

                  <span className="stat-description">Current payroll cycle</span>

                </div>

              </section>



              <section className="panel">

                <div className="panel-header">

                  <div>

                    <h3>Employee Directory</h3>

                    <p>Recently registered employees</p>

                  </div>



                  <button

                    type="button"

                    className="button-secondary"

                    onClick={() => handleNavigation('employees')}

                  >

                    View All

                  </button>

                </div>



                {employeeTable}

              </section>



              <section className="panel">

                <div className="panel-header">

                  <div>

                    <h3>Quick Actions</h3>

                    <p>Common HR operations</p>

                  </div>

                </div>



                <div className="quick-actions">

                  <button

                    type="button"

                    onClick={() => {

                      handleNavigation('employees')

                      openEmployeeForm()

                    }}

                  >

                    + Add Employee

                  </button>



                  <button

                    type="button"

                    onClick={() => handleNavigation('departments')}

                  >

                    View Departments

                  </button>



                  <button

                    type="button"

                    onClick={() => handleNavigation('payroll')}

                  >

                    View Payroll

                  </button>

                </div>

              </section>



              <section className="panel">

                <div className="panel-header">

                  <div>

                    <h3>Recent Payroll Activity</h3>

                    <p>Payroll cycle overview</p>

                  </div>

                </div>



                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>PAYROLL PERIOD</th>

                        <th>EMPLOYEES</th>

                        <th>AMOUNT</th>

                        <th>STATUS</th>

            <th>ACTION</th>

                      </tr>

                    </thead>



                    <tbody>

                      {payrollData.map((payroll) => (

                        <tr key={payroll.id}>

                          <td>{payroll.month}</td>

                          <td>{payroll.employees}</td>

                          <td>{formatCurrency(payroll.amount)}</td>

                          <td>{payroll.status}</td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </section>

            </>

          )}



          {activePage === 'employees' && (

            <>

              <section className="page-heading">

                <div>

                  <h1>Employees</h1>

                  <p>Manage your organization's employee records.</p>

                </div>



                <button

                  type="button"

                  className="button-primary"

                  onClick={openEmployeeForm}

                >

                  + Add Employee

                </button>

              </section>



              {employeeFormPanel}



              <section className="panel">

                <div className="panel-header">

                  <div>

                    <h3>Employee Directory</h3>

                    <p>{employeeTotal} registered employees</p>

                  </div>



                  <div className="directory-actions">

                    <input

                      type="search"

                      placeholder="Search employees..."

                      value={search}

                      onChange={(event) => setSearch(event.target.value)}

                    />



                    {search && (

                      <button

                        type="button"

                        className="button-secondary"

                        onClick={() => setSearch('')}

                      >

                        Clear

                      </button>

                    )}

                  </div>

                </div>



                {employeeTable}

              </section>

            </>

          )}



          {activePage === 'departments' && (

            <>

              <section className="page-heading">

                <div>

                  <h1>Departments</h1>

                  <p>View your organization's departments.</p>

                </div>

              </section>



              <section className="panel">

                <div className="panel-header">

                  <div>

                    <h3>Department Directory</h3>

                    <p>Available departments</p>

                  </div>

                </div>



                {departments.length === 0 ? (

                  <div className="empty-state">

                    Department information is not available here yet.

                  </div>

                ) : (

                  <div className="table-wrapper">

                    <table>

                      <thead>

                        <tr>

                          <th>CODE</th>

                          <th>DEPARTMENT NAME</th>

                          <th>DESCRIPTION</th>

                          <th>STATUS</th>

            <th>ACTION</th>

                        </tr>

                      </thead>



                      <tbody>

                        {departments.map((department) => (

                          <tr key={department.id}>

                            <td>{department.code}</td>

                            <td>{department.name}</td>

                            <td>{department.description || '-'}</td>

                            <td>

                              {department.active ? 'Active' : 'Inactive'}

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>

            </>

          )}





          {activePage === 'compensation' && (

            <Compensation

              employees={employees}

              token={token}

              userRole={displayRole}

              showMessage={showMessage}

            />

          )}





          {activePage === 'payroll' && (

            <>

              <section className="page-heading">

                <div>

                  <h1>Salary Overview</h1>

                  <p>View current employee salaries and compensation details.</p>

                </div>

              </section>



              <section className="panel">

                <div className="panel-header">

                  <div>

                    <h3>Current Employee Salaries</h3>

                    <p>Latest active compensation records</p>

                  </div>

                </div>

                 <div className="dashboard-stats">

  <div className="stat-card">

    <h4>Total Annual Salary</h4>

<h2>

  {currencySymbols[selectedSalaryCurrency]}{currencyFilteredSalaries.reduce(

    (total, salary) => total + Number(salary.annualSalary || 0),

    0

  ).toLocaleString('en-IN')}

</h2>

  </div>



  <div className="stat-card">

    <h4>Average Annual Salary</h4>

    <h2>

  {currencySymbols[selectedSalaryCurrency]}{currencyFilteredSalaries.length

    ? Math.round(

        currencyFilteredSalaries.reduce(

          (total, salary) => total + Number(salary.annualSalary || 0),

          0

        ) / currencyFilteredSalaries.length

      ).toLocaleString('en-IN')

    : '0'}

</h2>

  </div>



  <div className="stat-card">

    <h4>Highest Annual Salary</h4>

    <h2>

     {currencySymbols[selectedSalaryCurrency]}{Math.max(0, ...currencyFilteredSalaries.map(

        salary => Number(salary.annualSalary || 0)

      )).toLocaleString('en-IN')}

    </h2>

  </div>



  <div className="stat-card">

    <h4>Lowest Annual Salary</h4>

    <h2>

  {currencySymbols[selectedSalaryCurrency]}{currencyFilteredSalaries.length

    ? Math.min(...currencyFilteredSalaries.map(

        salary => Number(salary.annualSalary || 0)

      )).toLocaleString('en-IN')

    : '0'}

</h2>

  </div>

</div>



<section className="panel" style={{ marginBottom: '24px' }}>

  <h3>Salary Distribution by Department</h3>

  <p>Current annual salary totals by department (INR)</p>



  {departments.map((department) => {

    const departmentTotal = currentSalaries.reduce(

      (total, salary) => {

        const employee = allEmployees.find(

          (item) => Number(item.id) === Number(salary.employeeId)

        )



        return employee?.departmentName === department.name &&

          salary.currencyCode === 'INR'

          ? total + Number(salary.annualSalary || 0)

          : total

      },

      0

    )



    const totalInr = currentSalaries

      .filter((salary) => salary.currencyCode === 'INR')

      .reduce(

        (total, salary) => total + Number(salary.annualSalary || 0),

        0

      )



    const percentage = totalInr

      ? (departmentTotal / totalInr) * 100

      : 0



    return (

      <div key={department.id} style={{ marginBottom: '18px' }}>

        <div style={{

          display: 'flex',

          justifyContent: 'space-between',

          marginBottom: '6px'

        }}>

          <strong>{department.name}</strong>

          <strong>?{departmentTotal.toLocaleString('en-IN')}</strong>

        </div>



        <div style={{

          height: '12px',

          background: '#e5e7eb',

          borderRadius: '8px',

          overflow: 'hidden'

        }}>

          <div style={{

            width: `${percentage}%`,

            height: '100%',

            background: '#4f46e5',

            borderRadius: '8px'

          }} />

        </div>

      </div>

    )

  })}

</section>

<div style={{ marginBottom: '16px' }}>

  <label>Filter by Department: </label>

  <select

    value={selectedSalaryDepartment}

    onChange={(e) => setSelectedSalaryDepartment(e.target.value)}

  >

    <option value="All">All Departments</option>

    {departments.map((department) => (

      <option key={department.id} value={department.name}>

        {department.name}

      </option>

    ))}

  </select>

  <div style={{ marginTop: '12px' }}>

    <label>Filter by Currency: </label>

    <select

      value={selectedSalaryCurrency}

      onChange={(e) => setSelectedSalaryCurrency(e.target.value)}

    >

      <option value="INR">INR (?)</option>

      <option value="USD">USD ($)</option>

      <option value="GBP">GBP (Ã‚Â£)</option>

      <option value="CAD">CAD (CA$)</option>

      <option value="EUR">EUR (Ã¢â€šÂ¬)</option>

      <option value="AUD">AUD (A$)</option>

      <option value="SGD">SGD</option>

      <option value="AED">AED</option>

    </select>

  </div>

</div>



                <div className="table-wrapper">

                  <table>

                   <thead>

  <tr>

    <th>EMPLOYEE NAME</th>

    <th>EMPLOYEE ID</th>

    <th>ANNUAL SALARY</th>

    <th>CURRENCY</th>

    <th>EFFECTIVE FROM</th>

  </tr>

</thead>



<tbody>

  {salaryLoading ? (

    <tr>

      <td colSpan="5">Loading salary records...</td>

    </tr>

  ) : currencyFilteredSalaries.length === 0 ? (

    <tr>

      <td colSpan="5">No current salary records found.</td>

    </tr>

  ) : (

    currencyFilteredSalaries

  .filter((salary) => {

    if (selectedSalaryDepartment === 'All') return true



    const employee = allEmployees.find(

      (item) => Number(item.id) === Number(salary.employeeId)

    )



    return employee?.departmentName === selectedSalaryDepartment

  })

  .map((salary) => (

      <tr key={salary.id}>

        <td>{salary.employeeName}</td>

        <td>{salary.employeeNumber}</td>

        <td>

          {new Intl.NumberFormat('en-IN', {

            style: 'currency',

            currency: salary.currencyCode || 'INR',

            maximumFractionDigits: 0,

          }).format(Number(salary.annualSalary || 0))}

        </td>

        <td>{salary.currencyCode}</td>

        <td>{salary.effectiveFrom}</td>

      </tr>

    ))

  )}

</tbody>

                  </table>

                </div>

              </section>

            </>

          )}



          {activePage === 'reports' && (

            <>

              <section className="page-heading">

                <div>

                  <h1>Reports</h1>

                  <p>View employee and payroll reports.</p>

                </div>

              </section>



              <section className="panel">

                <div className="empty-state">

                  Reports will be available in a future development step.

                </div>

              </section>

            </>

          )}



          <footer className="footer">

            <span>{'\u00A9'} 2026 PaySphere. All rights reserved.</span>

            <span>Employee & Payroll Management System</span>

          </footer>

        </div>

      </main>



      {notification.message && (

        <div

          className={`toast-message ${notification.type}`}

          role="status"

        >

          {notification.message}

        </div>

      )}

    </div>

  )

}



export default App
