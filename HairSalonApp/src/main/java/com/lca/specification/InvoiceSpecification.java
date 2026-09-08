package com.lca.specification;

import com.lca.entity.Invoice;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class InvoiceSpecification {

    private InvoiceSpecification() {}

    public static Specification<Invoice> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;
            String value = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("invoiceCode")), value),
                    cb.like(cb.lower(root.get("customer").get("user").get("firstName")), value),
                    cb.like(cb.lower(root.get("customer").get("user").get("lastName")), value),
                    cb.like(cb.lower(root.get("customer").get("user").get("email")), value)
            );
        };
    }

    public static Specification<Invoice> customerId(Long customerId) {
        return (root, query, cb) -> customerId == null ? null : cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<Invoice> paymentStatus(Object paymentStatus) {
        return (root, query, cb) -> paymentStatus == null ? null : cb.equal(root.get("paymentStatus"), paymentStatus);
    }

    public static Specification<Invoice> paymentMethod(Object paymentMethod) {
        return (root, query, cb) -> paymentMethod == null ? null : cb.equal(root.get("paymentMethod"), paymentMethod);
    }

    public static Specification<Invoice> createdFrom(LocalDateTime from) {
        return (root, query, cb) -> from == null ? null : cb.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    public static Specification<Invoice> createdTo(LocalDateTime to) {
        return (root, query, cb) -> to == null ? null : cb.lessThanOrEqualTo(root.get("createdAt"), to);
    }
}