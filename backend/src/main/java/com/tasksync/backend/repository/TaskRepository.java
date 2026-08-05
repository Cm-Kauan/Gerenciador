package com.tasksync.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tasksync.backend.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
