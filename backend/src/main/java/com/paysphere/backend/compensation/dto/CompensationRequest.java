package com.paysphere.backend.compensation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CompensationRequest(

        @NotNull(message = "Annual salary is required")
        @DecimalMin(value = "0.01", message = "Salary must be greater than zero")
        BigDecimal annualSalary,

        @NotBlank(message = "Currency code is required")
        @Pattern(regexp = "[A-Za-z]{3}",
                message = "Currency must be a three-letter code")
        String currencyCode,

        @NotNull(message = "Effective date is required")
        @PastOrPresent(message = "Effective date cannot be in the future")
        LocalDate effectiveFrom,

        @Size(max = 255, message = "Revision reason cannot exceed 255 characters")
        String revisionReason

) {}