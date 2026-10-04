package com.foodredistribution.backend;

import com.foodredistribution.backend.dto.ClaimRequest;
import com.foodredistribution.backend.dto.FoodListingRequest;
import com.foodredistribution.backend.exception.BusinessRuleException;
import com.foodredistribution.backend.model.Claim;
import com.foodredistribution.backend.model.FoodListing;
import com.foodredistribution.backend.repository.ClaimRepository;
import com.foodredistribution.backend.repository.FoodListingRepository;
import com.foodredistribution.backend.service.ClaimService;
import com.foodredistribution.backend.service.FoodListingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodRedistributionApplicationTests {

    @Mock
    private FoodListingRepository foodListingRepository;

    @Mock
    private ClaimRepository claimRepository;

    @InjectMocks
    private FoodListingService foodListingService;

    @InjectMocks
    private ClaimService claimService;

    private FoodListingRequest validRequest;
    private FoodListing availableListing;
    private FoodListing expiredListing;
    private FoodListing claimedListing;

    @BeforeEach
    void setup() {
        validRequest = new FoodListingRequest();
        validRequest.setDonorName("Test Donor");
        validRequest.setFoodName("Rice");
        validRequest.setQuantity(10);
        validRequest.setLocation("Hostel A");
        validRequest.setCategory("Cooked Food");
        validRequest.setExpiryTime(LocalDateTime.now().plusHours(4));

        availableListing = FoodListing.builder()
                .id(1L)
                .donorName("Test Donor")
                .foodName("Rice")
                .quantity(10)
                .status("AVAILABLE")
                .expiryTime(LocalDateTime.now().plusHours(4))
                .createdAt(LocalDateTime.now())
                .build();

        expiredListing = FoodListing.builder()
                .id(2L)
                .donorName("Test Donor")
                .foodName("Old Bread")
                .quantity(5)
                .status("AVAILABLE")
                .expiryTime(LocalDateTime.now().minusHours(1))
                .createdAt(LocalDateTime.now().minusHours(5))
                .build();

        claimedListing = FoodListing.builder()
                .id(3L)
                .donorName("Test Donor")
                .foodName("Curry")
                .quantity(8)
                .status("CLAIMED")
                .expiryTime(LocalDateTime.now().plusHours(2))
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ===== FoodListingService Tests =====

    @Test
    void createListing_withValidRequest_succeeds() {
        when(foodListingRepository.save(any(FoodListing.class))).thenReturn(availableListing);

        FoodListing result = foodListingService.createListing(validRequest);

        assertNotNull(result);
        assertEquals("AVAILABLE", result.getStatus());
        verify(foodListingRepository, times(1)).save(any(FoodListing.class));
    }

    @Test
    void createListing_withEmptyDonorName_throwsException() {
        validRequest.setDonorName("");
        assertThrows(BusinessRuleException.class, () -> foodListingService.createListing(validRequest));
    }

    @Test
    void createListing_withZeroQuantity_throwsException() {
        validRequest.setQuantity(0);
        assertThrows(BusinessRuleException.class, () -> foodListingService.createListing(validRequest));
    }

    @Test
    void createListing_withPastExpiry_throwsException() {
        validRequest.setExpiryTime(LocalDateTime.now().minusHours(1));
        assertThrows(BusinessRuleException.class, () -> foodListingService.createListing(validRequest));
    }

    // ===== ClaimService Tests =====

    @Test
    void claimFood_withAvailableListing_succeeds() {
        ClaimRequest request = new ClaimRequest();
        request.setFoodId(1L);
        request.setNgoName("Test NGO");
        request.setContactInfo("test@ngo.org");

        Claim mockClaim = Claim.builder()
                .id(1L)
                .foodId(1L)
                .ngoName("Test NGO")
                .status("CLAIMED")
                .verificationToken("test-token-uuid")
                .verified(false)
                .claimedAt(LocalDateTime.now())
                .build();

        when(foodListingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(availableListing));
        when(foodListingRepository.save(any(FoodListing.class))).thenReturn(availableListing);
        when(claimRepository.save(any(Claim.class))).thenReturn(mockClaim);

        Claim result = claimService.createClaim(request);

        assertNotNull(result);
        assertEquals("CLAIMED", result.getStatus());
        assertNotNull(result.getVerificationToken());
        assertEquals("CLAIMED", availableListing.getStatus()); // food status updated
    }

    @Test
    void claimFood_withClaimedListing_throwsException() {
        ClaimRequest request = new ClaimRequest();
        request.setFoodId(3L);
        request.setNgoName("Test NGO");

        when(foodListingRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(claimedListing));

        assertThrows(BusinessRuleException.class, () -> claimService.createClaim(request));
    }

    @Test
    void claimFood_withExpiredListing_throwsException() {
        ClaimRequest request = new ClaimRequest();
        request.setFoodId(2L);
        request.setNgoName("Test NGO");

        when(foodListingRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(expiredListing));
        when(foodListingRepository.save(any(FoodListing.class))).thenReturn(expiredListing);

        assertThrows(BusinessRuleException.class, () -> claimService.createClaim(request));
    }

    @Test
    void verifyByToken_withValidToken_setsVerified() {
        Claim unverifiedClaim = Claim.builder()
                .id(1L)
                .foodId(1L)
                .status("CLAIMED")
                .verificationToken("valid-token")
                .verified(false)
                .claimedAt(LocalDateTime.now())
                .build();

        when(claimRepository.findByVerificationToken("valid-token")).thenReturn(Optional.of(unverifiedClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(unverifiedClaim);
        when(foodListingRepository.findById(1L)).thenReturn(Optional.of(availableListing));
        when(foodListingRepository.save(any(FoodListing.class))).thenReturn(availableListing);

        Claim result = claimService.verifyByToken("valid-token");

        assertTrue(result.getVerified());
        assertEquals("VERIFIED", result.getStatus());
    }

    @Test
    void verifyByToken_alreadyVerified_throwsException() {
        Claim alreadyVerified = Claim.builder()
                .id(1L)
                .foodId(1L)
                .status("VERIFIED")
                .verificationToken("used-token")
                .verified(true)
                .claimedAt(LocalDateTime.now())
                .verifiedAt(LocalDateTime.now())
                .build();

        when(claimRepository.findByVerificationToken("used-token")).thenReturn(Optional.of(alreadyVerified));

        assertThrows(BusinessRuleException.class, () -> claimService.verifyByToken("used-token"));
    }
}
