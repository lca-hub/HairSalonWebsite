package com.lca.service.impl;

import com.lca.dtos.response.StatisticsResponseDTO;
import com.lca.entity.Appointment;
import com.lca.entity.Invoice;
import com.lca.entity.Service;
import com.lca.entity.Stylist;
import com.lca.enums.AppointmentStatus;
import com.lca.enums.PaymentStatus;
import com.lca.repository.AppointmentRepository;
import com.lca.repository.CustomerRepository;
import com.lca.repository.InvoiceRepository;
import com.lca.repository.ProductRepository;
import com.lca.repository.ServiceRepository;
import com.lca.repository.StylistRepository;
import com.lca.service.StatisticsService;
import com.lca.specification.AppointmentSpecification;
import com.lca.specification.InvoiceSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.HashMap;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final AppointmentRepository appointmentRepo;
    private final InvoiceRepository invoiceRepo;
    private final CustomerRepository customerRepo;
    private final StylistRepository stylistRepo;
    private final ServiceRepository serviceRepo;
    private final ProductRepository productRepo;

    @Override
    public StatisticsResponseDTO getDashboard() {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(6);

        List<Appointment> appointments = appointmentRepo.findByAppointmentDateBetween(from, to);
        List<Invoice> invoices = invoiceRepo.findByPaymentStatusAndCreatedAtBetween(PaymentStatus.PAID, from.atStartOfDay(), to.atTime(LocalTime.MAX));

        List<PeriodRange> periods = new ArrayList<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            periods.add(new PeriodRange(date.toString(), date, date));
        }

        return buildResponse("DAY", to.getYear(), null, periods, appointments, invoices);
    }

    @Override
    public StatisticsResponseDTO getStats(String statsType, int year, Integer month) {
        String type = normalizeStatsType(statsType);
        List<PeriodRange> periods = buildPeriods(type, year, month);

        LocalDate from = periods.get(0).from();
        LocalDate to = periods.get(periods.size() - 1).to();

        Specification<Appointment> appointmentSpec = Specification
                .where(AppointmentSpecification.dateFrom(from))
                .and(AppointmentSpecification.dateTo(to));

        List<Appointment> appointments = appointmentRepo.findAll(appointmentSpec);

        LocalDateTime invoiceFrom = from.atStartOfDay();
        LocalDateTime invoiceTo = to.atTime(LocalTime.MAX);

        Specification<Invoice> invoiceSpec = Specification
                .where(InvoiceSpecification.paymentStatus(PaymentStatus.PAID))
                .and(InvoiceSpecification.createdFrom(invoiceFrom))
                .and(InvoiceSpecification.createdTo(invoiceTo));

        List<Invoice> invoices = invoiceRepo.findAll(invoiceSpec);

        return buildResponse(type, year, month, periods, appointments, invoices);
    }

    private StatisticsResponseDTO buildResponse(
            String statsType,
            int year, Integer month,
            List<PeriodRange> periods,
            List<Appointment> appointments,
            List<Invoice> invoices
    ) {
        StatisticsResponseDTO dto = new StatisticsResponseDTO();

        dto.setStatsType(statsType);
        dto.setYear(year);
        dto.setMonth(month);

        dto.setTotalAppointments(appointments.size());
        dto.setConfirmedAppointments(countStatus(appointments, AppointmentStatus.CONFIRMED));
        dto.setCompletedAppointments(countStatus(appointments, AppointmentStatus.COMPLETED));
        dto.setCancelledAppointments(countStatus(appointments, AppointmentStatus.CANCELLED));
        dto.setTotalRevenue(sumRevenue(invoices));

        dto.setTotalCustomers(customerRepo.count());
        dto.setTotalStylists(stylistRepo.count());
        dto.setTotalServices(serviceRepo.count());
        dto.setTotalProducts(productRepo.count());

        dto.setAppointmentsByStatus(countAppointmentsByStatus(appointments));
        dto.setPeriodData(buildPeriodData(periods, appointments, invoices));
        dto.setTopServices(buildTopServices(appointments));
        dto.setStylistPerformance(buildStylistPerformance(appointments, invoices));

        return dto;
    }

    private String normalizeStatsType(String statsType) {
        if (statsType == null || statsType.isBlank()) {
            return "MONTH";
        }

        String type = statsType.trim().toUpperCase();

        if (!type.equals("DAY") && !type.equals("MONTH") && !type.equals("QUARTER") && !type.equals("YEAR")) {
            throw new IllegalArgumentException("statsType phải là DAY, MONTH, QUARTER hoặc YEAR");
        }

        return type;
    }

    private List<PeriodRange> buildPeriods(String statsType, int year, Integer month) {
        List<PeriodRange> periods = new ArrayList<>();

        switch (statsType) {
            case "DAY" -> {
                if (month == null || month < 1 || month > 12) {
                    throw new IllegalArgumentException("Thống kê DAY phải truyền month từ 1 đến 12");
                }

                YearMonth yearMonth = YearMonth.of(year, month);

                for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
                    LocalDate date = yearMonth.atDay(day);
                    periods.add(new PeriodRange(String.format("%02d/%02d/%d", day, month, year), date, date));
                }
            }

            case "MONTH" -> {
                for (int m = 1; m <= 12; m++) {
                    YearMonth yearMonth = YearMonth.of(year, m);
                    periods.add(new PeriodRange(
                            String.format("%02d/%d", m, year),
                            yearMonth.atDay(1),
                            yearMonth.atEndOfMonth()
                    ));
                }
            }

            case "QUARTER" -> {
                for (int quarter = 1; quarter <= 4; quarter++) {
                    int startMonth = (quarter - 1) * 3 + 1;
                    LocalDate from = LocalDate.of(year, startMonth, 1);
                    LocalDate to = from.plusMonths(2).withDayOfMonth(
                            from.plusMonths(2).lengthOfMonth()
                    );

                    periods.add(new PeriodRange("Q" + quarter + "/" + year, from, to));
                }
            }

            case "YEAR" -> periods.add(new PeriodRange(
                    String.valueOf(year),
                    LocalDate.of(year, 1, 1),
                    LocalDate.of(year, 12, 31)
            ));

            default -> throw new IllegalArgumentException("Loại thống kê không hợp lệ");
        }

        return periods;
    }

    private List<StatisticsResponseDTO.PeriodStatisticsDTO> buildPeriodData(
            List<PeriodRange> periods,
            List<Appointment> appointments,
            List<Invoice> invoices
    ) {
        List<StatisticsResponseDTO.PeriodStatisticsDTO> result = new ArrayList<>();

        for (PeriodRange period : periods) {
            List<Appointment> periodAppointments = appointments.stream()
                    .filter(a -> isBetween(
                            a.getAppointmentDate(),
                            period.from(), period.to()
                    )).toList();

            List<Invoice> periodInvoices = invoices.stream()
                    .filter(i -> i.getCreatedAt() != null)
                    .filter(i -> isBetween(
                            i.getCreatedAt().toLocalDate(),
                            period.from(), period.to()
                    )).toList();

            result.add(new StatisticsResponseDTO.PeriodStatisticsDTO(
                    period.label(),
                    period.from(),
                    period.to(),
                    periodAppointments.size(),
                    countStatus(periodAppointments, AppointmentStatus.CONFIRMED),
                    countStatus(periodAppointments, AppointmentStatus.COMPLETED),
                    countStatus(periodAppointments, AppointmentStatus.CANCELLED),
                    sumRevenue(periodInvoices)
            ));
        }

        return result;
    }

    private List<StatisticsResponseDTO.TopServiceDTO> buildTopServices(List<Appointment> appointments) {
        Map<Long, Long> counts = new HashMap<>();
        Map<Long, String> names = new HashMap<>();

        appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .filter(a -> a.getService() != null)
                .forEach(a -> {
                    Service service = a.getService();
                    counts.merge(service.getId(), 1L, Long::sum);
                    names.putIfAbsent(service.getId(), service.getName());
                });

        return counts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue()
                        .reversed()
                        .thenComparing(Map.Entry.comparingByKey()))
                .limit(5)
                .map(entry -> new StatisticsResponseDTO.TopServiceDTO(
                        entry.getKey(),
                        names.get(entry.getKey()),
                        entry.getValue()
                )).toList();
    }

    private List<StatisticsResponseDTO.StylistPerformanceDTO> buildStylistPerformance(
            List<Appointment> appointments,
            List<Invoice> invoices
    ) {
        Map<Long, Long> completedCounts = new HashMap<>();
        Map<Long, BigDecimal> revenues = new HashMap<>();
        Map<Long, String> names = new HashMap<>();

        Map<Long, BigDecimal> invoiceByAppointment = new HashMap<>();

        for (Invoice invoice : invoices) {
            if (invoice.getAppointment() != null && invoice.getAppointment().getId() != null) {
                invoiceByAppointment.put(invoice.getAppointment().getId(), valueOrZero(invoice.getTotalAmount()));
            }
        }

        for (Appointment appointment : appointments) {
            if (appointment.getStatus() != AppointmentStatus.COMPLETED || appointment.getStylist() == null) {
                continue;
            }

            Stylist stylist = appointment.getStylist();
            Long stylistId = stylist.getId();

            completedCounts.merge(stylistId, 1L, Long::sum);
            names.putIfAbsent(stylistId, fullName(stylist));

            BigDecimal revenue = invoiceByAppointment.getOrDefault(appointment.getId(), BigDecimal.ZERO);

            revenues.merge(stylistId, revenue, BigDecimal::add);
        }

        return completedCounts.keySet().stream()
                .sorted((left, right) -> {
                    int countCompare = Long.compare(
                            completedCounts.get(right),
                            completedCounts.get(left)
                    );
                    if (countCompare != 0) {
                        return countCompare;
                    }

                    return revenues.getOrDefault(right, BigDecimal.ZERO)
                            .compareTo(revenues.getOrDefault(left, BigDecimal.ZERO));
                })
                .map(stylistId -> new StatisticsResponseDTO.StylistPerformanceDTO(
                        stylistId,
                        names.get(stylistId),
                        completedCounts.get(stylistId),
                        revenues.getOrDefault(stylistId, BigDecimal.ZERO)
                )).toList();
    }

    private long countStatus(List<Appointment> appointments, AppointmentStatus status) {
        return appointments.stream().filter(a -> a.getStatus() == status).count();
    }

    private Map<String, Long> countAppointmentsByStatus(List<Appointment> appointments) {
        Map<String, Long> result = new LinkedHashMap<>();

        for (AppointmentStatus status : AppointmentStatus.values()) {
            result.put(status.name(), countStatus(appointments, status));
        }

        return result;
    }

    private BigDecimal sumRevenue(List<Invoice> invoices) {
        return invoices.stream()
                .map(Invoice::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private boolean isBetween(LocalDate value, LocalDate from, LocalDate to) {
        return value != null && !value.isBefore(from) && !value.isAfter(to);
    }

    private String fullName(Stylist stylist) {
        if (stylist.getUser() == null) {
            return "Stylist #" + stylist.getId();
        }

        String firstName = stylist.getUser().getFirstName() == null ? "" : stylist.getUser().getFirstName();
        String lastName = stylist.getUser().getLastName() == null ? "" : stylist.getUser().getLastName();

        String name = (firstName + " " + lastName).trim();
        return name.isBlank() ? stylist.getUser().getEmail() : name;
    }

    private record PeriodRange(String label, LocalDate from, LocalDate to) {

    }

    @Override
    public StatisticsResponseDTO getStylistStats(String email, String statsType, int year, Integer month) {

        Stylist stylist = stylistRepo.findAll().stream()
                .filter(item -> item.getUser() != null
                        && item.getUser().getEmail() != null
                        && item.getUser().getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy stylist với email: " + email));

        String type = normalizeStatsType(statsType);
        List<PeriodRange> periods = buildPeriods(type, year, month);

        LocalDate from = periods.get(0).from();
        LocalDate to = periods.get(periods.size() - 1).to();

        List<Appointment> appointments = appointmentRepo.findByAppointmentDateBetween(from, to)
                .stream()
                .filter(appointment -> appointment.getStylist() != null)
                .filter(appointment -> appointment.getStylist().getId().equals(stylist.getId()))
                .toList();

        List<Invoice> invoices = invoiceRepo.findByPaymentStatusAndCreatedAtBetween(
                        PaymentStatus.PAID,
                        from.atStartOfDay(),
                        to.atTime(LocalTime.MAX)
                )
                .stream()
                .filter(invoice -> invoice.getAppointment() != null)
                .filter(invoice -> invoice.getAppointment().getStylist() != null)
                .filter(invoice -> invoice.getAppointment().getStylist().getId().equals(stylist.getId()))
                .toList();

        StatisticsResponseDTO dto = new StatisticsResponseDTO();

        dto.setStatsType(type);
        dto.setYear(year);
        dto.setMonth(month);

        dto.setTotalAppointments((int) appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count());

        dto.setConfirmedAppointments(countStatus(appointments, AppointmentStatus.CONFIRMED));

        dto.setCompletedAppointments(countStatus(appointments, AppointmentStatus.COMPLETED));

        dto.setCancelledAppointments(countStatus(appointments, AppointmentStatus.CANCELLED));

        dto.setTotalRevenue(
                appointments.stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                        .map(Appointment::getId)
                        .filter(Objects::nonNull)
                        .map(id -> invoices.stream()
                                .filter(invoice -> invoice.getAppointment() != null)
                                .filter(invoice -> invoice.getAppointment().getId().equals(id))
                                .map(Invoice::getTotalAmount)
                                .filter(Objects::nonNull)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

        dto.setAppointmentsByStatus(countAppointmentsByStatus(appointments));

        dto.setPeriodData(buildStylistPeriodData(periods, appointments, invoices));

        return dto;
    }

    private List<StatisticsResponseDTO.PeriodStatisticsDTO> buildStylistPeriodData(
            List<PeriodRange> periods,
            List<Appointment> appointments,
            List<Invoice> invoices
    ) {
        List<StatisticsResponseDTO.PeriodStatisticsDTO> result = new ArrayList<>();

        for (PeriodRange period : periods) {

            List<Appointment> periodAppointments = appointments.stream()
                    .filter(a -> isBetween(a.getAppointmentDate(), period.from(), period.to()))
                    .toList();

            List<Invoice> periodInvoices = invoices.stream()
                    .filter(i -> i.getCreatedAt() != null)
                    .filter(i -> isBetween(i.getCreatedAt().toLocalDate(), period.from(), period.to()))
                    .filter(i -> i.getAppointment() != null)
                    .filter(i -> i.getAppointment().getStatus() == AppointmentStatus.COMPLETED)
                    .toList();

            result.add(new StatisticsResponseDTO.PeriodStatisticsDTO(
                    period.label(),
                    period.from(),
                    period.to(),
                    periodAppointments.size(),
                    countStatus(periodAppointments, AppointmentStatus.CONFIRMED),
                    countStatus(periodAppointments, AppointmentStatus.COMPLETED),
                    countStatus(periodAppointments, AppointmentStatus.CANCELLED),
                    sumRevenue(periodInvoices)
            ));
        }

        return result;
    }
}
