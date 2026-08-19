package com.tasksync.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tasksync.backend.model.Transaction;
import com.tasksync.backend.repository.TransactionRepository;

@RestController
@RequestMapping("/api/finance/lancamentos")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    @PostMapping
    public Transaction create(@RequestBody Transaction transaction) {
        transaction.setId(null);
        return transactionRepository.save(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
