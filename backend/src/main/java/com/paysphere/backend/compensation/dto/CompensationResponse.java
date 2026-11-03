package com.paysphere.backend.compensation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CompensationResponse(
        Long id,
        Long employeeId,
        String employeeNumber,
        String employeeName,
        BigDecimal annualSalary,
        String currencyCode,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        String revisionReason,
        LocalDateTime createdAt
) {}