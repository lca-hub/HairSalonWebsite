package com.lca.specification;

import com.lca.entity.Service;
import org.springframework.data.jpa.domain.Specification;

public class ServiceSpecification {

    public static Specification<Service> keyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }

        String value = "%" + keyword.trim().toLowerCase() + "%";

        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), value);
    }

    public static Specification<Service> categoryId(Long categoryId) {
        if (categoryId == null) {
            return null;
        }

        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Service> active(Boolean isActive) {
        if (isActive == null) {
            return null;
        }

        return (root, query, cb) -> cb.equal(root.get("isActive"), isActive);
    }
}