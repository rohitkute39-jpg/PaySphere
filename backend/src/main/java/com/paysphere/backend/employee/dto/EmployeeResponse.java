package com.paysphere.backend.employee.dto;

import com.paysphere.backend.employee.entity.EmployeeStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeResponse(
        Long id,
        String employeeNumber,
        String firstName,
        String lastName,
        String email,
        String phone,
        String countryCode,
        String designation,
        Long departmentId,
        String departmentName,
        LocalDate dateOfJoining,
        EmployeeStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
