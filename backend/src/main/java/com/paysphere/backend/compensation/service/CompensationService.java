
package com.paysphere.backend.compensation.service;

import com.paysphere.backend.compensation.dto.CompensationMapper;
import com.paysphere.backend.compensation.dto.CompensationRequest;
import com.paysphere.backend.compensation.dto.CompensationResponse;
import com.paysphere.backend.compensation.entity.CompensationRecord;
import com.paysphere.backend.compensation.repository.CompensationRepository;
import com.paysphere.backend.employee.repository.EmployeeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CompensationService {

    private final CompensationRepository compensationRepository;
    private final EmployeeRepository employeeRepository;

    public CompensationService(
            CompensationRepository compensationRepository,
            EmployeeRepository employeeRepository) {
        this.compensationRepository = compensationRepository;
        this.employeeRepository = employeeRepository;
    }

    public CompensationResponse createCompensation(
            Long employeeId,
            CompensationRequest request) {

        var employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found"));

        var currentRecord = compensationRepository
                .findFirstByEmployeeIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
                        employeeId
                );

        if (currentRecord.isPresent()) {
            CompensationRecord previous = currentRecord.get();

            if (!request.effectiveFrom().isAfter(previous.getEffectiveFrom())) {
                throw new IllegalArgumentException(
                        "New salary effective date must be after the previous salary date"
                );
            }

            previous.setEffectiveTo(request.effectiveFrom().minusDays(1));
            compensationRepository.save(previous);
        }

        CompensationRecord record = new CompensationRecord();
        record.setEmployee(employee);
        record.setAnnualSalary(request.annualSalary());
        record.setCurrencyCode(request.currencyCode().toUpperCase());
        record.setEffectiveFrom(request.effectiveFrom());
        record.setRevisionReason(request.revisionReason());

        return CompensationMapper.toResponse(
                compensationRepository.save(record)
        );
    }

    @Transactional(readOnly = true)
    public List<CompensationResponse> getSalaryHistory(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new IllegalArgumentException("Employee not found");
        }

        return compensationRepository
                .findByEmployeeIdOrderByEffectiveFromDesc(employeeId)
                .stream()
                .map(CompensationMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompensationResponse getCurrentSalary(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new IllegalArgumentException("Employee not found");
        }

        CompensationRecord record = compensationRepository
                .findFirstByEmployeeIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
                        employeeId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException("Current salary record not found"));

        return CompensationMapper.toResponse(record);
    }

    @Transactional(readOnly = true)
    public List<CompensationResponse> getAllCurrentSalaries() {

        return compensationRepository.findByEffectiveToIsNull()
                .stream()
                .map(CompensationMapper::toResponse)
                .toList();
    }
}
