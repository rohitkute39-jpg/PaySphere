
package com.paysphere.backend.department.service;

import com.paysphere.backend.department.dto.DepartmentMapper;
import com.paysphere.backend.department.dto.DepartmentRequest;
import com.paysphere.backend.department.dto.DepartmentResponse;
import com.paysphere.backend.department.entity.Department;
import com.paysphere.backend.department.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {

        String code = request.code().trim();

        if (departmentRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Department code already exists");
        }

        if (departmentRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new IllegalArgumentException("Department name already exists");
        }

        Department department = DepartmentMapper.toEntity(request);

        return DepartmentMapper.toResponse(
                departmentRepository.save(department)
        );
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(DepartmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Department not found with ID: " + id
                ));

        return DepartmentMapper.toResponse(department);
    }
}
