package com.lca.specification;

import com.lca.entity.Attendance;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class AttendanceSpecification {

    private AttendanceSpecification() {}

    public static Specification<Attendance> stylistId(Long stylistId) {
        return (root, query, cb) -> stylistId == null ? null : cb.equal(root.get("stylist").get("id"), stylistId);
    }

    public static Specification<Attendance> date(LocalDate date) {
        return (root, query, cb) -> date == null ? null : cb.equal(root.get("schedule").get("workDate"), date);
    }

    public static Specification<Attendance> dateFrom(LocalDate from) {
        return (root, query, cb) -> from == null ? null : cb.greaterThanOrEqualTo(root.get("schedule").get("workDate"), from);
    }

    public static Specification<Attendance> dateTo(LocalDate to) {
        return (root, query, cb) -> to == null ? null : cb.lessThanOrEqualTo(root.get("schedule").get("workDate"), to);
    }

    public static Specification<Attendance> status(Object status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("attendanceStatus"), status);
    }
}