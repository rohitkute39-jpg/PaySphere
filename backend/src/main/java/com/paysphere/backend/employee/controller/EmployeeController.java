
package com.paysphere.backend.employee.controller;

import com.paysphere.backend.employee.dto.EmployeeRequest;
import com.paysphere.backend.employee.dto.EmployeeResponse;
import com.paysphere.backend.employee.entity.EmployeeStatus;
import com.paysphere.backend.employee.service.EmployeeService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(
            @Valid @RequestBody EmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }

    @GetMapping("/{id}")
    public EmployeeResponse getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @GetMapping
    public Page<EmployeeResponse> getEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search) {

        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page must be non-negative and size must be between 1 and 100"
            );
        }

        if (!java.util.Set.of(
                "id", "employeeNumber", "firstName",
                "lastName", "dateOfJoining", "status"
        ).contains(sortBy)) {
            throw new IllegalArgumentException("Invalid sort field");
        }

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, sortBy)
        );

        if (status != null) {
            return employeeService.getEmployeesByStatus(status, pageable);
        }

        if (departmentId != null) {
            return employeeService.getEmployeesByDepartment(departmentId, pageable);
        }

        if (search != null && !search.isBlank()) {
            return employeeService.searchEmployees(search.trim(), pageable);
        }

        return employeeService.getAllEmployees(pageable);
    }
}
