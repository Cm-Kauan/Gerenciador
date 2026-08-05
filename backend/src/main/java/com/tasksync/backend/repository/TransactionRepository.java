package com.tasksync.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tasksync.backend.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
