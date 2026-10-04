package com.foodredistribution.backend.controller;

import com.foodredistribution.backend.dto.FoodListingRequest;
import com.foodredistribution.backend.model.FoodListing;
import com.foodredistribution.backend.service.FoodListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "${app.frontend.url:*}")
@RequiredArgsConstructor
public class FoodListingController {

    private final FoodListingService foodListingService;

    @GetMapping("/all")
    public ResponseEntity<List<FoodListing>> getAllFood() {
        return ResponseEntity.ok(foodListingService.getAllListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodListing> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodListingService.getListingById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<FoodListing>> getFoodByStatus(@PathVariable String status) {
        return ResponseEntity.ok(foodListingService.getListingsByStatus(status.toUpperCase()));
    }

    @PostMapping("/add")
    public ResponseEntity<FoodListing> addFood(@RequestBody FoodListingRequest request) {
        FoodListing created = foodListingService.createListing(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id) {
        foodListingService.deleteListing(id);
        return ResponseEntity.noContent().build();
    }
}
