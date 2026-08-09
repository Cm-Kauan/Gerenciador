package com.tasksync.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tasksync.backend.model.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
