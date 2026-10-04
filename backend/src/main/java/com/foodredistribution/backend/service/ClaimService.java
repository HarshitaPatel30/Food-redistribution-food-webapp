package com.foodredistribution.backend.service;

import com.foodredistribution.backend.dto.ClaimRequest;
import com.foodredistribution.backend.exception.BusinessRuleException;
import com.foodredistribution.backend.exception.ResourceNotFoundException;
import com.foodredistribution.backend.model.Claim;
import com.foodredistribution.backend.model.FoodListing;
import com.foodredistribution.backend.repository.ClaimRepository;
import com.foodredistribution.backend.repository.FoodListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final FoodListingRepository foodListingRepository;

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public Claim getClaimById(Long id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));
    }

    @Transactional(noRollbackFor = BusinessRuleException.class)
    public Claim createClaim(ClaimRequest request) {
        if (request.getFoodId() == null) {
            throw new BusinessRuleException("Food ID is required");
        }
        if (request.getNgoName() == null || request.getNgoName().isBlank()) {
            throw new BusinessRuleException("NGO name is required");
        }

        FoodListing food = foodListingRepository.findByIdForUpdate(request.getFoodId())
                .orElseThrow(() -> new ResourceNotFoundException("Food listing not found with id: " + request.getFoodId()));

        // Prevent claiming expired listings
        if ("EXPIRED".equals(food.getStatus())) {
            throw new BusinessRuleException("Cannot claim an expired listing");
        }

        // Prevent claiming if already claimed or delivered
        if (!"AVAILABLE".equals(food.getStatus())) {
            throw new BusinessRuleException("Food listing is not available for claiming. Current status: " + food.getStatus());
        }

        // Check real-time expiry
        if (!food.getExpiryTime().isAfter(LocalDateTime.now())) {
            food.setStatus("EXPIRED");
            foodListingRepository.save(food);
            throw new BusinessRuleException("This food listing has expired and cannot be claimed");
        }

        // Mark food as CLAIMED
        food.setStatus("CLAIMED");
        foodListingRepository.save(food);

        // Generate unique QR verification token
        String verificationToken = UUID.randomUUID().toString();

        Claim claim = Claim.builder()
                .foodId(request.getFoodId())
                .ngoName(request.getNgoName())
                .contactInfo(request.getContactInfo())
                .status("CLAIMED")
                .verificationToken(verificationToken)
                .verified(false)
                .claimedAt(LocalDateTime.now())
                .build();

        return claimRepository.save(claim);
    }

    /**
     * QR Verification: verify a claim using its token.
     * Sets status to VERIFIED and prevents re-verification.
     */
    @Transactional
    public Claim verifyByToken(String token) {
        Claim claim = claimRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification token"));

        if (Boolean.TRUE.equals(claim.getVerified())) {
            throw new BusinessRuleException("This claim has already been verified");
        }

        claim.setVerified(true);
        claim.setStatus("VERIFIED");
        claim.setVerifiedAt(LocalDateTime.now());

        // Also mark the food listing as DELIVERED
        foodListingRepository.findById(claim.getFoodId()).ifPresent(food -> {
            food.setStatus("DELIVERED");
            foodListingRepository.save(food);
        });

        return claimRepository.save(claim);
    }

    public List<Claim> getClaimsByFoodId(Long foodId) {
        return claimRepository.findByFoodId(foodId);
    }
}
