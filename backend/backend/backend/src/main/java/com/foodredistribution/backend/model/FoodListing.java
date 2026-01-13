package com.foodredistribution.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
public class FoodListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String foodName;
    private String category;
    private int quantity;
    private String expiryTime;
    private String location;
    private String status;   // AVAILABLE / CLAIMED / DELIVERED
}
