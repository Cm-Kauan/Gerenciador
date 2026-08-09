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

import com.tasksync.backend.model.TeamMember;
import com.tasksync.backend.repository.TeamMemberRepository;

@RestController
@RequestMapping("/api/team")
public class TeamMemberController {

    private final TeamMemberRepository teamMemberRepository;

    public TeamMemberController(TeamMemberRepository teamMemberRepository) {
        this.teamMemberRepository = teamMemberRepository;
    }

    @GetMapping
    public List<TeamMember> findAll() {
        return teamMemberRepository.findAll();
    }

    @PostMapping
    public TeamMember create(@RequestBody TeamMember teamMember) {
        teamMember.setId(null);
        return teamMemberRepository.save(teamMember);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teamMemberRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
