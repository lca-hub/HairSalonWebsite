package com.lca.dtos.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class StatisticsResponseDTO {

    private String statsType;
    private int year;
    private Integer month;

    private long totalAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    private long totalCustomers;
    private long totalStylists;
    private long totalServices;
    private long totalProducts;

    private Map<String, Long> appointmentsByStatus;

    private List<PeriodStatisticsDTO> periodData;
    private List<TopServiceDTO> topServices;
    private List<StylistPerformanceDTO> stylistPerformance;

    @Data
    public static class PeriodStatisticsDTO {
        private String label;
        private LocalDate from;
        private LocalDate to;
        private long appointmentCount;
        private long confirmedCount;
        private long completedCount;
        private long cancelledCount;
        private BigDecimal revenue = BigDecimal.ZERO;

        public PeriodStatisticsDTO(
                String label, LocalDate from, LocalDate to,
                long appointmentCount, long confirmedCount,
                long completedCount, long cancelledCount,
                BigDecimal revenue
        ) {
            this.label = label;
            this.from = from;
            this.to = to;
            this.appointmentCount = appointmentCount;
            this.confirmedCount = confirmedCount;
            this.completedCount = completedCount;
            this.cancelledCount = cancelledCount;
            this.revenue = revenue == null ? BigDecimal.ZERO : revenue;
        }
    }

    @Data
    public static class TopServiceDTO {
        private Long serviceId;
        private String serviceName;
        private long completedAppointments;

        public TopServiceDTO(Long serviceId, String serviceName, long completedAppointments) {
            this.serviceId = serviceId;
            this.serviceName = serviceName;
            this.completedAppointments = completedAppointments;
        }
    }

    @Data
    public static class StylistPerformanceDTO {
        private Long stylistId;
        private String stylistName;
        private long completedAppointments;
        private BigDecimal revenue = BigDecimal.ZERO;

        public StylistPerformanceDTO(Long stylistId, String stylistName, long completedAppointments, BigDecimal revenue) {
            this.stylistId = stylistId;
            this.stylistName = stylistName;
            this.completedAppointments = completedAppointments;
            this.revenue = revenue == null ? BigDecimal.ZERO : revenue;
        }
    }
}
