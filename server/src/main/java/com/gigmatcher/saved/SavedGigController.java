package com.gigmatcher.saved;

import com.gigmatcher.common.ApiResponse;
import com.gigmatcher.common.ResourceNotFoundException;
import com.gigmatcher.gig.GigListing;
import com.gigmatcher.gig.GigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/saved-gigs")
public class SavedGigController {

    private final SavedGigRepository savedGigRepository;
    private final GigRepository gigRepository;

    public SavedGigController(SavedGigRepository savedGigRepository, GigRepository gigRepository) {
        this.savedGigRepository = savedGigRepository;
        this.gigRepository = gigRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavedGig>>> getMySavedGigs(Authentication auth) {
        String userId = auth.getName();
        List<SavedGig> savedGigs = savedGigRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(ApiResponse.ok(savedGigs));
    }

    @PutMapping("/{gigId}")
    @Transactional
    public ResponseEntity<ApiResponse<SavedGig>> saveGig(@PathVariable String gigId, Authentication auth) {
        String userId = auth.getName();

        return savedGigRepository.findByUserIdAndGigId(userId, gigId)
                .map(existing -> ResponseEntity.ok(ApiResponse.ok("Gig already saved", existing)))
                .orElseGet(() -> {
                    GigListing gig = gigRepository.findById(gigId)
                            .orElseThrow(() -> new ResourceNotFoundException("Gig not found: " + gigId));
                    String id = "svg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                    SavedGig newSaved = new SavedGig(id, userId, gig);
                    savedGigRepository.save(newSaved);
                    return ResponseEntity.ok(ApiResponse.ok("Gig saved successfully", newSaved));
                });
    }

    @DeleteMapping("/{gigId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> unsaveGig(@PathVariable String gigId, Authentication auth) {
        String userId = auth.getName();
        savedGigRepository.deleteByUserIdAndGigId(userId, gigId);
        return ResponseEntity.ok(ApiResponse.ok("Gig removed from saved list", null));
    }
}
