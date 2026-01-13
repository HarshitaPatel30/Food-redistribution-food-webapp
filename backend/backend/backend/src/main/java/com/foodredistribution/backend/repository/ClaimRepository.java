package com.foodredistribution.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.foodredistribution.backend.model.Claim;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
}
