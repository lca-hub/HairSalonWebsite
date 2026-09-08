package com.lca.specification;

import com.lca.entity.Stylist;
import org.springframework.data.jpa.domain.Specification;

public class StylistSpecification {

    private StylistSpecification() {}

    public static Specification<Stylist> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;
            String value = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("specialization")), value),
                    cb.like(cb.lower(root.get("user").get("firstName")), value),
                    cb.like(cb.lower(root.get("user").get("lastName")), value),
                    cb.like(cb.lower(cb.concat(cb.concat(root.get("user").get("firstName"), " "), root.get("user").get("lastName"))), value)
            );
        };
    }

    public static Specification<Stylist> specialization(String specialization) {
        return (root, query, cb) -> specialization == null || specialization.isBlank() ? null : cb.equal(cb.lower(root.get("specialization")), specialization.trim().toLowerCase());
    }

    public static Specification<Stylist> minExperience(Integer minExperience) {
        return (root, query, cb) -> minExperience == null ? null : cb.greaterThanOrEqualTo(root.get("experienceYears"), minExperience);
    }

    public static Specification<Stylist> maxExperience(Integer maxExperience) {
        return (root, query, cb) -> maxExperience == null ? null : cb.lessThanOrEqualTo(root.get("experienceYears"), maxExperience);
    }

    public static Specification<Stylist> isActive(Boolean isActive) {
        return (root, query, cb) -> isActive == null ? null : cb.equal(root.get("user").get("isActive"), isActive);
    }
}