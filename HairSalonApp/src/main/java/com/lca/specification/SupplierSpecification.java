package com.lca.specification;

import com.lca.entity.Supplier;
import org.springframework.data.jpa.domain.Specification;

public class SupplierSpecification {

    private SupplierSpecification() {}

    public static Specification<Supplier> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;
            String value = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), value),
                    cb.like(cb.lower(root.get("email")), value),
                    cb.like(cb.lower(root.get("phone")), value)
            );
        };
    }
}