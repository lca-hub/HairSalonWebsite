package com.lca.specification;

import com.lca.entity.Service;
import org.springframework.data.jpa.domain.Specification;

public class ServiceSpecification {

    private ServiceSpecification() {}

    public static Specification<Service> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank())
                return null;
            String value = "%" + keyword.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), value);
        };
    }

    public static Specification<Service> categoryId(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? null : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Service> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }
}