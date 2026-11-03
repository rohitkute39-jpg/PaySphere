package com.paysphere.backend.compensation.repository;

import com.paysphere.backend.compensation.entity.CompensationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompensationRepository extends JpaRepository<CompensationRecord, Long> {

    List<CompensationRecord> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);

    Optional<CompensationRecord> findFirstByEmployeeIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
            Long employeeId
    );

    List<CompensationRecord> findByCurrencyCode(String currencyCode);
}