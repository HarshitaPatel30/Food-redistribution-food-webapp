package com.foodredistribution.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodredistribution.backend.model.FoodListing;
import com.foodredistribution.backend.repository.ClaimRepository;
import com.foodredistribution.backend.repository.FoodListingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:food-workflow;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
@AutoConfigureMockMvc
class FoodWorkflowApiIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private FoodListingRepository foodRepository;
    @Autowired private ClaimRepository claimRepository;

    @BeforeEach
    void clearDatabase() {
        claimRepository.deleteAll();
        foodRepository.deleteAll();
    }

    @Test
    void donorListingClaimAndQrVerificationPersistAcrossApiCalls() throws Exception {
        String createdBody = mvc.perform(post("/api/food/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"donorName":"Community Kitchen","foodName":"Vegetable meals",
                                 "description":"Freshly prepared","quantity":12,"location":"Main Hall",
                                 "category":"Cooked Food","expiryTime":"2099-10-04T18:30:00"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("AVAILABLE")))
                .andReturn().getResponse().getContentAsString();
        JsonNode listing = objectMapper.readTree(createdBody);
        long listingId = listing.get("id").asLong();

        mvc.perform(get("/api/food/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].foodName", is("Vegetable meals")));

        String claimBody = mvc.perform(post("/api/claim/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{" + "\"foodId\":" + listingId
                                + ",\"ngoName\":\"Hope Foundation\",\"contactInfo\":\"hello@example.org\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("CLAIMED")))
                .andExpect(jsonPath("$.verificationToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(claimBody).get("verificationToken").asText();

        mvc.perform(post("/api/claim/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{" + "\"foodId\":" + listingId + ",\"ngoName\":\"Second NGO\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/food/" + listingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CLAIMED")));
        mvc.perform(get("/api/claim/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ngoName", is("Hope Foundation")));

        mvc.perform(post("/api/claim/verify/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified", is(true)))
                .andExpect(jsonPath("$.status", is("VERIFIED")));
        mvc.perform(get("/api/food/" + listingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DELIVERED")));
        mvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalListings", is(1)))
                .andExpect(jsonPath("$.totalClaims", is(1)))
                .andExpect(jsonPath("$.verifiedClaims", is(1)))
                .andExpect(jsonPath("$.deliveredListings", is(1)));
        mvc.perform(post("/api/claim/verify/" + token)).andExpect(status().isBadRequest());
    }

    @Test
    void expiredAvailableListingIsPersistedAsExpiredAndCannotBeClaimed() throws Exception {
        FoodListing expired = foodRepository.save(FoodListing.builder()
                .donorName("Donor")
                .foodName("Expired bread")
                .quantity(3)
                .expiryTime(LocalDateTime.now().minusMinutes(1))
                .status("AVAILABLE")
                .createdAt(LocalDateTime.now().minusHours(2))
                .build());

        mvc.perform(post("/api/claim/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{" + "\"foodId\":" + expired.getId() + ",\"ngoName\":\"Hope Foundation\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/food/" + expired.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("EXPIRED")));
        mvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expiredListings", is(1)))
                .andExpect(jsonPath("$.totalClaims", is(0)));
    }
}
