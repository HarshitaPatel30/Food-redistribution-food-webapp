package com.foodredistribution.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.foodredistribution.backend.model.FoodListing;

public interface FoodListingRepository extends JpaRepository<FoodListing, Long> {
}
