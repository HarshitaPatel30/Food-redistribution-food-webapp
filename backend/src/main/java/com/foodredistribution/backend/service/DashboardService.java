package com.foodredistribution.backend.service;

import com.foodredistribution.backend.dto.DashboardStats;
import com.foodredistribution.backend.repository.ClaimRepository;
import com.foodredistribution.backend.repository.FoodListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FoodListingRepository foodListingRepository;
    private final ClaimRepository claimRepository;
    private final FoodListingService foodListingService;

    public DashboardStats getStats() {
        foodListingService.markExpiredListings();
        long total = foodListingRepository.count();
        long available = foodListingRepository.countByStatus("AVAILABLE");
        long claimed = foodListingRepository.countByStatus("CLAIMED");
        long expired = foodListingRepository.countByStatus("EXPIRED");
        long delivered = foodListingRepository.countByStatus("DELIVERED");
        long totalClaims = claimRepository.count();
        long verified = claimRepository.countByVerifiedTrue();

        return new DashboardStats(total, available, claimed, expired, delivered, totalClaims, verified);
    }
}
