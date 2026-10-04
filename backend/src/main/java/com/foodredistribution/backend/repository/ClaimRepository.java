package com.foodredistribution.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.foodredistribution.backend.model.Claim;
import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByFoodId(Long foodId);

    Optional<Claim> findByVerificationToken(String token);

    boolean existsByFoodId(Long foodId);

    long countByVerifiedTrue();
}
