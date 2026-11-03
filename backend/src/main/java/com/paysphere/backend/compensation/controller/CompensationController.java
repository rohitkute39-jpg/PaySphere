
package com.paysphere.backend.compensation.controller;

import com.paysphere.backend.compensation.dto.CompensationRequest;
import com.paysphere.backend.compensation.dto.CompensationResponse;
import com.paysphere.backend.compensation.service.CompensationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/compensation")
public class CompensationController {

    private final CompensationService compensationService;

    public CompensationController(CompensationService compensationService) {
        this.compensationService = compensationService;
    }

    @PostMapping("/employees/{employeeId}")
    @ResponseStatus(HttpStatus.CREATED)
    public CompensationResponse createCompensation(
            @PathVariable Long employeeId,
            @Valid @RequestBody CompensationRequest request) {

        return compensationService.createCompensation(employeeId, request);
    }

    @GetMapping("/employees/{employeeId}/history")
    public List<CompensationResponse> getSalaryHistory(
            @PathVariable Long employeeId) {

        return compensationService.getSalaryHistory(employeeId);
    }

    @GetMapping("/employees/{employeeId}/current")
    public CompensationResponse getCurrentSalary(
            @PathVariable Long employeeId) {

        return compensationService.getCurrentSalary(employeeId);
    }
}
