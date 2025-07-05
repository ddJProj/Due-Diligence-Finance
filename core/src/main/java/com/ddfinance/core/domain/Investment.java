package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Investment entity stub for testing (client initially)
 * will be fully implemented later
 */
@Entity
@Table(name = "investments")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "investment_id")
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "investment_name")
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    public Investment(String name) {
        this.name = name;
    }
}
