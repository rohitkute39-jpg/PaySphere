
package com.paysphere.backend.employee.service;

import com.paysphere.backend.department.repository.DepartmentRepository;
import com.paysphere.backend.employee.dto.EmployeeMapper;
import com.paysphere.backend.employee.dto.EmployeeRequest;
import com.paysphere.backend.employee.dto.EmployeeResponse;
import com.paysphere.backend.employee.entity.Employee;
import com.paysphere.backend.employee.entity.EmployeeStatus;
import com.paysphere.backend.employee.repository.EmployeeRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    public EmployeeResponse createEmployee(EmployeeRequest request) {

        String employeeNumber = request.employeeNumber().trim();
        String email = request.email().trim();

        if (employeeRepository.existsByEmployeeNumber(employeeNumber)) {
            throw new IllegalArgumentException("Employee number already exists");
        }

        if (employeeRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Employee email already exists");
        }

        var department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Department not found"));

        Employee employee = EmployeeMapper.toEntity(request, department);

        return EmployeeMapper.toResponse(employeeRepository.save(employee));
    }

    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Employee not found with ID: " + id
                ));

        String employeeNumber = request.employeeNumber().trim();
        String email = request.email().trim();

        if (!employee.getEmployeeNumber().equalsIgnoreCase(employeeNumber)
                && employeeRepository.existsByEmployeeNumber(employeeNumber)) {
            throw new IllegalArgumentException("Employee number already exists");
        }

        if (!employee.getEmail().equalsIgnoreCase(email)
                && employeeRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Employee email already exists");
        }

        var department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Department not found"));

        employee.setEmployeeNumber(employeeNumber);
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName().trim());
        employee.setEmail(email);
        employee.setPhone(request.phone());
        employee.setCountryCode(request.countryCode());
        employee.setDesignation(request.designation().trim());
        employee.setDepartment(department);
        employee.setDateOfJoining(request.dateOfJoining());
        employee.setStatus(
                request.status() != null
                        ? request.status()
                        : EmployeeStatus.ACTIVE
        );

        return EmployeeMapper.toResponse(employeeRepository.save(employee));
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Employee not found with ID: " + id
                ));

        return EmployeeMapper.toResponse(employee);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable)
                .map(EmployeeMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getEmployeesByStatus(
            EmployeeStatus status, Pageable pageable) {
        return employeeRepository.findByStatus(status, pageable)
                .map(EmployeeMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getEmployeesByDepartment(
            Long departmentId, Pageable pageable) {
        return employeeRepository.findByDepartmentId(departmentId, pageable)
                .map(EmployeeMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> searchEmployees(
            String keyword, Pageable pageable) {
        return employeeRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        keyword, keyword, pageable
                )
                .map(EmployeeMapper::toResponse);
    }
}
