package com.tasksync.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tasksync.backend.model.TeamMember;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
}
