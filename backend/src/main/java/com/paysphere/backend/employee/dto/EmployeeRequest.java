package com.paysphere.backend.employee.dto;

import com.paysphere.backend.employee.entity.EmployeeStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EmployeeRequest(

        @NotBlank(message = "Employee number is required")
        @Size(max = 30)
        String employeeNumber,

        @NotBlank(message = "First name is required")
        @Size(max = 80)
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 80)
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 150)
        String email,

        @Size(max = 30)
        String phone,

        @Size(max = 2)
        String countryCode,

        @NotBlank(message = "Designation is required")
        @Size(max = 100)
        String designation,

        @NotNull(message = "Department ID is required")
        Long departmentId,

        @NotNull(message = "Joining date is required")
        @PastOrPresent(message = "Joining date cannot be in the future")
        LocalDate dateOfJoining,

        EmployeeStatus status

) {}
