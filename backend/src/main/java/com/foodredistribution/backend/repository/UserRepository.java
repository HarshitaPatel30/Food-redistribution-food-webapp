package com.foodredistribution.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.foodredistribution.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
