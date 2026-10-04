package com.foodredistribution.backend.dto;

import lombok.Data;

@Data
public class ClaimRequest {
    private Long foodId;
    private String ngoName;
    private String contactInfo;
}
