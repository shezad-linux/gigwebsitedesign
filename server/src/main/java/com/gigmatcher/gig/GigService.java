package com.gigmatcher.gig;

import com.gigmatcher.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GigService {

    private final GigRepository gigRepository;

    public GigService(GigRepository gigRepository) {
        this.gigRepository = gigRepository;
    }

    public List<GigListing> getAllGigs(String category,
                                       String search,
                                       String paymentVerification,
                                       Boolean remoteOnly) {
        return gigRepository.searchGigs(category, search, paymentVerification, remoteOnly);
    }

    public GigListing getGigBySlug(String slug) {
        return gigRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found with slug: " + slug));
    }

    public GigListing getGigById(String id) {
        return gigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found with id: " + id));
    }

    public GigListing saveGig(GigListing gig) {
        return gigRepository.save(gig);
    }

    public void deleteGig(String id) {
        if (!gigRepository.existsById(id)) {
            throw new ResourceNotFoundException("Gig not found with id: " + id);
        }
        gigRepository.deleteById(id);
    }
}
