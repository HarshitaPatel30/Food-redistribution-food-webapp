package com.foodredistribution.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.foodredistribution.backend.model.Claim;
import com.foodredistribution.backend.model.FoodListing;
import com.foodredistribution.backend.repository.ClaimRepository;
import com.foodredistribution.backend.repository.FoodListingRepository;

@RestController
@RequestMapping("/api/claim")
@CrossOrigin
public class ClaimController {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private FoodListingRepository foodListingRepository;

    @PostMapping("/add")
    public Claim claimFood(@RequestBody Claim claim) {

        FoodListing food = foodListingRepository
                .findById(claim.getFoodId())
                .orElseThrow(() -> new RuntimeException("Food not found"));

        food.setStatus("CLAIMED");
        foodListingRepository.save(food);

        claim.setStatus("CLAIMED");
        return claimRepository.save(claim);
    }

    @GetMapping("/all")
    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }
}
