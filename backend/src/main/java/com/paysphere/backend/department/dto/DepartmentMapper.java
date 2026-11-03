package com.paysphere.backend.department.dto;

import com.paysphere.backend.department.entity.Department;

public final class DepartmentMapper {

    private DepartmentMapper() {
    }

    public static Department toEntity(DepartmentRequest request) {
        Department department = new Department();
        department.setCode(request.code().trim().toUpperCase());
        department.setName(request.name().trim());
        department.setDescription(
                request.description() == null
                        ? null
                        : request.description().trim()
        );
        return department;
    }

    public static DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getCode(),
                department.getName(),
                department.getDescription(),
                department.isActive(),
                department.getCreatedAt()
        );
    }
}