package com.foodredistribution.backend.service;

import com.foodredistribution.backend.dto.FoodListingRequest;
import com.foodredistribution.backend.exception.BusinessRuleException;
import com.foodredistribution.backend.exception.ResourceNotFoundException;
import com.foodredistribution.backend.model.FoodListing;
import com.foodredistribution.backend.repository.FoodListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodListingService {

    private final FoodListingRepository foodListingRepository;

    public List<FoodListing> getAllListings() {
        // Mark expired ones before returning
        markExpiredListings();
        return foodListingRepository.findAll();
    }

    public FoodListing getListingById(Long id) {
        return foodListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food listing not found with id: " + id));
    }

    @Transactional
    public FoodListing createListing(FoodListingRequest request) {
        if (request.getDonorName() == null || request.getDonorName().isBlank()) {
            throw new BusinessRuleException("Donor name is required");
        }
        if (request.getFoodName() == null || request.getFoodName().isBlank()) {
            throw new BusinessRuleException("Food name is required");
        }
        if (request.getQuantity() <= 0) {
            throw new BusinessRuleException("Quantity must be greater than 0");
        }
        if (request.getExpiryTime() == null) {
            throw new BusinessRuleException("Expiry time is required");
        }
        if (!request.getExpiryTime().isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException("Expiry time must be in the future");
        }

        FoodListing listing = FoodListing.builder()
                .donorName(request.getDonorName())
                .foodName(request.getFoodName())
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .location(request.getLocation())
                .category(request.getCategory())
                .expiryTime(request.getExpiryTime())
                .status("AVAILABLE")
                .createdAt(LocalDateTime.now())
                .build();

        return foodListingRepository.save(listing);
    }

    @Transactional
    public FoodListing updateListingStatus(Long id, String status) {
        FoodListing listing = getListingById(id);
        listing.setStatus(status);
        return foodListingRepository.save(listing);
    }

    @Transactional
    public void deleteListing(Long id) {
        FoodListing listing = getListingById(id);
        if ("CLAIMED".equals(listing.getStatus())) {
            throw new BusinessRuleException("Cannot delete a claimed listing");
        }
        foodListingRepository.delete(listing);
    }

    public List<FoodListing> getListingsByStatus(String status) {
        markExpiredListings();
        return foodListingRepository.findByStatus(status);
    }

    /**
     * Scheduled job: mark expired listings every 5 minutes.
     */
    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void markExpiredListings() {
        List<FoodListing> expired = foodListingRepository.findExpiredAvailable(LocalDateTime.now());
        for (FoodListing f : expired) {
            f.setStatus("EXPIRED");
            foodListingRepository.save(f);
        }
    }
}
