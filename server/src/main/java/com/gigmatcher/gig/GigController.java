package com.gigmatcher.gig;

import com.gigmatcher.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gigs")
public class GigController {

    private final GigService gigService;

    public GigController(GigService gigService) {
        this.gigService = gigService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GigListing>>> getGigs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String paymentVerification,
            @RequestParam(required = false) Boolean remoteOnly) {
        List<GigListing> gigs = gigService.getAllGigs(category, search, paymentVerification, remoteOnly);
        return ResponseEntity.ok(ApiResponse.ok(gigs));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<GigListing>> getGigBySlug(@PathVariable String slug) {
        GigListing gig = gigService.getGigBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(gig));
    }
}
