package com.lca.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "stylist")
public class Stylist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 255)
    @Column(name = "specialization")
    private String specialization;

    @ColumnDefault("0")
    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @ColumnDefault("0.00")
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;


}