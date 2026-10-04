package com.foodredistribution.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FoodListingRequest {
    private String donorName;
    private String foodName;
    private String description;
    private int quantity;
    private String location;
    private String category;
    private LocalDateTime expiryTime;
}
