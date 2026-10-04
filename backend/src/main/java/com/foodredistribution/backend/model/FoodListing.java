package com.foodredistribution.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String donorName;

    @Column(nullable = false)
    private String foodName;

    private String description;

    @Column(nullable = false)
    private int quantity;

    private String location;

    private String category;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Column(nullable = false)
    @Builder.Default
    private String status = "AVAILABLE";   // AVAILABLE / CLAIMED / EXPIRED / DELIVERED

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
