package com.foodredistribution.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long foodId;

    private String ngoName;

    private String contactInfo;

    @Column(nullable = false)
    @Builder.Default
    private String status = "CLAIMED";   // CLAIMED / VERIFIED / CANCELLED

    // QR verification token (UUID stored as string)
    @Column(unique = true)
    private String verificationToken;

    private Boolean verified;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime claimedAt = LocalDateTime.now();

    private LocalDateTime verifiedAt;
}
