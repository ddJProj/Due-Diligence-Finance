package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "client")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String clientId;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private UserAccount userAccount;

    @ManyToOne
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployeePartner;

    // FIXME: Implement a better way to generate clientId (ie, "userAccount.id" + "-" + "client.id")
    public Client(String clientId, UserAccount userAccount, Employee assignedEmployeePartner) {
        this.clientId = clientId;
        setUserAccount(userAccount);
        setAssignedEmployeePartner(assignedEmployeePartner);
    }





//    private Employee assignedEmployeePair;

}
