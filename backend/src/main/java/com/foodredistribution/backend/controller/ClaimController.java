package com.foodredistribution.backend.controller;

import com.foodredistribution.backend.dto.ClaimRequest;
import com.foodredistribution.backend.model.Claim;
import com.foodredistribution.backend.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claim")
@CrossOrigin(origins = "${app.frontend.url:*}")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @GetMapping("/all")
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimById(id));
    }

    @GetMapping("/food/{foodId}")
    public ResponseEntity<List<Claim>> getClaimsByFood(@PathVariable Long foodId) {
        return ResponseEntity.ok(claimService.getClaimsByFoodId(foodId));
    }

    @PostMapping("/add")
    public ResponseEntity<Claim> claimFood(@RequestBody ClaimRequest request) {
        Claim claim = claimService.createClaim(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(claim);
    }

    /**
     * QR Verification endpoint.
     * Frontend submits the token from the QR code here.
     */
    @PostMapping("/verify/{token}")
    public ResponseEntity<Claim> verifyClaim(@PathVariable String token) {
        Claim verified = claimService.verifyByToken(token);
        return ResponseEntity.ok(verified);
    }
}
