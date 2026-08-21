package com.tasksync.backend.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "desc" e palavra reservada no PostgreSQL (usada em ORDER BY ... DESC) e
    // causa erro de sintaxe se usada como nome de coluna sem aspas. Por isso o
    // campo se chama "description" em vez de "desc". @JsonAlias aceita o nome
    // antigo "desc" também na entrada, caso algum cliente ainda mande esse
    // formato (ex.: cache de frontend desatualizado).
    @JsonAlias("desc")
    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    /** entrada | saida | cartao */
    private String type;

    /** pix | dinheiro | cartao_credito | cartao_debito | boleto | transferencia */
    private String payment;

    /** formato "YYYY-MM". Coluna renomeada porque MONTH e palavra reservada no H2. */
    @Column(name = "ref_month")
    private String month;

    private String category;

    public Transaction() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPayment() {
        return payment;
    }

    public void setPayment(String payment) {
        this.payment = payment;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
