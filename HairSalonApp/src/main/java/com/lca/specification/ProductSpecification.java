package com.lca.specification;

import com.lca.entity.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    public static Specification<Product> isActive(Boolean isActive) {
        if (isActive == null) {
            return null;
        }

        return (root, query, cb) -> cb.equal(root.get("isActive"), isActive);
    }
    public static Specification<Product> keyword(String keyword) {

        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        String value = "%" + keyword.trim().toLowerCase() + "%";

        return (root, query, cb) -> cb.or(cb.like(cb.lower(root.get("name")), value), cb.like(cb.lower(root.get("productCode")), value));
    }

    public static Specification<Product> categoryId(Long categoryId) {

        if (categoryId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Product> supplierId(Long supplierId) {

        if (supplierId == null) {
            return null;
        }

        return (root, query, cb) -> cb.equal(root.get("supplier").get("id"), supplierId);
    }
}