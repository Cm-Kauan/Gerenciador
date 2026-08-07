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

import com.tasksync.backend.model.Investment;
import com.tasksync.backend.repository.InvestmentRepository;

@RestController
@RequestMapping("/api/finance/investments")
public class InvestmentController {

    private final InvestmentRepository investmentRepository;

    public InvestmentController(InvestmentRepository investmentRepository) {
        this.investmentRepository = investmentRepository;
    }

    @GetMapping
    public List<Investment> findAll() {
        return investmentRepository.findAll();
    }

    @PostMapping
    public Investment create(@RequestBody Investment investment) {
        investment.setId(null);
        return investmentRepository.save(investment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        investmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
