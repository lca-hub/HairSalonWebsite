package com.lca.specification;

import com.lca.entity.PurchaseOrder;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class PurchaseOrderSpecification {

    private PurchaseOrderSpecification() {}

    public static Specification<PurchaseOrder> supplierId(Long supplierId) {
        return (root, query, cb) -> supplierId == null ? null : cb.equal(root.get("supplier").get("id"), supplierId);
    }

    public static Specification<PurchaseOrder> isReceived(Boolean isReceived) {
        return (root, query, cb) -> isReceived == null ? null : cb.equal(root.get("isReceived"), isReceived);
    }

    public static Specification<PurchaseOrder> orderDateFrom(LocalDateTime from) {
        return (root, query, cb) -> from == null ? null : cb.greaterThanOrEqualTo(root.get("orderDate"), from);
    }

    public static Specification<PurchaseOrder> orderDateTo(LocalDateTime to) {
        return (root, query, cb) -> to == null ? null : cb.lessThanOrEqualTo(root.get("orderDate"), to);
    }
}