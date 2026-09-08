package com.lca.specification;

import com.lca.entity.Customer;
import org.springframework.data.jpa.domain.Specification;

public class CustomerSpecification {

    private CustomerSpecification() {}

    public static Specification<Customer> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;
            String value = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("user").get("firstName")), value),
                    cb.like(cb.lower(root.get("user").get("lastName")), value),
                    cb.like(cb.lower(cb.concat(cb.concat(root.get("user").get("firstName"), " "), root.get("user").get("lastName"))), value),
                    cb.like(cb.lower(root.get("user").get("email")), value),
                    cb.like(cb.lower(root.get("user").get("phoneNumber")), value)
            );
        };
    }

    public static Specification<Customer> gender(Object gender) {
        return (root, query, cb) -> gender == null ? null : cb.equal(root.get("gender"), gender);
    }

    public static Specification<Customer> isActive(Boolean isActive) {
        return (root, query, cb) -> isActive == null ? null : cb.equal(root.get("user").get("isActive"), isActive);
    }
}