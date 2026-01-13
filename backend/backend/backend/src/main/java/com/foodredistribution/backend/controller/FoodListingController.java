package com.foodredistribution.backend.controller;

import com.foodredistribution.backend.model.FoodListing;
import com.foodredistribution.backend.repository.FoodListingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin("*")
public class FoodListingController {

    private final FoodListingRepository repo;

    public FoodListingController(FoodListingRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/all")
    public List<FoodListing> getAllFood() {
        return repo.findAll();
    }

    @PostMapping("/add")
    public FoodListing addFood(@RequestBody FoodListing food) {
        return repo.save(food);
    }
}
