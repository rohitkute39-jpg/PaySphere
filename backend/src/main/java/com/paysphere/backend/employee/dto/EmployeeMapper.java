package com.paysphere.backend.employee.dto;

import com.paysphere.backend.department.entity.Department;
import com.paysphere.backend.employee.entity.Employee;
import com.paysphere.backend.employee.entity.EmployeeStatus;

public final class EmployeeMapper {

    private EmployeeMapper() {
    }

    public static Employee toEntity(EmployeeRequest request, Department department) {

        Employee employee = new Employee();

        employee.setEmployeeNumber(request.employeeNumber().trim());
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName().trim());
        employee.setEmail(request.email().trim().toLowerCase());
        employee.setPhone(request.phone());
        employee.setDesignation(request.designation().trim());
        employee.setDepartment(department);
        employee.setDateOfJoining(request.dateOfJoining());

        employee.setStatus(
                request.status() == null
                        ? EmployeeStatus.ACTIVE
                        : request.status()
        );

        return employee;
    }

    public static EmployeeResponse toResponse(Employee employee) {

        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeNumber(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getDesignation(),
                employee.getDepartment().getId(),
                employee.getDepartment().getName(),
                employee.getDateOfJoining(),
                employee.getStatus(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}