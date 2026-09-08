package com.lca.specification;

import com.lca.entity.Appointment;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class AppointmentSpecification {

    private AppointmentSpecification() {}

    public static Specification<Appointment> customerId(Long customerId) {
        return (root, query, cb) -> customerId == null ? null : cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<Appointment> stylistId(Long stylistId) {
        return (root, query, cb) -> stylistId == null ? null : cb.equal(root.get("stylist").get("id"), stylistId);
    }

    public static Specification<Appointment> status(Object status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Appointment> appointmentDate(LocalDate date) {
        return (root, query, cb) -> date == null ? null : cb.equal(root.get("appointmentDate"), date);
    }

    public static Specification<Appointment> dateFrom(LocalDate from) {
        return (root, query, cb) -> from == null ? null : cb.greaterThanOrEqualTo(root.get("appointmentDate"), from);
    }

    public static Specification<Appointment> dateTo(LocalDate to) {
        return (root, query, cb) -> to == null ? null : cb.lessThanOrEqualTo(root.get("appointmentDate"), to);
    }
}