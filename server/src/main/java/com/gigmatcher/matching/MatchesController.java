package com.gigmatcher.matching;

import com.gigmatcher.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/me/matches")
public class MatchesController {

    private final MatchingService matchingService;

    public MatchesController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MatchResultDto>>> getMyMatches(Authentication auth) {
        String userId = auth.getName();
        List<MatchResultDto> matches = matchingService.getMatchesForUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(matches));
    }
}
