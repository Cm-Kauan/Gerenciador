package com.tasksync.backend.model;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Representa tanto uma Tarefa quanto uma Meta, diferenciadas pelo campo `type`.
 * O frontend trata os dois no mesmo array e filtra por esse campo, então
 * mantemos a mesma modelagem no backend em vez de criar duas entidades.
 */
@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String priority;

    private String workspace;

    private String tags;

    private LocalDate dueDate;

    private boolean completed;

    @Column(length = 4000)
    private String subtasks;

    private Instant createdAt;

    private String type;

    private Integer goalTarget;

    private Integer goalCurrent;

    public Task() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getWorkspace() {
        return workspace;
    }

    public void setWorkspace(String workspace) {
        this.workspace = workspace;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getSubtasks() {
        return subtasks;
    }

    public void setSubtasks(String subtasks) {
        this.subtasks = subtasks;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getGoalTarget() {
        return goalTarget;
    }

    public void setGoalTarget(Integer goalTarget) {
        this.goalTarget = goalTarget;
    }

    public Integer getGoalCurrent() {
        return goalCurrent;
    }

    public void setGoalCurrent(Integer goalCurrent) {
        this.goalCurrent = goalCurrent;
    }
}
