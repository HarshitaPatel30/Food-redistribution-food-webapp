package com.foodredistribution.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.foodredistribution.backend.model")
@EnableJpaRepositories("com.foodredistribution.backend.repository")
public class FoodRedistributionApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodRedistributionApplication.class, args);
    }
}
	