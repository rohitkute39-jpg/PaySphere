package com.paysphere.backend.compensation.dto;

import com.paysphere.backend.compensation.entity.CompensationRecord;

public final class CompensationMapper {

    private CompensationMapper() {
    }

    public static CompensationResponse toResponse(
            CompensationRecord record) {

        var employee = record.getEmployee();

        return new CompensationResponse(
                record.getId(),
                employee.getId(),
                employee.getEmployeeNumber(),
                employee.getFirstName() + " " + employee.getLastName(),
                record.getAnnualSalary(),
                record.getCurrencyCode(),
                record.getEffectiveFrom(),
                record.getEffectiveTo(),
                record.getRevisionReason(),
                record.getCreatedAt()
        );
    }
}