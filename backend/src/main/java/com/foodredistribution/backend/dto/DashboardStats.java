package com.foodredistribution.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStats {
    private long totalListings;
    private long availableListings;
    private long claimedListings;
    private long expiredListings;
    private long deliveredListings;
    private long totalClaims;
    private long verifiedClaims;
}
