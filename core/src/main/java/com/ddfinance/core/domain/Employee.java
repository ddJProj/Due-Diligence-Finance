package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private String employeeId;

    @OneToOne
    @JoinColumn(name = "user_id" ,unique = true)
    private UserAccount userAccount;

    // FIXME: FIX THIS? do we need use the id or employee string
    @OneToMany(mappedBy = "assignedEmployeePartner", fetch = FetchType.LAZY)
    private Set<Client> clientList = new HashSet<>();

    private String locationId;
    private String jobTitle;

    public Employee(){
        this.locationId = "USA";
        this.clientList = new HashSet<>();
    }

    public Employee(String employeeId, UserAccount userAccount) {
        this();
        setUserAccount(userAccount);
        setJobTitle(jobTitle);
    }


    /**
     *
     * @return
     */
    public String getEmployeeId() {
        if (employeeId == null) {
            generateEmployeeId();
        }
        return employeeId;
    }

    /**
     *
     */
    private void generateEmployeeId(){
        if (userAccount != null && userAccount.getId() != null && id != null) {
            this.employeeId= userAccount.getId() + "_" + id;
        }
    }

    /**
     * Persist the generated values
     */
    @PostPersist
    private void postPersist(){
        generateEmployeeId();
    }


}