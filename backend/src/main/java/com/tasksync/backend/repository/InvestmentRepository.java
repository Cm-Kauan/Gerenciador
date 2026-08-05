package com.tasksync.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tasksync.backend.model.Investment;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
}
