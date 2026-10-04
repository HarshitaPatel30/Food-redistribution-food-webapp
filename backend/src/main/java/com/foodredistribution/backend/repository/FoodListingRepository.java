package com.foodredistribution.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import com.foodredistribution.backend.model.FoodListing;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

public interface FoodListingRepository extends JpaRepository<FoodListing, Long> {

    List<FoodListing> findByStatus(String status);

    long countByStatus(String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM FoodListing f WHERE f.id = :id")
    Optional<FoodListing> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT f FROM FoodListing f WHERE f.expiryTime <= :now AND f.status = 'AVAILABLE'")
    List<FoodListing> findExpiredAvailable(@Param("now") LocalDateTime now);
}
